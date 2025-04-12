import { PaymentMethodType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Obter todos os parâmetros possíveis
  const saleIdParam = searchParams.get("saleId");
  const idInTourOperatorParam = searchParams.get("idInTourOperator");
  const tourOperatorNameParam = searchParams.get("tourOperator");
  const clientNameParam = searchParams.get("client");

  // Se tiver saleId, mantemos o comportamento original (busca única)
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

      const isCredit = sale.paymentMethod === PaymentMethodType.CREDITO;

      const hostingCommissionPercentage = isCredit
        ? (sale.tourOperator?.hostingCommissionInstallment ?? 0)
        : (sale.tourOperator?.hostingCommissionUpfront ?? 0);

      const ticketCommissionPercentage = isCredit
        ? (sale.tourOperator?.ticketCommissionInstallment ?? 0)
        : (sale.tourOperator?.ticketCommissionUpfront ?? 0);

      return NextResponse.json({
        id: sale.id,
        client: sale.client.name,
        saller: sale.saller.name,
        tourOperator: sale.tourOperator.name,
        grossTotal: sale.grossTotal,
        discountTotal: sale.totalDiscount,
        netTotal: sale.netTotal,
        agencyTicketCommissionPercentage: ticketCommissionPercentage,
        agencyHostingCommissionPercentage: hostingCommissionPercentage,
        agencyCommissionValue: sale.agencyCommissionValue ?? 0,
      });
    } catch (error) {
      console.error("Erro ao buscar dados da venda:", error);
      return NextResponse.json(
        { error: "Erro ao buscar comissão da agência." },
        { status: 500 },
      );
    }
  }

  // Caso não tenha saleId, fazemos uma busca com ou sem filtros
  try {
    // Construir objeto de where com tipo específico
    const where: Prisma.SaleWhereInput = {};

    if (idInTourOperatorParam) {
      where.idInTourOperator = Number(idInTourOperatorParam);
    }

    if (tourOperatorNameParam) {
      where.tourOperator = {
        name: {
          contains: tourOperatorNameParam,
          mode: "insensitive",
        },
      };
    }

    if (clientNameParam) {
      where.client = {
        name: {
          contains: clientNameParam,
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
        saleDate: "desc", // Ordena por data mais recente primeiro
      },
    });

    // Mapear os resultados para o formato desejado
    const result = sales.map((sale) => {
      const isCredit = sale.paymentMethod === PaymentMethodType.CREDITO;

      const hostingCommissionPercentage = isCredit
        ? (sale.tourOperator?.hostingCommissionInstallment ?? 0)
        : (sale.tourOperator?.hostingCommissionUpfront ?? 0);

      const ticketCommissionPercentage = isCredit
        ? (sale.tourOperator?.ticketCommissionInstallment ?? 0)
        : (sale.tourOperator?.ticketCommissionUpfront ?? 0);

      return {
        id: sale.id,
        client: sale.client.name,
        saller: sale.saller.name,
        tourOperator: sale.tourOperator.name,
        grossTotal: sale.grossTotal,
        discountTotal: sale.totalDiscount,
        netTotal: sale.netTotal,
        agencyTicketCommissionPercentage: ticketCommissionPercentage,
        agencyHostingCommissionPercentage: hostingCommissionPercentage,
        agencyCommissionValue: sale.agencyCommissionValue ?? 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar vendas." },
      { status: 500 },
    );
  }
}
