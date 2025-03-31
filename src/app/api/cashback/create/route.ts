import { NextResponse } from "next/server";

import { parseBrazilianDate } from "@/app/functions/backend/parse-brazilian-date";
import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // // Validação dos campos obrigatórios
    // if (
    //   !data.name ||
    //   !data.startDate ||
    //   !data.endDate ||
    //   !data.percentage ||
    //   !data.validityDays ||
    //   !data.purchaseDate ||
    //   !data.checkin ||
    //   !data.checkout
    // ) {
    //   return NextResponse.json(
    //     {
    //       error: "Dados inválidos.",
    //       message: "Preencha todos os campos obrigatórios.",
    //     },
    //     { status: 400 },
    //   );
    // }

    // Conversão e validação das datas
    const startDate = parseBrazilianDate(data.startDate);
    const endDate = parseBrazilianDate(data.endDate);
    const purchaseDate = parseBrazilianDate(data.purchaseDate);
    const checkin = parseBrazilianDate(data.checkin);
    const checkout = parseBrazilianDate(data.checkout);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      isNaN(purchaseDate.getTime()) ||
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

    const existingCashback = await db.cashback.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingCashback) {
      return NextResponse.json(
        {
          error: "Cashback já existe.",
          message: "Já existe um cashback com este nome.",
        },
        { status: 400 },
      );
    }

    const cashback = await db.cashback.create({
      data: {
        name: data.name,
        startDate: startDate, // Usando o objeto Date convertido
        endDate: endDate, // Usando o objeto Date convertido
        percentage: percentage,
        validityDays: validityDays,
        purchaseDate: purchaseDate,
        checkin: checkin,
        checkout: checkout,
      },
    });

    return NextResponse.json(
      {
        message: "Cashback criado com sucesso.",
        cashback,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao criar cashback:", error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível criar o cashback.",
      },
      { status: 500 },
    );
  }
}
