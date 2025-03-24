import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validação dos campos obrigatórios
    if (
      !data.name ||
      !data.login ||
      !data.cpf ||
      !data.dateOfBirth ||
      !data.email ||
      !data.primaryPhone ||
      !data.secondaryPhone ||
      !data.state ||
      !data.city ||
      !data.tags
    ) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "Preencha todos os campos obrigatórios.",
        },
        { status: 400 },
      );
    }

    // Verifica se o cliente já existe
    const existingClient = await db.client.findFirst({
      where: { cpf: data.cpf }, // Verifica pelo CPF, que deve ser único
    });
    if (existingClient) {
      return NextResponse.json(
        {
          error: "Esse cliente já existe.",
          message: "Esse cliente já existe.",
        },
        { status: 400 },
      );
    }

    // Cria o cliente e conecta as tags
    const client = await db.client.create({
      data: {
        name: data.name,
        login: data.login,
        cpf: data.cpf,
        dateOfBirth: data.dateOfBirth,
        email: data.email,
        primaryPhone: data.primaryPhone,
        secondaryPhone: data.secondaryPhone,
        state: data.state,
        city: data.city,
        tags: {
          connect: data.tags.map((tagId: number) => ({ id: tagId })), // Conecta as tags existentes
        },
      },
      include: {
        tags: true, // Inclui as tags no retorno
      },
    });

    return NextResponse.json(
      { message: "Cliente cadastrado com sucesso.", client },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "Erro ao cadastrar cliente.",
        message: "Ocorreu um erro ao processar a solicitação.",
      },
      { status: 500 },
    );
  }
}
