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
          message: "O ID do acompanhante é obrigatório.",
        },
        { status: 400 },
      );
    }

    // Verifica se o ingresso existe no banco de dados
    const existingCompanion = await db.companion.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCompanion) {
      return NextResponse.json(
        {
          error: "Acompanhante não encontrado.",
          message: "O acompanhante que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.companion.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Acompnhante excluído com sucesso.",
        deletedCompanion: existingCompanion, // Opcional: retornar o ingresso excluído
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir acompanhante:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir o acompanhante. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
