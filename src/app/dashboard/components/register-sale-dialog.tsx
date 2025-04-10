import { PaymentMethodType } from "@prisma/client";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Sale } from "@/types/sale";

interface SallerCommission {
  tourOperator: TourOperator;
}

interface Saller {
  id: number;
  name: string;
  commissions: SallerCommission[]; // Adicione esta linha
}

interface TourOperator {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
}

interface SaleCashback {
  id: number;
  amount: number;
  expiryDate: string;
  cashback: {
    id: number;
    name: string;
    percentage?: number;
  };
  sale: {
    // Adicione esta propriedade
    id: number;
    saleDate: string;
    client: {
      id: number;
      name: string;
    };
  };
}

// interface Cashback {
//   id: number;
//   name: string;
// }

interface Companion {
  id: number;
  name: string;
}

interface Hosting {
  id: number;
  name: string;
}

interface Hospedagem {
  hostingId: number;
  name: string;
  quartos: number;
  valor: string;
}

interface Ticket {
  id: number;
  name: string;
}

interface Ingresso {
  data: string;
  ticketId: number; // Alterado de 'ingresso' para 'ticketId'
  adulto: number;
  crianca: number;
  meia: number;
  valoringresso: string;
}
interface FormData {
  idInTourOperator: string;
  sallerId: string;
  tourOperatorId: string;
  clientId: string;
  paymentMethod: PaymentMethodType | "";
  saleDate: string;
  checkIn: string;
  checkOut: string;
  sallerCommission: string;
  agencyCommission: string;
  ticketDiscount: string;
  hostingDiscount: string;
  observation: string;
  cashbackId: string;
  canceledSale: boolean;
  invoice: {
    issuedInvoice: string;
    estimatedIssueDate: string;
    invoiceNumber: string;
    invoiceDate: string;
    expectedReceiptDate: string;
    invoiceReceived: string;
    receiptDate: string;
  };
}

interface RegisterSaleDialogProps {
  onSaleSuccess: (newSale: Sale) => void;
}

