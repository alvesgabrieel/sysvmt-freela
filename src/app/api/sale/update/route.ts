import { PaymentMethodType } from "@prisma/client";
import { NextResponse } from "next/server";

import { parseBrazilianDate } from "@/app/functions/backend/parse-brazilian-date";
import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

interface CompanionRequest {
  companionId: number;
}

interface HostingRequest {
  hostingId: number;
  rooms: number;
  price: string; // Formato "1.200,50"
}

interface TicketRequest {
  ticketId: number;
  date: string; // Formato "dd/mm/aaaa"
  adults: number;
  kids: number;
  halfPriceTicket: number;
  price: string; // Formato "1.500,99"
}

interface InvoiceRequest {
  issuedInvoice: string;
  estimatedIssueDate?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  expectedReceiptDate?: string;
  invoiceReceived: string;
  receiptDate?: string;
}

interface FullSaleUpdateRequest {
  id: number;
  idInTourOperator: number;
  sallerId: number;
  tourOperatorId: number;
  clientId: number;
  paymentMethod: PaymentMethodType;
  saleDate: string;
  checkIn: string;
  checkOut: string;
  ticketDiscount: string;
  hostingDiscount: string;
  observation?: string;
  cashbackId?: number | null;
  canceledSale?: boolean;
  companions?: CompanionRequest[];
  hostings?: HostingRequest[];
  tickets?: TicketRequest[];
  invoice: InvoiceRequest;
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as FullSaleUpdateRequest;

    if (!body.id) {
      return NextResponse.json(
        { error: "ID da venda não fornecido!" },
        { status: 400 },
      );
    }

