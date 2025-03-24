import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    // Extrai o ID da tag da query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // Valida se o ID foi fornecido
    if (!id) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "O ID da tag é obrigatório.",
        },
        { status: 400 },
      );
    }

    // Verifica se a tag existe no banco de dados
    const existingTag = await db.tag.findUnique({
      where: { id: Number(id) },
      include: { clients: true }, // Inclui os clientes vinculados
    });

    if (!existingTag) {
      return NextResponse.json(
        {
          error: "Tag não encontrada.",
          message: "A tag que você está tentando excluir não existe.",
        },
        { status: 404 },
      );
    }

    // Remove a tag de todos os clientes vinculados
    await Promise.all(
      existingTag.clients.map((client) =>
        db.client.update({
          where: { id: client.id },
          data: {
            tags: {
              disconnect: { id: Number(id) }, // Remove a tag do cliente
            },
          },
        }),
      ),
    );

    // Exclui a tag
    await db.tag.delete({
      where: { id: Number(id) },
    });

    // Retorna uma mensagem de sucesso
    return NextResponse.json(
      {
        message: "Tag excluída com sucesso.",
        deletedTag: existingTag,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(`Erro ao excluir tag:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível excluir a tag. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
