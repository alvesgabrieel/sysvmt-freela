import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUp() {
  return (
    <div className="flex h-screen w-full">
      {/* Imagem do lado esquerdo */}
      <div className="w-1/2 h-full hidden md:block relative">
        <Image
          src="/image_sign_in.jpg"
          alt="Lighthouse"
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Formulário do lado direito */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold mb-4">Crie sua conta</h2>

          <div className="space-y-4">
            <Input type="text" placeholder="nome completo" />
            <Input type="text" placeholder="username" />
            <Input type="email" placeholder="Email" />
            <Input type="password" placeholder="crie uma senha" />
            <Input type="password" placeholder="confirme sua senha" />

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Criar conta
            </Button>
          </div>

          <div className="text-center mt-4 text-sm">
            <span>Já possui uma conta?</span>
            <a href="/signin" className="text-blue-600 hover:underline">
              Entre
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
