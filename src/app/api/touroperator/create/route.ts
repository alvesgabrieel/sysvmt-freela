import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
    try{

        const data = await request.json();

        if (!data.name || !data.phone || !data.email || !data.site || !data.login || !data.password || !data.upfrontComission || !data.installmentComission) { 
            return NextResponse.json(
                {
                    error: "Dados inválidos.",
                    message: "Preenha todos campos obrigatórios.",
                },
                { status: 400 }
            );
        }

        const existingTourOperator = await db.tourOperator.findFirst({
            where: { name: data.name, email: data.email, login: data.login }
        })

        if(existingTourOperator){
            return NextResponse.json(
                {
                    error: "Hospedagem já existe.",
                    message: "Essa hospedagem já existe.",
                },
                { status: 400 },
            );
        }

        const tourOperator = await db.tourOperator.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email,
                site: data.site,
                login: data.login,
                password: data.password,
                upfrontComission: data.upfrontComission,
                installmentComission: data.installmentComission,
                state: data.state,
                city: data.city,
                observation: data.observation
            },
        });

        return NextResponse.json(
            {message: "Hospedagem criada com sucesso.", tourOperator},
            {status: 201}
        );
    } catch (error) {
        console.error(`Erro ao salvar a hospedagem no banco de dados:`, error);
        return NextResponse.json(
            {
                error: "Erro no servidor.",
                message: "Não foi possível criar a hospedagem. Tente novamente.",
            },
            { status: 500 },
        );
    }
}