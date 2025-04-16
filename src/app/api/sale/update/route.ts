import { PaymentMethodType } from "@prisma/client";
import { addDays, isWithinInterval } from "date-fns";
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
  price: string;
}

interface TicketRequest {
  ticketId: number;
  date: string;
  adults: number;
  kids: number;
  halfPriceTicket: number;
  price: string;
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
        // 1. Buscar a venda existente
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

        // Função auxiliar para formatar datas para comparação
        function formatDateToCompare(date: Date): string {
          return date.toISOString().split("T")[0];
        }

        // 2. Verificar mudanças nas datas relevantes para cashback
        const dateChanged =
          body.saleDate !== formatDateToCompare(existingSale.saleDate) ||
          body.checkIn !== formatDateToCompare(existingSale.checkIn) ||
          body.checkOut !== formatDateToCompare(existingSale.checkOut);

        // 3. Recalcular totais
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
        const initialDiscount = ticketDiscount + hostingDiscount;

        // 4. Buscar cashbacks aplicados anteriormente (USED)
        const appliedCashbacks = await prisma.saleCashback.findMany({
          where: {
            saleId: body.id,
            status: "USED",
          },
          include: {
            cashback: true,
          },
        });

        // Calcular valor líquido antes de aplicar cashbacks
        const netTotalBeforeCashback = grossTotal - initialDiscount;

        // 5. Calcular cashback aplicado (mantém o mesmo valor ou ajusta se necessário)
        let totalCashback = appliedCashbacks.reduce(
          (sum, cb) => sum + cb.amount,
          0,
        );

        // Se o valor líquido diminuiu, ajustar o cashback aplicado
        if (totalCashback > netTotalBeforeCashback) {
          totalCashback = netTotalBeforeCashback;

          // Atualizar cashbacks aplicados (se houver)
          if (appliedCashbacks.length > 0) {
            // Ajusta proporcionalmente cada cashback aplicado
            const adjustmentFactor = netTotalBeforeCashback / totalCashback;

            for (const cb of appliedCashbacks) {
              await prisma.saleCashback.update({
                where: { id: cb.id },
                data: {
                  amount: cb.amount * adjustmentFactor,
                },
              });
            }
          }
        }

        // Calcular valor líquido final
        const netTotal = netTotalBeforeCashback - totalCashback;

        // 6. Recalcular comissões
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

        // 7. Atualizar a venda principal
        const updatedSale = await prisma.sale.update({
          where: { id: body.id },
          data: {
            idInTourOperator: Number(body.idInTourOperator),
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
            totalCashback,
            totalDiscount: initialDiscount + totalCashback,
            netTotal,
            sallerCommissionValue,
            agencyCommissionValue,
          },
        });

        // 8. Atualizar relacionamentos
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

        // 9. Lógica de Cashback Ativo (futuro)
        let saleCashback = existingSale.saleCashback;
        const currentDate = new Date();

        // Verificar se precisa atualizar o cashback ativo
        const valuesChanged =
          grossTotal !== existingSale.grossTotal ||
          ticketDiscount !== existingSale.ticketDiscount ||
          hostingDiscount !== existingSale.hostingDiscount;

        if (
          (dateChanged || valuesChanged) &&
          saleCashback?.status === "ACTIVE"
        ) {
          // Verificar validade do cashback existente
          const currentCashback = await prisma.cashback.findUnique({
            where: { id: saleCashback.cashbackId },
          });

          if (
            !currentCashback ||
            !isWithinInterval(currentDate, {
              start: currentCashback.startDate,
              end: currentCashback.endDate,
            })
          ) {
            // Remover cashback se a campanha expirou
            await prisma.saleCashback.delete({
              where: { id: saleCashback.id },
            });
            saleCashback = null;
          }
        }

        // Buscar campanha ativa válida
        const activeCashback = await prisma.cashback.findFirst({
          where: {
            startDate: { lte: currentDate },
            endDate: { gte: currentDate },
          },
          orderBy: { percentage: "desc" },
        });

        // Verificar se precisa criar/atualizar cashback ativo
        if (
          activeCashback &&
          (!saleCashback ||
            dateChanged ||
            valuesChanged ||
            (saleCashback && saleCashback.cashbackId !== activeCashback.id))
        ) {
          // Se já existe um cashback ativo, remover antes de criar novo
          if (saleCashback?.status === "ACTIVE") {
            await prisma.saleCashback.delete({
              where: { id: saleCashback.id },
            });
          }

          // Calcular datas do novo cashback
          let startDate: Date;
          switch (activeCashback.selectType) {
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

          const expiryDate = addDays(
            new Date(startDate.setHours(23, 59, 59, 999)),
            activeCashback.validityDays,
          );

          // Calcular valor do cashback baseado no líquido
          const cashbackAmount = netTotal * (activeCashback.percentage / 100);

          // Criar novo cashback
          saleCashback = await prisma.saleCashback.create({
            data: {
              saleId: body.id,
              cashbackId: activeCashback.id,
              status: "ACTIVE",
              amount: cashbackAmount,
              expiryDate,
            },
          });
        }

        // 10. Atualizar nota fiscal
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
          appliedCashbacks: appliedCashbacks.length > 0 ? appliedCashbacks : [],
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
