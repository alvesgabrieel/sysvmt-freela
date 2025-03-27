import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

interface Filters {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // 1. Extrai filtros (mantido igual)
    const filters: Filters = {};
    if (searchParams.has("id") && searchParams.get("id") !== "") {
      filters.id = parseInt(searchParams.get("id")!, 10);
    }
    if (searchParams.has("name") && searchParams.get("name") !== "") {
      filters.name = searchParams.get("name")!;
    }
    if (searchParams.has("phone") && searchParams.get("phone") !== "") {
      filters.phone = searchParams.get("phone")!;
    }
    if (searchParams.has("email") && searchParams.get("email") !== "") {
      filters.email = searchParams.get("email")!;
    }
    if (
      searchParams.has("dateOfBirth") &&
      searchParams.get("dateOfBirth") !== ""
    ) {
      filters.dateOfBirth = searchParams.get("dateOfBirth")!;
    }

    // 2. Paginação SEMPRE ativa (valores padrão: page=1, itemsPerPage=5)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || "5", 10); // Removida a opção "0"
    const skip = (page - 1) * itemsPerPage;

    // 3. Consulta ao banco (com paginação em TODOS os casos)
    const [companions, totalCompanions] = await Promise.all([
      db.companion.findMany({
        where: {
          ...(filters.id && { id: filters.id }),
          ...(filters.name && {
            name: { contains: filters.name, mode: "insensitive" },
          }),
          ...(filters.phone && { phone: filters.phone }),
          ...(filters.email && { email: filters.email }),
          ...(filters.dateOfBirth && { dateOfBirth: filters.dateOfBirth }),
        },
        skip,
        take: itemsPerPage, // Sem condicional: sempre paginado
      }),
      db.companion.count({ where: { ...filters } }), // Contagem total
    ]);

    // 4. Resposta padronizada (sempre com paginação)
    return NextResponse.json(
      {
        companions,
        totalPages: Math.ceil(totalCompanions / itemsPerPage),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar os acompanhantes:", error);
    return NextResponse.json(
      { error: "Erro no servidor", message: "Falha ao processar a requisição" },
      { status: 500 },
    );
  }
}
