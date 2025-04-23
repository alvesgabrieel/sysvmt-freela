"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
        "A senha deve conter pelo menos uma letra e um número",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

interface ChangePasswordFormProps {
  email?: string; // Opcional (usado no passo 1)
  token: string | null; // Obrigatório (usado nos passos 1 e 2)
}

export default function ChangePasswordForm({
  email,
  token,
}: ChangePasswordFormProps) {
  console.log("Token recebido no componente:", token);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //   const [thisEmail, setThisEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  const handleChangePassword = async (data: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    console.log("Token sendo enviado para API:", token); // Adicione esta linha
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          newPassword: data.newPassword,
          token,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao alterar senha");
      }

      toast.success("Senha alterada com sucesso! Redirecionando...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (error) {
      console.error("Erro completo:", error);
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
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Criar nova senha</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Digite sua nova senha pra {email || "sua conta"}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nova senha"
              {...register("newPassword")}
              className="h-11 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme a nova senha"
              {...register("confirmPassword")}
              className="h-11 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">Atualizando...</span>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <button
          onClick={() => router.push("/signin")}
          className="text-blue-600 hover:underline"
        >
          Voltar para login
        </button>
      </div>
    </div>
  );
}
