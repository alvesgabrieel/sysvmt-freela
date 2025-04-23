"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import ChangePasswordForm from "@/app/components/change-password-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

export default function ChangePassword() {
  // const router = useRouter();
  const [step, setStep] = useState<"request" | "success" | "change">("request");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
  });

  const handleRequest = async (data: { email: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/requestpasswordreset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao enviar email");
      }

      setEmail(data.email);
      setStep("success");
      toast.success(
        "Email enviado com sucesso! Verifique sua caixa de entrada.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao processar solicitação",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div className="relative hidden h-full w-1/2 md:block">
        <Image
          src="/image_sign_in.jpg"
          alt="Redefinição de senha"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      <div className="flex w-full flex-col items-center justify-center px-4 md:w-1/2 md:px-10">
        {step === "request" ? (
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Redefinir senha
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Digite o email associado à sua conta
              </p>
            </div>

            <form onSubmit={handleSubmit(handleRequest)} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  {...register("email")}
                  className="h-11"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="h-11 w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="animate-pulse">Enviando...</span>
                ) : (
                  "Continuar"
                )}
              </Button>
            </form>
          </div>
        ) : step === "success" ? (
          <div className="w-full max-w-sm space-y-6 text-center">
            <h1 className="text-2xl font-bold">Verifique seu email</h1>
            <p className="text-muted-foreground mt-4">
              Enviamos um link para <strong>{email}</strong>. Siga as instruções
              para redefinir sua senha.
            </p>
          </div>
        ) : (
          <ChangePasswordForm email={email} token={null} />
        )}
      </div>
    </div>
  );
}
