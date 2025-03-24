import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.phone || !data.email || !data.dateOfBirth) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "Preenha todos campos obrigatórios.",
        },
        { status: 400 },
      );
    }

    const companion = await db.companion.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
      },
    });
    return NextResponse.json(
      { message: "Acompanhante criado com sucesso.", companion },
      { status: 201 },
    );
  } catch (err) {
    console.error(`Erro ao salvar hospedagem no banco de dados:`, err);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível criar o hospedagem. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
