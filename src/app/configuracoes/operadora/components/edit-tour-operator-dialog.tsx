"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  upfrontComission: number | string;
  installmentComission: number | string;
  observation?: string | null;
}

interface EditTourOperatorDialogProps {
  tourOperator: TourOperator;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTourOperator: TourOperator) => void;
}

export const EditTourOperatorDialog = ({
  tourOperator,
  isOpen,
  onClose,
  onSave,
}: EditTourOperatorDialogProps) => {
  // Converte o valor inicial para o formato de digitação (remove vírgula e símbolo %)
  // const convertInitialValue = (value: number | string): string => {
  //   if (typeof value === "number") {
  //     return String(value).replace(".", "");
  //   }
  //   return value.replace(/,|%/g, "");
  // };

  const [editedTourOperator, setEditedTourOperator] = useState<TourOperator>({
    ...tourOperator,
    observation: tourOperator.observation || "",
  });

  // States separados para os valores brutos das comissões
  // const [upfrontInput, setUpfrontInput] = useState<string>(() =>
  //   convertInitialValue(tourOperator.upfrontComission),
  // );
  // const [installmentInput, setInstallmentInput] = useState<string>(() =>
  //   convertInitialValue(tourOperator.installmentComission),
  // );

  // // Função para formatar o valor digitado como porcentagem (0,05%, 1,23%, etc)
  // const formatPercentage = (input: string): string => {
  //   if (!input) return "";

  //   const numbers = input.replace(/\D/g, "");
  //   const padded = numbers.padStart(3, "0"); // Garante pelo menos 3 dígitos (1 + 2 decimais)

  //   const integerPart = padded.slice(0, -2) || "0";
  //   const decimalPart = padded.slice(-2);

  //   return `${integerPart},${decimalPart}%`;
  // };

  // // Função para lidar com as teclas pressionadas
  // const handlePercentageKeyDown = (
  //   e: KeyboardEvent<HTMLInputElement>,
  //   currentValue: string,
  //   setValue: React.Dispatch<React.SetStateAction<string>>,
  // ) => {
  //   // Permite apenas números e Backspace
  //   if (!/[0-9]|Backspace/.test(e.key)) {
  //     e.preventDefault();
  //     return;
  //   }

  //   let newValue = currentValue.replace(/\D/g, "");

  //   if (e.key === "Backspace") {
  //     newValue = newValue.slice(0, -1);
  //   } else {
  //     newValue += e.key;
  //   }

  //   // Limita o tamanho para evitar números muito grandes
  //   if (newValue.length > 5) {
  //     // Máximo 999,99%
  //     return;
  //   }

  //   setValue(newValue);
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedTourOperator((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Prepara os dados para enviar (mantém como string com vírgula)
      const updatedData = {
        ...editedTourOperator,
        // upfrontComission: upfrontInput
        //   ? `${upfrontInput.slice(0, -2) || "0"},${upfrontInput.slice(-2).padEnd(2, "0")}`
        //   : "0,00",
        // installmentComission: installmentInput
        //   ? `${installmentInput.slice(0, -2) || "0"},${installmentInput.slice(-2).padEnd(2, "0")}`
        //   : "0,00",
        observation: editedTourOperator.observation?.trim() || null,
      };

      console.log("Dados sendo enviados:", updatedData);

      const response = await fetch(
        `/api/touroperator/update?id=${editedTourOperator.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        },
      );

      if (response.ok) {
        onSave(updatedData);
        onClose();
        toast.success("Registro atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar a operadora");
      }
    } catch (error) {
      console.error("Erro ao atualizar a operadora:", error);
      toast.error("Erro ao atualizar a operadora");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar operadora</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Campos normais (nome, telefone, etc) */}
          <div>
            <Label>Nome</Label>
            <Input
              name="name"
              value={editedTourOperator.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              name="phone"
              value={editedTourOperator.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Contato</Label>
            <Input
              name="contact"
              value={editedTourOperator.contact}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              name="email"
              value={editedTourOperator.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Site</Label>
            <Input
              name="site"
              value={editedTourOperator.site}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Login</Label>
            <Input
              name="login"
              value={editedTourOperator.login}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Senha</Label>
            <Input
              name="password"
              value={editedTourOperator.password}
              onChange={handleChange}
            />
          </div>

          {/* Inputs de comissão com a nova lógica */}
          {/* <div>
            <Label>Comissão à vista (%)</Label>
            <Input
              value={formatPercentage(upfrontInput)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(e, upfrontInput, setUpfrontInput)
              }
              readOnly
              inputMode="decimal"
            />
          </div>
          <div>
            <Label>Comissão parcelada (%)</Label>
            <Input
              value={formatPercentage(installmentInput)}
              onKeyDown={(e) =>
                handlePercentageKeyDown(
                  e,
                  installmentInput,
                  setInstallmentInput,
                )
              }
              readOnly
              inputMode="decimal"
            />
          </div> */}

          <div className="grid w-full gap-1.5">
            <Label>Observação</Label>
            <textarea
              name="observation"
              className="w-full rounded-md border bg-[#e5e5e5]/30 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={editedTourOperator.observation ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} variant="outline">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
