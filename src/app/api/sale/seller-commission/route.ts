import { PaymentMethodType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const saleIdParam = searchParams.get("saleId");
  const idInTourOperatorParam = searchParams.get("idInTourOperator");
  const sellerNameParam = searchParams.get("saller");
  const clientNameParam = searchParams.get("client");

  // Se tiver saleId, faz busca única
  if (saleIdParam) {
    if (isNaN(Number(saleIdParam))) {
      return NextResponse.json(
        { error: "Parâmetro saleId inválido." },
        { status: 400 },
      );
    }

    try {
      const saleId = Number(saleIdParam);
      const sale = await db.sale.findUnique({
        where: { id: saleId },
        include: {
          client: true,
          saller: true,
          tourOperator: true,
        },
      });

      if (!sale) {
        return NextResponse.json(
          { error: "Venda não encontrada." },
          { status: 404 },
        );
      }

      const sallerCommission = await db.sallerCommission.findFirst({
        where: {
          sallerId: sale.sallerId,
          tourOperatorId: sale.tourOperatorId,
        },
      });

      const commissionPercentage =
        sale.paymentMethod === PaymentMethodType.CREDITO
          ? (sallerCommission?.installmentCommission ?? 0)
          : (sallerCommission?.upfrontCommission ?? 0);

      return NextResponse.json({
        id: sale.id,
        client: sale.client.name,
        saller: sale.saller.name,
        tourOperator: sale.tourOperator.name,
        grossTotal: sale.grossTotal,
        discountTotal: sale.totalDiscount,
        netTotal: sale.netTotal,
        sallerCommissionPercentage: commissionPercentage,
        sallerCommissionValue: sale.sallerCommissionValue ?? 0,
      });
    } catch (error) {
      console.error("Erro ao buscar dados da venda:", error);
      return NextResponse.json(
        { error: "Erro ao buscar dados da venda." },
        { status: 500 },
      );
    }
  }

  // Caso não tenha saleId, faz busca com filtros
  try {
    const where: Prisma.SaleWhereInput = {};

    if (idInTourOperatorParam) {
      where.idInTourOperator = Number(idInTourOperatorParam);
    }

    if (sellerNameParam) {
      where.saller = {
        name: {
          contains: sellerNameParam as string, // Cast para string
          mode: "insensitive",
        },
      };
    }

    if (clientNameParam) {
      where.client = {
        name: {
          contains: clientNameParam as string, // Cast para string
          mode: "insensitive",
        },
      };
    }

    const sales = await db.sale.findMany({
      where,
      include: {
        client: true,
        saller: true,
        tourOperator: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    const result = await Promise.all(
      sales.map(async (sale) => {
        const sallerCommission = await db.sallerCommission.findFirst({
          where: {
            sallerId: sale.sallerId,
            tourOperatorId: sale.tourOperatorId,
          },
        });

        const commissionPercentage =
          sale.paymentMethod === PaymentMethodType.CREDITO
            ? (sallerCommission?.installmentCommission ?? 0)
            : (sallerCommission?.upfrontCommission ?? 0);

        return {
          id: sale.id,
          client: sale.client.name,
          saller: sale.saller.name,
          tourOperator: sale.tourOperator.name,
          grossTotal: sale.grossTotal,
          discountTotal: sale.totalDiscount,
          netTotal: sale.netTotal,
          sallerCommissionPercentage: commissionPercentage,
          sallerCommissionValue: sale.sallerCommissionValue ?? 0,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas." },
      { status: 500 },
    );
  }
}
