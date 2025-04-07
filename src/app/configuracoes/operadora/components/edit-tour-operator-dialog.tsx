"use client";

import { Loader } from "lucide-react";
import { useState } from "react";
import { IMaskInput } from "react-imask";
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
  observation?: string | null;
  hostingCommissionUpfront: string;
  hostingCommissionInstallment: string;
  ticketCommissionUpfront: string;
  ticketCommissionInstallment: string;
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
  const convertInitialValue = (value: number | string): string => {
    if (typeof value === "number") {
      return String(Math.round(value * 100)); // Multiplica por 100 para converter corretamente
    }
    return value.replace(/,|%/g, "");
  };

  const [editedTourOperator, setEditedTourOperator] = useState<TourOperator>({
    ...tourOperator,
    observation: tourOperator.observation || "",
  });

  //States separados para os valores brutos das comissões
  const [hostingCommissionUpfrontInput, setHostingCommissionUpfrontInput] =
    useState<string>(() =>
      convertInitialValue(tourOperator.hostingCommissionUpfront),
    );
  const [
    hostingCommissionInstallmentInput,
    setHostingCommissionInstallmentInput,
  ] = useState<string>(() =>
    convertInitialValue(tourOperator.hostingCommissionInstallment),
  );
  const [ticketCommissionUpfrontInput, setTicketCommissionUpfrontInput] =
    useState<string>(() =>
      convertInitialValue(tourOperator.ticketCommissionUpfront),
    );
  const [
    ticketCommissionInstallmentInput,
    setTicketCommissionInstallmentInput,
  ] = useState<string>(() =>
    convertInitialValue(tourOperator.ticketCommissionInstallment),
  );

  const [isLoading, setIsLoading] = useState(false);

  // Função para formatar o valor digitado como porcentagem (0,05%, 1,23%, etc)
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
    setIsLoading(true);
    try {
      // Prepara os dados para enviar (mantém como string com vírgula)
      const updatedData = {
        ...editedTourOperator,
        phone: editedTourOperator.phone,
        hostingCommissionUpfront: hostingCommissionUpfrontInput
          ? `${hostingCommissionUpfrontInput.slice(0, -2) || "0"},${hostingCommissionUpfrontInput.slice(-2).padEnd(2, "0")}`
          : "0,00",
        hostingCommissionInstallment: hostingCommissionInstallmentInput
          ? `${hostingCommissionInstallmentInput.slice(0, -2) || "0"},${hostingCommissionInstallmentInput.slice(-2).padEnd(2, "0")}`
          : "0,00",
        ticketCommissionUpfront: ticketCommissionUpfrontInput
          ? `${ticketCommissionUpfrontInput.slice(0, -2) || "0"},${ticketCommissionUpfrontInput.slice(-2).padEnd(2, "0")}`
          : "0,00",
        ticketCommissionInstallment: ticketCommissionInstallmentInput
          ? `${ticketCommissionInstallmentInput.slice(0, -2) || "0"},${ticketCommissionInstallmentInput.slice(-2).padEnd(2, "0")}`
          : "0,00",
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar operadora</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Primeira linha - Nome e Telefone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                name="name"
                value={editedTourOperator.name}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <IMaskInput
                mask="(00) 00000-0000"
                name="phone"
                value={editedTourOperator.phone}
                onAccept={(value) =>
                  setEditedTourOperator((prev) => ({ ...prev, phone: value }))
                }
                className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 mt-2 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Segunda linha - Contato e E-mail */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contato</Label>
              <Input
                name="contact"
                value={editedTourOperator.contact}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                name="email"
                value={editedTourOperator.email}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Terceira linha - Site e Login */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Site</Label>
              <Input
                name="site"
                value={editedTourOperator.site}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Login</Label>
              <Input
                name="login"
                value={editedTourOperator.login}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Quarta linha - Senha e Observação (observação ocupa linha inteira abaixo) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Senha</Label>
              <Input
                name="password"
                value={editedTourOperator.password}
                onChange={handleChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Comissões - Dois por linha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Comissão da hospedagem à vista (%)</Label>
              <Input
                value={formatPercentage(hostingCommissionUpfrontInput)}
                onKeyDown={(e) =>
                  handlePercentageKeyDown(
                    e,
                    hostingCommissionUpfrontInput,
                    setHostingCommissionUpfrontInput,
                  )
                }
                readOnly
                inputMode="decimal"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Comissão da hospedagem parcelada (%)</Label>
              <Input
                value={formatPercentage(hostingCommissionInstallmentInput)}
                onKeyDown={(e) =>
                  handlePercentageKeyDown(
                    e,
                    hostingCommissionInstallmentInput,
                    setHostingCommissionInstallmentInput,
                  )
                }
                readOnly
                inputMode="decimal"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Comissão do ingresso à vista (%)</Label>
              <Input
                value={formatPercentage(ticketCommissionUpfrontInput)}
                onKeyDown={(e) =>
                  handlePercentageKeyDown(
                    e,
                    ticketCommissionUpfrontInput,
                    setTicketCommissionUpfrontInput,
                  )
                }
                readOnly
                inputMode="decimal"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Comissão do ingresso parcelado (%)</Label>
              <Input
                value={formatPercentage(ticketCommissionInstallmentInput)}
                onKeyDown={(e) =>
                  handlePercentageKeyDown(
                    e,
                    ticketCommissionInstallmentInput,
                    setTicketCommissionInstallmentInput,
                  )
                }
                readOnly
                inputMode="decimal"
                className="mt-2"
              />
            </div>
          </div>

          {/* Observação - Ocupa linha inteira */}
          <div className="w-full">
            <Label>Observação</Label>
            <textarea
              name="observation"
              className="mt-2 w-full rounded-md border bg-[#e5e5e5]/30 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={editedTourOperator.observation ?? ""}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancelar</Button>
            {isLoading ? (
              <Button onClick={handleSave} variant="outline" disabled>
                <Loader className="animate-spin" />
              </Button>
            ) : (
              <Button onClick={handleSave} variant="outline">
                Salvar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
