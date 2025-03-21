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

export default function RegisterSaleDialog() {
  const [activeTab, setActiveTab] = useState("gerais");

  // Estado para armazenar a lista de acompanhantes selecionados
  const [acompanhantesSelecionados, setAcompanhantesSelecionados] = useState<string[]>([]);

  // Estado para armazenar a lista de registros dde hospedagem
  const [registrosHospedagem, setRegistrosHospedagem] = useState<
    { hospedagem: string; quartos: number; valor: string }[]
  >([]);
  // Estado para armazenar os valores dos inputs da hospedagem
  const [hospedagem, setHospedagem] = useState("");
  const [quartos, setQuartos] = useState(0);
  const [valor, setValor] = useState("");

  // Estado para armazenar a lista de registros de ingressos
  const [registrosIngresso, setRegistrosIngresso] = useState<
    {
      data: string;
      ingresso: string;
      adulto: number;
      crianca: number;
      meia: number;
      valoringresso: string;
    }[]
  >([]);
   // Estado para armazenar os valores dos inputs de ingresso
   const [data, setData] = useState("");
   const [ingresso, setIngresso] = useState("");
   const [adulto, setAdulto] = useState(0);
   const [crianca, setCrianca] = useState(0);
   const [meia, setMeia] = useState(0);
   const [valoringresso, setValoringresso] = useState("");  

   // Função para adicionar um novo registro de hospedagem
   const adicionarRegistroHospedagem = () => {
    const valorNumerico = parseFloat(valor);
    if (hospedagem && quartos > 0 && valorNumerico > 0) {
      setRegistrosHospedagem([...registrosHospedagem, { hospedagem, quartos, valor }]);
      // Limpa os inputs após adicionar
      setHospedagem("");
      setQuartos(0);
      setValor("");
    } else {
      alert("Preencha todos os campos corretamente!");
    }
  };

  // Função para adicionar um novo registro de ingresso
  const adicionarRegistroIngresso = () => {
    const valorNumerico = parseFloat(valoringresso);
    if (data && ingresso && adulto >= 0 && crianca >= 0 && meia >= 0 && valorNumerico > 0) {
      setRegistrosIngresso([
        ...registrosIngresso,
        { data, ingresso, adulto, crianca, meia, valoringresso },
      ]);
      // Limpa os inputs após adicionar
      setData("");
      setIngresso("");
      setAdulto(0);
      setCrianca(0);
      setMeia(0);
      setValoringresso("");
    } else {
      alert("Preencha todos os campos corretamente!");
    }
  };

  // Função para adicionar um novo select de acompanhante
  const adicionarAcompanhante = () => {
    setAcompanhantesSelecionados([...acompanhantesSelecionados, ""]); // Adiciona um novo item vazio à lista
  };

  // Função para atualizar o valor de um acompanhante selecionado
  const atualizarAcompanhante = (index: number, value: string) => {
    const novosAcompanhantes = [...acompanhantesSelecionados];
    novosAcompanhantes[index] = value;
    setAcompanhantesSelecionados(novosAcompanhantes);
  };


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
              activeTab === "acompanhantes"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("acompanhantes")}
          >
            Acompanhantes
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "hospedagem"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("hospedagem")}
          >
            Hospedagens
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
              activeTab === "nt-fiscal"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded`}
            onClick={() => handleTabChange("nt-fiscal")}
          >
            Nota Fiscal
          </button>
        </div>

        {/* Scrollable Area */}
        <ScrollArea className="h-[400px] space-y-4 overflow-auto">
          {/* Conteúdo das Abas */}
          {/* Gerais */}
          {activeTab === "gerais" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Id
                </Label>
                <Input id="cliente" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vendedor" className="text-right">
                  Vendedor
                </Label>
                <select
                  id="vendedor"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um vendedor</option>
                  <option value="1">João Silva</option>
                  <option value="2">Maria Souza</option>
                  <option value="3">Pedro Costa</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pagamento" className="text-right">
                  Forma de pagamento
                </Label>
                <select
                id="pagamento"
                className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma forma de pagamento</option>
                <option value="1">Pix</option>
                <option value="2">Dinheiro</option>
                <option value="3">Debito</option>
              </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="operadora" className="text-right">
                  Operadora
                </Label>
                <select
                id="operadora"
                className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma operadora</option>
                <option value="1">Operadora 1</option>
                <option value="2">Operadora 2</option>
                <option value="3">Operadora 3</option>
              </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comissao-vendedor" className="text-right">
                  Comissão do vendedor
                </Label>
                <Input id="comissao-vendedor" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comissa-agencia" className="text-right">
                  Comissão do vendedor
                </Label>
                <Input id="comissa-agencia" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dataVenda" className="text-right">
                  Data da Venda
                </Label>
                <Input id="dataVenda" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="checkin" className="text-right">
                  Check-in
                </Label>
                <Input id="checkin" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="checkout" className="text-right">
                  Check-out
                </Label>
                <Input id="checkout" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Cliente
                </Label>
                <select
                id="cliente"
                className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um cliente</option>
                <option value="1">João Maria</option>
                <option value="2">Pedro Alves</option>
                <option value="3">Camila Silva</option>
              </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desconto-ingresso" className="text-right">
                  Desconto do ingresso
                </Label>
                <Input id="desconto-ingresso" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desconto-hospedagem" className="text-right">
                  Desconto da hospedagem
                </Label>
                <Input id="desconto-hospedagem" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cashback" className="text-right">
                  Cashback
                </Label>
                <select
                id="cashback"
                className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione Cashback</option>
                <option value="1">Cashback 1</option>
                <option value="2">Cashback 2</option>
                <option value="3">Cashback 3</option>
              </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacao" className="text-right">
                  Observações
                </Label>
                <textarea
                  id="observacao"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4} // Define o número de linhas visíveis
                  placeholder="Digite suas observações..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vendaCancelada" className="text-right">
                  Venda cancelada
                </Label>
                <select
                  id="vendaCancelada"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>
          )}

          {/* acompanhates */}
          {activeTab === "acompanhantes" && (
            <div className="space-y-4 p-5">
            {/* Título */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="acompanhante" className="text-right">
                Acompanhante
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <select
                  id="acompanhante"
                  value={acompanhantesSelecionados[0] || ""}
                  onChange={(e) => atualizarAcompanhante(0, e.target.value)}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 w-full" >
                  <option value="">Selecione um acompanhante</option>
                  <option value="1">João Silva</option>
                  <option value="2">Maria Souza</option>
                  <option value="3">Pedro Costa</option>
                </select>
                <button
                  type="button"
                  onClick={adicionarAcompanhante}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  +
                </button>
              </div>
            </div>
      
            {/* Selects adicionais */}
            {acompanhantesSelecionados.slice(1).map((acompanhanteId, index) => (
              <div key={index + 1} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`acompanhante-${index + 1}`} className="text-right">
                  Acompanhante {index + 2}
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <select
                    id={`acompanhante-${index + 1}`}
                    value={acompanhanteId}
                    onChange={(e) => atualizarAcompanhante(index + 1, e.target.value)}
                    className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12 w-full" >
                    <option value="">Selecione um acompanhante</option>
                    <option value="1">João Silva</option>
                    <option value="2">Maria Souza</option>
                    <option value="3">Pedro Costa</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const novosAcompanhantes = acompanhantesSelecionados.filter(
                        (_, i) => i !== index + 1
                      );
                      setAcompanhantesSelecionados(novosAcompanhantes);
                    }}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    -
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Hospedagem */}
          {activeTab === "hospedagem" && (
            <div className="space-y-4 p-5">
            {/* Inputs */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hospedagem" className="text-right">
                Hospedagem
              </Label>
              <select
                id="hospedagem"
                value={hospedagem}
                onChange={(e) => setHospedagem(e.target.value)}
                className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a hospedagem</option>
                <option value="Hotel A">Hotel A</option>
                <option value="Hotel B">Hotel B</option>
                <option value="Hotel C">Hotel C</option>
              </select>
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quartos" className="text-right">
                Quartos
              </Label>
              <Input
                id="quartos"
                type="number"
                value={quartos}
                onChange={(e) => setQuartos(Number(e.target.value))}
                className="col-span-3"
                min="0"
              />
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <Input
                id="valor"
                type="text"
                value={valor}
                onChange={(e) => {
                  // Permite apenas números e ponto decimal
                  const valorDigitado = e.target.value.replace(/[^0-9.]/g, "");
                  setValor(valorDigitado);
                }}
                className="col-span-3"
                min="0"
              />
            </div>
      
            {/* Botão Adicionar */}
            <div className="flex justify-end">
              <button
                onClick={adicionarRegistroHospedagem}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>
      
            {/* Lista de Registros */}
            <div className="space-y-2">
              {registrosHospedagem.map((registro, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p>
                    <strong>Hospedagem:</strong> {registro.hospedagem}
                  </p>
                  <p>
                    <strong>Quartos:</strong> {registro.quartos}
                  </p>
                  <p>
                  <strong>Valor:</strong> R$ {parseFloat(registro.valor).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          )}
          
          {/* Ingresso */}
          {activeTab === "ingresso" && (
            <div className="space-y-4 p-5">
            {/* Inputs */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="data" className="text-right">
                Data
              </Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="col-span-3"
              />
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ingresso" className="text-right">
                Ingresso
              </Label>
              <select
                id="ingresso"
                value={ingresso}
                onChange={(e) => setIngresso(e.target.value)}
                className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o ingresso</option>
                <option value="Ingresso A">Ingresso A</option>
                <option value="Ingresso B">Ingresso B</option>
                <option value="Ingresso C">Ingresso C</option>
              </select>
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adulto" className="text-right">
                Adulto
              </Label>
              <Input
                id="adulto"
                type="number"
                value={adulto}
                onChange={(e) => setAdulto(Number(e.target.value))}
                className="col-span-3"
                min="0"
              />
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="crianca" className="text-right">
                Criança
              </Label>
              <Input
                id="crianca"
                type="number"
                value={crianca}
                onChange={(e) => setCrianca(Number(e.target.value))}
                className="col-span-3"
                min="0"
              />
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="meia" className="text-right">
                Meia
              </Label>
              <Input
                id="meia"
                type="number"
                value={meia}
                onChange={(e) => setMeia(Number(e.target.value))}
                className="col-span-3"
                min="0"
              />
            </div>
      
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="valor" className="text-right">
                Valor
              </Label>
              <Input
                id="valor"
                type="number"
                value={valoringresso}
                onChange={(e) => {
                  // Permite apenas números e ponto decimal
                  const valorDigitado = e.target.value.replace(/[^0-9.]/g, "");
                  setValoringresso(valorDigitado);
                }}
                className="col-span-3"
                min="0"
              />
            </div>
      
            {/* Botão Adicionar */}
            <div className="flex justify-end">
              <button
                onClick={adicionarRegistroIngresso}
                className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>
      
            {/* Lista de Registros */}
            <div className="space-y-2">
              {registrosIngresso.map((registro, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p>
                    <strong>Data:</strong> {registro.data}
                  </p>
                  <p>
                    <strong>Ingresso:</strong> {registro.ingresso}
                  </p>
                  <p>
                    <strong>Adulto:</strong> {registro.adulto}
                  </p>
                  <p>
                    <strong>Criança:</strong> {registro.crianca}
                  </p>
                  <p>
                    <strong>Meia:</strong> {registro.meia}
                  </p>
                  <p>
                    <strong>Valor:</strong> R$ {parseFloat(registro.valoringresso).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          )}

          {activeTab === "nt-fiscal" && (
            <div className="space-y-4 p-5">
            {/* Inputs */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nt-fiscal-emitida" className="text-right">
                  NF emitida?
                </Label>
                <select
                  id="nt-fiscal-emitida"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                  <option value="sem_emissao">Sem Emissão</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-emissao" className="text-right">
                  Data prevista para emissão:
                </Label>
                <Input
                  id="data-emissao"
                  type="date"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero-nf" className="text-right">
                  Número da NF:
                </Label>
                <Input
                  id="numero-nf"
                  type="number"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-nf" className="text-right">
                  Data da NF:
                </Label>
                <Input
                  id="data-nf"
                  type="date"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-prevista-recebimento" className="text-right">
                  Data prevista para o recebimento:
                </Label>
                <Input
                  id="data-prevista-recebimento"
                  type="date"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nt-fiscal-recebida" className="text-right">
                  NF Rececbida?
                </Label>
                <select
                  id="nt-fiscal-recebida"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-recebimento" className="text-right">
                  Data do recebimento:
                </Label>
                <Input
                  id="data-recebimento"
                  type="date"
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
