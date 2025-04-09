import { CashbackStatus, PaymentMethodType } from "@prisma/client";
import { addDays } from "date-fns";
import { NextResponse } from "next/server";

import { parseBrazilianDate } from "@/app/functions/backend/parse-brazilian-date";
import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

// Interfaces
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
  estimatedIssueDate?: string; // Formato "dd/mm/aaaa" (opcional)
  invoiceNumber?: string; // Opcional
  invoiceDate?: string; // Formato "dd/mm/aaaa" (opcional)
  expectedReceiptDate?: string; // Formato "dd/mm/aaaa" (opcional)
  invoiceReceived: string;
  receiptDate?: string; // Formato "dd/mm/aaaa" (opcional)
}

interface SaleRequest {
  idInTourOperator: number;
  sallerId: number;
  tourOperatorId: number;
  clientId: number;
  paymentMethod: PaymentMethodType;
  saleDate: string; // Formato "dd/mm/aaaa"
  checkIn: string; // Formato "dd/mm/aaaa"
  checkOut: string; // Formato "dd/mm/aaaa"
  ticketDiscount: string; // Formato "0,00"
  hostingDiscount: string; // Formato "50,00"
  observation?: string;
  cashbackId?: number | null;
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

    const result = await db.$transaction(
      async (prisma) => {
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
        const totalDiscount =
          convertNumbers.ticketDiscount + convertNumbers.hostingDiscount;
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
            totalCashback: 0, // Inicializado como 0
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

        let totalCashback = 0;
        let saleCashback = null;

        // Lógica do Cashback
        if (body.cashbackId) {
          const cashback = await prisma.cashback.findUnique({
            where: { id: body.cashbackId },
          });

          if (cashback) {
            // Determina data base conforme tipo
            let startDate: Date;
            switch (cashback.selectType) {
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

            // Calcular expiryDate garantindo horário final do dia
            const expiryDate = addDays(
              new Date(startDate.setHours(23, 59, 59, 999)), // Fim do dia
              cashback.validityDays,
            );
            const status = CashbackStatus.ACTIVE;

            // Calcula valor do cashback
            totalCashback = grossTotal * (cashback.percentage / 100);

            // Cria registro de SaleCashback
            saleCashback = await prisma.saleCashback.create({
              data: {
                saleId: sale.id,
                cashbackId: cashback.id,
                status,
                amount: totalCashback,
                expiryDate,
              },
            });

            // Atualiza APENAS totalCashback
            await prisma.sale.update({
              where: { id: sale.id },
              data: {
                totalCashback,
              },
            });
          }
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

        // Retorna a venda com todos os relacionamentos
        return {
          ...sale,
          saleCashback,
          invoice,
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
