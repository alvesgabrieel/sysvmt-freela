"use client";

import { Loader } from "lucide-react";
import { useState } from "react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TourOperator {
  id: number;
  name: string;
  phone: string;
  contact: string;
  email: string;
  site: string;
  login: string;
  password: string;
  upfrontComission: number;
  installmentComission: number;
  observation?: string | null;
}

interface RegisterTourOperatorProps {
  onAddTourOperator: (newTourOperator: TourOperator) => void;
}

const RegisterTourOperatorDialog: React.FC<RegisterTourOperatorProps> = ({
  onAddTourOperator,
}) => {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [site, setSite] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [upfrontComission, setUpfrontComission] = useState<string>("");
  const [installmentComission, setInstallmentComission] = useState<string>("");
  const [observation, setObservation] = useState<string>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);

  const formatCommissionInput = (value: string) => {
    const input = value.replace(/\D/g, ""); // Remove tudo que não for número

    if (input === "") {
      return ""; // Se o campo estiver vazio, retorna vazio
    } else if (input.length === 1) {
      return input; // Caso tenha apenas 1 dígito
    } else if (input.length === 2) {
      return input.slice(0, 1) + "," + input.slice(1); // 1 dígito antes do ponto
    } else {
      return input.slice(0, 2) + "," + input.slice(2, 5); // 2 dígitos antes do ponto
    }
  };

  const handleCommissionChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(formatCommissionInput(value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/touroperator/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        contact,
        email,
        site,
        login,
        password,
        upfrontComission,
        installmentComission,
        observation,
      }),
    });
    if (response.ok) {
      const result = await response.json();

      onAddTourOperator(result.tourOperator);
      toast.success(result.message);
      setIsOpen(false);
      setIsLoading(false);
      setName("");
      setPhone("");
      setContact("");
      setEmail("");
      setSite("");
      setLogin("");
      setPassword("");
      setUpfrontComission("");
      setInstallmentComission("");
      setObservation("");
    } else {
      const error = await response.json();
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar operadora
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar operadora</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              type="text"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefone" className="text-right">
              Telefone
            </Label>
            <IMaskInput
              id="telefone"
              mask="(00) 0000-0000" // Máscara para telefone
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={phone}
              onAccept={(value) => setPhone(value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contato" className="text-right">
              Contato
            </Label>
            <Input
              id="contato"
              type="text"
              className="col-span-3"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-mail
            </Label>
            <Input
              id="email"
              type="text"
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="site" className="text-right">
              Site
            </Label>
            <Input
              id="site"
              type="text"
              className="col-span-3"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Login
            </Label>
            <Input
              id="login"
              type="text"
              className="col-span-3"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="senha" className="text-right">
              Senha
            </Label>
            <Input
              id="senha"
              type="text"
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comissao-a-vista" className="text-right">
              Comissão à vista (%)
            </Label>
            <Input
              id="comissao-a-vista"
              type="text"
              inputMode="decimal"
              className="col-span-3"
              value={upfrontComission}
              onChange={(e) =>
                handleCommissionChange(e.target.value, setUpfrontComission)
              }
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comissao-parcelada" className="text-right">
              Comissão parcelada (%)
            </Label>
            <Input
              id="comissao-parcelada"
              type="text"
              inputMode="decimal"
              className="col-span-3"
              value={installmentComission}
              onChange={(e) =>
                handleCommissionChange(e.target.value, setInstallmentComission)
              }
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="observacao" className="self-start pt-2 text-right">
              Observação
            </Label>
            <textarea
              id="observacao"
              className="col-span-3 rounded-md border bg-[#e5e5e5]/30 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={observation} // Agora controlado
              onChange={(e) => setObservation(e.target.value)} // Atualizando o estado
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? (
                <Loader className="h-4 w-4" /> // Ou qualquer outro componente de loading
              ) : (
                "Cadastrar Operadora"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterTourOperatorDialog;
