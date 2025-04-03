import { Prisma } from "@prisma/client"; // Adicionando os tipos do Prisma
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get("saleId");
    const clientName = searchParams.get("clientName");

    // Definindo `whereCondition` como Prisma.SaleWhereInput
    const whereCondition: Prisma.SaleWhereInput = {};

    if (saleId) {
      whereCondition.id = Number(saleId);
    }

    if (clientName) {
      whereCondition.client = {
        is: {
          name: {
            contains: clientName,
            mode: "insensitive",
          },
        },
      };
    }

    // Consulta ao banco de dados com filtro correto
    const sales = await db.sale.findMany({
      where: whereCondition,
      select: {
        id: true,
        saleDate: true,
        totalCashback: true,
        client: {
          select: {
            name: true,
          },
        },
        saleCashback: {
          select: {
            expiryDate: true,
            status: true,
          },
        },
      },
    });

    // Mapeando os dados para a resposta
    const result = sales.map((sale) => ({
      saleId: sale.id,
      saleDate: sale.saleDate,
      clientName: sale.client?.name || "Sem Cliente",
      totalCashback: sale.totalCashback,
      expiryDate: sale.saleCashback?.expiryDate || null,
      status: sale.saleCashback?.status || "N/A",
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar relatório de cashback:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
