import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const tickets = await db.ticket.findMany();

    return NextResponse.json(tickets, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível encontrar os ingressos",
      },
      { status: 500 },
    );
  }
}
