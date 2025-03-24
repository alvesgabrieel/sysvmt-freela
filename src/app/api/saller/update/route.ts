import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    // Recebe os dados do formulário como FormData
    const formData = await request.formData();

    // Extrai o ID do vendedor da query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID do vendedor é obrigatório." },
        { status: 400 },
      );
    }

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

    // Verifica se a foto foi fornecida e se o tamanho é válido
    if (photo && photo.size > 5 * 1024 * 1024) {
      // 5 MB
      return NextResponse.json(
        {
          error: "O arquivo é muito grande. O tamanho máximo permitido é 5 MB.",
        },
        { status: 400 },
      );
    }

    // Converte a foto para buffer (se existir)
    let photoBuffer = null;
    if (photo) {
      photoBuffer = await photo.arrayBuffer(); // Converte a foto para um buffer
    }

    // Atualiza o vendedor no banco de dados
    const updatedSaller = await db.saller.update({
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
        photo: photoBuffer ? Buffer.from(photoBuffer) : undefined, // Atualiza a foto apenas se um novo arquivo for fornecido
        state,
        city,
        adress,
        number,
        complement,
      },
    });

    return NextResponse.json(
      { message: "Vendedor atualizado com sucesso.", saller: updatedSaller },
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
