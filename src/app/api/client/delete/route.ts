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
          message: "O ID do cliente é obrigatório.",
        },
        { status: 400 },
      );
    }

    // Verifica se o ingresso existe no banco de dados
    const existingClient = await db.client.findUnique({
      where: { id: Number(id) },
    });

    if (!existingClient) {
      return NextResponse.json(
        {
          error: "Cliente não encontrado.",
          message: "O Cliente que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    await db.client.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Cliente excluído com sucesso.",
        deletedClient: existingClient, // Opcional: retornar o ingresso excluído
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir cliente:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir o cliente. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
