import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignIn() {
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
          <h2 className="text-2xl font-semibold mb-4">
            Que bom ver você novamente
          </h2>

          <div className="space-y-4">
            <Input type="email" placeholder="Email or phone number" />
            <Input type="password" placeholder="Enter password" />

            <div className="flex items-center justify-between text-sm">
              <a
                href="/changepassword"
                className="text-blue-600 hover:underline"
              >
                Esqueceu sua senha?
              </a>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Entrar
            </Button>
          </div>

          <div className="text-center mt-4 text-sm">
            <span>Ainda nao possui uma conta?</span>
            <a href="/signup" className="text-blue-600 hover:underline">
              Cadastre-se
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
