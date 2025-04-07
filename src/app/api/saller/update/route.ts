import { NextResponse } from "next/server";

import { parseBrazilianNumber } from "@/app/functions/backend/parse-brazilian-number";
import { db } from "@/lib/prisma";

interface CommissionData {
  operadora: string;
  aVista: string;
  parcelado: string;
}

export async function PUT(request: Request) {
  try {
    // Extrai o ID do vendedor da query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do vendedor é obrigatório." },
        { status: 400 },
      );
    }

    // Recebe os dados do formulário como FormData
    const formData = await request.formData();

    // Extrai os campos do FormData
    const name = formData.get("name") as string;
    const login = formData.get("login") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const cpf = formData.get("cpf") as string;
    const rg = formData.get("rg") as string;
    const observation = formData.get("observation") as string;
    const pix = formData.get("pix") as string;
    const state = formData.get("state") as string;
    const city = formData.get("city") as string;
    const adress = formData.get("adress") as string;
    const number = formData.get("number") as string;
    const complement = formData.get("complement") as string;

    // Extrai as comissões (JSON string)
    const commissionsJSON = formData.get("commissions") as string;
    const commissions: CommissionData[] = commissionsJSON
      ? JSON.parse(commissionsJSON)
      : [];

    // Validação das comissões (se houver)
    if (commissions.length > 0) {
      const invalidCommissions = commissions.some(
        (c) =>
          !c.operadora ||
          isNaN(parseBrazilianNumber(c.aVista)) ||
          isNaN(parseBrazilianNumber(c.parcelado)),
      );

      if (invalidCommissions) {
        return NextResponse.json(
          {
            error: "Comissões inválidas",
            message: "Preencha todas as comissões corretamente.",
          },
          { status: 400 },
        );
      }
    }

    // Validação dos campos obrigatórios
    if (
      !name ||
      !login ||
      !email ||
      !phone ||
      !cpf ||
      !rg ||
      !pix ||
      !state ||
      !city ||
      !adress ||
      !number
    ) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "Preencha todos os campos obrigatórios.",
        },
        { status: 400 },
      );
    }

    // Transaction para atualização atômica
    const result = await db.$transaction(async (prisma) => {
      // 1. Atualiza o vendedor
      await prisma.saller.update({
        where: { id: Number(id) },
        data: {
          name,
          login,
          email,
          phone,
          cpf,
          rg,
          observation,
          pix,
          state,
          city,
          adress,
          number,
          complement,
        },
      });

      // 2. Atualiza comissões individualmente
      if (commissions.length > 0) {
        const sentTourOperatorIds = commissions.map((c) => Number(c.operadora));

        // 2.1. Remove comissões não enviadas (opcional)
        await prisma.sallerCommission.deleteMany({
          where: {
            sallerId: Number(id),
            NOT: { tourOperatorId: { in: sentTourOperatorIds } },
          },
        });

        // 2.2. Atualiza ou cria cada comissão
        await Promise.all(
          commissions.map(async (c) => {
            const commissionData = {
              upfrontCommission: parseBrazilianNumber(c.aVista),
              installmentCommission: parseBrazilianNumber(c.parcelado),
            };

            // Verifica se a comissão já existe
            const existingCommission = await prisma.sallerCommission.findFirst({
              where: {
                sallerId: Number(id),
                tourOperatorId: Number(c.operadora),
              },
            });

            if (existingCommission) {
              await prisma.sallerCommission.update({
                where: { id: existingCommission.id },
                data: commissionData,
              });
            } else {
              await prisma.sallerCommission.create({
                data: {
                  sallerId: Number(id),
                  tourOperatorId: Number(c.operadora),
                  ...commissionData,
                },
              });
            }
          }),
        );
      }

      // 3. Retorna o vendedor com todas as relações atualizadas
      return await prisma.saller.findUnique({
        where: { id: Number(id) },
        include: {
          commissions: {
            include: {
              tourOperator: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    // Formata a resposta para o frontend
    const formattedSaller = {
      id: result?.id,
      name: result?.name,
      login: result?.login,
      email: result?.email,
      phone: result?.phone,
      cpf: result?.cpf,
      rg: result?.rg,
      observation: result?.observation,
      pix: result?.pix,
      state: result?.state,
      city: result?.city,
      adress: result?.adress,
      number: result?.number,
      complement: result?.complement,
      commissions: result?.commissions.map((c) => ({
        id: c.id,
        tourOperatorId: c.tourOperatorId,
        tourOperatorName: c.tourOperator.name,
        upfrontCommission: c.upfrontCommission,
        installmentCommission: c.installmentCommission,
      })),
    };

    return NextResponse.json(
      {
        message: "Vendedor atualizado com sucesso.",
        saller: formattedSaller,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao atualizar vendedor:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar vendedor." },
      { status: 500 },
    );
  }
}
