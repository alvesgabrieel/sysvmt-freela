import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

interface Filters {
  id?: number;
  name?: string;
  login?: string;
  email?: string;
  state?: string;
  city?: string;
  phone?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // 1. Extrai filtros
    const filters: Filters = {};
    if (searchParams.has("id") && searchParams.get("id") !== "") {
      filters.id = parseInt(searchParams.get("id")!, 10);
    }
    if (searchParams.has("name") && searchParams.get("name") !== "") {
      filters.name = searchParams.get("name")!;
    }
    if (searchParams.has("login") && searchParams.get("login") !== "") {
      filters.login = searchParams.get("login")!;
    }
    if (searchParams.has("email") && searchParams.get("email") !== "") {
      filters.email = searchParams.get("email")!;
    }
    if (searchParams.has("state") && searchParams.get("state") !== "") {
      filters.state = searchParams.get("state")!;
    }
    if (searchParams.has("city") && searchParams.get("city") !== "") {
      filters.city = searchParams.get("city")!;
    }
    if (searchParams.has("phone") && searchParams.get("phone") !== "") {
      filters.phone = searchParams.get("phone")!;
    }

    // 2. Paginação
    const page = parseInt(searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(searchParams.get("itemsPerPage") || "5", 10);
    const skip = (page - 1) * itemsPerPage;

    // 3. Consulta ao banco com relações
    const [sallers, totalSallers] = await Promise.all([
      db.saller.findMany({
        where: {
          ...(filters.id && { id: filters.id }),
          ...(filters.name && {
            name: { contains: filters.name, mode: "insensitive" },
          }),
          ...(filters.login && {
            login: { contains: filters.login, mode: "insensitive" },
          }),
          ...(filters.email && {
            email: { contains: filters.email, mode: "insensitive" },
          }),
          ...(filters.state && { state: filters.state }),
          ...(filters.city && { city: filters.city }),
          ...(filters.phone && { phone: filters.phone }),
        },
        include: {
          commissions: {
            include: {
              tourOperator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        skip,
        take: itemsPerPage,
        orderBy: { id: "desc" },
      }),
      db.saller.count({ where: { ...filters } }),
    ]);

    // 4. Formata a resposta para incluir comissões
    const formattedSallers = sallers.map((saller) => ({
      ...saller,
      commissions: saller.commissions.map((commission) => ({
        id: commission.id,
        tourOperatorId: commission.tourOperatorId,
        tourOperatorName: commission.tourOperator.name,
        upfrontCommission: commission.upfrontCommission,
        installmentCommission: commission.installmentCommission,
      })),
    }));

    // 5. Resposta padronizada
    return NextResponse.json(
      {
        sallers: formattedSallers,
        totalPages: Math.ceil(totalSallers / itemsPerPage),
        currentPage: page,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar os vendedores:", error);
    return NextResponse.json(
      { error: "Erro no servidor", message: "Falha ao processar a requisição" },
      { status: 500 },
    );
  }
}
