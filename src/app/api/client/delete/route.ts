import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          message: "O ID do cliente é obrigatório",
        },
        { status: 400 },
      );
    }

    const existingClient = await db.client.findUnique({
      where: { id: Number(id) },
      include: {
        sales: true, // Include related sales to check for dependencies
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        {
          error: "Cliente não encontrado",
          message: "O cliente que você está tentando excluir não existe",
        },
        { status: 404 },
      );
    }

    // Check if client has any sales
    if (existingClient.sales.length > 0) {
      return NextResponse.json(
        {
          error: "Restrição de integridade",
          message: "Não é possível excluir: cliente possui vendas vinculadas",
          salesCount: existingClient.sales.length,
        },
        { status: 400 },
      );
    }

    await db.client.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      {
        message: "Cliente excluído com sucesso",
        deletedClient: existingClient,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);

    if (error instanceof Error && "code" in error && error.code === "P2003") {
      return NextResponse.json(
        {
          error: "Restrição de integridade",
          message:
            "Este cliente possui registros vinculados e não pode ser excluído",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro no servidor",
        message: "Não foi possível excluir o cliente",
      },
      { status: 500 },
    );
  }
}
