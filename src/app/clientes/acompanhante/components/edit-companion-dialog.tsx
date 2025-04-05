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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const response = await fetch(
        `/api/companion/update?id=${editedCompanion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editedCompanion,
            // Garante que os campos serão enviados exatamente como estão no estado
            phone: editedCompanion.phone,
            dateOfBirth: editedCompanion.dateOfBirth,
          }),
        },
      );

      if (response.ok) {
        onSave(editedCompanion);
        onClose();
        toast.success("Registro atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar acompanhante");
      }
    } catch (error) {
      toast.error("Erro ao atualizar acompanhante");
      console.error("Erro ao atualizar acompanhante:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar acompanhante</DialogTitle>
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
            <IMaskInput
              mask="(00) 00000-0000"
              name="phone"
              value={editedCompanion.phone}
              onAccept={(value) =>
                setEditedCompanion((prev) => ({ ...prev, phone: value }))
              }
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <IMaskInput
              mask="00/00/0000"
              name="dateOfBirth"
              value={editedCompanion.dateOfBirth}
              onAccept={(value) =>
                setEditedCompanion((prev) => ({ ...prev, dateOfBirth: value }))
              }
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancelar</Button>
            {loading ? (
              <Button variant="outline" disabled>
                <Loader className="animate-spin" />
              </Button>
            ) : (
              <Button variant="outline" onClick={handleSave}>
                Salvar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
