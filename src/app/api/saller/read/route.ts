import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const sallers = await db.saller.findMany();

    return NextResponse.json(sallers, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível encontrar os vendedores",
      },
      { status: 500 },
    );
  }
}
