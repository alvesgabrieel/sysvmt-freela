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
  observation?: string | null;
  hostingCommissionUpfront: string;
  hostingCommissionInstallment: string;
  ticketCommissionUpfront: string;
  ticketCommissionInstallment: string;
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
  // const [upfrontInput, setUpfrontInput] = useState<string>("");
  // const [installmentInput, setInstallmentInput] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
  const [hostingCommissionUpfront, setHostingCommissionUpfront] =
    useState<string>("");
  const [hostingCommissionInstallment, setHostingCommissionInstallment] =
    useState<string>("");
  const [ticketCommissionUpfront, setTicketCommissionUpfront] =
    useState<string>("");
  const [ticketCommissionInstallment, setTicketCommissionInstallment] =
    useState<string>("");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Função para formatar o valor digitado como porcentagem (0.05%, 1.23%, etc)
  const formatPercentage = (input: string): string => {
    if (!input) return "";

    const numbers = input.replace(/\D/g, "");
    const padded = numbers.padStart(3, "0"); // Garante pelo menos 3 dígitos (1 + 2 decimais)

    const integerPart = padded.slice(0, -2) || "0";
    const decimalPart = padded.slice(-2);

    return `${integerPart},${decimalPart}%`;
  };

  // Função para lidar com as teclas pressionadas
  const handlePercentageKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentValue: string,
    setValue: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    // Permite apenas números e Backspace
    if (!/[0-9]|Backspace/.test(e.key)) {
      e.preventDefault();
      return;
    }

    let newValue = currentValue.replace(/\D/g, "");

    if (e.key === "Backspace") {
      newValue = newValue.slice(0, -1);
    } else {
      newValue += e.key;
    }

    // Limita o tamanho para evitar números muito grandes
    if (newValue.length > 5) {
      // Máximo 999,99%
      return;
    }

    setValue(newValue);
  };

  // Converte o valor digitado para o formato que o backend espera (ex: "123" → "1.23")
  const formatForBackend = (input: string): string => {
    if (!input) return "0,00"; // Valor padrão quando vazio

    const numbers = input.replace(/\D/g, "");
    const padded = numbers.padStart(3, "0"); // Garante 2 casas decimais

    return `${padded.slice(0, -2)},${padded.slice(-2)}`;
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
        //upfrontComission: formatForBackend(upfrontInput),
        //installmentComission: formatForBackend(installmentInput),
        observation,
        hostingCommissionUpfront: formatForBackend(hostingCommissionUpfront),
        hostingCommissionInstallment: formatForBackend(
          hostingCommissionInstallment,
        ),
        ticketCommissionUpfront: formatForBackend(ticketCommissionUpfront),
        ticketCommissionInstallment: formatForBackend(
          ticketCommissionInstallment,
        ),
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
      // setUpfrontInput("");
      // setInstallmentInput("");
      setObservation("");
      setHostingCommissionUpfront("");
      setHostingCommissionInstallment("");
      setTicketCommissionUpfront("");
      setTicketCommissionInstallment("");
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
              className="col-span-3 ml-[76px] w-[598px]"
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
              mask="(00) 00000-0000"
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring ml-[76px] flex h-10 w-[598px]  rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="col-span-3 ml-[76px] w-[598px]"
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
              className="col-span-3 ml-[76px] w-[598px]"
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
              className="col-span-3 ml-[76px] w-[598px]"
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
              className="col-span-3 ml-[76px] w-[598px]"
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
              className="col-span-3 ml-[76px] w-[598px]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comissao-hosp-a-vista" className="w-sm text-right">
              Comissão da hospedagem à vista (%)
            </Label>
            <Input
              id="comissao-hosp-a-vista"
              type="text"
              className="col-span-3 ml-[76px] w-[598px]"
              value={formatPercentage(hostingCommissionUpfront)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(
                  e,
                  hostingCommissionUpfront,
                  setHostingCommissionUpfront,
                )
              }
              readOnly
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="comissao-hosp-parcelada"
              className="w-sm text-right"
            >
              Comissão da hospedagem parcelada (%)
            </Label>
            <Input
              id="comissao-hosp-parcelada"
              type="text"
              className="col-span-3 ml-[76px] w-[598px]"
              value={formatPercentage(hostingCommissionInstallment)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(
                  e,
                  hostingCommissionInstallment,
                  setHostingCommissionInstallment,
                )
              }
              readOnly
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="comissao-ingresso-a-vista"
              className="w-sm text-right"
            >
              Comissão do ingresso à vista (%)
            </Label>
            <Input
              id="comissao-ingresso-a-vista"
              type="text"
              className="col-span-3 ml-[76px] w-[598px]"
              value={formatPercentage(ticketCommissionUpfront)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(
                  e,
                  ticketCommissionUpfront,
                  setTicketCommissionUpfront,
                )
              }
              readOnly
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="comissao-ingresso-parcelada"
              className="w-sm text-right"
            >
              Comissão do ingresso parcelada (%)
            </Label>
            <Input
              id="comissao-ingresso-parcelada"
              type="text"
              className="col-span-3 ml-[76px] w-[598px]"
              value={formatPercentage(ticketCommissionInstallment)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(
                  e,
                  ticketCommissionInstallment,
                  setTicketCommissionInstallment,
                )
              }
              readOnly
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Label htmlFor="observacao" className="self-start pt-2 text-right">
              Observação
            </Label>
            <textarea
              id="observacao"
              className="col-span-3 ml-[76px] rounded-md border bg-[#e5e5e5]/30 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
