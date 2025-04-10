import { PaymentMethodType } from "@prisma/client";
import { addDays } from "date-fns";
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

interface SaleRequest {
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
  cashbackId?: string | null;
  companions?: CompanionRequest[];
  hostings?: HostingRequest[];
  tickets?: TicketRequest[];
  invoice: InvoiceRequest;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaleRequest;

    // Validação básica
    if (
      !body.idInTourOperator ||
      !body.sallerId ||
      !body.tourOperatorId ||
      !body.clientId ||
      !body.paymentMethod ||
      !body.saleDate ||
      !body.checkIn ||
      !body.checkOut ||
      !body.invoice
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando!" },
        { status: 400 },
      );
    }

    const result = await db.$transaction(
      async (prisma) => {
        // Converte valores e datas
        const convertNumbers = {
          ticketDiscount: parseBrazilianNumber(body.ticketDiscount),
          hostingDiscount: parseBrazilianNumber(body.hostingDiscount),
        };

        const convertDates = {
          saleDate: parseBrazilianDate(body.saleDate),
          checkIn: parseBrazilianDate(body.checkIn),
          checkOut: parseBrazilianDate(body.checkOut),
        };

        // 1. Busca cashbacks disponíveis para o cliente
        const availableCashbacks = await prisma.saleCashback.findMany({
          where: {
            status: "ACTIVE",
            expiryDate: { gt: new Date() },
            sale: {
              clientId: body.clientId,
              canceledSale: false,
            },
          },
          include: {
            cashback: true,
          },
          orderBy: {
            expiryDate: "asc", // Aplica os mais antigos primeiro
          },
        });

        // Cálculos de totais
        const totalHostings =
          body.hostings?.reduce((sum, hosting) => {
            return sum + parseBrazilianNumber(hosting.price);
          }, 0) || 0;

        const totalTickets =
          body.tickets?.reduce((sum, ticket) => {
            return sum + parseBrazilianNumber(ticket.price);
          }, 0) || 0;

        const grossTotal = totalHostings + totalTickets;
        const initialDiscount =
          convertNumbers.ticketDiscount + convertNumbers.hostingDiscount;

        // 2. Calcula cashback a aplicar
        const totalAvailableCashback = availableCashbacks.reduce(
          (sum, cb) => sum + cb.amount,
          0,
        );

        // Aplica o cashback disponível, limitado ao valor restante da venda
        const cashbackToApply = Math.min(
          totalAvailableCashback,
          grossTotal - initialDiscount,
        );

        // 3. Atualiza totais com cashback
        const totalDiscount = initialDiscount + cashbackToApply;
        const netTotal = grossTotal - totalDiscount;

        // Buscar a comissão do vendedor
        const sallerCommission = await prisma.sallerCommission.findFirst({
          where: {
            sallerId: body.sallerId,
            tourOperatorId: body.tourOperatorId,
          },
        });

        // Determina a taxa da comissão
        const commissionRate =
          body.paymentMethod === "CREDITO"
            ? (sallerCommission?.installmentCommission ?? 0)
            : (sallerCommission?.upfrontCommission ?? 0);

        // Calcular o valor da comissão do vendedor
        const sallerCommissionValue = netTotal * (commissionRate / 100);

        // Busca comissao da agência
        const tourOperator = await prisma.tourOperator.findUnique({
          where: { id: body.tourOperatorId },
        });

        const totalHostingsLíquido =
          totalHostings - convertNumbers.hostingDiscount;
        const totalTicketsLíquido =
          totalTickets - convertNumbers.ticketDiscount;

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

        // Cria a venda com todos os relacionamentos incluídos
        const sale = await prisma.sale.create({
          data: {
            idInTourOperator: body.idInTourOperator,
            sallerId: body.sallerId,
            tourOperatorId: body.tourOperatorId,
            clientId: body.clientId,
            paymentMethod: body.paymentMethod,
            saleDate: convertDates.saleDate,
            checkIn: convertDates.checkIn,
            checkOut: convertDates.checkOut,
            ticketDiscount: convertNumbers.ticketDiscount,
            hostingDiscount: convertNumbers.hostingDiscount,
            observation: body.observation || "",
            grossTotal,
            totalCashback: cashbackToApply, // Só terá valor se cashbacks foram aplicados
            totalDiscount,
            netTotal,
            sallerCommissionValue,
            agencyCommissionValue,
            companions: body.companions
              ? {
                  create: body.companions.map((comp) => ({
                    companionId: comp.companionId,
                  })),
                }
              : undefined,
            saleHosting: body.hostings
              ? {
                  create: body.hostings.map((host) => ({
                    hostingId: host.hostingId,
                    rooms: host.rooms,
                    price: parseBrazilianNumber(host.price),
                  })),
                }
              : undefined,
            saleTicket: body.tickets
              ? {
                  create: body.tickets.map((ticket) => ({
                    ticketId: ticket.ticketId,
                    date: parseBrazilianDate(ticket.date),
                    adults: ticket.adults,
                    kids: ticket.kids,
                    halfPriceTicket: ticket.halfPriceTicket,
                    price: parseBrazilianNumber(ticket.price),
                  })),
                }
              : undefined,
          },
          include: {
            tourOperator: true,
            client: true,
            companions: {
              include: {
                companion: true,
              },
            },
            saleHosting: {
              include: {
                hosting: true,
              },
            },
            saleTicket: {
              include: {
                ticket: true,
              },
            },
          },
        });

        // 4. Marca cashbacks como usados (se algum foi aplicado)
        if (cashbackToApply > 0) {
          await prisma.saleCashback.updateMany({
            where: {
              id: {
                in: availableCashbacks.map((cb) => cb.id),
              },
            },
            data: {
              status: "USED",
            },
          });
        }

        // Lógica para gerar NOVO cashback (se houver campanha ativa)
        let saleCashback = null;
        const currentDate = new Date();
        const activeCashback = await prisma.cashback.findFirst({
          where: {
            startDate: { lte: currentDate },
            endDate: { gte: currentDate },
          },
          orderBy: {
            percentage: "desc",
          },
        });

        if (activeCashback) {
          let startDate: Date;
          switch (activeCashback.selectType) {
            case "PURCHASEDATE":
              startDate = convertDates.saleDate;
              break;
            case "CHECKIN":
              startDate = convertDates.checkIn;
              break;
            case "CHECKOUT":
              startDate = convertDates.checkOut;
              break;
            default:
              startDate = convertDates.saleDate;
          }

          const expiryDate = addDays(
            new Date(startDate.setHours(23, 59, 59, 999)),
            activeCashback.validityDays,
          );

          saleCashback = await prisma.saleCashback.create({
            data: {
              saleId: sale.id,
              cashbackId: activeCashback.id,
              status: "ACTIVE",
              amount: netTotal * (activeCashback.percentage / 100),
              expiryDate,
            },
          });
        }

        // Cria nota fiscal
        const invoice = await prisma.invoice.create({
          data: {
            saleId: sale.id,
            issuedInvoice: body.invoice.issuedInvoice,
            estimatedIssueDate: body.invoice.estimatedIssueDate
              ? parseBrazilianDate(body.invoice.estimatedIssueDate)
              : null,
            invoiceNumber: body.invoice.invoiceNumber || null,
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
          ...sale,
          saleCashback,
          invoice,
          appliedCashbacks: cashbackToApply > 0 ? availableCashbacks : [],
        };
      },
      {
        timeout: 10000,
        maxWait: 10000,
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return NextResponse.json(
      {
        error:
          "Falha ao processar a venda. Verifique os dados e tente novamente.",
      },
      { status: 500 },
    );
  }
}
