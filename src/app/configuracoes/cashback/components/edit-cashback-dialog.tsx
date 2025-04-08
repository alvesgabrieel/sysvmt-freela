"use client";

import { CashbackType } from "@prisma/client";
import { Loader } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import { formatBackendDateToFrontend } from "@/app/functions/frontend/format-backend-date-to-frontend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CASHBACK_TYPE_LABELS: Record<CashbackType, string> = {
  CHECKIN: "Check-in",
  CHECKOUT: "Check-out",
  PURCHASEDATE: "Data da Compra",
};

interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: string;
  validityDays: number;
  selectType: CashbackType;
}
interface EditCashbackDialogProps {
  cashback: Cashback;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCashback: Cashback) => void;
}

export const EditCashbackDialog = ({
  cashback,
  isOpen,
  onClose,
  onSave,
}: EditCashbackDialogProps) => {
  // Converte o valor inicial para o formato de digitação (remove vírgula e símbolo %)
  const convertInitialValue = (value: unknown): string => {
    if (typeof value !== "string") {
      if (typeof value === "number") {
        // Converte número (ex: 3.0) para string "3,00%"
        value = value.toFixed(2).replace(".", ",") + "%";
      } else {
        value = "0,00%"; // fallback seguro
      }
    }

    const numericValue = parseFloat(
      (value as string).replace(/%/g, "").replace(",", "."),
    );

    return String(Math.round(numericValue * 100));
  };

  const [editedCashback, setEditedCashback] = useState<Cashback>({
    ...cashback,
    startDate: formatBackendDateToFrontend(cashback.startDate),
    endDate: formatBackendDateToFrontend(cashback.endDate),
  });

  // State separado para o valor bruto da porcentagem (apenas dígitos)
  const [percentageInput, setPercentageInput] = useState<string>(() =>
    convertInitialValue(cashback.percentage || "0"),
  );

  const [loading, setLoading] = useState(false);

  // Função para formatar o valor digitado como porcentagem (0,05%, 1,23%, etc)
  const formatPercentage = (input: string): string => {
    if (!input) return "0,00%";

    const numericValue = parseInt(input, 10) / 100; // Converte centavos para valor decimal
    return (
      numericValue.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    );
  };

  // Função para lidar com as teclas pressionadas
  const handlePercentageKeyDown = (
    e: KeyboardEvent,
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedCashback((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: string, value: string) => {
    setEditedCashback((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    console.log("Data recebida do backend:", {
      original: cashback.startDate,
      formatted: formatBackendDateToFrontend(cashback.startDate),
    });

    setEditedCashback({
      ...cashback,
      startDate: formatBackendDateToFrontend(cashback.startDate),
      endDate: formatBackendDateToFrontend(cashback.endDate),
    });

    // Atualiza o valor bruto da porcentagem quando o cashback muda
    setPercentageInput(convertInitialValue(cashback.percentage));
  }, [cashback]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const startDate = new Date(
        editedCashback.startDate.split("/").reverse().join("-"),
      );
      const endDate = new Date(
        editedCashback.endDate.split("/").reverse().join("-"),
      );

      if (startDate >= endDate) {
        toast.error("A data final deve ser maior que a data inicial");
        return;
      }

      // Prepara os dados para enviar (formato esperado pelo backend)
      const payload = {
        ...editedCashback,
        percentage: (parseInt(percentageInput, 10) / 100)
          .toFixed(2)
          .replace(".", ","),
        validityDays: Number(editedCashback.validityDays),
      };

      const response = await fetch(
        `/api/cashback/update?id=${editedCashback.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const updated = await response.json();
        onSave(updated.cashback);
        toast.success("Cashback atualizado com sucesso!");
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao atualizar");
      }
    } catch (error) {
      toast.error("Erro na conexão com o servidor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Editar cashback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              name="name"
              value={editedCashback.name}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          {/* Novo campo: Select para o tipo de cashback */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="selectType" className="text-right">
              Tipo
            </Label>
            <select
              id="selectType"
              name="selectType"
              value={editedCashback.selectType}
              onChange={handleChange}
              className="border-input ring-offset-background focus-visible:ring-ring bg-background col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              {Object.entries(CASHBACK_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Data inicial da vigência
            </Label>
            <IMaskInput
              id="startDate"
              mask="00/00/0000"
              value={editedCashback.startDate}
              onAccept={(value) => handleDateChange("startDate", value)}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring bg-background col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Data final da vigência
            </Label>
            <IMaskInput
              id="endDate"
              mask="00/00/0000"
              value={editedCashback.endDate}
              onAccept={(value) => handleDateChange("endDate", value)}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring bg-background col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="percentage" className="text-right">
              Percentual (%)
            </Label>
            <Input
              id="percentage"
              value={formatPercentage(percentageInput)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(e, percentageInput, setPercentageInput)
              }
              readOnly
              inputMode="decimal"
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="validityDays" className="text-right">
              Validade (dias)
            </Label>
            <Input
              id="validityDays"
              name="validityDays"
              type="number"
              min="1"
              value={editedCashback.validityDays}
              onChange={handleChange}
              className="col-span-3"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {loading ? (
              <Button type="button" disabled>
                <Loader className="animate-spin" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSave}>
                Salvar
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
