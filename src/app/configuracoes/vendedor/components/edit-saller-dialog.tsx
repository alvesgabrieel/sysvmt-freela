"use client";

import { Minus, Plus } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
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

interface Commission {
  id?: number;
  tourOperatorId: number;
  tourOperatorName: string;
  upfrontCommission: number;
  installmentCommission: number;
}

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
  commissions?: Commission[];
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
  const [operadoras, setOperadoras] = useState<{ id: number; name: string }[]>(
    [],
  );
  const [comissoes, setComissoes] = useState<
    {
      id?: number;
      operadora: string;
      aVistaInput: string;
      parceladoInput: string;
    }[]
  >([]);
  const [activeTab, setActiveTab] = useState("dados-basicos");

  // Carrega estados e operadoras
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statesData, operadorasData] = await Promise.all([
          fetchStates(),
          fetch("/api/touroperator/list").then((res) => res.json()),
        ]);
        setStates(statesData);
        setOperadoras(operadorasData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados iniciais");
      }
    };
    loadData();
  }, []);

  // Carrega cidades quando estado é selecionado
  useEffect(() => {
    if (saller.state) {
      const selectedState = states.find((s) => s.nome === saller.state);
      if (selectedState) {
        handleStateChange(selectedState.id);
      }
    }
  }, [saller.state, states]);

  // Carrega comissões existentes
  // Carrega comissões existentes - VERSÃO CORRIGIDA
  useEffect(() => {
    if (saller.commissions && saller.commissions.length > 0) {
      const comissoesFormatadas = saller.commissions.map((comissao) => {
        // Converte 12.5% para "1250" (mantendo os decimais)
        const aVistaInput = Math.round(comissao.upfrontCommission * 100)
          .toString()
          .padStart(3, "0");
        const parceladoInput = Math.round(comissao.installmentCommission * 100)
          .toString()
          .padStart(3, "0");

        return {
          id: comissao.id,
          operadora: comissao.tourOperatorId.toString(),
          aVistaInput,
          parceladoInput,
        };
      });
      setComissoes(comissoesFormatadas);
    } else {
      setComissoes([{ operadora: "", aVistaInput: "", parceladoInput: "" }]);
    }
  }, [saller]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleStateChange = async (stateId: number) => {
    try {
      const citiesData = await fetchCitiesByState(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error("Erro ao carregar cidades:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setEditedSaller((prev) => ({
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

  // Funções para manipulação de comissões
  const formatPercentage = (input: string): string => {
    if (!input) return "";
    const numbers = input.replace(/\D/g, "");
    const padded = numbers.padStart(3, "0");
    const integerPart = padded.slice(0, -2) || "0";
    const decimalPart = padded.slice(-2);
    return `${integerPart},${decimalPart}%`;
  };

  const formatForBackend = (input: string): string => {
    if (!input) return "";
    const numbers = input.replace(/\D/g, "");
    const padded = numbers.padStart(3, "0");
    return `${padded.slice(0, -2)},${padded.slice(-2)}`;
  };

  const handlePercentageKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    currentValue: string,
    setValue: (value: string) => void,
  ) => {
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
    if (newValue.length > 5) return;
    setValue(newValue);
  };

  const handleComissaoChange = (
    index: number,
    field: string,
    value: string,
    isInputValue: boolean = false,
  ) => {
    const novasComissoes = [...comissoes];
    if (isInputValue) {
      novasComissoes[index] = {
        ...novasComissoes[index],
        [`${field}Input`]: value,
      };
    } else {
      novasComissoes[index] = { ...novasComissoes[index], [field]: value };
    }
    setComissoes(novasComissoes);
  };

  const adicionarComissao = () => {
    setComissoes([
      ...comissoes,
      { operadora: "", aVistaInput: "", parceladoInput: "" },
    ]);
  };

  const removerComissao = (index: number) => {
    setComissoes(comissoes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      // Adiciona campos básicos
      Object.entries(editedSaller).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          key !== "commissions" &&
          key !== "id"
        ) {
          formData.append(key, value.toString());
        }
      });

      // Prepara comissões para envio
      const comissoesConvertidas = comissoes.map((comissao) => ({
        id: comissao.id,
        operadora: comissao.operadora,
        aVista: formatForBackend(comissao.aVistaInput),
        parcelado: formatForBackend(comissao.parceladoInput),
      }));

      // Filtra comissões válidas
      const comissoesValidas = comissoesConvertidas.filter((c) => c.operadora);

      // Valida comissões
      const comissoesInvalidas = comissoesValidas.some(
        (c) => !c.aVista || !c.parcelado,
      );

      if (comissoesInvalidas) {
        toast.error("Preencha todas as comissões corretamente");
        return;
      }

      formData.append("commissions", JSON.stringify(comissoesValidas));

      // Se houver uma nova foto, adiciona ao FormData
      if (editedSaller.photo) {
        const photoFile = new File([editedSaller.photo], "photo.jpg", {
          type: "image/jpeg",
        });
        formData.append("photo", photoFile);
      }

      // Envia a requisição
      const response = await fetch(`/api/saller/update?id=${editedSaller.id}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const updatedSaller = await response.json();
        setEditedSaller((prev) => ({
          ...prev,
          commissions: updatedSaller.saller.commissions || [],
        }));
        onSave(updatedSaller.saller);
        onClose();
        toast.success("Vendedor atualizado com sucesso!");
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao atualizar vendedor");
      }
    } catch (error) {
      console.error("Erro ao atualizar o vendedor:", error);
      toast.error("Erro ao atualizar vendedor");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Editar Vendedor</DialogTitle>
        </DialogHeader>

        <div className="mb-6 mt-4 flex space-x-4">
          <button
            className={`rounded px-4 py-2 ${
              activeTab === "dados-basicos"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleTabChange("dados-basicos")}
          >
            Dados básicos
          </button>
          <button
            className={`rounded px-4 py-2 ${
              activeTab === "comissoes"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => handleTabChange("comissoes")}
          >
            Comissões
          </button>
        </div>

        {activeTab === "dados-basicos" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Input
                  name="rg"
                  value={editedSaller.rg}
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
                  className="w-full rounded-md border p-2"
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
                  className="w-full rounded-md border p-2"
                  disabled={!editedSaller.state}
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
              <div className="col-span-2">
                <Label>Complemento</Label>
                <Input
                  name="complement"
                  value={editedSaller.complement || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-2">
                <Label>Observação</Label>
                <textarea
                  name="observation"
                  value={editedSaller.observation || ""}
                  onChange={(e) => handleChange(e)}
                  className="w-full rounded-md border p-2"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "comissoes" && (
          <div className="space-y-4">
            {comissoes.map((comissao, index) => (
              <div key={index} className="mb-4 flex items-center gap-4">
                <div className="flex-1">
                  <Label>Operadora</Label>
                  <select
                    value={comissao.operadora}
                    onChange={(e) =>
                      handleComissaoChange(index, "operadora", e.target.value)
                    }
                    className="w-full rounded-md border p-2"
                  >
                    <option value="">Selecione uma operadora</option>
                    {operadoras.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>À Vista (%)</Label>
                  <Input
                    type="text"
                    className="w-24"
                    value={formatPercentage(comissao.aVistaInput)}
                    onKeyDown={(e) =>
                      handlePercentageKeyDown(
                        e,
                        comissao.aVistaInput,
                        (value) =>
                          handleComissaoChange(index, "aVista", value, true),
                      )
                    }
                    readOnly
                  />
                </div>

                <div>
                  <Label>Parcelado (%)</Label>
                  <Input
                    type="text"
                    className="w-24"
                    value={formatPercentage(comissao.parceladoInput)}
                    onKeyDown={(e) =>
                      handlePercentageKeyDown(
                        e,
                        comissao.parceladoInput,
                        (value) =>
                          handleComissaoChange(index, "parcelado", value, true),
                      )
                    }
                    readOnly
                  />
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removerComissao(index)}
                  className="mt-5"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={adicionarComissao}
              className="mt-4"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Comissão
            </Button>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
