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

    const filters: Filters = {};
    if (url.searchParams.has("id") && url.searchParams.get("id") !== "") {
      filters.id = parseInt(url.searchParams.get("id")!, 10);
    }
    if (url.searchParams.has("name") && url.searchParams.get("name") !== "") {
      filters.name = url.searchParams.get("name")!;
    }
    if (url.searchParams.has("phone") && url.searchParams.get("phone") !== "") {
      filters.phone = url.searchParams.get("phone")!;
    }
    if (url.searchParams.has("email") && url.searchParams.get("email") !== "") {
      filters.email = url.searchParams.get("email")!;
    }
    if (
      url.searchParams.has("dateOfBirth") &&
      url.searchParams.get("dateOfBirth") !== ""
    ) {
      filters.dateOfBirth = url.searchParams.get("dateOfBirth")!;
    }

    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(
      url.searchParams.get("itemsPerPage") || "5",
      10,
    );
    const skip = (page - 1) * itemsPerPage;

    const companions = await db.companion.findMany({
      where: {
        ...(filters.id && { id: filters.id }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: "insensitive",
          },
        }),
        ...(filters.phone && { phone: filters.phone }),
        ...(filters.email && {
          email: {
            contains: filters.email,
            mode: "insensitive",
          },
        }),
        ...(filters.dateOfBirth && { dateOfBirth: filters.dateOfBirth }),
      },
      skip: skip,
      take: itemsPerPage,
    });

    const totalCompanions = await db.companion.count({
      where: {
        ...(filters.id && { id: filters.id }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: "insensitive",
          },
        }),
        ...(filters.phone && { phone: filters.phone }),
        ...(filters.email && {
          email: {
            contains: filters.email,
            mode: "insensitive",
          },
        }),
        ...(filters.dateOfBirth && { dateOfBirth: filters.dateOfBirth }),
      },
    });

    const totalPages = Math.ceil(totalCompanions / itemsPerPage);

    return NextResponse.json({ companions, totalPages }, { status: 200 });
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
