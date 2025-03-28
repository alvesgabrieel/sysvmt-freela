import { NextResponse } from "next/server";

import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da operadora é obrigatório." },
        { status: 400 },
      );
    }

    const data = await request.json();

    // Converter os valores para float
    const upfrontComission = parseBrazilianNumber(data.upfrontComission);
    const installmentComission = parseBrazilianNumber(
      data.installmentComission,
    );

    const updatedTourOperator = await db.tourOperator.update({
      where: { id: Number(id) },
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
        observation: data.observation,
      },
    });

    return NextResponse.json(
      {
        message: "Operadora atualizado com sucesso.",
        tourOperator: updatedTourOperator,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar operadora:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar operadora." },
      { status: 500 },
    );
  }
}
