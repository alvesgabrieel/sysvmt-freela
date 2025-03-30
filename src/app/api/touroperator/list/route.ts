import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const operadoras = await db.tourOperator.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(operadoras, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar operadoras:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
