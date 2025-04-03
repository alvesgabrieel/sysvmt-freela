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

        // 1. Cria a venda (netTotal NÃO inclui cashback)
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
            netTotal: grossTotal - totalDiscount, // ✅ Não subtrai cashback
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
        });

        let totalCashback = 0;
        let saleCashback = null;

        // 2. Lógica do Cashback (sem afetar netTotal)
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

            // 1. Calcular expiryDate garantindo horário final do dia
            const expiryDate = addDays(
              new Date(startDate.setHours(23, 59, 59, 999)), // Fim do dia
              cashback.validityDays,
            );
            const status = CashbackStatus.ACTIVE;

            // Calcula valor do cashback (10% de grossTotal, por exemplo)
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

            // Atualiza APENAS totalCashback (netTotal permanece inalterado)
            await prisma.sale.update({
              where: { id: sale.id },
              data: {
                totalCashback, // Armazena o valor calculado
                // netTotal NÃO é atualizado (mantém grossTotal - totalDiscount)
              },
            });
          }
        }

        // 3. Cria nota fiscal
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

        return { sale, saleCashback, invoice };
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
