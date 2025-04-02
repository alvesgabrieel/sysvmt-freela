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

    // Validação mínima
    if (!body.id) {
      return NextResponse.json(
        { error: "ID da venda não fornecido!" },
        { status: 400 },
      );
    }

    // Transação de atualização completa com timeout aumentado
    const result = await db.$transaction(
      async (prisma) => {
        // 1. Atualiza a venda principal
        await prisma.sale.update({
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
            ticketDiscount: parseBrazilianNumber(body.ticketDiscount),
            hostingDiscount: parseBrazilianNumber(body.hostingDiscount),
            observation: body.observation,
            cashbackId: body.cashbackId,
            canceledSale: body.canceledSale || false,
          },
        });

        // 2. Atualiza relacionamentos (substitui tudo)
        // Companions
        await prisma.saleCompanion.deleteMany({ where: { saleId: body.id } });
        if (body.companions?.length) {
          await prisma.saleCompanion.createMany({
            data: body.companions.map((c) => ({
              saleId: body.id,
              companionId: c.companionId,
            })),
          });
        }

        // Hostings
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

        // Tickets
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

        // 3. Atualiza nota fiscal
        await prisma.invoice.upsert({
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

        return { success: true };
      },
      {
        maxWait: 30000, // 30 segundos
        timeout: 30000, // 30 segundos
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