    const result = await db.$transaction(
      async (prisma) => {
        // 1. Buscar a venda existente para verificar se precisa recalcular cashback
        const existingSale = await prisma.sale.findUnique({
          where: { id: body.id },
          include: {
            saleCashback: true,
            saleHosting: true,
            saleTicket: true,
          },
        });

        if (!existingSale) {
          throw new Error("Venda não encontrada");
        }

        // 2. Recalcular totais (como no POST)
        const totalHostings =
          body.hostings?.reduce((sum, hosting) => {
            return sum + parseBrazilianNumber(hosting.price);
          }, 0) || 0;

        const totalTickets =
          body.tickets?.reduce((sum, ticket) => {
            return sum + parseBrazilianNumber(ticket.price);
          }, 0) || 0;

        const grossTotal = totalHostings + totalTickets;
        const ticketDiscount = parseBrazilianNumber(body.ticketDiscount);
        const hostingDiscount = parseBrazilianNumber(body.hostingDiscount);
        const totalDiscount = ticketDiscount + hostingDiscount;
        const netTotal = grossTotal - totalDiscount;

        // 3. Recalcular comissões (como no POST)
        const sallerCommission = await prisma.sallerCommission.findFirst({
          where: {
            sallerId: body.sallerId,
            tourOperatorId: body.tourOperatorId,
          },
        });

        const commissionRate =
          body.paymentMethod === "CREDITO"
            ? (sallerCommission?.installmentCommission ?? 0)
            : (sallerCommission?.upfrontCommission ?? 0);

        const sallerCommissionValue = netTotal * (commissionRate / 100);

        const tourOperator = await prisma.tourOperator.findUnique({
          where: { id: body.tourOperatorId },
        });

        const totalHostingsLíquido = totalHostings - hostingDiscount;
        const totalTicketsLíquido = totalTickets - ticketDiscount;

        let agencyCommissionRateHosting = 0;
        let agencyCommissionRateTicket = 0;

        if (body.paymentMethod === "CREDITO") {
          agencyCommissionRateHosting =
            tourOperator?.hostingCommissionInstallment ?? 0;
          agencyCommissionRateTicket =
            tourOperator?.ticketCommissionInstallment ?? 0;
        } else {
          agencyCommissionRateHosting =
            tourOperator?.hostingCommissionUpfront ?? 0;
          agencyCommissionRateTicket =
            tourOperator?.ticketCommissionUpfront ?? 0;
        }

        const agencyCommissionValueHosting =
          totalHostingsLíquido * (agencyCommissionRateHosting / 100);
        const agencyCommissionValueTicket =
          totalTicketsLíquido * (agencyCommissionRateTicket / 100);
        const agencyCommissionValue =
          agencyCommissionValueHosting + agencyCommissionValueTicket;

        // 4. Atualizar a venda principal com os novos cálculos
        const updatedSale = await prisma.sale.update({
          where: { id: body.id },
          data: {
            idInTourOperator: body.idInTourOperator,
            sallerId: body.sallerId,
            tourOperatorId: body.tourOperatorId,
            clientId: body.clientId,
            paymentMethod: body.paymentMethod,
            saleDate: parseBrazilianDate(body.saleDate),
            checkIn: parseBrazilianDate(body.checkIn),
            checkOut: parseBrazilianDate(body.checkOut),
            ticketDiscount,
            hostingDiscount,
            observation: body.observation,
            canceledSale: body.canceledSale || false,
            grossTotal,
            totalDiscount,
            netTotal,
            sallerCommissionValue,
            agencyCommissionValue,
          },
        });

        // 5. Atualizar relacionamentos (como antes)
        await prisma.saleCompanion.deleteMany({ where: { saleId: body.id } });
        if (body.companions?.length) {
          await prisma.saleCompanion.createMany({
            data: body.companions.map((c) => ({
              saleId: body.id,
              companionId: c.companionId,
            })),
          });
        }

        await prisma.saleHosting.deleteMany({ where: { saleId: body.id } });
        if (body.hostings?.length) {
          await prisma.saleHosting.createMany({
            data: body.hostings.map((h) => ({
              saleId: body.id,
              hostingId: h.hostingId,
              rooms: h.rooms,
              price: parseBrazilianNumber(h.price),
            })),
          });
        }

        await prisma.saleTicket.deleteMany({ where: { saleId: body.id } });
        if (body.tickets?.length) {
          await prisma.saleTicket.createMany({
            data: body.tickets.map((t) => ({
              saleId: body.id,
              ticketId: t.ticketId,
              date: parseBrazilianDate(t.date),
              adults: t.adults,
              kids: t.kids,
              halfPriceTicket: t.halfPriceTicket,
              price: parseBrazilianNumber(t.price),
            })),
          });
        }

        // 6. Lógica de Cashback (como no POST)
        let totalCashback = 0;
        let saleCashback = existingSale.saleCashback;

        // Verifica se precisa atualizar o cashback
        const cashbackChanged =
          body.cashbackId !== existingSale.saleCashback?.cashbackId ||
          body.paymentMethod !== existingSale.paymentMethod ||
          body.saleDate !== formatDateToCompare(existingSale.saleDate) ||
          body.checkIn !== formatDateToCompare(existingSale.checkIn) ||
          body.checkOut !== formatDateToCompare(existingSale.checkOut) ||
          grossTotal !== existingSale.grossTotal;

        // Função auxiliar para formatar datas para comparação
        function formatDateToCompare(date: Date): string {
          return date.toISOString().split("T")[0];
        }

        if (body.cashbackId && cashbackChanged) {
          const cashback = await prisma.cashback.findUnique({
            where: { id: body.cashbackId },
          });

          if (cashback) {
            let startDate: Date;
            switch (cashback.selectType) {
              case "PURCHASEDATE":
                startDate = parseBrazilianDate(body.saleDate);
                break;
              case "CHECKIN":
                startDate = parseBrazilianDate(body.checkIn);
                break;
              case "CHECKOUT":
                startDate = parseBrazilianDate(body.checkOut);
                break;
              default:
                startDate = parseBrazilianDate(body.saleDate);
            }

            const expiryDate = new Date(startDate);
            expiryDate.setDate(expiryDate.getDate() + cashback.validityDays);
            expiryDate.setHours(23, 59, 59, 999);

            totalCashback = grossTotal * (cashback.percentage / 100);

            if (existingSale.saleCashback) {
              // Atualiza cashback existente
              saleCashback = await prisma.saleCashback.update({
                where: { id: existingSale.saleCashback.id },
                data: {
                  cashbackId: cashback.id,
                  amount: totalCashback,
                  expiryDate,
                },
              });
            } else {
              // Cria novo cashback
              saleCashback = await prisma.saleCashback.create({
                data: {
                  saleId: body.id,
                  cashbackId: cashback.id,
                  status: "ACTIVE",
                  amount: totalCashback,
                  expiryDate,
                },
              });
            }
          }
        } else if (!body.cashbackId && existingSale.saleCashback) {
          // Remove cashback se foi desmarcado
          await prisma.saleCashback.delete({
            where: { id: existingSale.saleCashback.id },
          });
          saleCashback = null;
        }

        // Atualiza totalCashback na venda
        await prisma.sale.update({
          where: { id: body.id },
          data: {
            totalCashback,
          },
        });

        // 7. Atualizar nota fiscal (como antes)
        const invoice = await prisma.invoice.upsert({
          where: { saleId: body.id },
          update: {
            issuedInvoice: body.invoice.issuedInvoice,
            estimatedIssueDate: body.invoice.estimatedIssueDate
              ? parseBrazilianDate(body.invoice.estimatedIssueDate)
              : null,
            invoiceNumber: body.invoice.invoiceNumber,
            invoiceDate: body.invoice.invoiceDate
              ? parseBrazilianDate(body.invoice.invoiceDate)
              : null,
            expectedReceiptDate: body.invoice.expectedReceiptDate
              ? parseBrazilianDate(body.invoice.expectedReceiptDate)
              : null,
            invoiceReceived: body.invoice.invoiceReceived,
            receiptDate: body.invoice.receiptDate
              ? parseBrazilianDate(body.invoice.receiptDate)
              : null,
          },
          create: {
            saleId: body.id,
            issuedInvoice: body.invoice.issuedInvoice,
            estimatedIssueDate: body.invoice.estimatedIssueDate
              ? parseBrazilianDate(body.invoice.estimatedIssueDate)
              : null,
            invoiceNumber: body.invoice.invoiceNumber,
            invoiceDate: body.invoice.invoiceDate
              ? parseBrazilianDate(body.invoice.invoiceDate)
              : null,
            expectedReceiptDate: body.invoice.expectedReceiptDate
              ? parseBrazilianDate(body.invoice.expectedReceiptDate)
              : null,
            invoiceReceived: body.invoice.invoiceReceived,
            receiptDate: body.invoice.receiptDate
              ? parseBrazilianDate(body.invoice.receiptDate)
              : null,
          },
        });

        return {
          ...updatedSale,
          saleCashback,
          invoice,
        };
      },
      {
        maxWait: 30000,
        timeout: 30000,
      },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar venda:", error);
    return NextResponse.json(
      {
        error: "Falha ao atualizar a venda completa.",
      },
      { status: 500 },
    );
  }
}
