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
          message: "O ID do vendedor é obrigatório.",
        },
        { status: 400 },
      );
    }

    const existingSaller = await db.saller.findUnique({
      where: { id: Number(id) },
    });

    if (!existingSaller) {
      return NextResponse.json(
        {
          error: "Vendedor não encontrado.",
          message: "O vendedor que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.saller.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Vendedor excluído com sucesso.",
        deletedSaller: existingSaller,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir vendedor:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir o vendedor. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
