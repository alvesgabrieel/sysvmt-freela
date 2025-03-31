import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const hosting = await db.hosting.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(hosting, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar hospedagem:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
