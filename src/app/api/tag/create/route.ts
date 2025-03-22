import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
    try{

        const data = await request.json();

        // Validação básica para garantir que os dados necessários sejam fornecidos
        if (!data.name || !data.color) {
            return NextResponse.json(
                {
                    error: "Dados inválidos.",
                    message: "Nome e cor da tag são obrigatórios.",
                },
                { status: 400 }
            );
        }


        const existingTag = await db.tag.findFirst({
            where: { name: data.name }
        })

        if(existingTag){
            return NextResponse.json(
                {
                    error: "Tag já existe.",
                    message: "Já existe uma tag com esse nome.",
                },
                { status: 400 },
            );
        }

        const tag = await db.tag.create({
            data: {
                name: data.name,
                color: data.color
            },
        });

        return NextResponse.json(
            {message: "Tag criada com sucesso.", tag},
            {status: 201}
        );

    } catch (error) {
        console.error(`Erro ao salvar tag no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível criar a tag. Tente novamente.",
            },
            { status: 500 },
        );
    }
}