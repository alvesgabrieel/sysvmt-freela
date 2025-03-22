import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
    try {

        const hostings = await db.hosting.findMany()

        return NextResponse.json(
            { hostings },
            { status: 200 }
        );

    } catch (error) {
        console.error(`Erro ao buscar hostings no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível buscar os hostings. Tente novamente.",
            },
            { status: 500 },
        );
    }
}