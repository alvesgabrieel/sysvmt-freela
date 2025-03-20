import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Verifica se o usuário existe no banco de dados
    const user = await db.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    if (!JWT_SECRET) {
      return NextResponse.json(
        { error: "JWT_SECRET não configurado." },
        { status: 500 },
      );
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    // Gera o JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "10h" },
    );

    // Retorna o token para o frontend
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao realizar o login." },
      { status: 500 },
    );
  }
}
