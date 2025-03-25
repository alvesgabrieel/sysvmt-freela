"use client";

import { useRef, useState } from "react"; // Adicione useRef
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

interface Tag {
  id: number;
  name: string;
  color: string; // Espera-se que seja um código hexadecimal (ex: #ffffff)
}

interface EditTagDialogProps {
  tag: Tag;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTag: Tag) => void;
}

export const EditTagDialog = ({
  tag,
  isOpen,
  onClose,
  onSave,
}: EditTagDialogProps) => {
  const [editedTag, setEditedTag] = useState<Tag>(tag);
  const colorInputRef = useRef<HTMLInputElement>(null); // Referência para o input de cor

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedTag((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/tag/update?id=${editedTag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedTag),
      });

      if (response.ok) {
        onSave(editedTag); // Atualiza o estado no frontend
        onClose(); // Fecha o diálogo
        toast.success("Registro atualizado com sucesso");
      } else {
        console.error("Erro ao atualizar a tag");
      }
    } catch (error) {
      console.error("Erro ao atualizar a tag:", error);
    }
  };

  // Função para abrir o seletor de cores ao clicar na bolinha
  const handleColorCircleClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click(); // Aciona o input de cor
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[320px] sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>Editar Tag</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              name="name"
              value={editedTag.name}
              onChange={handleChange}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Cor</Label>
            <div className="flex items-center gap-2">
              {/* Input de cor escondido */}
              <input
                type="color"
                name="color"
                value={editedTag.color}
                onChange={handleChange}
                ref={colorInputRef}
                style={{
                  opacity: 0,
                  position: "absolute",
                  pointerEvents: "none",
                }}
              />
              {/* Bolinha personalizada */}
              <div
                onClick={handleColorCircleClick}
                style={{
                  backgroundColor: editedTag.color, // Cor selecionada
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%", // Transforma em uma bolinha
                  cursor: "pointer", // Mostra que é clicável
                  border: "2px solid #ccc", // Borda para destacar
                }}
              />
              {/* Exibe o valor hexadecimal da cor */}
              <span className="text-sm text-gray-600">{editedTag.color}</span>
            </div>
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
