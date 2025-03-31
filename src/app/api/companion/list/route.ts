import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const companion = await db.companion.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(companion, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar acompanhante:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
