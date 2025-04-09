import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const sales = await db.sale.findMany({
      include: {
        tourOperator: true,
        companions: true,
        client: true,
        saleTicket: true,
        saleHosting: true,
        invoice: true,
        saleCashback: {
          include: {
            cashback: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
