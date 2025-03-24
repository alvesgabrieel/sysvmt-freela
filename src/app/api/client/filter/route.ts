import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

interface Filters {
  id?: number;
  name?: string;
  cpf?: string;
  login?: string;
  state?: string;
  city?: string;
  phone?: string;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const filters: Filters = {};
    if (url.searchParams.has("id") && url.searchParams.get("id") !== "") {
      filters.id = parseInt(url.searchParams.get("id")!, 10);
    }
    if (url.searchParams.has("name") && url.searchParams.get("name") !== "") {
      filters.name = url.searchParams.get("name")!;
    }
    if (url.searchParams.has("cpf") && url.searchParams.get("cpf") !== "") {
      filters.cpf = url.searchParams.get("cpf")!;
    }
    if (url.searchParams.has("login") && url.searchParams.get("login") !== "") {
      filters.login = url.searchParams.get("login")!;
    }
    if (url.searchParams.has("state") && url.searchParams.get("state") !== "") {
      filters.state = url.searchParams.get("state")!;
    }
    if (url.searchParams.has("city") && url.searchParams.get("city") !== "") {
      filters.city = url.searchParams.get("city")!;
    }
    if (url.searchParams.has("phone") && url.searchParams.get("phone") !== "") {
      filters.phone = url.searchParams.get("phone")!;
    }

    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(
      url.searchParams.get("itemsPerPage") || "5",
      10,
    );
    const skip = (page - 1) * itemsPerPage;

    const clients = await db.client.findMany({
      where: {
        ...(filters.id && { id: filters.id }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: "insensitive",
          },
        }),
        ...(filters.cpf && { cpf: filters.cpf }),
        ...(filters.login && {
          login: {
            contains: filters.login,
            mode: "insensitive",
          },
        }),
        ...(filters.state && { state: filters.state }),
        ...(filters.city && { city: filters.city }),
        ...(filters.phone && { phone: filters.phone }),
      },
      skip: skip,
      take: itemsPerPage,
    });

    const totalClients = await db.client.count({
      where: {
        ...(filters.id && { id: filters.id }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: "insensitive",
          },
        }),
        ...(filters.cpf && { cpf: filters.cpf }),
        ...(filters.login && {
          login: {
            contains: filters.login,
            mode: "insensitive",
          },
        }),
        ...(filters.state && { state: filters.state }),
        ...(filters.city && { city: filters.city }),
        ...(filters.phone && { phone: filters.phone }),
      },
    });

    const totalPages = Math.ceil(totalClients / itemsPerPage);

    return NextResponse.json({ clients, totalPages }, { status: 200 });
  } catch (err) {
    console.error(`Erro ao buscar sallers no banco de dados:`, err);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível buscar os sallers. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
