// Atualize sua API (/api/cashback/filter-cashback-for-sale)
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get("saleId");
    const clientName = searchParams.get("clientName");

    const whereCondition: Prisma.SaleWhereInput = {
      // Apenas vendas que TEM um registro de cashback (não importa o status)
      saleCashback: { isNot: null },
    };

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
            amount: true,
            expiryDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // Filtra apenas resultados onde saleCashback existe
    const filteredSales = sales.filter((sale) => sale.saleCashback !== null);

    const result = filteredSales.map((sale) => ({
      saleId: sale.id,
      saleDate: sale.saleDate,
      clientName: sale.client?.name || "Sem Cliente",
      amount: sale.saleCashback?.amount || 0,
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
