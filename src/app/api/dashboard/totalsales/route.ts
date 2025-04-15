// app/api/sale/total-sales/route.ts
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Soma de todos os valores netTotal de todas as vendas
    const totalSales = await db.sale.aggregate({
      _sum: {
        netTotal: true,
      },
    });

    // Retornando o valor total de vendas
    return NextResponse.json({ totalSales: totalSales._sum.netTotal });
  } catch {
    return NextResponse.json(
      { error: "Erro ao calcular o total das vendas." },
      { status: 500 },
    );
  }
}
