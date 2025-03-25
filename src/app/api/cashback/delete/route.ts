import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "O ID do cashback é obrigatório.",
        },
        { status: 400 },
      );
    }

    const existingCashback = await db.cashback.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCashback) {
      return NextResponse.json(
        {
          error: "Cashback não encontrado.",
          message: "O cashback que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.cashback.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      {
        message: "Cashback excluído com sucesso.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir cashback:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir o cashback. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
