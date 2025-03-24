import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do acompanhante é obrigatório." },
        { status: 400 },
      );
    }

    const data = await request.json();

    const updatedCompanion = await db.companion.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
      },
    });

    return NextResponse.json(
      {
        message: "Acompanhante atualizado com sucesso.",
        Companion: updatedCompanion,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar acompanhante:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar acompanhante." },
      { status: 500 },
    );
  }
}
