import { NextResponse } from "next/server";

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
      !data.password ||
      data.upfrontComission === undefined ||
      data.installmentComission === undefined
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
    const upfrontComission = parseFloat(data.upfrontComission);
    const installmentComission = parseFloat(data.installmentComission);

    if (isNaN(upfrontComission) || isNaN(installmentComission)) {
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
          message:
            "Já existe um operador turístico com este nome, e-mail ou login.",
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
        upfrontComission,
        installmentComission,
      },
    });

    return NextResponse.json(
      {
        message: "Operador turístico criado com sucesso.",
        tourOperator,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Erro ao salvar o operador turístico no banco de dados:",
      error,
    );
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message:
          "Não foi possível criar o operador turístico. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
