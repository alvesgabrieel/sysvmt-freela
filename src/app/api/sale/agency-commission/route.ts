import { PaymentMethodType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const saleIdParam = searchParams.get("saleId");

  if (!saleIdParam || isNaN(Number(saleIdParam))) {
    return NextResponse.json(
      { error: "Parâmetro saleId inválido ou ausente." },
      { status: 400 },
    );
  }

  const saleId = Number(saleIdParam);

  try {
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
