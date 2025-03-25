import { useState } from "react";
import { IMaskInput } from "react-imask";

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
import { ScrollArea } from "@/components/ui/scroll-area"; // Importando o ScrollArea

export default function RegisterSaleDialog() {
  const [activeTab, setActiveTab] = useState("gerais");

  // Estado para armazenar a lista de acompanhantes selecionados
  const [acompanhantes, setAcompanhantes] = useState<
    { id: number; value: string }[]
  >([{ id: Date.now(), value: "" }]);

  // Estado para armazenar a lista de registros dde hospedagem
  const [registrosHospedagem, setRegistrosHospedagem] = useState<
    { hospedagem: string; quartos: number; valor: string }[]
  >([]);
  // Estado para armazenar os valores dos inputs da hospedagem
  const [hospedagem, setHospedagem] = useState("");
  const [quartos, setQuartos] = useState("");
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
  const [adulto, setAdulto] = useState("");
  const [crianca, setCrianca] = useState("");
  const [meia, setMeia] = useState("");
  const [valoringresso, setValoringresso] = useState("");

  const TODOS_ACOMPANHANTES = [
    { id: "1", nome: "João Silva" },
    { id: "2", nome: "Maria Souza" },
    { id: "3", nome: "Pedro Costa" },
  ];

  // Na função adicionarRegistroHospedagem:
  const adicionarRegistroHospedagem = () => {
    const valorNumerico = parseFloat(valor);
    const quartosNumerico = parseFloat(quartos);
    if (hospedagem && quartosNumerico > 0 && valorNumerico > 0) {
      setRegistrosHospedagem([
        ...registrosHospedagem,
        { hospedagem, quartos: quartosNumerico, valor },
      ]);
      setHospedagem("");
      setQuartos("");
      setValor("");
    }
  };

  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Permite apenas números ou string vazia
      if (value === "" || /^[0-9]*$/.test(value)) {
        setter(value);
      }
    };

  // Na função adicionarRegistroIngresso:
  const adicionarRegistroIngresso = () => {
    const valorNumerico = parseFloat(valoringresso);
    const adultoNumerico = parseFloat(adulto);
    const criancaNumerico = parseFloat(crianca);
    const meiaNumerica = parseFloat(meia);

    if (
      data &&
      ingresso &&
      adultoNumerico >= 0 &&
      criancaNumerico >= 0 &&
      meiaNumerica >= 0 &&
      valorNumerico > 0
    ) {
      setRegistrosIngresso([
        ...registrosIngresso,
        {
          data,
          ingresso,
          adulto: adultoNumerico,
          crianca: criancaNumerico,
          meia: meiaNumerica,
          valoringresso,
        },
      ]);
      setData("");
      setIngresso("");
      setAdulto("");
      setCrianca("");
      setMeia("");
      setValoringresso("");
    }
  };

  // Função para adicionar um novo select de acompanhante
  // Adiciona novo campo de acompanhante (se houver opções disponíveis)
  const adicionarAcompanhante = () => {
    const opcoesDisponiveis = getOpcoesDisponiveis("");
    if (opcoesDisponiveis.length > 0) {
      setAcompanhantes([...acompanhantes, { id: Date.now(), value: "" }]);
    }
  };

  // Função para remover um acompanhante
  const removerAcompanhante = (id: number) => {
    if (acompanhantes.length > 1) {
      setAcompanhantes(acompanhantes.filter((a) => a.id !== id));
    }
  };

  // Função para atualizar o valor de um acompanhante
  const atualizarAcompanhante = (id: number, value: string) => {
    setAcompanhantes(
      acompanhantes.map((a) => (a.id === id ? { ...a, value } : a)),
    );
  };
  // Função para filtrar opções disponíveis
  // Filtra as opções disponíveis para um select específico
  const getOpcoesDisponiveis = (valorAtual: string) => {
    const idsSelecionados = acompanhantes.map((a) => a.value);
    return TODOS_ACOMPANHANTES.filter(
      (opcao) => !idsSelecionados.includes(opcao.id) || opcao.id === valorAtual,
    );
  };

  // const renderAcompanhante = (
  //   acompanhante: { id: number; value: string },
  //   index: number,
  // ) => (
  //   <div key={acompanhante.id} className="grid grid-cols-4 items-center gap-4">
  //     <Label className="text-right">
  //       {index === 0 ? "Acompanhante" : `Acompanhante ${index + 1}`}
  //     </Label>
  //     <div className="col-span-3 flex items-center gap-2">
  //       <select
  //         value={acompanhante.value}
  //         onChange={(e) =>
  //           atualizarAcompanhante(acompanhante.id, e.target.value)
  //         }
  //         className="..."
  //       >
  //         <option value="">Selecione...</option>
  //         {getOpcoesDisponiveis(acompanhante.value).map((opcao) => (
  //           <option key={opcao.id} value={opcao.id}>
  //             {opcao.nome}
  //           </option>
  //         ))}
  //       </select>

  //       {index < acompanhantes.length - 1 ? (
  //         <button onClick={() => removerAcompanhante(acompanhante.id)}>
  //           -
  //         </button>
  //       ) : (
  //         <button
  //           onClick={adicionarAcompanhante}
  //           disabled={getOpcoesDisponiveis("").length === 0}
  //         >
  //           +
  //         </button>
  //       )}
  //     </div>
  //   </div>
  // );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Cadastrar venda</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] md:max-w-[900px] lg:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>Cadastrar venda</DialogTitle>
        </DialogHeader>

        {/* Abas para Navegação */}
        <div className="mb-6 mt-4 flex space-x-4">
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
                  Id na operadora
                </Label>
                <Input id="cliente" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vendedor" className="text-right">
                  Vendedor
                </Label>
                <select
                  id="vendedor"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
                  <option value="1">Operadora 1</option>
                  <option value="2">Operadora 2</option>
                  <option value="3">Operadora 3</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comissao-vendedor" className="text-right">
                  Comissão do vendedor
                </Label>
                <Input
                  id="comissao-vendedor"
                  type="number"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comissa-agencia" className="text-right">
                  Comissão do vendedor
                </Label>
                <Input
                  id="comissa-agencia"
                  type="number"
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da Venda</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-in</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-out</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Cliente
                </Label>
                <select
                  id="cliente"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
                  <option value="1">João Maria</option>
                  <option value="2">Pedro Alves</option>
                  <option value="3">Camila Silva</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desconto-ingresso" className="text-right">
                  Desconto do ingresso
                </Label>
                <Input
                  id="desconto-ingresso"
                  type="number"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desconto-hospedagem" className="text-right">
                  Desconto da hospedagem
                </Label>
                <Input
                  id="desconto-hospedagem"
                  type="number"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cashback" className="text-right">
                  Cashback
                </Label>
                <select
                  id="cashback"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
                  <option value="1">Cashback 1</option>
                  <option value="2">Cashback 2</option>
                  <option value="3">Cashback 3</option>
                </select>
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
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Venda cancelada</Label>
                <div className="col-span-3 flex items-center gap-4">
                  {/* Radio Sim */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="vendaCancelada"
                      value="sim"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Sim</span>
                  </label>

                  {/* Radio Não */}
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="vendaCancelada"
                      value="nao"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Não</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Acompanhantes - Modificado */}
          {activeTab === "acompanhantes" && (
            <div className="space-y-4 p-5">
              {acompanhantes.map((acompanhante, index) => (
                <div
                  key={acompanhante.id}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label
                    htmlFor={`acompanhante-${acompanhante.id}`}
                    className="text-right"
                  >
                    {index === 0 ? "Acompanhante" : `Acompanhante ${index + 1}`}
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    {/* Select com estilização original */}
                    <select
                      id={`acompanhante-${acompanhante.id}`}
                      value={acompanhante.value}
                      onChange={(e) =>
                        atualizarAcompanhante(acompanhante.id, e.target.value)
                      }
                      className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um acompanhante</option>
                      {getOpcoesDisponiveis(acompanhante.value).map((opcao) => (
                        <option key={opcao.id} value={opcao.id}>
                          {opcao.nome}
                        </option>
                      ))}
                    </select>

                    {/* Botões com estilização original */}
                    {index < acompanhantes.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => removerAcompanhante(acompanhante.id)}
                        className="rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        -
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={adicionarAcompanhante}
                        disabled={getOpcoesDisponiveis("").length === 0}
                        className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                      >
                        +
                      </button>
                    )}
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
                  <option value="Hotel A">Hotel A</option>
                  <option value="Hotel B">Hotel B</option>
                  <option value="Hotel C">Hotel C</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quartos" className="text-right">
                  Quartos
                </Label>
                {/* Quartos */}
                <Input
                  id="quartos"
                  type="number"
                  value={quartos}
                  onChange={handleNumberChange(setQuartos)}
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
                    const valorDigitado = e.target.value.replace(
                      /[^0-9.]/g,
                      "",
                    );
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
                  className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>

              {/* Lista de Registros */}
              <div className="space-y-2">
                {registrosHospedagem.map((registro, index) => (
                  <div key={index} className="rounded-md border p-4">
                    <p>
                      <strong>Hospedagem:</strong> {registro.hospedagem}
                    </p>
                    <p>
                      <strong>Quartos:</strong> {registro.quartos}
                    </p>
                    <p>
                      <strong>Valor:</strong> R${" "}
                      {parseFloat(registro.valor).toFixed(2)}
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
                <Label className="text-right">Data</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
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
                  onChange={handleNumberChange(setAdulto)}
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
                  onChange={handleNumberChange(setCrianca)}
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
                  onChange={handleNumberChange(setMeia)}
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
                    const valorDigitado = e.target.value.replace(
                      /[^0-9.]/g,
                      "",
                    );
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
                  className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>

              {/* Lista de Registros */}
              <div className="space-y-2">
                {registrosIngresso.map((registro, index) => (
                  <div key={index} className="rounded-md border p-4">
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
                      <strong>Valor:</strong> R${" "}
                      {parseFloat(registro.valoringresso).toFixed(2)}
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
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                  <option value="sem_emissao">Sem Emissão</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data prevista para emissão</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero-nf" className="text-right">
                  Número da NF:
                </Label>
                <Input id="numero-nf" type="number" className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da NF</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="w-[240px] text-right">
                  Data prevista para o recebimento
                </Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nt-fiscal-recebida" className="text-right">
                  NF Rececbida?
                </Label>
                <select
                  id="nt-fiscal-recebida"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value=""></option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className=" text-right">Data de recebimento</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  unmask
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button type="submit" variant="outline">
            Salvar venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
