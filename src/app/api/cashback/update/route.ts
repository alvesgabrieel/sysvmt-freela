import { NextResponse } from "next/server";

import { parseBrazilianDate } from "@/app/functions/backend/parse-brazilian-date";
import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do cashback é obrigatório." },
        { status: 400 },
      );
    }

    const data = await request.json();

    const startDate = parseBrazilianDate(data.startDate);
    const endDate = parseBrazilianDate(data.endDate);
    const purchaseData = parseBrazilianDate(data.purchaseData);
    const checkin = parseBrazilianDate(data.checkin);
    const checkout = parseBrazilianDate(data.checkout);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      isNaN(purchaseData.getTime()) ||
      isNaN(checkin.getTime()) ||
      isNaN(checkout.getTime())
    ) {
      return NextResponse.json(
        {
          error: "Data inválida.",
          message: "Data inválida ou formato incorreto (use dd/mm/aaaa).",
        },
        { status: 400 },
      );
    }

    // Verificação de conflito de datas
    if (startDate >= endDate) {
      return NextResponse.json(
        {
          error: "Datas inválidas.",
          message: "A data de início deve ser anterior à data de fim.",
        },
        { status: 400 },
      );
    }

    // Validação do percentual (agora aceita "10,5" ou "10.5")
    const percentage = parseBrazilianNumber(data.percentage);
    if (isNaN(percentage)) {
      return NextResponse.json(
        {
          error: "Percentual inválido",
          message: "Use números com vírgula (ex: 10,5 para 10.5%)",
        },
        { status: 400 },
      );
    }

    // Verifica se é um valor positivo
    if (percentage <= 0) {
      return NextResponse.json(
        {
          error: "Percentual inválido",
          message: "O percentual deve ser maior que zero",
        },
        { status: 400 },
      );
    }

    // Validação dos dias de validade
    const validityDays = parseInt(data.validityDays);
    if (isNaN(validityDays) || validityDays <= 0) {
      return NextResponse.json(
        {
          error: "Validade inválida.",
          message: "A validade deve ser um número de dias positivo.",
        },
        { status: 400 },
      );
    }

    const updatedCashback = await db.cashback.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        startDate: startDate,
        endDate: endDate,
        percentage: percentage,
        validityDays: validityDays,
        purchaseData: purchaseData,
        checkin: checkin,
        checkout: checkout,
      },
    });

    return NextResponse.json(
      {
        message: "Cashback atualizado com sucesso.",
        cashback: updatedCashback,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar cashback:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar cashback." },
      { status: 500 },
    );
  }
}
