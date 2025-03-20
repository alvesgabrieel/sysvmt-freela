"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Loader from "../components/loader";

// Esquema de validação com Zod
const formSchema = z.object({
  username: z.string().min(1, { message: "Username é obrigatório." }),
  password: z.string().min(1, { message: "Senha é obrigatória." }),
});

type FormData = z.infer<typeof formSchema>;

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar a visibilidade da senha

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/dashboard"); 
    } else {
      setIsAuthenticated(false); 
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <Loader />;
  }

  const handleLogin = async (data: FormData) => {
    setIsLoading(true);

    try {
      const loginResponse = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username, password: data.password }),
      });

      if (loginResponse.ok) {
        const { token } = await loginResponse.json();
        localStorage.setItem("token", token);
        router.replace("/dashboard");
        toast.success("Login bem sucedido!");
      } else {
        const errorData = await loginResponse.json();
        toast.error(`Erro ao fazer login: ${errorData.error}`);
      }
    } catch (error) {
      toast.error("Ocorreu um erro, tente novamente mais tarde");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-1/2 h-full hidden md:block relative">
        <Image
          src="/image_sign_in.jpg"
          alt="Lighthouse"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold mb-4">Que bom ver você novamente</h2>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                {...register("username")}
                className={`border ${errors.username ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                {...register("password")}
                className={`border pr-10 ${errors.password ? "border-red-500" : "border-gray-300"}`}
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

            <div className="flex items-center justify-between text-sm">
              <a href="/changepassword" className="text-blue-600 hover:underline">
                Esqueceu sua senha?
              </a>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Carregando..." : "Entrar"}
            </Button>
          </form>

          <div className="text-center mt-4 text-sm">
            <span>Ainda não possui uma conta?</span>
            <a href="/signup" className="text-blue-600 hover:underline">
              <span> Cadastre-se</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
