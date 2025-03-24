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
          message: "O ID da operadora é obrigatório.",
        },
        { status: 400 },
      );
    }

    const existingTourOperator = await db.tourOperator.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTourOperator) {
      return NextResponse.json(
        {
          error: "Operadora não encontrado.",
          message: "A operadora que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.tourOperator.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Operadora excluído com sucesso.",
        deletedTourOperator: existingTourOperator,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir operadora:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir a operadora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
