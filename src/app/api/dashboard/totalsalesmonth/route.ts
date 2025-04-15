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

    // Vendas do mês atual
    const salesOfCurrentMonth = await db.sale.findMany({
      where: {
        saleDate: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
        canceledSale: false,
      },
      select: {
        netTotal: true,
      },
    });

    // Vendas do mês anterior
    const salesOfLastMonth = await db.sale.findMany({
      where: {
        saleDate: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
        canceledSale: false,
      },
      select: {
        netTotal: true,
      },
    });

    // Soma dos totais
    const totalCurrent = salesOfCurrentMonth.reduce(
      (acc, sale) => acc + sale.netTotal,
      0,
    );

    const totalLast = salesOfLastMonth.reduce(
      (acc, sale) => acc + sale.netTotal,
      0,
    );

    // Calcula a variação percentual
    const percentageChange =
      totalLast === 0 ? null : ((totalCurrent - totalLast) / totalLast) * 100;

    return NextResponse.json({
      totalMonthlySales: totalCurrent,
      previousMonthSales: totalLast,
      percentageChange,
    });
  } catch (error) {
    console.error("Erro ao buscar vendas do mês:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas do mês" },
      { status: 500 },
    );
  }
}
