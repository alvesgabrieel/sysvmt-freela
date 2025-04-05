"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
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
import { fetchCitiesByState, fetchStates } from "@/services/ibge";

interface Client {
  id: number;
  name: string;
  login: string;
  cpf: string;
  dateOfBirth: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  state: string;
  city: string;
  tags: [];
}

interface EditClientDialogProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: Client) => void;
}

export const EditClientDialog = ({
  client,
  isOpen,
  onClose,
  onSave,
}: EditClientDialogProps) => {
  const [editedClient, setEditedClient] = useState<Client>(client);

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
    if (client.state) {
      const selectedState = states.find((s) => s.nome === client.state);
      if (selectedState) {
        handleStateChange(selectedState.id);
      }
    }
  }, [client.state, states]);

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
    setEditedClient((prev) => ({
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
    setIsLoading(true);
    try {
      const response = await fetch(`/api/client/update?id=${editedClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...editedClient,
          dateOfBirth: editedClient.dateOfBirth,
          primaryPhone: editedClient.primaryPhone,
          secondaryPhone: editedClient.secondaryPhone,
          cpf: editedClient.cpf,
        }),
      });

      if (response.ok) {
        onSave(editedClient); // Atualiza o estado no frontend
        onClose(); // Fecha o diálogo
        toast.success("Registro atualizado com sucesso");
      } else {
        console.error("Erro ao atualizar a cliente");
      }
    } catch (error) {
      console.error("Erro ao atualizar a cliente:", error);
    } finally {
      setIsLoading(false);
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
              value={editedClient.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Login</Label>
            <Input
              name="login"
              value={editedClient.login}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>CPF</Label>
            <IMaskInput
              mask="000.000.000-00"
              name="cpf"
              value={editedClient.cpf}
              onAccept={(value) =>
                setEditedClient((prev) => ({ ...prev, cpf: value }))
              }
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <Label>Data de nascimento</Label>
            <IMaskInput
              mask="00/00/0000"
              name="dateOfBirth"
              value={editedClient.dateOfBirth}
              onAccept={(value) =>
                setEditedClient((prev) => ({ ...prev, dateOfBirth: value }))
              }
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              name="email"
              value={editedClient.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Telefone principal</Label>
            <IMaskInput
              mask="(00) 00000-0000"
              name="primaryPhone"
              value={editedClient.primaryPhone}
              onAccept={(value) => {
                setEditedClient((prev) => ({ ...prev, primaryPhone: value }));
              }}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div>
            <Label>Telefone secundário</Label>
            <IMaskInput
              mask="(00) 00000-0000"
              name="secondaryPhone"
              value={editedClient.secondaryPhone}
              onAccept={(value) => {
                setEditedClient((prev) => ({ ...prev, secondaryPhone: value }));
              }}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div>
            <Label>Estado</Label>
            <select
              name="state"
              value={editedClient.state}
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
              value={editedClient.city}
              onChange={handleChange}
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!editedClient.state} // Desabilita se nenhum estado for selecionado
            >
              <option value="">Cidade</option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Cancelar</Button>
            {isLoading ? (
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
