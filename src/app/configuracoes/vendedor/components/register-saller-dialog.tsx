import { Minus, Plus } from "lucide-react";
import { useState } from "react";
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

export default function RegisterSallerDialog() {
  const [activeTab, setActiveTab] = useState("dados-basicos");
  const [comissoes, setComissoes] = useState([
    { operadora: "", aVista: "", parcelado: "" },
  ]);
  const [file, setFile] = useState<File | null>(null);

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
    formData.append("name", (document.getElementById("nome-vendedor") as HTMLInputElement).value);
    formData.append("login", (document.getElementById("login") as HTMLInputElement).value);
    formData.append("email", (document.getElementById("email") as HTMLInputElement).value);
    formData.append("cpf", (document.getElementById("cpf") as HTMLInputElement).value);
    formData.append("rg", (document.getElementById("rg") as HTMLInputElement).value);
    formData.append("phone", (document.getElementById("telefone") as HTMLInputElement).value);
    formData.append("observation", (document.getElementById("observacao") as HTMLTextAreaElement).value);
    formData.append("pix", (document.getElementById("pix") as HTMLInputElement).value);
    formData.append("state", (document.getElementById("estado") as HTMLSelectElement).value);
    formData.append("city", (document.getElementById("cidade") as HTMLSelectElement).value);
    formData.append("adress", (document.getElementById("logradouro") as HTMLInputElement).value);
    formData.append("number", (document.getElementById("numero") as HTMLInputElement).value);
    formData.append("complement", (document.getElementById("complemento") as HTMLInputElement).value);

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
        (document.getElementById("nome-vendedor") as HTMLInputElement).value = "";
        (document.getElementById("login") as HTMLInputElement).value = "";
        (document.getElementById("email") as HTMLInputElement).value = "";
        (document.getElementById("cpf") as HTMLInputElement).value = "";
        (document.getElementById("rg") as HTMLInputElement).value = "";
        (document.getElementById("telefone") as HTMLInputElement).value = "";
        (document.getElementById("observacao") as HTMLTextAreaElement).value = "";
        (document.getElementById("pix") as HTMLInputElement).value = "";
        (document.getElementById("estado") as HTMLSelectElement).value = "";
        (document.getElementById("cidade") as HTMLSelectElement).value = "";
        (document.getElementById("logradouro") as HTMLInputElement).value = "";
        (document.getElementById("numero") as HTMLInputElement).value = "";
        (document.getElementById("complemento") as HTMLInputElement).value = "";
        setFile(null); // Limpa a foto
        setComissoes([{ operadora: "", aVista: "", parcelado: "" }]); // Reseta as comissões
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
        <div className="flex space-x-4 mt-4 mb-6">
          <button
            className={`px-4 py-2 ${
              activeTab === "dados-basicos" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("dados-basicos")}
          >
            Dados básicos
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "comissoes" ? "bg-blue-500 text-white" : "bg-gray-200"
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
                <Input id="cpf" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rg" className="text-right">
                  RG
                </Label>
                <Input id="rg" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone" className="text-right">
                  Telefone
                </Label>
                <Input id="telefone" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacao" className="text-right">
                  Observação
                </Label>
                <textarea
                  id="observacao"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um estado</option>
                  <option value="1">RN</option>
                  <option value="2">SP</option>
                  <option value="3">RJ</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cidade" className="text-right">
                  Cidade
                </Label>
                <select
                  id="cidade"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma cidade</option>
                  <option value="1">Natal</option>
                  <option value="2">São Paulo</option>
                  <option value="3">Rio de Janeiro</option>
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
                    className="p-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
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
                    className="p-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
                  />
                  <Label htmlFor={`parcelado-${index}`} className="text-right">
                    Parcelado
                  </Label>
                  <Input
                    id={`parcelado-${index}`}
                    type="number"
                    className="p-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
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
                      <Minus className="w-4 h-4 text-red-500" />
                    ) : (
                      <Plus className="w-4 h-4" />
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