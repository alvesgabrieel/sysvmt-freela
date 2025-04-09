import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const sallers = await db.saller.findMany({
      include: {
        commissions: {
          include: {
            tourOperator: true, // Inclui as operadoras vinculadas
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(sallers, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vendedores:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
