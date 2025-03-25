import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { parseBrazilianDate } from "@/app/functions/backend/parse-brazilian-date";
import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

interface Filters {
  id?: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  percentage?: number;
  validityDays?: number;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filters: Filters = {};

    // Filtro por ID
    if (url.searchParams.has("id") && url.searchParams.get("id") !== "") {
      filters.id = parseInt(url.searchParams.get("id")!, 10);
      if (isNaN(filters.id)) {
        return NextResponse.json(
          { error: "ID inválido", message: "O ID deve ser um número" },
          { status: 400 },
        );
      }
    }

    // Filtro por nome
    if (url.searchParams.has("name") && url.searchParams.get("name") !== "") {
      filters.name = url.searchParams.get("name")!;
    }

    // Filtro por data de início (formato dd/mm/aaaa)
    if (
      url.searchParams.has("startDate") &&
      url.searchParams.get("startDate") !== ""
    ) {
      const dateStr = url.searchParams.get("startDate")!;
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return NextResponse.json(
          {
            error: "Formato inválido",
            message: "Data de início deve estar no formato dd/mm/aaaa",
          },
          { status: 400 },
        );
      }
      filters.startDate = parseBrazilianDate(dateStr);
      if (isNaN(filters.startDate.getTime())) {
        return NextResponse.json(
          { error: "Data inválida", message: "Verifique a data de início" },
          { status: 400 },
        );
      }
    }

    // Filtro por data final (formato dd/mm/aaaa)
    if (
      url.searchParams.has("endDate") &&
      url.searchParams.get("endDate") !== ""
    ) {
      const dateStr = url.searchParams.get("endDate")!;
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return NextResponse.json(
          {
            error: "Formato inválido",
            message: "Data final deve estar no formato dd/mm/aaaa",
          },
          { status: 400 },
        );
      }
      filters.endDate = parseBrazilianDate(dateStr);
      if (isNaN(filters.endDate.getTime())) {
        return NextResponse.json(
          { error: "Data inválida", message: "Verifique a data final" },
          { status: 400 },
        );
      }
    }

    // Filtro por percentual (aceita "25,3" ou "25.3")
    if (
      url.searchParams.has("percentage") &&
      url.searchParams.get("percentage") !== ""
    ) {
      const percentageStr = url.searchParams.get("percentage")!;
      if (!/^\d+([,.]\d{1,2})?$/.test(percentageStr)) {
        return NextResponse.json(
          {
            error: "Formato inválido",
            message: "Use vírgula ou ponto (ex: 25,3 ou 25.3)",
          },
          { status: 400 },
        );
      }
      filters.percentage = parseBrazilianNumber(percentageStr);
      if (isNaN(filters.percentage)) {
        return NextResponse.json(
          {
            error: "Percentual inválido",
            message: "Deve ser um número positivo",
          },
          { status: 400 },
        );
      }
    }

    // Filtro por validade em dias
    if (
      url.searchParams.has("validityDays") &&
      url.searchParams.get("validityDays") !== ""
    ) {
      filters.validityDays = parseInt(
        url.searchParams.get("validityDays")!,
        10,
      );
      if (isNaN(filters.validityDays) || filters.validityDays <= 0) {
        return NextResponse.json(
          {
            error: "Validade inválida",
            message: "Deve ser um número de dias positivo",
          },
          { status: 400 },
        );
      }
    }

    // Paginação
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const itemsPerPage = parseInt(
      url.searchParams.get("itemsPerPage") || "10",
      10,
    );
    const skip = (page - 1) * itemsPerPage;

    // CONSTRUÇÃO DO WHERE (ÚNICA ALTERAÇÃO REAL)
    const whereClause: Prisma.CashbackWhereInput = {
      AND: [
        ...(filters.id ? [{ id: filters.id }] : []),
        ...(filters.name
          ? [{ name: { contains: filters.name, mode: "insensitive" as const } }]
          : []),
        ...(filters.startDate
          ? [{ startDate: { gte: filters.startDate } }]
          : []),
        ...(filters.endDate ? [{ endDate: { lte: filters.endDate } }] : []),
        ...(filters.percentage ? [{ percentage: filters.percentage }] : []),
        ...(filters.validityDays
          ? [{ validityDays: filters.validityDays }]
          : []),
      ],
    };

    // Consulta ao banco
    const cashbacks = await db.cashback.findMany({
      where: whereClause,
      skip,
      take: itemsPerPage,
      orderBy: { createdAt: "desc" },
    });

    // Contagem para paginação
    const totalCashback = await db.cashback.count({ where: whereClause });
    const totalPages = Math.ceil(totalCashback / itemsPerPage);

    return NextResponse.json(
      {
        cashbacks,
        pagination: {
          currentPage: page,
          totalPages,
          itemsPerPage,
          totalItems: totalCashback,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar cashbacks:", error);
    return NextResponse.json(
      {
        error: "Erro interno",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
