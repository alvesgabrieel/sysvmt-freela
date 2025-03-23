import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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
    const photo = formData.get("photo") as File; // Arquivo da foto
    const state = formData.get("state") as string;
    const city = formData.get("city") as string;
    const adress = formData.get("adress") as string;
    const number = formData.get("number") as string;
    const complement = formData.get("complement") as string;

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

    if (photo && photo.size > 5 * 1024 * 1024) {
      // 5 MB
      return NextResponse.json(
        {
          error: "O arquivo é muito grande. O tamanho máximo permitido é 5 MB.",
        },
        { status: 400 },
      );
    }

    // Verifica se o vendedor já existe
    const existingSaller = await db.saller.findFirst({
      where: { login, email },
    });

    if (existingSaller) {
      return NextResponse.json(
        {
          error: "Vendedor já existe.",
          message: "Já existe um vendedor com esse login e e-mail.",
        },
        { status: 400 },
      );
    }

    // Converte a foto para buffer (se existir)
    let photoBuffer = null;
    if (photo) {
      photoBuffer = await photo.arrayBuffer(); // Converte a foto para um buffer
    }

    // Cria o vendedor no banco de dados
    const saller = await db.saller.create({
      data: {
        name,
        login,
        email,
        phone,
        cpf,
        rg,
        observation,
        pix,
        photo: photoBuffer ? Buffer.from(photoBuffer) : null, // Armazena a foto como buffer
        state,
        city,
        adress,
        number,
        complement,
      },
    });

    return NextResponse.json(
      { message: "Saller criado com sucesso.", saller },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao salvar saller no banco de dados:", error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível criar o saller. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
