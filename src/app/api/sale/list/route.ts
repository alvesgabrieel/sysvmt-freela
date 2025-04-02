import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const sale = await db.sale.findMany({
      include: {
        tourOperator: true,
        companions: true,
        client: true,
        saleTicket: true,
        saleHosting: true,
        invoice: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(sale, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar ingresso:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
