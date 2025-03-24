import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da tag é obrigatória." },
        { status: 400 },
      );
    }

    const data = await request.json();

    const updatedTag = await db.tag.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        color: data.color,
      },
    });

    return NextResponse.json(
      { message: "Tag atualizado com sucesso.", tag: updatedTag },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar tag:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tag." },
      { status: 500 },
    );
  }
}
