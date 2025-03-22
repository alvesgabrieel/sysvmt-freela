import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET() {
    try {

        const tourOperator = await db.tourOperator.findMany()

        return NextResponse.json(
            { tourOperator },
            { status: 200 }
        );

    } catch (error) {
        console.error(`Erro ao buscar hospedagens no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível buscar as hospedagens. Tente novamente.",
            },
            { status: 500 },
        );
    }
}