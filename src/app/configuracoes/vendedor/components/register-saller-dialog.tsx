import { Loader, Minus, Plus } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchCitiesByState, fetchStates } from "@/services/ibge";

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

interface RegisterSallerDialogProps {
  onAddSaller: (newSaller: Saller) => void;
}

const RegisterSallerDialog: React.FC<RegisterSallerDialogProps> = ({
  onAddSaller,
}) => {
  const [activeTab, setActiveTab] = useState("dados-basicos");
  const [comissoes, setComissoes] = useState([
    { operadora: "", aVistaInput: "", parceladoInput: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    login: "",
    email: "",
    cpf: "",
    rg: "",
    phone: "",
    observation: "",
    pix: "",
    adress: "",
    number: "",
    complement: "",
  });

  // Estados e cidades
  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [operadoras, setOperadoras] = useState<{ id: number; name: string }[]>(
    [],
  );

  // Formata o valor para exibição (ex: "154" → "1,54%")
  const formatPercentage = (input: string): string => {
    if (!input) return "";
    const numbers = input.replace(/\D/g, "");
    const padded = numbers.padStart(3, "0");
    const integerPart = padded.slice(0, -2) || "0";
    const decimalPart = padded.slice(-2);
    return `${integerPart},${decimalPart}%`;
  };

  // Converte para formato com vírgula (ex: "154" → "1,54")
  const formatForBackend = (input: string): string => {
    if (!input) return "";
    const numbers = input.replace(/\D/g, "");
    const padded = numbers.padStart(3, "0");
    return `${padded.slice(0, -2)},${padded.slice(-2)}`;
  };

  // Manipula a digitação
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

  useEffect(() => {
    const carregarOperadoras = async () => {
      try {
        const response = await fetch("/api/touroperator/list");
        if (!response.ok) throw new Error(`Erro: ${response.status}`);
        const operadoras = await response.json();
        setOperadoras(operadoras);
      } catch (error) {
        console.error("Erro ao carregar operadoras:", error);
        toast.error("Não foi possível carregar as operadoras");
        setOperadoras([]);
      }
    };
    carregarOperadoras();
  }, []);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    // Prepara as comissões com valores no formato "15,4" (string com vírgula)
    const comissoesConvertidas = comissoes.map((comissao) => ({
      operadora: comissao.operadora,
      aVista: formatForBackend(comissao.aVistaInput), // "15,4"
      parcelado: formatForBackend(comissao.parceladoInput), // "12,5"
    }));

    const comissoesInvalidas = comissoesConvertidas.some(
      (c) => c.operadora && (!c.aVista || !c.parcelado),
    );

    if (comissoesInvalidas) {
      toast.error("Preencha todas as comissões corretamente");
      setIsLoading(false);
      return;
    }

    const comissoesParaEnviar = comissoesConvertidas.filter((c) => c.operadora);

    if (file && !file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido.");
      return;
    }

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) dataToSend.append(key, value);
    });

    if (selectedState) dataToSend.append("state", selectedState);
    if (selectedCity) dataToSend.append("city", selectedCity);
    if (comissoesParaEnviar.length > 0) {
      dataToSend.append("commissions", JSON.stringify(comissoesParaEnviar));
    }
    if (file) dataToSend.append("photo", file);

    try {
      const response = await fetch("/api/saller/create", {
        method: "POST",
        body: dataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Vendedor cadastrado com sucesso!");
        onAddSaller(result.saller);
        setIsOpen(false);
        setIsLoading(false);
        setFormData({
          name: "",
          login: "",
          email: "",
          cpf: "",
          rg: "",
          phone: "",
          observation: "",
          pix: "",
          adress: "",
          number: "",
          complement: "",
        });
        setSelectedState("");
        setSelectedCity("");
        setFile(null);
        setComissoes([{ operadora: "", aVistaInput: "", parceladoInput: "" }]);
      } else {
        const error = await response.json();
        toast.error(error.message);
      }
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast.error("Erro ao conectar com o servidor");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar vendedor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar vendedor</DialogTitle>
        </DialogHeader>

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

        <ScrollArea className="h-[400px] space-y-4 overflow-auto">
          {activeTab === "dados-basicos" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome-vendedor" className="text-right">
                  Nome
                </Label>
                <Input
                  id="nome-vendedor"
                  type="text"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="login" className="text-right">
                  Login
                </Label>
                <Input
                  id="login"
                  type="text"
                  className="col-span-3"
                  value={formData.login}
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="text"
                  className="col-span-3"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">
                  CPF
                </Label>
                <IMaskInput
                  mask="000.000.000-00"
                  id="cpf"
                  type="text"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.cpf}
                  onAccept={(value) => setFormData({ ...formData, cpf: value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rg" className="text-right">
                  RG
                </Label>
                <IMaskInput
                  mask="000.000.000"
                  id="rg"
                  type="text"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.rg}
                  onAccept={(value) => setFormData({ ...formData, rg: value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone" className="text-right">
                  Telefone
                </Label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  id="telefone"
                  type="text"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.phone}
                  onAccept={(value) =>
                    setFormData({ ...formData, phone: value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <Label
                  htmlFor="observacao"
                  className="self-start pt-2 text-right"
                >
                  Observação
                </Label>
                <textarea
                  id="observacao"
                  className="col-span-3 rounded-md border bg-[#e5e5e5]/30 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={formData.observation}
                  onChange={(e) =>
                    setFormData({ ...formData, observation: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pix" className="text-right">
                  Pix
                </Label>
                <Input
                  id="pix"
                  type="text"
                  className="col-span-3"
                  value={formData.pix}
                  onChange={(e) =>
                    setFormData({ ...formData, pix: e.target.value })
                  }
                />
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  required
                >
                  <option value=""></option>
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  required
                  disabled={!selectedState}
                >
                  <option value=""></option>
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
                <Input
                  id="logradouro"
                  type="text"
                  className="col-span-3"
                  value={formData.adress}
                  onChange={(e) =>
                    setFormData({ ...formData, adress: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero" className="text-right">
                  Número
                </Label>
                <Input
                  id="numero"
                  type="text"
                  className="col-span-3"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="complemento" className="text-right">
                  Complemento
                </Label>
                <Input
                  id="complemento"
                  type="text"
                  className="col-span-3"
                  value={formData.complement}
                  onChange={(e) =>
                    setFormData({ ...formData, complement: e.target.value })
                  }
                />
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
                    className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-96 rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={comissao.operadora}
                    onChange={(e) =>
                      handleComissaoChange(index, "operadora", e.target.value)
                    }
                  >
                    <option value="">Selecione uma operadora</option>
                    {operadoras.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>

                  <Label htmlFor={`a-vista-${index}`} className="text-right">
                    À Vista (%)
                  </Label>
                  <Input
                    id={`a-vista-${index}`}
                    type="text"
                    className="w-20 rounded-md border p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    required
                  />

                  <Label htmlFor={`parcelado-${index}`} className="text-right">
                    Parcelado (%)
                  </Label>
                  <Input
                    id={`parcelado-${index}`}
                    type="text"
                    className="w-20 rounded-md border p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    required
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
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? <Loader className="h-4 w-4" /> : "Cadastrar vendedor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterSallerDialog;
