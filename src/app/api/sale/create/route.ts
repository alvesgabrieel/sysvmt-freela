import { PaymentMethodType } from "@prisma/client";
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
  // sallerCommission: string; // Formato "12,8"
  // agencyCommission: string; // Formato "15,5"
  ticketDiscount: string; // Formato "0,00"
  hostingDiscount: string; // Formato "50,00"
  observation?: string;
  cashbackId?: number | null;
  companions?: CompanionRequest[];
  hostings?: HostingRequest[];
  tickets?: TicketRequest[];
  invoice: InvoiceRequest; // Dados da nota fiscal
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SaleRequest;

    // Validação rápida
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
      // sallerCommission: parseBrazilianNumber(body.sallerCommission),
      // agencyCommission: parseBrazilianNumber(body.agencyCommission),
      ticketDiscount: parseBrazilianNumber(body.ticketDiscount),
      hostingDiscount: parseBrazilianNumber(body.hostingDiscount),
    };

    const convertDates = {
      saleDate: parseBrazilianDate(body.saleDate),
      checkIn: parseBrazilianDate(body.checkIn),
      checkOut: parseBrazilianDate(body.checkOut),
    };

    // Transação Prisma
    const result = await db.$transaction(
      async (prisma) => {
        // Calcula o total de hospedagens
        const totalHostings =
          body.hostings?.reduce((sum, hosting) => {
            return sum + parseBrazilianNumber(hosting.price);
          }, 0) || 0;

        // Calcula o total de passagens
        const totalTickets =
          body.tickets?.reduce((sum, ticket) => {
            return sum + parseBrazilianNumber(ticket.price);
          }, 0) || 0;

        // Calcula o grossTotal (soma de hospedagens e passagens)
        const grossTotal = totalHostings + totalTickets;

        // Calcula o totalDiscount (soma dos descontos)
        const totalDiscount =
          convertNumbers.ticketDiscount + convertNumbers.hostingDiscount;

        // Calcula o totalCashback (porcentagem do grossTotal)
        let totalCashback = 0;
        if (body.cashbackId) {
          const cashback = await prisma.cashback.findUnique({
            where: { id: body.cashbackId },
            select: { percentage: true }, // Agora buscamos a porcentagem
          });
          if (cashback?.percentage) {
            totalCashback = grossTotal * (cashback.percentage / 100);
          }
        }

        // Calcula o netTotal (grossTotal - descontos - cashback)
        const netTotal = grossTotal - totalDiscount - totalCashback;

        // 1. Cria a venda
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
            // sallerCommission: convertNumbers.sallerCommission,
            // agencyCommission: convertNumbers.agencyCommission,
            ticketDiscount: convertNumbers.ticketDiscount,
            hostingDiscount: convertNumbers.hostingDiscount,
            observation: body.observation || "",
            cashbackId: body.cashbackId || null,
            grossTotal,
            totalCashback,
            totalDiscount,
            netTotal,
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

        // 2. Cria a nota fiscal
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

        return { sale, invoice };
      },
      {
        timeout: 10000, // ⏳ 10 segundos (em milissegundos)
        maxWait: 10000, // ⏳ Tempo máximo de espera para iniciar a transação
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
