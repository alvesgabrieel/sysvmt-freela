import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
    try{
        const data = await request.json();
        if (!data.name || !data.state || !data.city) {
            return NextResponse.json(
                {
                    error: "Dados inválidos.",
                    message: "Preenha todos campos obrigatórios.",
                },
                { status: 400 }
            );
        }
        const existingHosting = await db.hosting.findFirst({
            where: { name: data.name, state: data.state, city: data.city }
        })
        if(existingHosting){
            return NextResponse.json(
                {
                    error: "Essa hospedagem já existe.",
                    message: "Essa hospedagem já existe.",
                },
                { status: 400 },
            );
        }
        const hosting = await db.hosting.create({
            data: {
                name: data.name,
                state: data.state,
                city: data.city,
                observation: data.observation
            },
        });
        return NextResponse.json(
            {message: "Hosting criado com sucesso.", hosting},
            {status: 201}
        );
    } catch (error) {
        console.error(`Erro ao salvar hosting no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível criar o hosting. Tente novamente.",
            },
            { status: 500 },
        );
    }
}