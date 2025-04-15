// app/api/dashboard/total-sales-count-month/route.ts

import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // Início e fim do mês atual
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // Início e fim do mês anterior
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Contagem do mês atual
    const totalSalesCountMonth = await db.sale.count({
      where: {
        canceledSale: false,
        saleDate: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
    });

    // Contagem do mês anterior
    const totalSalesCountLastMonth = await db.sale.count({
      where: {
        canceledSale: false,
        saleDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Cálculo da porcentagem de variação
    const percentageChange =
      totalSalesCountLastMonth === 0
        ? null
        : ((totalSalesCountMonth - totalSalesCountLastMonth) /
            totalSalesCountLastMonth) *
          100;

    return NextResponse.json({
      totalSalesCountMonth,
      totalSalesCountLastMonth,
      percentageChange,
    });
  } catch (error) {
    console.error("Erro ao contar vendas do mês:", error);
    return NextResponse.json(
      { error: "Erro ao contar vendas do mês" },
      { status: 500 },
    );
  }
}
