import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const tourOperators = await db.tourOperator.findMany();

    return NextResponse.json(tourOperators, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível encontrar as operadoras",
      },
      { status: 500 },
    );
  }
}
