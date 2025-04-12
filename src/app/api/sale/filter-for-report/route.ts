import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

function isValid(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const saleDateFrom = searchParams.get("saleDateFrom");
    const saleDateTo = searchParams.get("saleDateTo");
    const checkInFrom = searchParams.get("checkInFrom");
    const checkInTo = searchParams.get("checkInTo");
    const checkOutFrom = searchParams.get("checkOutFrom");
    const checkOutTo = searchParams.get("checkOutTo");
    const tourOperatorName = searchParams.get("tourOperator") || undefined;
    const ticketName = searchParams.get("ticket") || undefined;
    const hostingName = searchParams.get("hosting") || undefined;

    const where: Prisma.SaleWhereInput = {
      canceledSale: false,
    };

    if (isValid(saleDateFrom) && isValid(saleDateTo)) {
      where.saleDate = {
        gte: saleDateFrom ? new Date(saleDateFrom) : undefined,
        lte: saleDateTo ? new Date(saleDateTo) : undefined,
      };
    }

    if (isValid(checkInFrom) && isValid(checkInTo)) {
      where.checkIn = {
        gte: checkInFrom ? new Date(checkInFrom) : undefined,
        lte: checkInTo ? new Date(checkInTo) : undefined,
      };
    }

    if (isValid(checkOutFrom) && isValid(checkOutTo)) {
      where.checkOut = {
        gte: checkOutFrom ? new Date(checkOutFrom) : undefined,
        lte: checkOutTo ? new Date(checkOutTo) : undefined,
      };
    }

    if (isValid(tourOperatorName)) {
      where.tourOperator = {
        name: {
          contains: tourOperatorName,
          mode: "insensitive",
        },
      };
    }

    if (isValid(ticketName)) {
      where.saleTicket = {
        some: {
          ticket: {
            name: {
              contains: ticketName,
              mode: "insensitive",
            },
          },
        },
      };
    }

    if (isValid(hostingName)) {
      where.saleHosting = {
        some: {
          hosting: {
            name: {
              contains: hostingName,
              mode: "insensitive",
            },
          },
        },
      };
    }

    const sales = await db.sale.findMany({
      where,
      include: {
        tourOperator: true,
        saleTicket: { include: { ticket: true } },
        saleHosting: { include: { hosting: true } },
        saller: true,
        client: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return NextResponse.json(sales, { status: 200 });
  } catch (error) {
    console.error("Erro ao filtrar vendas:", error);
    return NextResponse.json(
      { error: "Falha ao buscar vendas." },
      { status: 500 },
    );
  }
}
