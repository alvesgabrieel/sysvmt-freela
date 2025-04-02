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
          message: "O ID da venda é obrigatório.",
        },
        { status: 400 },
      );
    }

    const existingSale = await db.sale.findUnique({
      where: { id: Number(id) },
    });

    if (!existingSale) {
      return NextResponse.json(
        {
          error: "Venda não encontrado.",
          message: "A venda que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.sale.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      {
        message: "Venda excluído com sucesso.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir venda:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir a venda. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
