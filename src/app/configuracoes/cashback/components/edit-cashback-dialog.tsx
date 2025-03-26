"use client";

import { useEffect, useState } from "react";
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

interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: string;
  validityDays: number;
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
  const [editedCashback, setEditedCashback] = useState<Cashback>({
    ...cashback,
    percentage: formatPercentageForDisplay(String(cashback.percentage)),
    startDate: formatBackendDateToFrontend(cashback.startDate),
    endDate: formatBackendDateToFrontend(cashback.endDate),
  });

  // Formata o valor do banco para exibição (2.5 → "2,5")
  function formatPercentageForDisplay(
    value: string | number | null | undefined,
  ): string {
    if (typeof value === "number") {
      return value.toString().replace(".", ",");
    }

    if (!value) return "";

    return value.includes(".") ? value.replace(".", ",") : value;
  }

  const formatPercentageInput = (value: string): string => {
    const input = value.replace(/\D/g, "");

    if (input === "") {
      return "";
    } else if (input.length === 1) {
      return input;
    } else if (input.length === 2) {
      return input.slice(0, 1) + "," + input.slice(1);
    } else {
      return input.slice(0, 2) + "," + input.slice(2, 5);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCashback((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: string, value: string) => {
    setEditedCashback((prev) => ({ ...prev, [field]: value }));
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setEditedCashback((prev) => ({
      ...prev,
      percentage: formatPercentageInput(rawValue),
    }));
  };

  useEffect(() => {
    console.log("Data recebida do backend:", {
      original: cashback.startDate,
      formatted: formatBackendDateToFrontend(cashback.startDate),
    });

    setEditedCashback({
      ...cashback,
      percentage: formatPercentageForDisplay(cashback.percentage),
      startDate: formatBackendDateToFrontend(cashback.startDate), // Mantém a formatação
      endDate: formatBackendDateToFrontend(cashback.endDate), // Mantém a formatação
    });
  }, [cashback]);

  const handleSave = async () => {
    try {
      if (
        !editedCashback.name ||
        !editedCashback.startDate ||
        !editedCashback.endDate ||
        !editedCashback.percentage
      ) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

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

      // 3. VALIDAÇÃO DO PERCENTUAL - FORMATO BRASILEIRO (COM VÍRGULA)
      const percentageValue = editedCashback.percentage;

      // Verifica se tem vírgula e se os números são válidos
      if (
        !percentageValue.includes(",") ||
        isNaN(Number(percentageValue.replace(",", ".")))
      ) {
        toast.error("Use o formato brasileiro (ex: 3,2 para 3,2%)");
        return;
      }
      const payload = {
        ...editedCashback,
        percentage: percentageValue,
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

        // Atualiza a lista de cashbacks na tela sem precisar filtrar de novo
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
              name="percentage"
              value={editedCashback.percentage}
              onChange={handlePercentageChange}
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
            <Button type="button" onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
