import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
    try {

        const tickets = await db.ticket.findMany()

        return NextResponse.json(
            { tickets },
            { status: 200 }
        );

    } catch (error) {
        console.error(`Erro ao buscar tickets no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível buscar os tickets. Tente novamente.",
            },
            { status: 500 },
        );
    }
}