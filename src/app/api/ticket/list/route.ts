import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const ticket = await db.ticket.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar ingresso:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
