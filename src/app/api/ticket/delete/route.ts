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
          message: "O ID do ingresso é obrigatório.",
        },
        { status: 400 },
      );
    }

    // Verifica se o ingresso existe no banco de dados
    const existingTicket = await db.ticket.findUnique({
      where: { id: Number(id) },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          error: "Ingresso não encontrado.",
          message: "O ingresso que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    // Exclui o ingresso do banco de dados
    await db.ticket.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Ingresso excluído com sucesso.",
        deletedTicket: existingTicket, // Opcional: retornar o ingresso excluído
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir ingresso:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir o ingresso. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
