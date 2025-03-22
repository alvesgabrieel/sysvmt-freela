import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
    try {
        const tags = await db.tag.findMany();

        return NextResponse.json({ tags });
    } catch (error) {
        console.error(`Erro ao buscar tags:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível buscar as tags. Tente novamente.",
            },
            { status: 500 },
        );
    }
}