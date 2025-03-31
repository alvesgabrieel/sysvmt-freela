import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const saller = await db.saller.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(saller, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar vendedor:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
