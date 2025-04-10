import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId || isNaN(Number(clientId))) {
    return NextResponse.json(
      { error: "ID do cliente inválido ou não fornecido" },
      { status: 400 },
    );
  }

  try {
    const nowUTC = new Date();
    nowUTC.setUTCHours(0, 0, 0, 0);

    // Correção: Busca através do relacionamento Sale -> Client
    const cashbacks = await db.saleCashback.findMany({
      where: {
        status: "ACTIVE",
        expiryDate: { gt: nowUTC },
        sale: {
          clientId: Number(clientId),
          // Adicione esta linha para garantir que a venda não está cancelada
          canceledSale: false,
        },
      },
      include: {
        cashback: { select: { id: true, name: true, percentage: true } },
        sale: {
          select: {
            id: true,
            saleDate: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    const formattedCashbacks = cashbacks.map((cb) => ({
      id: cb.id,
      amount: cb.amount,
      expiryDate: cb.expiryDate.toISOString(),
      cashback: {
        // Mantenha a estrutura que o frontend espera
        id: cb.cashback.id,
        name: cb.cashback.name,
        percentage: cb.cashback.percentage,
      },
      sale: {
        // Inclua todas as propriedades necessárias
        id: cb.sale.id,
        saleDate: cb.sale.saleDate.toISOString(),
        client: {
          id: cb.sale.client.id,
          name: cb.sale.client.name,
        },
      },
    }));

    return NextResponse.json(formattedCashbacks);
  } catch (error) {
    console.error("Erro ao buscar cashbacks:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
