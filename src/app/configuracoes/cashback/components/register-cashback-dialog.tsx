"use client";

import { CashbackType } from "@prisma/client";
import { Loader } from "lucide-react";
import { KeyboardEvent, useState } from "react";
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

interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: string;
  validityDays: number;
  selectType: CashbackType;
}

interface RegisterCashbackDialogProps {
  onAddCashback: (newCashback: Cashback) => void;
}

const RegisterCashbackDialog: React.FC<RegisterCashbackDialogProps> = ({
  onAddCashback,
}) => {
  const [name, setName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("");
  const [validityDays, setValidityDays] = useState<string>("");
  const [selectType, setSelectType] = useState<string>("");

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
    e: KeyboardEvent<HTMLInputElement>,
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

    // Validação adicional
    if (
      new Date(startDate.split("/").reverse().join("-")) >=
      new Date(endDate.split("/").reverse().join("-"))
    ) {
      toast.error("A data final deve ser maior que a data inicial");
      return;
    }

    const response = await fetch("/api/cashback/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        startDate,
        endDate,
        percentage: formatForBackend(percentage),
        validityDays,
        selectType,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      toast.success(result.message);
      onAddCashback(result.cashback);
      setIsOpen(false);
      setIsLoading(false);
      setName("");
      setStartDate("");
      setEndDate("");
      setPercentage("");
      setValidityDays("");
      setSelectType("");
    } else {
      const error = await response.json();
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar cashback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] md:max-w-[600px] lg:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Cadastrar cashback</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="gap-45 grid grid-cols-4 items-center">
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
          <div className="gap-45 grid grid-cols-4 items-center">
            <Label htmlFor="nome" className="w-28 text-right">
              Tipo
            </Label>
            <select
              value={selectType}
              onChange={(e) => setSelectType(e.target.value)}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value=""></option>
              <option value="PURCHASEDATE">Data da compra</option>
              <option value="CHECKOUT">Check-out</option>
              <option value="CHECKIN">Check-in</option>
            </select>
          </div>
          <div className="gap-45 grid grid-cols-4 items-center">
            <Label
              htmlFor="data-inicial"
              className="whitespace-nowrap text-right"
            >
              Data inicial da vigência
            </Label>
            <IMaskInput
              id="data-inicial"
              mask="00/00/0000"
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={startDate}
              onAccept={(value) => setStartDate(value)}
              required
            />
          </div>
          <div className="gap-45 grid grid-cols-4 items-center">
            <Label
              htmlFor="data-final"
              className="whitespace-nowrap text-right"
            >
              Data final da vigência
            </Label>
            <IMaskInput
              id="data-final"
              mask="00/00/0000"
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={endDate}
              onAccept={(value) => setEndDate(value)}
            />
          </div>
          <div className="gap-45 grid grid-cols-4 items-center">
            <Label htmlFor="comissao-a-vista" className="w-32 text-right">
              Percentual (%)
            </Label>
            <Input
              id="comissao-a-vista"
              type="text"
              className="col-span-3"
              value={formatPercentage(percentage)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(e, percentage, setPercentage)
              }
              readOnly
              required
            />
          </div>
          <div className="gap-45 grid grid-cols-4 items-center">
            <Label htmlFor="nome" className="w-28 text-right">
              Validade (dias)
            </Label>
            <Input
              id="nome"
              type="number"
              className="col-span-3"
              value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" variant="outline" disabled={isLoading}>
              {isLoading ? (
                <Loader className="h-4 w-4" /> // Ou qualquer outro componente de loading
              ) : (
                "Cadastrar cashback"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterCashbackDialog;
