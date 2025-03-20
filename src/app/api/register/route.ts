import bcrypt from "bcryptjs"; // Se estiver rodando localmente, pode usar "bcrypt"
import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/lib/prisma";

const userSchema = z
  .object({
    name: z.string().min(3, {
      message: "O nome deve ter pelo menos 3 caracteres.",
    }),
    username: z
      .string()
      .min(3, {
        message: "O nome de usuário deve ter pelo menos 3 caracteres.",
      })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message:
          "O nome de usuário deve conter apenas letras, números e underscores.",
      }),
    email: z.string().email({ message: "Email inválido." }),
    password: z
      .string()
      .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
      .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
        message: "A senha deve conter pelo menos uma letra e um número.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validação dos dados
    const parsedData = userSchema.safeParse(data);
    if (!parsedData.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          message: "Por favor, verifique os campos preenchidos.",
          details: parsedData.error.format(),
        },
        { status: 400 },
      );
    }

    const { name, username, email, password } = parsedData.data;

    // Verifica se o usuário já existe
    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Usuário já existe.",
          message: "Este email ou usuário já está cadastrado.",
        },
        { status: 400 },
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criação do usuário no banco de dados
    const user = await db.user.create({
      data: { name, username, email, password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso!", user },
      { status: 201 },
    );
  } catch (error) {
    console.error(`Erro ao salvar usuário no banco de dados:`, error);
    return NextResponse.json(
      {
        error: "Erro no servidor.",
        message: "Não foi possível criar sua conta. Tente novamente.",
      },
      { status: 500 },
    );
  }
}
