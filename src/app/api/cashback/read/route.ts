import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const cashback = await db.cashback.findMany();

    return NextResponse.json(cashback, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível encontrar os cashbacks",
      },
      { status: 500 },
    );
  }
}
