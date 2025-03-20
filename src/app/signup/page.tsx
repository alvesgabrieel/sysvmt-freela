"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Loader from "../components/loader";

const formSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    username: z
      .string()
      .min(3, "O nome de usuário deve ter pelo menos 3 caracteres.")
      .regex(/^[a-zA-Z0-9_]+$/, "O nome de usuário deve conter apenas letras, números e underline."),
    email: z.string().email("Email inválido."),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres.")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "A senha deve conter pelo menos uma letra e um número."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export default function SignUp() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<null | boolean>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      setIsAuthenticated(false);
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Erro ao registrar.");
      }

      toast.success("Cadastro realizado com sucesso!");
      router.push("/signin");
    } catch (error) {
      toast.error("Ocorreu um erro, tente novamente mais tarde");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isAuthenticated === null) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="relative hidden h-full w-1/2 md:block">
        <Image src="/image_sign_in.jpg" alt="Imagem" layout="fill" objectFit="cover" />
      </div>
      <div className="flex w-full flex-col items-center justify-center px-10 md:w-1/2">
        <div className="w-full max-w-sm">
          <h2 className="mb-4 text-2xl font-semibold">Crie sua conta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("name")} placeholder="Nome completo" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

            <Input {...register("username")} placeholder="Nome de usuário" />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

            <Input {...register("email")} placeholder="Email" type="email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <div className="relative">
              <Input
                {...register("password")}
                placeholder="Senha"
                type={showPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <Input
                {...register("confirmPassword")}
                placeholder="Confirmar senha"
                type={showConfirmPassword ? "text" : "password"}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span>Já possui uma conta?</span>
            <Link href="/signin" className="text-blue-600 hover:underline"> Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
