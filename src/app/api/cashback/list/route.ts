import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const cashback = await db.cashback.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(cashback, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar cashback:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
