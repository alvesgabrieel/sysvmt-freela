"use client";

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
import { fetchCitiesByState, fetchStates } from "@/services/ibge"; // Importando o serviço do IBGE

interface Saller {
  id: number;
  name: string;
  login: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  observation?: string;
  pix: string;
  photo?: string;
  state: string;
  city: string;
  adress: string;
  number: string;
  complement?: string;
}

interface EditSallerDialogProps {
  saller: Saller;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSaller: Saller) => void;
}

export const EditSallerDialog = ({
  saller,
  isOpen,
  onClose,
  onSave,
}: EditSallerDialogProps) => {
  const [editedSaller, setEditedSaller] = useState<Saller>(saller);
  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

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
    if (saller.state) {
      const selectedState = states.find((s) => s.nome === saller.state);
      if (selectedState) {
        handleStateChange(selectedState.id);
      }
    }
  }, [saller.state, states]);

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
    setEditedSaller((prev) => ({
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
      // Cria um objeto FormData
      const formData = new FormData();

      // Adiciona os campos ao FormData
      formData.append("name", editedSaller.name);
      formData.append("login", editedSaller.login);
      formData.append("email", editedSaller.email);
      formData.append("phone", editedSaller.phone);
      formData.append("cpf", editedSaller.cpf);
      formData.append("rg", editedSaller.rg);
      formData.append("observation", editedSaller.observation || "");
      formData.append("pix", editedSaller.pix);
      formData.append("state", editedSaller.state);
      formData.append("city", editedSaller.city);
      formData.append("adress", editedSaller.adress);
      formData.append("number", editedSaller.number);
      formData.append("complement", editedSaller.complement || "");

      // Se houver uma nova foto, adiciona ao FormData
      if (editedSaller.photo) {
        const photoFile = new File([editedSaller.photo], "photo.jpg", {
          type: "image/jpeg",
        });
        formData.append("photo", photoFile);
      }

      // Envia a requisição com FormData
      const response = await fetch(`/api/saller/update?id=${editedSaller.id}`, {
        method: "PUT",
        body: formData, // Não é necessário definir o cabeçalho Content-Type manualmente
      });

      if (response.ok) {
        onSave(editedSaller); // Atualiza o estado no frontend
        onClose(); // Fecha o diálogo
        toast.success("Vendedor atualizado com sucesso!");
      } else {
        console.error("Erro ao atualizar o vendedor");
      }
    } catch (error) {
      console.error("Erro ao atualizar o vendedor:", error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Vendedor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input
              name="name"
              value={editedSaller.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Login</Label>
            <Input
              name="login"
              value={editedSaller.login}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={editedSaller.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input
              name="phone"
              value={editedSaller.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>CPF</Label>
            <Input
              name="cpf"
              value={editedSaller.cpf}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>RG</Label>
            <Input name="rg" value={editedSaller.rg} onChange={handleChange} />
          </div>
          <div>
            <Label>Observação</Label>
            <Input
              name="observation"
              value={editedSaller.observation || ""}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>PIX</Label>
            <Input
              name="pix"
              value={editedSaller.pix}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Estado</Label>
            <select
              name="state"
              value={editedSaller.state}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.nome}>
                  {state.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Cidade</Label>
            <select
              name="city"
              value={editedSaller.city}
              onChange={handleChange}
              className="w-full rounded border p-2"
              disabled={!editedSaller.state} // Desabilita se nenhum estado for selecionado
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
            <Label>Endereço</Label>
            <Input
              name="adress"
              value={editedSaller.adress}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Número</Label>
            <Input
              name="number"
              value={editedSaller.number}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Complemento</Label>
            <Input
              name="complement"
              value={editedSaller.complement || ""}
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
