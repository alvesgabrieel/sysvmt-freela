import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await db.client.findMany();

    return NextResponse.json(clients, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível encontrar os clientes",
      },
      { status: 500 },
    );
  }
}
