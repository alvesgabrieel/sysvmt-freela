import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const companions = await db.companion.findMany();

    return NextResponse.json(companions, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível encontrar os acompanhantes",
      },
      { status: 500 },
    );
  }
}
