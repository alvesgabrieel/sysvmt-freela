import { NextResponse } from "next/server";

import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
// import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (
      !data.name ||
      !data.phone ||
      !data.email ||
      !data.site ||
      !data.login ||
      !data.password
    ) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "Preencha todos os campos obrigatórios.",
        },
        { status: 400 },
      );
    }

    // Converter os valores para float
    const hostingCommissionUpfront = parseBrazilianNumber(
      data.hostingCommissionUpfront,
    );
    const hostingCommissionInstallment = parseBrazilianNumber(
      data.hostingCommissionInstallment,
    );
    const ticketCommissionUpfront = parseBrazilianNumber(
      data.ticketCommissionUpfront,
    );
    const ticketCommissionInstallment = parseBrazilianNumber(
      data.ticketCommissionInstallment,
    );

    if (
      isNaN(hostingCommissionUpfront) ||
      isNaN(hostingCommissionInstallment) ||
      isNaN(ticketCommissionUpfront) ||
      isNaN(ticketCommissionInstallment)
    ) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "Comissões devem ser números válidos.",
        },
        { status: 400 },
      );
    }

    const existingTourOperator = await db.tourOperator.findFirst({
      where: {
        OR: [{ name: data.name }, { email: data.email }, { login: data.login }],
      },
    });

    if (existingTourOperator) {
      return NextResponse.json(
        {
          error: "Operador já existe.",
          message: "Já existe uma operadora com este nome, e-mail ou login.",
        },
        { status: 400 },
      );
    }

    const tourOperator = await db.tourOperator.create({
      data: {
        name: data.name,
        phone: data.phone,
        contact: data.contact,
        email: data.email,
        site: data.site,
        login: data.login,
        password: data.password,
        observation: data.observation,
        hostingCommissionUpfront,
        hostingCommissionInstallment,
        ticketCommissionUpfront,
        ticketCommissionInstallment,
      },
    });

    return NextResponse.json(
      {
        message: "Operadora criada com sucesso.",
        tourOperator,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao salvar Operadora no banco de dados:", error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível criar Operadora. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
