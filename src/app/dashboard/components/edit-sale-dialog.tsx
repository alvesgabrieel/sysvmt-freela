"use client";

import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import { formatCurrency } from "@/app/functions/frontend/format-backend-currency-to-frontend";
import { formatBackendDateToFrontend } from "@/app/functions/frontend/format-backend-date-to-frontend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sale } from "@/types/sale";

interface EditSaleDialogProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export default function EditSaleDialog({
  open,
  onClose,
  sale,
}: EditSaleDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("gerais"); // Adicione este estado
  const [editedSale, setEditedSale] = useState<Partial<Sale>>({});
  // Estado para o formulário de nova hospedagem
  const [newHosting, setNewHosting] = useState({
    hostingId: 0,
    rooms: 0,
    price: "",
  });

  const [newTicket, setNewTicket] = useState({
    date: "",
    ticketId: 0,
    adults: 0,
    kids: 0,
    halfPriceTicket: 0,
    price: "",
  });

  const [sallers, setSallers] = useState<
    Array<{
      id: number;
      name: string;
    }>
  >([]);

  const [tourOperator, setTourOperator] = useState<
    Array<{
      id: number;
      name: string;
    }>
  >([]);

  const [client, setClient] = useState<
    Array<{
      id: number;
      name: string;
    }>
  >([]);

  const [cashback, setCashback] = useState<
    Array<{
      id: number;
      name: string;
    }>
  >([]);

  const [availableCompanions, setAvailableCompanions] = useState<
    Array<{
      id: number;
      name: string;
    }>
  >([]);

  const [availableHostings, setAvailableHostings] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
    }>
  >([]);

  const [availableTickets, setAvailableTickets] = useState<
    Array<{
      id: number;
      name: string;
      price: number;
    }>
  >([]);

  useEffect(() => {
    if (sale) {
      console.log("Dados da venda recebidos:", sale);
      setEditedSale({
        ...sale,
        cashbackId: sale.saleCashback?.cashback?.id || undefined,
        saleDate: ensureDateFormat(sale.saleDate),
        checkIn: ensureDateFormat(sale.checkIn),
        checkOut: ensureDateFormat(sale.checkOut),
        companions: sale.companions || [],
        saleTicket: sale.saleTicket?.map((ticket) => ({
          ...ticket,
          date: ensureDateFormat(ticket.date),
        })),
        invoice: sale.invoice
          ? {
              ...sale.invoice,
              estimatedIssueDate: ensureDateFormat(
                sale.invoice.estimatedIssueDate,
              ),
              invoiceDate: ensureDateFormat(sale.invoice.invoiceDate),
              expectedReceiptDate: ensureDateFormat(
                sale.invoice.expectedReceiptDate,
              ),
              receiptDate: ensureDateFormat(sale.invoice.receiptDate),
            }
          : undefined,
      });
    }
  }, [sale]);

  const ensureDateFormat = (date: string | Date | null | undefined): string => {
    if (!date || date === "") return ""; // Permite string vazia

    // Se já está no formato DD/MM/AAAA, retorna como está
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }

    // Se for objeto Date ou ISO string, formata para DD/MM/AAAA
    const formattedDate = typeof date === "string" ? date : date.toISOString();
    return formatBackendDateToFrontend(formattedDate);
  };
  //busca vendedores
  useEffect(() => {
    const fetchSallers = async () => {
      try {
        const response = await fetch("/api/saller/list");
        const data = await response.json();
        setSallers(data);
      } catch (error) {
        console.error("Erro ao buscar vendedores:", error);
      }
    };

    fetchSallers();
  }, []);

  //busca operadoras
  useEffect(() => {
    const fetchTourOperator = async () => {
      try {
        const response = await fetch("/api/touroperator/list");
        const data = await response.json();
        setTourOperator(data);
      } catch (error) {
        console.error("Erro ao buscar vendedores:", error);
      }
    };

    fetchTourOperator();
  }, []);

  //busca cliente
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch("/api/client/list");
        const data = await response.json();
        setClient(data);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      }
    };

    fetchClient();
  }, []);

  //busca cashback
  useEffect(() => {
    const fetchCashback = async () => {
      try {
        const response = await fetch("/api/cashback/list");
        const data = await response.json();
        setCashback(data);
      } catch (error) {
        console.error("Erro ao buscar Cashback:", error);
      }
    };

    fetchCashback();
  }, []);

  // Busca acompanhantes
  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const response = await fetch("/api/companion/list");
        const data = await response.json();
        setAvailableCompanions(data);
      } catch (error) {
        console.error("Erro ao buscar acompanhantes:", error);
      }
    };

    fetchCompanions();
  }, []);

  // Busca hospedagens
  useEffect(() => {
    const fetchHostings = async () => {
      try {
        const response = await fetch("/api/hosting/list");
        const data = await response.json();
        setAvailableHostings(data);
      } catch (error) {
        console.error("Erro ao buscar hospedagens:", error);
      }
    };

    fetchHostings();
  }, []);

  // Busca ingressos
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/ticket/list");
        const data = await response.json();
        setAvailableTickets(data);
      } catch (error) {
        console.error("Erro ao buscar ingressos:", error);
      }
    };

    fetchTickets();
  }, []);

  // Função para adicionar hospedagem
  const handleAddHosting = () => {
    if (!newHosting.hostingId || !newHosting.rooms || !newHosting.price) {
      toast.error("Preencha todos os campos");
      return;
    }

    const priceNumber = parseFloat(newHosting.price.replace(",", "."));

    setEditedSale({
      ...editedSale,
      saleHosting: [
        ...(editedSale.saleHosting || []),
        {
          hostingId: newHosting.hostingId,
          rooms: newHosting.rooms,
          price: priceNumber,
          id: Date.now(), // ID temporário
        },
      ],
    });

    // Reset form
    setNewHosting({
      hostingId: 0,
      rooms: 1,
      price: "",
    });
  };

  // Função para remover hospedagem
  const handleRemoveHosting = (index: number) => {
    const newHostings = [...(editedSale.saleHosting || [])];
    newHostings.splice(index, 1);
    setEditedSale({
      ...editedSale,
      saleHosting: newHostings,
    });
  };

  // Função para adicionar ingresso
  const handleAddTicket = () => {
    if (!newTicket.date || !newTicket.ticketId || !newTicket.price) {
      toast.error("Preencha data, ingresso e valor");
      return;
    }

    const priceNumber = parseFloat(newTicket.price.replace(",", "."));

    setEditedSale({
      ...editedSale,
      saleTicket: [
        ...(editedSale.saleTicket || []),
        {
          ticketId: newTicket.ticketId,
          date: newTicket.date,
          adults: newTicket.adults,
          kids: newTicket.kids,
          halfPriceTicket: newTicket.halfPriceTicket,
          price: priceNumber,
          id: Date.now(), // ID temporário
        },
      ],
    });

    // Reset form
    setNewTicket({
      date: "",
      ticketId: 0,
      adults: 0,
      kids: 0,
      halfPriceTicket: 0,
      price: "",
    });
  };

  // Função para remover ingresso
  const handleRemoveTicket = (index: number) => {
    const newTickets = [...(editedSale.saleTicket || [])];
    newTickets.splice(index, 1);
    setEditedSale({
      ...editedSale,
      saleTicket: newTickets,
    });
  };

  const handleUpdateSale = async () => {
    setIsLoading(true);
    try {
      if (!editedSale.id) {
        toast.error("Nenhuma venda selecionada para edição");
        return;
      }

      // Prepara os dados no formato que a API espera
      const updateData = {
        id: editedSale.id,
        idInTourOperator: editedSale.idInTourOperator,
        sallerId: editedSale.sallerId,
        tourOperatorId: editedSale.tourOperatorId,
        clientId: editedSale.clientId,
        paymentMethod: editedSale.paymentMethod,
        // Envia as datas exatamente como estão (strings no formato DD/MM/AAAA)
        saleDate: editedSale.saleDate,
        checkIn: editedSale.checkIn,
        checkOut: editedSale.checkOut,
        ticketDiscount:
          editedSale.ticketDiscount?.toString().replace(".", ",") || "0,00",
        hostingDiscount:
          editedSale.hostingDiscount?.toString().replace(".", ",") || "0,00",
        observation: editedSale.observation,
        cashbackId: editedSale.cashbackId,
        canceledSale: editedSale.canceledSale || false,
        companions:
          editedSale.companions?.map((c) => ({
            companionId: c.companionId,
          })) || [],
        hostings:
          editedSale.saleHosting?.map((h) => ({
            hostingId: h.hostingId,
            rooms: h.rooms,
            price: h.price.toString().replace(".", ","),
          })) || [],
        tickets:
          editedSale.saleTicket?.map((t) => ({
            ticketId: t.ticketId,
            // Envia a data do ingresso exatamente como está
            date: t.date,
            adults: t.adults,
            kids: t.kids,
            halfPriceTicket: t.halfPriceTicket,
            price: t.price.toString().replace(".", ","),
          })) || [],
        invoice: {
          issuedInvoice: editedSale.invoice?.issuedInvoice || "PENDENTE",
          // Envia as datas da nota fiscal exatamente como estão
          estimatedIssueDate: editedSale.invoice?.estimatedIssueDate,
          invoiceNumber: editedSale.invoice?.invoiceNumber,
          invoiceDate: editedSale.invoice?.invoiceDate,
          expectedReceiptDate: editedSale.invoice?.expectedReceiptDate,
          invoiceReceived: editedSale.invoice?.invoiceReceived || "PENDENTE",
          receiptDate: editedSale.invoice?.receiptDate,
        },
      };

      // LOG PARA VERIFICAR O QUE ESTÁ SENDO ENVIADO (FRONTEND)
      console.log(
        "🔄 Dados enviados para o backend:",
        JSON.stringify(updateData, null, 2),
      );

      // Envia para a API
      const response = await fetch("/api/sale/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Falha ao atualizar venda");
      }

      toast.success("Venda atualizada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar venda:", error);
      toast.error("Erro ao atualizar venda");
    } finally {
      setIsLoading(false);
    }
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[700px] md:max-w-[900px] lg:max-w-[1100px]"
        onInteractOutside={onClose}
      >
        <DialogHeader>
          <DialogTitle>Editar Venda</DialogTitle>
        </DialogHeader>

        <div className="mb-6 mt-4 flex space-x-4">
          {[
            "gerais",
            "acompanhantes",
            "hospedagem",
            "ingresso",
            "nt-fiscal",
          ].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 ${
                activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
              } rounded`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "gerais" && "Gerais"}
              {tab === "acompanhantes" && "Acompanhantes"}
              {tab === "hospedagem" && "Hospedagens"}
              {tab === "ingresso" && "Ingressos"}
              {tab === "nt-fiscal" && "Nota Fiscal"}
            </button>
          ))}
        </div>

        <ScrollArea className="h-[400px] overflow-auto">
          {activeTab === "gerais" && (
            <div className="space-y-4 p-5">
              {/* ID na operadora */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">ID na Operadora</Label>
                <Input
                  className="col-span-3"
                  value={editedSale.idInTourOperator || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      idInTourOperator: e.target.value,
                    })
                  }
                />
              </div>

              {/* vendedor     */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Vendedor</Label>
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.sallerId || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      sallerId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {sallers.map((seller) => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* forma de pagamento     */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Forma de Pagamento</Label>
                <select className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Pix</option>
                  <option>Dinheiro</option>
                  <option>Débito</option>
                  <option>Crédito</option>
                </select>
              </div>

              {/* operadora     */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Operadora</Label>
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.tourOperatorId || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      tourOperatorId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {tourOperator.map((tourOperator) => (
                    <option key={tourOperator.id} value={tourOperator.id}>
                      {tourOperator.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* data da venda     */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da Venda</Label>
                <IMaskInput
                  mask="00/00/0000"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={
                    editedSale.saleDate === ""
                      ? ""
                      : typeof editedSale.saleDate === "string" &&
                          editedSale.saleDate.includes("/")
                        ? editedSale.saleDate
                        : formatBackendDateToFrontend(editedSale.saleDate || "")
                  }
                  onAccept={(value, mask) => {
                    // Permite campo vazio
                    if (value === "" || mask.unmaskedValue === "") {
                      setEditedSale({ ...editedSale, saleDate: "" });
                    } else {
                      setEditedSale({ ...editedSale, saleDate: value });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && editedSale.saleDate === "") {
                      e.preventDefault(); // Evita comportamento padrão quando já está vazio
                    }
                  }}
                />
              </div>

              {/* checkin         */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-in</Label>
                <IMaskInput
                  mask="00/00/0000"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={
                    typeof editedSale.checkIn === "string" &&
                    editedSale.checkIn.includes("/")
                      ? editedSale.checkIn
                      : formatBackendDateToFrontend(editedSale.checkIn || "")
                  }
                  onAccept={(value) =>
                    setEditedSale({ ...editedSale, checkIn: value })
                  }
                />
              </div>

              {/* CHECKOUT */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-out</Label>
                <IMaskInput
                  mask="00/00/0000"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={
                    typeof editedSale.checkOut === "string" &&
                    editedSale.checkOut.includes("/")
                      ? editedSale.checkOut
                      : formatBackendDateToFrontend(editedSale.checkOut || "")
                  }
                  onAccept={(value) =>
                    setEditedSale({ ...editedSale, checkOut: value })
                  }
                />
              </div>

              {/* CLIENTE */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cliente</Label>
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.clientId || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      clientId: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {client.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* desconto ingressos */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Desconto Ingressos</Label>
                <Input
                  className="col-span-3"
                  value={editedSale.ticketDiscount || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      ticketDiscount: e.target.value,
                    })
                  }
                />
              </div>

              {/* desconto hospedagem */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Desconto Hospedagem</Label>
                <Input
                  className="col-span-3"
                  value={editedSale.hostingDiscount || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      hostingDiscount: e.target.value,
                    })
                  }
                />
              </div>

              {/* CASHBACK */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cashback</Label>
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.cashbackId || ""} // Garanta que está usando o valor correto
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      cashbackId: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                >
                  <option value="">Selecione</option>
                  {cashback.map((cashback) => (
                    <option key={cashback.id} value={cashback.id}>
                      {cashback.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* OBSERVACAO */}
              <div className="grid grid-cols-4 gap-4">
                <Label className="self-start pt-2 text-right">Observação</Label>
                <textarea
                  className="col-span-3 rounded-md border p-2"
                  rows={4}
                  value={editedSale.observation}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      observation: e.target.value,
                    })
                  }
                />
              </div>

              {/* Venda Cancelada */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Venda Cancelada</Label>
                <div className="col-span-3 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="canceledSale"
                      checked={editedSale.canceledSale === true}
                      onChange={() =>
                        setEditedSale({
                          ...editedSale,
                          canceledSale: true,
                        })
                      }
                    />
                    Sim
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="canceledSale"
                      checked={editedSale.canceledSale === false}
                      onChange={() =>
                        setEditedSale({
                          ...editedSale,
                          canceledSale: false,
                        })
                      }
                    />
                    Não
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "acompanhantes" && (
            <div className="space-y-4 p-5">
              {editedSale.companions?.map((relation, index) => (
                <div
                  key={relation.id}
                  className="grid grid-cols-4 items-center gap-4"
                >
                  <Label className="text-right">
                    {index === 0 ? "Acompanhante" : `Acompanhante ${index + 1}`}
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <select
                      value={relation.companionId}
                      onChange={(e) => {
                        const newCompanions = [
                          ...(editedSale.companions || []),
                        ];
                        newCompanions[index].companionId = Number(
                          e.target.value,
                        );
                        setEditedSale({
                          ...editedSale,
                          companions: newCompanions,
                        });
                      }}
                      className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecione um acompanhante</option>
                      {availableCompanions.map((companion) => (
                        <option key={companion.id} value={companion.id}>
                          {companion.name}
                        </option>
                      ))}
                    </select>

                    {index === (editedSale.companions?.length || 0) - 1 ? (
                      <button
                        onClick={() => {
                          setEditedSale({
                            ...editedSale,
                            companions: [
                              ...(editedSale.companions || []),
                              { id: Date.now(), companionId: 0 },
                            ],
                          });
                        }}
                        className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        +
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newCompanions = [
                            ...(editedSale.companions || []),
                          ];
                          newCompanions.splice(index, 1);
                          setEditedSale({
                            ...editedSale,
                            companions: newCompanions,
                          });
                        }}
                        className="rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        -
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "hospedagem" && (
            <div className="space-y-4 p-5">
              {/* Formulário para nova hospedagem */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Hospedagem</Label>
                <select
                  value={newHosting.hostingId || ""}
                  onChange={(e) =>
                    setNewHosting({
                      ...newHosting,
                      hostingId: Number(e.target.value),
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione</option>
                  {availableHostings.map((hosting) => (
                    <option key={hosting.id} value={hosting.id}>
                      {hosting.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Quartos</Label>
                <Input
                  type="number"
                  className="col-span-3"
                  min="1"
                  value={newHosting.rooms === 0 ? "" : newHosting.rooms}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewHosting({
                      ...newHosting,
                      rooms: value === "" ? 0 : parseInt(value) || 0,
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Valor</Label>
                <Input
                  value={newHosting.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = formatCurrencyForInput(digits);
                    setNewHosting({
                      ...newHosting,
                      price: formatted,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (!e.target.value.includes(",")) {
                      const formatted = formatCurrencyForInput(
                        e.target.value + "00",
                      );
                      setNewHosting({
                        ...newHosting,
                        price: formatted,
                      });
                    }
                  }}
                  className="col-span-3"
                  min="0"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAddHosting}
                  className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>

              {/* Lista de hospedagens existentes */}
              <div className="space-y-2">
                {editedSale.saleHosting?.map((hosting, index) => {
                  const hostingInfo = availableHostings.find(
                    (h) => h.id === hosting.hostingId,
                  );
                  return (
                    <div
                      key={hosting.id}
                      className="relative rounded-md border p-4"
                    >
                      <button
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveHosting(index)}
                      >
                        ×
                      </button>
                      <p>
                        <strong>Hospedagem:</strong>{" "}
                        {hostingInfo?.name || "Não encontrada"}
                      </p>
                      <p>
                        <strong>Quartos:</strong> {hosting.rooms}
                      </p>
                      <p>
                        <strong>Valor:</strong> {formatCurrency(hosting.price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "ingresso" && (
            <div className="space-y-4 p-5">
              {/* Formulário para novo ingresso */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data</Label>
                <IMaskInput
                  mask="00/00/0000"
                  value={newTicket.date}
                  onAccept={(value) =>
                    setNewTicket({ ...newTicket, date: value })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Ingresso</Label>
                <select
                  value={newTicket.ticketId}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      ticketId: Number(e.target.value),
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="0">Selecione</option>
                  {availableTickets.map((ticket) => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Adulto</Label>
                <Input
                  type="number"
                  className="col-span-3"
                  min="0"
                  value={newTicket.adults === 0 ? "" : newTicket.adults}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTicket({
                      ...newTicket,
                      adults: value === "" ? 0 : parseInt(value) || 0,
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Criança</Label>
                <Input
                  type="number"
                  className="col-span-3"
                  min="0"
                  value={newTicket.kids === 0 ? "" : newTicket.kids}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTicket({
                      ...newTicket,
                      kids: value === "" ? 0 : parseInt(value) || 0,
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Meia</Label>
                <Input
                  type="number"
                  className="col-span-3"
                  min="0"
                  value={
                    newTicket.halfPriceTicket === 0
                      ? ""
                      : newTicket.halfPriceTicket
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTicket({
                      ...newTicket,
                      halfPriceTicket: value === "" ? 0 : parseInt(value) || 0,
                    });
                  }}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Valor</Label>
                <Input
                  value={newTicket.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = formatCurrencyForInput(digits);
                    setNewTicket({
                      ...newTicket,
                      price: formatted,
                    });
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    if (!e.target.value.includes(",")) {
                      const formatted = formatCurrencyForInput(
                        e.target.value + "00",
                      );
                      setNewTicket({
                        ...newTicket,
                        price: formatted,
                      });
                    }
                  }}
                  className="col-span-3"
                  min="0"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleAddTicket}
                  className="rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
                >
                  Adicionar
                </button>
              </div>

              {/* Lista de ingressos existentes */}
              <div className="space-y-2">
                {editedSale.saleTicket?.map((ticket, index) => {
                  const ticketInfo = availableTickets.find(
                    (t) => t.id === ticket.ticketId,
                  );
                  return (
                    <div
                      key={ticket.id}
                      className="relative rounded-md border p-4"
                    >
                      <button
                        className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveTicket(index)}
                      >
                        ×
                      </button>
                      <p>
                        <strong>Data:</strong>{" "}
                        {formatBackendDateToFrontend(ticket.date)}
                      </p>
                      <p>
                        <strong>Ingresso:</strong>{" "}
                        {ticketInfo?.name || "Não encontrado"}
                      </p>
                      <p>
                        <strong>Adulto:</strong> {ticket.adults}
                      </p>
                      <p>
                        <strong>Criança:</strong> {ticket.kids}
                      </p>
                      <p>
                        <strong>Meia:</strong> {ticket.halfPriceTicket}
                      </p>
                      <p>
                        <strong>Valor:</strong> {formatCurrency(ticket.price)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "nt-fiscal" && (
            <div className="space-y-4 p-5">
              {/* NF emitida? */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">NF emitida?</Label>
                <select
                  value={editedSale.invoice?.issuedInvoice || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        issuedInvoice: e.target.value,
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione</option>
                  <option value="SIM">Sim</option>
                  <option value="NAO">Não</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              {/* Data prevista para emissão */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data prevista para emissão</Label>
                <IMaskInput
                  mask="00/00/0000"
                  value={editedSale.invoice?.estimatedIssueDate || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        estimatedIssueDate: value,
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Número da NF */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Número da NF</Label>
                <Input
                  value={editedSale.invoice?.invoiceNumber || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        invoiceNumber: e.target.value,
                      },
                    })
                  }
                  className="col-span-3"
                />
              </div>

              {/* Data da NF */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da NF</Label>
                <IMaskInput
                  mask="00/00/0000"
                  value={editedSale.invoice?.invoiceDate || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        invoiceDate: value,
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Data prevista para o recebimento */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="w-[240px] text-right">
                  Data prevista para o recebimento
                </Label>
                <IMaskInput
                  mask="00/00/0000"
                  value={editedSale.invoice?.expectedReceiptDate || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        expectedReceiptDate: value,
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* NF Recebida? */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">NF Recebida?</Label>
                <select
                  value={editedSale.invoice?.invoiceReceived || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        invoiceReceived: e.target.value,
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione</option>
                  <option value="SIM">Sim</option>
                  <option value="NAO">Não</option>
                  <option value="PENDENTE">Pendente</option>
                </select>
              </div>

              {/* Data de recebimento */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data de recebimento</Label>
                <IMaskInput
                  mask="00/00/0000"
                  value={editedSale.invoice?.receiptDate || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      invoice: {
                        ...editedSale.invoice,
                        receiptDate: value,
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="outline"
            onClick={handleUpdateSale}
            disabled={!editedSale.id || isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
