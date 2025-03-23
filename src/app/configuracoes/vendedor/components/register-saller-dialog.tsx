import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask"; // Importe o IMaskInput
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchCitiesByState, fetchStates } from "@/services/ibge";

export default function RegisterSallerDialog() {
  const [activeTab, setActiveTab] = useState("dados-basicos");
  const [comissoes, setComissoes] = useState([
    { operadora: "", aVista: "", parcelado: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);

  // Estados e cidades
  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Buscar estados ao carregar o componente
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        toast.error("Erro ao buscar estados");
        console.error(error);
      }
    };
    loadStates();
  }, []);

  // Buscar cidades quando um estado é selecionado
  useEffect(() => {
    if (!selectedState) return;

    const loadCities = async () => {
      try {
        const selectedStateData = states.find((s) => s.nome === selectedState);
        if (selectedStateData) {
          const citiesData = await fetchCitiesByState(selectedStateData.id);
          setCities(citiesData);
        }
      } catch (error) {
        toast.error("Erro ao buscar cidades");
        console.error(error);
        setCities([]);
      }
    };
    loadCities();
  }, [selectedState, states]);

  const adicionarComissao = () => {
    setComissoes([...comissoes, { operadora: "", aVista: "", parcelado: "" }]);
  };

  const removerComissao = (index: number) => {
    setComissoes(comissoes.filter((_, i) => i !== index));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = async () => {
    // Validação da foto
    if (file && !file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem.");
      return;
    }

    const formData = new FormData();

    // Adiciona os campos do formulário ao FormData
    formData.append(
      "name",
      (document.getElementById("nome-vendedor") as HTMLInputElement).value,
    );
    formData.append(
      "login",
      (document.getElementById("login") as HTMLInputElement).value,
    );
    formData.append(
      "email",
      (document.getElementById("email") as HTMLInputElement).value,
    );
    formData.append(
      "cpf",
      (document.getElementById("cpf") as HTMLInputElement).value,
    );
    formData.append(
      "rg",
      (document.getElementById("rg") as HTMLInputElement).value,
    );
    formData.append(
      "phone",
      (document.getElementById("telefone") as HTMLInputElement).value,
    );
    formData.append(
      "observation",
      (document.getElementById("observacao") as HTMLTextAreaElement).value,
    );
    formData.append(
      "pix",
      (document.getElementById("pix") as HTMLInputElement).value,
    );
    formData.append("state", selectedState);
    formData.append("city", selectedCity);
    formData.append(
      "adress",
      (document.getElementById("logradouro") as HTMLInputElement).value,
    );
    formData.append(
      "number",
      (document.getElementById("numero") as HTMLInputElement).value,
    );
    formData.append(
      "complement",
      (document.getElementById("complemento") as HTMLInputElement).value,
    );

    // Adiciona a foto ao FormData, se existir
    if (file) {
      formData.append("photo", file);
    }

    try {
      const response = await fetch("/api/saller/create", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        toast.success("Vendedor cadastrado com sucesso!");

        // Limpa o formulário após o sucesso
        (document.getElementById("nome-vendedor") as HTMLInputElement).value =
          "";
        (document.getElementById("login") as HTMLInputElement).value = "";
        (document.getElementById("email") as HTMLInputElement).value = "";
        (document.getElementById("cpf") as HTMLInputElement).value = "";
        (document.getElementById("rg") as HTMLInputElement).value = "";
        (document.getElementById("telefone") as HTMLInputElement).value = "";
        (document.getElementById("observacao") as HTMLTextAreaElement).value =
          "";
        (document.getElementById("pix") as HTMLInputElement).value = "";
        setSelectedState("");
        setSelectedCity("");
        (document.getElementById("logradouro") as HTMLInputElement).value = "";
        (document.getElementById("numero") as HTMLInputElement).value = "";
        (document.getElementById("complemento") as HTMLInputElement).value = "";
        setFile(null);
        setComissoes([{ operadora: "", aVista: "", parcelado: "" }]);
      } else {
        toast.error(`Erro: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast.error("Erro ao cadastrar vendedor. Tente novamente.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Cadastrar Vendedor</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Vendedor</DialogTitle>
          <DialogDescription>
            Preencha as informações do vendedor abaixo.
          </DialogDescription>
        </DialogHeader>

        {/* Abas para Navegação */}
        <div className="mb-6 mt-4 flex space-x-4">
          <button
            className={`px-4 py-2 ${
              activeTab === "dados-basicos"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("dados-basicos")}
          >
            Dados básicos
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "comissoes"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("comissoes")}
          >
            Comissões
          </button>
        </div>

        {/* Scrollable Area */}
        <ScrollArea className="h-[400px] space-y-4 overflow-auto">
          {/* Conteúdo das Abas */}
          {activeTab === "dados-basicos" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome-vendedor" className="text-right">
                  Nome
                </Label>
                <Input id="nome-vendedor" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="login" className="text-right">
                  Login
                </Label>
                <Input id="login" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input id="email" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">
                  CPF
                </Label>
                <IMaskInput
                  mask="000.000.000-00" // Máscara para CPF
                  id="cpf"
                  type="text"
                  className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rg" className="text-right">
                  RG
                </Label>
                <IMaskInput
                  mask="000.000.000" // Máscara para RG
                  id="rg"
                  type="text"
                  className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000.000.000"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone" className="text-right">
                  Telefone
                </Label>
                <IMaskInput
                  mask="(00) 00000-0000" // Máscara para Telefone
                  id="telefone"
                  type="text"
                  className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacao" className="text-right">
                  Observação
                </Label>
                <textarea
                  id="observacao"
                  className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Digite suas observações..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pix" className="text-right">
                  Pix
                </Label>
                <Input id="pix" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="foto" className="text-right">
                  Foto
                </Label>
                <Input
                  id="foto"
                  type="file"
                  className="col-span-3"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right">
                  Estado
                </Label>
                <select
                  id="estado"
                  className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  required
                >
                  <option value="">Selecione um estado</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.nome}>
                      {state.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cidade" className="text-right">
                  Cidade
                </Label>
                <select
                  id="cidade"
                  className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  required
                  disabled={!selectedState}
                >
                  <option value="">Selecione uma cidade</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.nome}>
                      {city.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logradouro" className="text-right">
                  Logradouro
                </Label>
                <Input id="logradouro" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero" className="text-right">
                  Número
                </Label>
                <Input id="numero" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="complemento" className="text-right">
                  Complemento
                </Label>
                <Input id="complemento" type="text" className="col-span-3" />
              </div>
            </div>
          )}

          {activeTab === "comissoes" && (
            <div className="space-y-4 p-5">
              {comissoes.map((comissao, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Label htmlFor={`operadora-${index}`} className="text-right">
                    Operadora
                  </Label>
                  <select
                    id={`operadora-${index}`}
                    className="flex-1 rounded-md border p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma operadora</option>
                    <option value="1">Operadora 1</option>
                    <option value="2">Operadora 2</option>
                    <option value="3">Operadora 3</option>
                  </select>
                  <Label htmlFor={`a-vista-${index}`} className="text-right">
                    À Vista
                  </Label>
                  <Input
                    id={`a-vista-${index}`}
                    type="number"
                    className="w-20 rounded-md border p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Label htmlFor={`parcelado-${index}`} className="text-right">
                    Parcelado
                  </Label>
                  <Input
                    id={`parcelado-${index}`}
                    type="number"
                    className="w-20 rounded-md border p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      index === 0 && comissoes.length > 1
                        ? removerComissao(index)
                        : adicionarComissao()
                    }
                    className="p-1"
                  >
                    {index === 0 && comissoes.length > 1 ? (
                      <Minus className="h-4 w-4 text-red-500" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Salvar Vendedor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
