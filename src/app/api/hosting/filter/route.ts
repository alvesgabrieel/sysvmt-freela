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

    // Pegando os filtros da query string
    const filters: Filters = {};
    if (url.searchParams.has("id") && url.searchParams.get("id") !== "") {
      filters.id = parseInt(url.searchParams.get("id")!, 10);
    }
    if (url.searchParams.has("name") && url.searchParams.get("name") !== "") {
      filters.name = url.searchParams.get("name")!;
    }
    if (url.searchParams.has("state") && url.searchParams.get("state") !== "") {
      filters.state = url.searchParams.get("state")!;
    }
    if (url.searchParams.has("city") && url.searchParams.get("city") !== "") {
      filters.city = url.searchParams.get("city")!;
    }
    if (
      url.searchParams.has("observation") &&
      url.searchParams.get("observation") !== ""
    ) {
      filters.observation = url.searchParams.get("observation")!;
    }

    // Pegando parâmetros de paginação
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(
      url.searchParams.get("itemsPerPage") || "5",
      10,
    );
    const skip = (page - 1) * itemsPerPage;

    // Consultando ingressos no banco de dados com filtros e paginação
    const hostings = await db.hosting.findMany({
      where: {
        ...(filters.id && { id: filters.id }), // Filtro por ID (se existir)
        ...(filters.name && {
          name: {
            contains: filters.name, // Filtro por nome (case-insensitive)
            mode: "insensitive", // Ignora maiúsculas/minúsculas
          },
        }),
        ...(filters.state && { state: filters.state }), // Filtro por estado
        ...(filters.city && { city: filters.city }), // Filtro por cidade
        ...(filters.observation && {
          observation: {
            contains: filters.observation, // Filtro por observação (case-insensitive)
            mode: "insensitive", // Ignora maiúsculas/minúsculas
          },
        }),
      },
      skip: skip,
      take: itemsPerPage,
    });

    // Contando o total de registros para cálculo de total de páginas
    const totalHostings = await db.hosting.count({
      where: {
        ...(filters.id && { id: filters.id }), // Filtro por ID (se existir)
        ...(filters.name && {
          name: {
            contains: filters.name, // Filtro por nome (case-insensitive)
            mode: "insensitive", // Ignora maiúsculas/minúsculas
          },
        }),
        ...(filters.state && { state: filters.state }), // Filtro por estado
        ...(filters.city && { city: filters.city }), // Filtro por cidade
        ...(filters.observation && {
          observation: {
            contains: filters.observation, // Filtro por observação (case-insensitive)
            mode: "insensitive", // Ignora maiúsculas/minúsculas
          },
        }),
      },
    });

    const totalPages = Math.ceil(totalHostings / itemsPerPage);

    return NextResponse.json({ hostings, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar as hospedagens no banco de dados:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível buscar as hospedagens. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
