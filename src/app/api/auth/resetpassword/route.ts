import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, newPassword, token } = await request.json();
    console.log("Token recebido na API:", token); // Adicione esta linha

    // Busca o usuário
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    if (!token) {
      return NextResponse.json(
        { message: "Token é obrigatório" },
        { status: 400 },
      );
    }

    // Verifica o token (se estiver usando)
    if (
      token &&
      (!user.resetToken ||
        user.resetToken !== token ||
        new Date() > user.resetTokenExpiry!)
    ) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 400 },
      );
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha e limpa o token
    await db.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: "Senha alterada com sucesso" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Erro ao alterar senha" },
      { status: 500 },
    );
  }
}