export default function RegisterSaleDialog({
  onSaleSuccess,
}: RegisterSaleDialogProps) {
  const [activeTab, setActiveTab] = useState("gerais");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [acompanhantes, setAcompanhantes] = useState<Companion[]>([]);
  const [registrosHospedagem, setRegistrosHospedagem] = useState<Hospedagem[]>(
    [],
  );
  const [registrosIngresso, setRegistrosIngresso] = useState<Ingresso[]>([]);
  const [hospedagemSelecionada, setHospedagemSelecionada] = useState("");
  const [quartos, setQuartos] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [ingresso, setIngresso] = useState("");
  const [adulto, setAdulto] = useState("");
  const [crianca, setCrianca] = useState("");
  const [meia, setMeia] = useState("");
  const [valoringresso, setValoringresso] = useState("");

  const [sallers, setSallers] = useState<Saller[]>([]);
  const [loadingSallers, setLoadingSallers] = useState(true);

  const [tourOperators, setTourOperators] = useState<TourOperator[]>([]);
  const [loadingTourOperators, setLoadingTourOperators] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  // const [loadingCashbacks, setLoadingCashbacks] = useState(true);
  const [availableCashbacks, setAvailableCashbacks] = useState<SaleCashback[]>(
    [],
  );
  const [loadingCashbacks, setLoadingCashbacks] = useState(true);

  const [allCompanions, setAllCompanions] = useState<Companion[]>([]);
  const [loadingCompanions, setLoadingCompanions] = useState(true);

  const [allHostings, setAllHostings] = useState<Hosting[]>([]);
  const [loadingHostings, setLoadingHostings] = useState(true);

  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [filteredTourOperators, setFilteredTourOperators] = useState<
    TourOperator[]
  >([]);

  const [formData, setFormData] = useState<FormData>({
    idInTourOperator: "",
    sallerId: "",
    tourOperatorId: "",
    clientId: "",
    paymentMethod: "",
    saleDate: "",
    checkIn: "",
    checkOut: "",
    sallerCommission: "",
    agencyCommission: "",
    ticketDiscount: "",
    hostingDiscount: "",
    observation: "",
    cashbackId: "",
    canceledSale: false,
    invoice: {
      issuedInvoice: "",
      estimatedIssueDate: "",
      invoiceNumber: "",
      invoiceDate: "",
      expectedReceiptDate: "",
      invoiceReceived: "",
      receiptDate: "",
    },
  });

  useEffect(() => {
    fetchSallers();
    fetchTourOperator();
    fetchClients();
    // fetchCashbacks();
    fetchCompanions();
    fetchHostings();
    fetchTickets();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      fetchAvailableCashbacks(Number(formData.clientId));
    }
  }, [formData.clientId]);

  const fetchSallers = async () => {
    try {
      setLoadingSallers(true);
      const response = await fetch("/api/sale/list-with-tour-operators");
      if (!response.ok) {
        throw new Error("Erro ao carregar vendedores");
      }
      const data = await response.json();
      setSallers(data);
    } catch (error) {
      console.error("Erro ao carregar vendedores:", error);
    } finally {
      setLoadingSallers(false);
    }
  };

  const fetchTourOperator = async () => {
    try {
      setLoadingTourOperators(true);
      const response = await fetch("/api/touroperator/list");
      if (!response.ok) {
        throw new Error("Erro ao carregar operadoras");
      }
      const data = await response.json();
      setTourOperators(data);
    } catch (error) {
      console.error("Erro ao carregar operadoras:", error);
    } finally {
      setLoadingTourOperators(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await fetch("/api/client/list");
      if (!response.ok) {
        throw new Error("Erro ao carregar clientes");
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoadingClients(false);
    }
  };

  // const fetchCashbacks = async () => {
  //   try {
  //     setLoadingCashbacks(true);
  //     const response = await fetch("/api/cashback/list");
  //     if (!response.ok) {
  //       throw new Error("Erro ao carregar cashbacks");
  //     }
  //     const data = await response.json();
  //     setCashbacks(data);
  //   } catch (error) {
  //     console.error("Erro ao carregar cashbacks:", error);
  //   } finally {
  //     setLoadingCashbacks(false);
  //   }
  // };

  //cashback disponivel caso o cliente tenha
  const fetchAvailableCashbacks = async (clientId: number) => {
    try {
      setLoadingCashbacks(true);
      const response = await fetch(
        `/api/sale/cashbacks-available?clientId=${clientId}`,
      );
      if (!response.ok) {
        throw new Error("Erro ao carregar cashbacks disponíveis");
      }
      const data = await response.json();
      console.log("Dados recebidos:", data); // Adicione isto para debug
      setAvailableCashbacks(data);
    } catch (error) {
      console.error("Erro ao carregar cashbacks disponíveis:", error);
    } finally {
      setLoadingCashbacks(false);
    }
  };

  const fetchCompanions = async () => {
    try {
      setLoadingCompanions(true);
      const response = await fetch("/api/companion/list");
      if (!response.ok) {
        throw new Error("Erro ao carregar acompanhantes");
      }
      const data = await response.json();
      setAllCompanions(data);
      // Inicializa com um acompanhante vazio
      setAcompanhantes([{ id: 0, name: "" }]);
    } catch (error) {
      console.error("Erro ao carregar acompanhantes:", error);
    } finally {
      setLoadingCompanions(false);
    }
  };

  const fetchHostings = async () => {
    try {
      setLoadingHostings(true);
      const response = await fetch("/api/hosting/list");
      if (!response.ok) {
        throw new Error("Erro ao carregar hospedagens");
      }
      const data = await response.json();
      setAllHostings(data);
    } catch (error) {
      console.error("Erro ao carregar hospedagens:", error);
    } finally {
      setLoadingHostings(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await fetch("/api/ticket/list");
      if (!response.ok) {
        throw new Error("Erro ao carregar ingressos");
      }
      const data = await response.json();
      setAllTickets(data);
    } catch (error) {
      console.error("Erro ao carregar ingressos:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const limparCampos = () => {
    // Limpa os campos do formulário principal
    setFormData({
      idInTourOperator: "",
      sallerId: "",
      tourOperatorId: "",
      clientId: "",
      paymentMethod: "",
      saleDate: "",
      checkIn: "",
      checkOut: "",
      sallerCommission: "",
      agencyCommission: "",
      ticketDiscount: "",
      hostingDiscount: "",
      observation: "",
      cashbackId: "",
      canceledSale: false,
      invoice: {
        issuedInvoice: "",
        estimatedIssueDate: "",
        invoiceNumber: "",
        invoiceDate: "",
        expectedReceiptDate: "",
        invoiceReceived: "",
        receiptDate: "",
      },
    });

    // Limpa os acompanhantes
    setAcompanhantes([{ id: 0, name: "" }]);

    // Limpa as hospedagens
    setRegistrosHospedagem([]);
    setHospedagemSelecionada("");
    setQuartos("");
    setValor("");

    // Limpa os ingressos
    setRegistrosIngresso([]);
    setData("");
    setIngresso("");
    setAdulto("");
    setCrianca("");
    setMeia("");
    setValoringresso("");
  };

  const adicionarAcompanhante = () => {
    const opcoesDisponiveis = getOpcoesDisponiveis(acompanhantes.length);
    if (opcoesDisponiveis.length > 0) {
      setAcompanhantes([...acompanhantes, { id: 0, name: "" }]);
    }
  };

  const removerAcompanhante = (index: number) => {
    if (acompanhantes.length > 1) {
      setAcompanhantes(acompanhantes.filter((_, i) => i !== index));
    }
  };

  const atualizarAcompanhante = (index: number, companionId: string) => {
    const selectedCompanion = allCompanions.find(
      (c) => c.id.toString() === companionId,
    );
    if (selectedCompanion) {
      const novosAcompanhantes = [...acompanhantes];
      novosAcompanhantes[index] = selectedCompanion;
      setAcompanhantes(novosAcompanhantes);
    }
  };

  const getOpcoesDisponiveis = (currentIndex: number) => {
    const idsSelecionados = acompanhantes
      .filter((_, index) => index !== currentIndex)
      .map((c) => c.id);

    return allCompanions.filter((opcao) => !idsSelecionados.includes(opcao.id));
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInvoiceChange = (
    field: keyof FormData["invoice"],
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      invoice: {
        ...prev.invoice,
        [field]: value,
      },
    }));
  };

  const formatCurrencyForInput = (value: string): string => {
    // Remove tudo que não for dígito
    let digits = value.replace(/\D/g, "");

    // Adiciona zeros à esquerda se necessário para ter pelo menos 3 dígitos
    digits = digits.padStart(3, "0");

    // Formata como centavos
    let formatted = digits.replace(/(\d{2})$/, ",$1");

    // Adiciona pontos para milhares
    formatted = formatted.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    // Remove zeros à esquerda desnecessários (exceto para "0,00")
    if (formatted.startsWith("0") && formatted.length > 4) {
      formatted = formatted.replace(/^0+/, "");
    }

    return formatted;
  };

  const handleCurrencyChangeInput = (field: keyof FormData, value: string) => {
    // Se o valor for apagado completamente, mantém vazio
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [field]: "",
      }));
      return;
    }

    // Remove tudo que não for dígito
    const digits = value.replace(/\D/g, "");

    // Formata o valor
    const formatted = formatCurrencyForInput(digits);

    setFormData((prev) => ({
      ...prev,
      [field]: formatted,
    }));
  };

  const prepareValueForAPI = (value: string): string => {
    return value === "" ? "0,00" : formatCurrencyForAPI(value);
  };

  const formatCurrencyForAPI = (value: string): string => {
    // Se o valor estiver vazio ou for "0,00", retorna "0,00"
    if (!value || value === "0,00") {
      return "0,00";
    }

    // Remove tudo que não for dígito ou vírgula
    const cleaned = value.replace(/[^\d,]/g, "");

    // Converte para número (substitui vírgula por ponto para o parseFloat)
    const numberValue = parseFloat(cleaned.replace(",", "."));

    // Se for NaN (caso de entrada inválida), retorna "0,00"
    if (isNaN(numberValue)) {
      return "0,00";
    }

    // Formata para o padrão brasileiro (com 2 decimais, vírgula e ponto)
    return numberValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateString: string) => {
    // Remove qualquer caractere não numérico
    const cleaned = dateString.replace(/\D/g, "");

    // Verifica se tem pelo menos 8 dígitos (ddmmyyyy)
    if (cleaned.length >= 8) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
    }

    // Retorna a string original se não puder ser formatada
    return dateString;
  };

  const adicionarRegistroHospedagem = () => {
    const valorNumerico = parseFloat(
      valor.replace(/\./g, "").replace(",", "."),
    ); // Converte para número
    const quartosNumerico = parseFloat(quartos);
    const hospedagemSelecionadaObj = allHostings.find(
      (h) => h.id.toString() === hospedagemSelecionada,
    );

    if (hospedagemSelecionadaObj && quartosNumerico > 0 && valorNumerico > 0) {
      // Mantém a formatação original do input (1.500,34)
      const valorFormatado = valor.includes(",") ? valor : `${valor},00`; // Garante os centavos se não existirem

      setRegistrosHospedagem([
        ...registrosHospedagem,
        {
          hostingId: hospedagemSelecionadaObj.id,
          name: hospedagemSelecionadaObj.name,
          quartos: quartosNumerico,
          valor: valorFormatado, // Usa o valor já formatado do input
        },
      ]);
      setHospedagemSelecionada("");
      setQuartos("");
      setValor("");
    }
  };

  const removerRegistroHospedagem = (index: number) => {
    setRegistrosHospedagem(registrosHospedagem.filter((_, i) => i !== index));
  };

  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^[0-9]*$/.test(value)) {
        setter(value);
      }
    };

  useEffect(() => {
    console.log(typeof valoringresso);
  }, [valoringresso]);

  const adicionarRegistroIngresso = () => {
    const valorNumerico = valoringresso
      ? parseFloat(valoringresso.replace(/\./g, "").replace(",", "."))
      : 0;

    const adultoNumerico = parseFloat(adulto) || 0;
    const criancaNumerico = parseFloat(crianca) || 0;
    const meiaNumerica = parseFloat(meia) || 0;

    console.log("Dados antes de adicionar:", {
      data,
      ingresso,
      adulto: adultoNumerico,
      crianca: criancaNumerico,
      meia: meiaNumerica,
      valor: valorNumerico,
    });

    if (
      data &&
      ingresso &&
      (adultoNumerico > 0 || criancaNumerico > 0 || meiaNumerica > 0) &&
      valorNumerico > 0
    ) {
      const novoIngresso: Ingresso = {
        data,
        ticketId: Number(ingresso),
        adulto: adultoNumerico,
        crianca: criancaNumerico,
        meia: meiaNumerica,
        valoringresso: valoringresso.includes(",")
          ? valoringresso
          : `${valoringresso},00`,
      };

      console.log("Adicionando ingresso:", novoIngresso);

      setRegistrosIngresso([...registrosIngresso, novoIngresso]);
      setData("");
      setIngresso("");
      setAdulto("");
      setCrianca("");
      setMeia("");
      setValoringresso("");
    } else {
      console.log("Falha na validação - dados incompletos");
      alert("Preencha todos os campos obrigatórios do ingresso!");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true); // Ativa o loading

      if (
        !formData.idInTourOperator ||
        !formData.sallerId ||
        !formData.tourOperatorId ||
        !formData.clientId ||
        !formData.paymentMethod ||
        !formData.saleDate ||
        !formData.checkIn ||
        !formData.checkOut ||
        !formData.invoice.issuedInvoice ||
        !formData.invoice.invoiceReceived
      ) {
        toast.error("Preencha todos os campos obrigatórios!");
        setIsSubmitting(false);
        return;
      }

      // Função para formatar a data com barras
      const formatDateWithSlashes = (dateStr: string) => {
        // Se já tiver barras, mantém
        if (dateStr.includes("/")) return dateStr;
        // Se for 8 dígitos, adiciona barras
        if (dateStr.length === 8) {
          return `${dateStr.substring(0, 2)}/${dateStr.substring(2, 4)}/${dateStr.substring(4)}`;
        }
        return dateStr; // Retorna original se não puder formatar
      };

      const requestData = {
        idInTourOperator: Number(formData.idInTourOperator),
        sallerId: Number(formData.sallerId),
        tourOperatorId: Number(formData.tourOperatorId),
        clientId: Number(formData.clientId),
        paymentMethod: formData.paymentMethod as PaymentMethodType,
        saleDate: formatDateWithSlashes(formData.saleDate),
        checkIn: formatDateWithSlashes(formData.checkIn),
        checkOut: formatDateWithSlashes(formData.checkOut),
        sallerCommission: formData.sallerCommission,
        agencyCommission: formData.agencyCommission,
        ticketDiscount: prepareValueForAPI(formData.ticketDiscount),
        hostingDiscount: prepareValueForAPI(formData.hostingDiscount),
        observation: formData.observation,
        cashbackId: formData.cashbackId ? Number(formData.cashbackId) : null,
        companions: acompanhantes
          .filter((a) => a.id > 0) // Filtra apenas os acompanhantes selecionados
          .map((a) => ({ companionId: a.id })),
        hostings: registrosHospedagem.map((h) => ({
          hostingId: h.hostingId, // Já é number, não precisa do Number()
          rooms: h.quartos,
          price: formatCurrencyForAPI(h.valor),
        })),
        tickets: registrosIngresso.map((i) => ({
          ticketId: i.ticketId,
          date: formatDateWithSlashes(i.data),
          adults: i.adulto,
          kids: i.crianca,
          halfPriceTicket: i.meia,
          price: formatCurrencyForAPI(i.valoringresso),
        })),
        invoice: {
          issuedInvoice: formData.invoice.issuedInvoice,
          estimatedIssueDate: formatDateWithSlashes(
            formData.invoice.estimatedIssueDate,
          ),
          invoiceNumber: formData.invoice.invoiceNumber,
          invoiceDate: formatDateWithSlashes(formData.invoice.invoiceDate),
          expectedReceiptDate: formatDateWithSlashes(
            formData.invoice.expectedReceiptDate,
          ),
          invoiceReceived: formData.invoice.invoiceReceived,
          receiptDate: formatDateWithSlashes(formData.invoice.receiptDate),
        },
      };

      // LOG PRINCIPAL - Mostra todos os dados que serão enviados
      console.log(
        "Dados que serão enviados para a API:",
        JSON.stringify(requestData, null, 2),
      );

      // LOG DETALHADO - Para verificar partes específicas
      console.log("Dados de hospedagem:", requestData.hostings);
      console.log("Dados de ingressos:", requestData.tickets);
      console.log("Dados da nota fiscal:", requestData.invoice);

      const response = await fetch("/api/sale/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Erro ao cadastrar venda");
      }

      const result = await response.json();
      onSaleSuccess(result);
      console.log("Venda cadastrada com sucesso:", result);
      toast.success("Venda cadastrada com sucesso!");
      // Fecha o dialog e limpa os campos
      setIsDialogOpen(false);
      limparCampos();
    } catch (error) {
      console.error("Erro:", error);
      toast.error(
        "Erro ao cadastrar venda. Verifique os dados e tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          Cadastrar venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] md:max-w-[900px] lg:max-w-[1100px]">
        <DialogHeader>
          <DialogTitle>Cadastrar venda</DialogTitle>
        </DialogHeader>

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

        <ScrollArea className="h-[400px] space-y-4 overflow-auto">
          {activeTab === "gerais" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Id na Operadora
                </Label>
                <Input
                  id="cliente"
                  className="col-span-3"
                  value={formData.idInTourOperator}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInputChange("idInTourOperator", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vendedor" className="text-right">
                  Vendedor
                </Label>
                <select
                  id="vendedor"
                  value={formData.sallerId}
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) => {
                    const selectedSallerId = e.target.value;
                    handleInputChange("sallerId", selectedSallerId);

                    // Filtra operadoras vinculadas ao vendedor selecionado
                    const selectedSaller = sallers.find(
                      (s) => s.id.toString() === selectedSallerId,
                    );
                    const linkedOperators =
                      selectedSaller?.commissions?.map((c) => c.tourOperator) ||
                      [];

                    setFilteredTourOperators(
                      linkedOperators.length > 0
                        ? linkedOperators
                        : tourOperators,
                    );
                  }}
                  disabled={loadingSallers}
                >
                  <option value="">
                    {loadingSallers ? "Carregando..." : "Selecione"}
                  </option>
                  {sallers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pagamento" className="text-right">
                  Forma de pagamento
                </Label>
                <select
                  id="pagamento"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.paymentMethod}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange(
                      "paymentMethod",
                      e.target.value as PaymentMethodType,
                    )
                  }
                >
                  <option value=""></option>
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="DEBITO">Débito</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="operadora" className="text-right">
                  Operadora
                </Label>
                <select
                  id="operadora"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.tourOperatorId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange("tourOperatorId", e.target.value)
                  }
                  disabled={loadingTourOperators || !formData.sallerId}
                >
                  <option value="">
                    {loadingTourOperators
                      ? "Carregando..."
                      : !formData.sallerId
                        ? "Selecione um vendedor primeiro"
                        : filteredTourOperators.length === 0
                          ? "Nenhuma operadora vinculada"
                          : " "}
                  </option>
                  {filteredTourOperators.map((tourOperator) => (
                    <option key={tourOperator.id} value={tourOperator.id}>
                      {tourOperator.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da Venda</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.saleDate}
                  onAccept={(value) =>
                    handleInputChange("saleDate", value as string)
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-in</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.checkIn}
                  onAccept={(value) =>
                    handleInputChange("checkIn", value as string)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-out</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.checkOut}
                  onAccept={(value) =>
                    handleInputChange("checkOut", value as string)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Cliente
                </Label>
                <select
                  id="cliente"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.clientId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange("clientId", e.target.value)
                  }
                  disabled={loadingClients}
                >
                  <option value="">
                    {loadingClients ? "Carregando..." : " "}
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desconto-ingresso" className="text-right">
                  Desconto do ingresso
                </Label>
                <Input
                  id="desconto-ingresso"
                  value={formData.ticketDiscount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // Permite apenas números e vírgula
                    const value = e.target.value.replace(/[^\d,]/g, "");
                    handleCurrencyChangeInput("ticketDiscount", value);
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desconto-hospedagem" className="text-right">
                  Desconto da hospedagem
                </Label>
                <Input
                  id="desconto-hospedagem"
                  value={formData.hostingDiscount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // Permite apenas números e vírgula
                    const value = e.target.value.replace(/[^\d,]/g, "");
                    handleCurrencyChangeInput("hostingDiscount", value);
                  }}
                  className="col-span-3"
                />
              </div>
              {/* cashback */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cashback-disponivel" className="text-right">
                  Cashback Disponível
                </Label>
                <select
                  id="cashback-disponivel"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.cashbackId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInputChange("cashbackId", e.target.value)
                  }
                  disabled={loadingCashbacks || !formData.clientId}
                >
                  <option value="">
                    {loadingCashbacks
                      ? "Carregando..."
                      : !formData.clientId
                        ? "Selecione um cliente primeiro"
                        : availableCashbacks.length === 0
                          ? "Nenhum cashback disponível"
                          : "Selecione um cashback"}
                  </option>
                  {availableCashbacks.map((cashback) => (
                    <option key={cashback.id} value={cashback.id}>
                      {cashback.cashback?.name || "Nome não disponível"} - R${" "}
                      {cashback.amount?.toFixed(2) || "0.00"}
                      (Válido até{" "}
                      {cashback.expiryDate
                        ? new Date(cashback.expiryDate).toLocaleDateString()
                        : "data não disponível"}
                      )
                    </option>
                  ))}
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
                  value={formData.observation}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("observation", e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Venda cancelada</Label>
                <div className="col-span-3 flex items-center gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="vendaCancelada"
                      value="sim"
                      checked={formData.canceledSale}
                      onChange={() => handleInputChange("canceledSale", true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Sim</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="vendaCancelada"
                      value="nao"
                      checked={!formData.canceledSale}
                      onChange={() => handleInputChange("canceledSale", false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Não</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "acompanhantes" && (
            <div className="space-y-4 p-5">
              {acompanhantes.map((acompanhante, index) => (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label
                    htmlFor={`acompanhante-${index}`}
                    className="text-right"
                  >
                    {index === 0 ? "Acompanhante" : `Acompanhante ${index + 1}`}
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <select
                      id={`acompanhante-${index}`}
                      value={acompanhante.id || ""}
                      onChange={(e) =>
                        atualizarAcompanhante(index, e.target.value)
                      }
                      className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={loadingCompanions}
                    >
                      <option value="">
                        {loadingCompanions
                          ? "Carregando..."
                          : "Selecione um acompanhante"}
                      </option>
                      {getOpcoesDisponiveis(index).map((opcao) => (
                        <option key={opcao.id} value={opcao.id}>
                          {opcao.name}
                        </option>
                      ))}
                    </select>

                    {index < acompanhantes.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => removerAcompanhante(index)}
                        className="rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        -
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={adicionarAcompanhante}
                        disabled={
                          loadingCompanions ||
                          getOpcoesDisponiveis(index).length === 0
                        }
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

          {activeTab === "hospedagem" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hospedagem" className="text-right">
                  Hospedagem
                </Label>
                <select
                  id="hospedagem"
                  value={hospedagemSelecionada}
                  onChange={(e) => setHospedagemSelecionada(e.target.value)}
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loadingHostings}
                >
                  <option value="">
                    {loadingHostings
                      ? "Carregando..."
                      : "Selecione uma hospedagem"}
                  </option>
                  {allHostings.map((hospedagem) => (
                    <option key={hospedagem.id} value={hospedagem.id}>
                      {hospedagem.name}
                    </option>
                  ))}
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
                  onChange={handleNumberChange(setQuartos)}
                  className="col-span-3"
                  min="1"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="valor" className="text-right">
                  Valor
                </Label>
                <Input
                  id="valor"
                  value={valor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = formatCurrencyForInput(digits);
                    setValor(formatted);
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (!e.target.value.includes(",")) {
                      const formatted = formatCurrencyForInput(
                        e.target.value + "00",
                      );
                      setValor(formatted);
                    }
                  }}
                  className="col-span-3"
                  min="0"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={adicionarRegistroHospedagem}
                  disabled={!hospedagemSelecionada || !quartos || !valor}
                  className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {registrosHospedagem.map((registro, index) => (
                  <div key={index} className="relative rounded-md border p-4">
                    <button
                      onClick={() => removerRegistroHospedagem(index)}
                      className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                    <p>
                      <strong>Hospedagem:</strong> {registro.name}
                    </p>
                    <p>
                      <strong>Quartos:</strong> {registro.quartos}
                    </p>
                    <p>
                      <strong>Valor:</strong> R$ {registro.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "ingresso" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={data} // Alterado de formData.saleDate para data
                  onAccept={(value) => setData(value as string)} // Alterado para setData
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ingresso" className="text-right">
                  Ingresso
                </Label>
                <select
                  id="ingresso"
                  value={ingresso}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setIngresso(e.target.value)
                  }
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={loadingTickets}
                >
                  <option value="">
                    {loadingTickets ? "Carregando..." : "Selecione um ingresso"}
                  </option>
                  {allTickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.name}
                    </option>
                  ))}
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
                  value={valoringresso}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = formatCurrencyForInput(digits);
                    setValoringresso(formatted);
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (!e.target.value.includes(",")) {
                      const formatted = formatCurrencyForInput(
                        e.target.value + "00",
                      );
                      setValoringresso(formatted);
                    }
                  }}
                  className="col-span-3"
                  min="0"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={adicionarRegistroIngresso}
                  className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {registrosIngresso.map((registro, index) => {
                  const ticket = allTickets.find(
                    (t) => t.id === registro.ticketId,
                  );
                  return (
                    <div key={index} className="rounded-md border p-4">
                      <p>
                        <strong>Data:</strong> {formatDate(registro.data)}
                      </p>
                      <p>
                        <strong>Ingresso:</strong>{" "}
                        {ticket?.name || "Ingresso não encontrado"}
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
                        <strong>Valor:</strong> R$ {registro.valoringresso}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "nt-fiscal" && (
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nt-fiscal-emitida" className="text-right">
                  NF emitida?
                </Label>
                <select
                  id="nt-fiscal-emitida"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.invoice.issuedInvoice}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInvoiceChange("issuedInvoice", e.target.value)
                  }
                >
                  <option value=""></option>
                  <option value="EMITIDA">Sim</option>
                  <option value="NAO_EMITIDA">Não</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data prevista para emissão</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.invoice.estimatedIssueDate}
                  onAccept={(value) =>
                    handleInvoiceChange("estimatedIssueDate", value as string)
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numero-nf" className="text-right">
                  Número da NF:
                </Label>
                <Input
                  id="numero-nf"
                  className="col-span-3"
                  value={formData.invoice.invoiceNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleInvoiceChange("invoiceNumber", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da NF</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.invoice.invoiceDate}
                  onAccept={(value) =>
                    handleInvoiceChange("invoiceDate", value as string)
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="w-[240px] text-right">
                  Data prevista para o recebimento
                </Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.invoice.expectedReceiptDate}
                  onAccept={(value) =>
                    handleInvoiceChange("expectedReceiptDate", value as string)
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nt-fiscal-recebida" className="text-right">
                  NF Recebida?
                </Label>
                <select
                  id="nt-fiscal-recebida"
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.invoice.invoiceReceived}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleInvoiceChange("invoiceReceived", e.target.value)
                  }
                >
                  <option value=""></option>
                  <option value="RECEBIDA">Sim</option>
                  <option value="NAO_RECEBIDA">Não</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data de recebimento</Label>
                <IMaskInput
                  mask="00/00/0000"
                  overwrite
                  className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.invoice.receiptDate}
                  onAccept={(value) =>
                    handleInvoiceChange("receiptDate", value as string)
                  }
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => {
              setIsDialogOpen(false);
              limparCampos();
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar venda"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
