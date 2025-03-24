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

interface Companion {
  id: number;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
}

interface EditCompanionDialogProps {
  companion: Companion;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCompanion: Companion) => void;
}

export const EditCompanionDialog = ({
  companion,
  isOpen,
  onClose,
  onSave,
}: EditCompanionDialogProps) => {
  const [editedCompanion, setEditedCompanion] = useState<Companion>(companion);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedCompanion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSave = async () => {
    try {
      const response = await fetch(
        `/api/companion/update?id=${editedCompanion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedCompanion),
        },
      );

      if (response.ok) {
        onSave(editedCompanion); // Atualiza o estado no frontend
        onClose(); // Fecha o diálogo
        toast.success("Registro atualizado com sucesso");
      } else {
        console.error("Erro ao atualizar acompanhante");
      }
    } catch (error) {
      console.error("Erro ao atualizar acompanhante:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              name="name"
              value={editedCompanion.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              name="phone"
              value={editedCompanion.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              name="email"
              value={editedCompanion.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Data de nascimento</Label>
            <Input
              name="dateOfBirth"
              value={editedCompanion.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
