"use client";

import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import Select from "react-select";
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

interface Tag {
  id: string;
  name: string;
  color: string;
}

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
  tags: Tag[];
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    client.tags.map((tag) => tag.id),
  );

  const [states, setStates] = useState<
    { id: number; sigla: string; nome: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Busca as tags disponíveis
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag/read");
        if (response.ok) {
          const result = await response.json();
          setTags(result.tags);
        } else {
          toast.error("Erro ao carregar as tags");
        }
      } catch (error) {
        toast.error("Erro ao carregar as tags");
        console.error("Erro ao carregar as tags", error);
      }
    };
    fetchTags();
  }, []);

  // Atualiza as tags selecionadas quando o cliente muda
  useEffect(() => {
    setSelectedTags(client.tags.map((tag) => tag.id));
  }, [client]);

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

    if (name === "state") {
      const selectedState = states.find((s) => s.nome === value);
      if (selectedState) {
        handleStateChange(selectedState.id);
      } else {
        setCities([]);
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
          tags: selectedTags, // Inclui as tags selecionadas
        }),
      });

      if (response.ok) {
        const updatedClient = await response.json();
        onSave(updatedClient);
        onClose();
        toast.success("Registro atualizado com sucesso");
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao atualizar o cliente");
      }
    } catch (error) {
      console.error("Erro ao atualizar o cliente:", error);
      toast.error("Erro ao atualizar o cliente");
    } finally {
      setIsLoading(false);
    }
  };

  // Transforma as tags no formato que o react-select espera
  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }));

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

          {/* Campo de Tags */}
          <div>
            <Label>Tags</Label>
            <Select
              options={tagOptions}
              isMulti
              value={tagOptions.filter((option) =>
                selectedTags.includes(option.value),
              )}
              onChange={(selectedOptions) => {
                setSelectedTags(selectedOptions.map((option) => option.value));
              }}
              styles={{
                control: (base, { isFocused }) => ({
                  ...base,
                  backgroundColor: "rgba(229, 229, 229, 0.3)",
                  borderColor: isFocused ? "#86b7fe" : "#e2e8f0",
                  boxShadow: isFocused
                    ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
                    : "none",
                  minHeight: "40px",
                  "&:hover": {
                    borderColor: "#86b7fe",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "rgba(229, 229, 229, 0.5)",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#1e293b",
                  fontWeight: "500",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#64748b",
                  ":hover": {
                    backgroundColor: "rgba(229, 229, 229, 0.8)",
                    color: "#dc3545",
                  },
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "rgba(229, 229, 229, 0.95)",
                  marginTop: "4px",
                }),
                option: (base, { isFocused, isSelected }) => ({
                  ...base,
                  backgroundColor: isSelected
                    ? "rgba(203, 213, 225, 0.7)"
                    : isFocused
                      ? "rgba(203, 213, 225, 0.5)"
                      : "transparent",
                  color: "#1e293b",
                  "&:active": {
                    backgroundColor: "rgba(203, 213, 225, 0.7)",
                  },
                }),
                input: (base) => ({
                  ...base,
                  color: "#1e293b",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#64748b",
                }),
              }}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: "#e2e8f0",
                  primary25: "rgba(229, 229, 229, 0.5)",
                  primary50: "rgba(229, 229, 229, 0.7)",
                },
              })}
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
