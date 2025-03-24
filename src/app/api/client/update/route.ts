import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do cliente é obrigatório." },
        { status: 400 },
      );
    }

    const data = await request.json();

    const updatedClient = await db.client.update({
      where: { id: Number(id) },
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
      },
    });

    return NextResponse.json(
      {
        message: "Cliente atualizado com sucesso.",
        Client: updatedClient,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cliente." },
      { status: 500 },
    );
  }
}
