import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da hospedagem é obrigatório." },
        { status: 400 },
      );
    }

    const data = await request.json();

    const updatedHosting = await db.hosting.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        state: data.state,
        city: data.city,
        observation: data.observation,
      },
    });

    return NextResponse.json(
      {
        message: "Hospedagem atualizado com sucesso.",
        hosting: updatedHosting,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar hospedagem:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar hospedagem." },
      { status: 500 },
    );
  }
}
