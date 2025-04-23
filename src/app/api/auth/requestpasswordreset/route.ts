import crypto from "crypto";
import { NextResponse } from "next/server";

import { db } from "@/lib/prisma";

// Adicione no início do arquivo
const FROM_NAME = "Vila Mira Turismo"; // Nome que aparece no remetente

export async function POST(request: Request) {
  try {
    console.log("=== DEBUG MODE ===");
    console.log("FROM_EMAIL:", process.env.FROM_EMAIL);
    console.log(
      "API Key:",
      process.env.MAILERSEND_API_KEY?.slice(0, 10) + "...",
    );

    const { email } = await request.json();

    // Verifica usuário
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "Se o email existir, enviaremos um link de redefinição" },
        { status: 200 },
      );
    }

    // Gera token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await db.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/changepassword?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Template de e-mail melhorado
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Redefinição de Senha</h2>
        <p>Clique no botão abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}" 
           style="background: #2563eb; color: white; padding: 10px 15px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Redefinir Senha
        </a>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
          Se você não solicitou isso, ignore este e-mail. O link expira em 1 hora.
        </p>
      </div>
    `;

    // Envia email via MailerSend
    const mailResponse = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: {
          email: process.env.FROM_EMAIL,
          name: FROM_NAME,
        },
        to: [{ email }],
        subject: "Redefinição de Senha - Vila Mira Turismo",
        html: emailTemplate,
      }),
    });

    if (!mailResponse.ok) {
      const errorData = await mailResponse.json();
      console.error("Erro MailerSend:", errorData);
      throw new Error("Falha no serviço de e-mail");
    }

    return NextResponse.json(
      { message: "E-mail de redefinição enviado com sucesso" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro completo:", error);
    return NextResponse.json(
      { message: "Erro ao processar solicitação. Tente novamente mais tarde." },
      { status: 500 },
    );
  }
}
