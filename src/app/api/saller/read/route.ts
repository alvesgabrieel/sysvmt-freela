import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
    try {

        const sallers = await db.saller.findMany()

        return NextResponse.json(
            { sallers },
            { status: 200 }
        );

    } catch (error) {
        console.error(`Erro ao buscar sallers no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível buscar os sallers. Tente novamente.",
            },
            { status: 500 },
        );
    }
}