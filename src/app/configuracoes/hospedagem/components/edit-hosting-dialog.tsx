"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
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
import { fetchCitiesByState, fetchStates } from "@/services/ibge"; // Importe as funções do IBGE

interface Hosting {
  id: number;
  name: string;
  state: string;
  city: string;
  observation?: string;
}

interface EditHostingDialogProps {
  hosting: Hosting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTicket: Hosting) => void;
}

export const EditHostingDialog = ({
  hosting,
  isOpen,
  onClose,
  onSave,
}: EditHostingDialogProps) => {
  const [editedHosting, setEditedHosting] = useState<Hosting>(hosting);

  const [states, setStates] = useState<
    { id: number; sigla: string; nome: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Busca os estados ao abrir o diálogo
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    };

    loadStates();
  }, []);

  useEffect(() => {
    if (hosting.state) {
      const selectedState = states.find((s) => s.nome === hosting.state);
      if (selectedState) {
        handleStateChange(selectedState.id);
      }
    }
  }, [hosting.state, states]);

  // Busca as cidades quando um estado é selecionado
  const handleStateChange = async (stateId: number) => {
    try {
      const citiesData = await fetchCitiesByState(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedHosting((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Se o estado for alterado, busca as cidades correspondentes
    if (name === "state") {
      const selectedState = states.find((s) => s.nome === value);
      if (selectedState) {
        handleStateChange(selectedState.id);
      } else {
        setCities([]); // Limpa as cidades se nenhum estado for selecionado
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/hosting/update?id=${editedHosting.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedHosting),
        },
      );

      if (response.ok) {
        onSave(editedHosting); // Atualiza o estado no frontend
        onClose(); // Fecha o diálogo
        toast.success("Registro atualizado com sucesso");
      } else {
        console.error("Erro ao atualizar a hospedagem");
      }
    } catch (error) {
      console.error("Erro ao atualizar a hospedagem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Hospedagem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              name="name"
              value={editedHosting.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Estado</Label>
            <select
              name="state"
              value={editedHosting.state}
              onChange={handleChange}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.nome}>
                  {state.nome} ({state.sigla})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Cidade</Label>
            <select
              name="city"
              value={editedHosting.city}
              onChange={handleChange}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!editedHosting.state} // Desabilita se nenhum estado for selecionado
            >
              <option value="">Selecione uma cidade</option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Observação</Label>
            <Input
              name="observation"
              value={editedHosting.observation || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancelar</Button>
            {isLoading ? (
              <Button onClick={handleSave} variant="outline" disabled>
                <Loader />
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
