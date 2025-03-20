import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area"; // Importando o ScrollArea

export default function DialogDemo() {
  const [activeTab, setActiveTab] = useState("gerais");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Cadastrar Venda</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Venda</DialogTitle>
          <DialogDescription>
            Preencha as informações da venda abaixo.
          </DialogDescription>
        </DialogHeader>

        {/* Abas para Navegação */}
        <div className="flex space-x-4 mt-4 mb-6">
          <button
            className={`px-4 py-2 ${
              activeTab === "gerais" ? "bg-blue-500 text-white" : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("gerais")}
          >
            Gerais
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "ingresso"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("ingresso")}
          >
            Ingresso
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "acompanhantes"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("acompanhantes")}
          >
            Acompanhantes
          </button>
        </div>

        {/* Scrollable Area */}
        <ScrollArea className="h-[400px] space-y-4 overflow-auto">
          {/* Conteúdo das Abas */}
          {activeTab === "gerais" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Id
                </Label>
                <Input id="cliente" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Vendedor
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Forma de pagamento
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Operadora
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Comissão do vendedor
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Comissão do vendedor
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Data da Venda
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Check-in
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Check-out
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Cliente
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Desconto do ingresso
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Desconto da hospedagem
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Cashback
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Observações
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Venda cancelada
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
            </div>
          )}

          {activeTab === "ingresso" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ingressoNumero" className="text-right">
                  Número do Ingresso
                </Label>
                <Input id="ingressoNumero" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tipoIngresso" className="text-right">
                  Tipo de Ingresso
                </Label>
                <Input id="tipoIngresso" className="col-span-3" />
              </div>
            </div>
          )}

          {activeTab === "acompanhantes" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="acompanhanteNome" className="text-right">
                  Nome do Acompanhante
                </Label>
                <Input id="acompanhanteNome" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="acompanhanteIdade" className="text-right">
                  Idade do Acompanhante
                </Label>
                <Input
                  id="acompanhanteIdade"
                  type="number"
                  className="col-span-3"
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="submit">Salvar Venda</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
