// app/api/dashboard/total-sales-count/route.ts

import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const totalSalesCount = await db.sale.count({
      where: {
        canceledSale: false, // Conta apenas vendas não canceladas
      },
    });

    return NextResponse.json({ totalSalesCount });
  } catch (error) {
    console.error("Erro ao contar vendas:", error);
    return NextResponse.json(
      { error: "Erro ao contar vendas" },
      { status: 500 },
    );
  }
}
