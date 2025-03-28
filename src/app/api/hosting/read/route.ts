import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

interface Filters {
  id?: number;
  name?: string;
  state?: string;
  city?: string;
  observation?: string;
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
    if (searchParams.has("state") && searchParams.get("state") !== "") {
      filters.state = searchParams.get("state")!;
    }
    if (searchParams.has("city") && searchParams.get("city") !== "") {
      filters.city = searchParams.get("city")!;
    }
    if (
      searchParams.has("observation") &&
      searchParams.get("observation") !== ""
    ) {
      filters.observation = searchParams.get("observation")!;
    }

    // 2. Paginação SEMPRE ativa (valores padrão: page=1, itemsPerPage=5)
    const page = parseInt(searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || "5", 10); // Removida a opção "0"
    const skip = (page - 1) * itemsPerPage;

    // 3. Consulta ao banco (com paginação em TODOS os casos)
    const [hostings, totalHostings] = await Promise.all([
      db.hosting.findMany({
        where: {
          ...(filters.id && { id: filters.id }),
          ...(filters.name && {
            name: { contains: filters.name, mode: "insensitive" },
          }),
          ...(filters.state && { state: filters.state }),
          ...(filters.city && { city: filters.city }),
          ...(filters.observation && {
            observation: { contains: filters.observation, mode: "insensitive" },
          }),
        },
        skip,
        take: itemsPerPage,
        orderBy: { id: "desc" },
      }),
      db.hosting.count({ where: { ...filters } }), // Contagem total
    ]);

    // 4. Resposta padronizada (sempre com paginação)
    return NextResponse.json(
      {
        hostings,
        totalPages: Math.ceil(totalHostings / itemsPerPage),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar hospedagens:", error);
    return NextResponse.json(
      { error: "Erro no servidor", message: "Falha ao processar a requisição" },
      { status: 500 },
    );
  }
}
