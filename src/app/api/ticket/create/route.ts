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

        const existingTicket = await db.ticket.findFirst({
            where: { name: data.name }
        })

        if(existingTicket){
            return NextResponse.json(
                {
                    error: "Ticket já existe.",
                    message: "Já existe um ticket com esse nome.",
                },
                { status: 400 },
            );
        }

        const ticket = await db.ticket.create({
            data: {
                name: data.name,
                state: data.state,
                city: data.city,
                observation: data.observation
            },
        });

        return NextResponse.json(
            {message: "Ticket criado com sucesso.", ticket},
            {status: 201}
        );
    } catch (error) {
        console.error(`Erro ao salvar ticket no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível criar o ticket. Tente novamente.",
            },
            { status: 500 },
        );
    }
}        