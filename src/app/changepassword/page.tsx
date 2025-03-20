import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChangePassword() {
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
            Insira o email da sua conta
          </h2>

          <div className="space-y-4">
            <Input type="email" placeholder="Insira seu e-mail" />

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Enviar solicitação para alteração de senha
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
