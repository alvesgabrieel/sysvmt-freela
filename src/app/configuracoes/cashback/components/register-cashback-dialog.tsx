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

interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: string;
  validityDays: number;
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

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);

  const formatPercentageInput = (value: string) => {
    const input = value.replace(/\D/g, "");

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

  const handlePercentageChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setter(formatPercentageInput(value));
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
        percentage: percentage,
        validityDays,
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
              inputMode="decimal"
              className="col-span-3"
              value={percentage}
              onChange={(e) =>
                handlePercentageChange(e.target.value, setPercentage)
              }
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
