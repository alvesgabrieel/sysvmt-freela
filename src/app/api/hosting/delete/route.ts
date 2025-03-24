import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    // Extrai o ID do ingresso da query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Valida se o ID foi fornecido
    if (!id) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "O ID da hospedagem é obrigatório.",
        },
        { status: 400 },
      );
    }

    const existingHosting = await db.hosting.findUnique({
      where: { id: Number(id) },
    });

    if (!existingHosting) {
      return NextResponse.json(
        {
          error: "Hospedagem não encontrado.",
          message: "O hospedagem que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.hosting.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Hospedagem excluído com sucesso.",
        deletedHosting: existingHosting,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir hospedagem:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir a hospedagem. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
