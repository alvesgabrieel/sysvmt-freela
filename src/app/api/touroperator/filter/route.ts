import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

interface Filters {
  id?: number;
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
  site?: string;
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
    if (
      url.searchParams.has("contact") &&
      url.searchParams.get("contact") !== ""
    ) {
      filters.contact = url.searchParams.get("contact")!;
    }
    if (url.searchParams.has("phone") && url.searchParams.get("phone") !== "") {
      filters.phone = url.searchParams.get("phone")!;
    }
    if (url.searchParams.has("email") && url.searchParams.get("email") !== "") {
      filters.email = url.searchParams.get("email")!;
    }
    if (url.searchParams.has("site") && url.searchParams.get("site") !== "") {
      filters.site = url.searchParams.get("site")!;
    }

    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(
      url.searchParams.get("itemsPerPage") || "5",
      10,
    );
    const skip = (page - 1) * itemsPerPage;

    const tourOperator = await db.tourOperator.findMany({
      where: {
        ...(filters.id && { id: filters.id }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: "insensitive",
          },
        }),
        ...(filters.contact && {
          contact: {
            contains: filters.contact,
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
        ...(filters.site && {
          site: {
            contains: filters.site,
            mode: "insensitive",
          },
        }),
      },
      skip: skip,
      take: itemsPerPage,
    });

    const totalTourOperator = await db.tourOperator.count({
      where: {
        ...(filters.id && { id: filters.id }),
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: "insensitive",
          },
        }),
        ...(filters.contact && {
          contact: {
            contains: filters.contact,
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
        ...(filters.site && {
          site: {
            contains: filters.site,
            mode: "insensitive",
          },
        }),
      },
    });

    const totalPages = Math.ceil(totalTourOperator / itemsPerPage);

    return NextResponse.json({ tourOperator, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`Erro ao buscar operadoras no banco de dados:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível buscar as operadoras. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
