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
  upfrontComission: number | string; // Pode ser número ou string
  installmentComission: number | string; // Pode ser número ou string
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
  const [editedTourOperator, setEditedTourOperator] = useState<TourOperator>({
    ...tourOperator,
    observation: tourOperator.observation || "",
    upfrontComission: tourOperator.upfrontComission
      ? String(tourOperator.upfrontComission).replace(".", ",")
      : "", // Converte número para string e substitui ponto por vírgula
    installmentComission: tourOperator.installmentComission
      ? String(tourOperator.installmentComission).replace(".", ",")
      : "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditedTourOperator((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    field: "upfrontComission" | "installmentComission",
  ) => {
    setEditedTourOperator((prev) => ({
      ...prev,
      [field]: formatCommissionInput(value), // Formata e atualiza apenas o campo necessário
    }));
  };

  const handleSave = async () => {
    try {
      const updatedData = {
        ...editedTourOperator,
        observation: editedTourOperator.observation?.trim() || null, // Converte string vazia para null
      };

      const response = await fetch(
        `/api/touroperator/update?id=${editedTourOperator.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData), // Envia os dados convertidos
        },
      );

      if (response.ok) {
        onSave(updatedData); // Atualiza o estado no frontend
        onClose(); // Fecha o diálogo
        toast.success("Registro atualizado com sucesso");
      } else {
        console.error("Erro ao atualizar a operadora");
      }
    } catch (error) {
      console.error("Erro ao atualizar a operadora:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar operadora</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
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

          <div>
            <Label>Comissão à vista (%)</Label>
            <Input
              name="upfrontComission"
              value={editedTourOperator.upfrontComission}
              onChange={(e) =>
                handleCommissionChange(e.target.value, "upfrontComission")
              }
              inputMode="decimal"
            />
          </div>
          <div>
            <Label>Comissão parcelada (%)</Label>
            <Input
              name="installmentComission"
              value={editedTourOperator.installmentComission}
              onChange={(e) =>
                handleCommissionChange(e.target.value, "installmentComission")
              }
              inputMode="decimal"
            />
          </div>

          <div className="grid w-full gap-1.5">
            {" "}
            {/* Container pai */}
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
