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

type PaymentMethodType = "PIX" | "DINHEIRO" | "DEBITO" | "CREDITO";

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
  const [activeTab, setActiveTab] = useState("gerais");
  const [editedSale, setEditedSale] = useState<Partial<Sale>>({});
  const [newHosting, setNewHosting] = useState({
    hostingId: 0,
    rooms: 1,
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
  const [sallers, setSallers] = useState<Array<{ id: number; name: string }>>(
    [],
  );
  const [tourOperators, setTourOperators] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>(
    [],
  );
  const [availableCompanions, setAvailableCompanions] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [availableHostings, setAvailableHostings] = useState<
    Array<{ id: number; name: string; price: number }>
  >([]);
  const [availableTickets, setAvailableTickets] = useState<
    Array<{ id: number; name: string; price: number }>
  >([]);

  // Formata a data para o formato DD/MM/AAAA garantindo as barras
  const formatDateWithSlashes = (dateString: string): string => {
    const digitsOnly = dateString.replace(/\D/g, "");
    if (!digitsOnly) return "";
    if (digitsOnly.length <= 2) return digitsOnly;
    if (digitsOnly.length <= 4)
      return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
  };

  // Garante que a data esteja no formato correto
  const ensureDateFormat = (date: string | Date | null | undefined): string => {
    if (!date || date === "") return "";

    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return date;
    }

    const formattedDate = typeof date === "string" ? date : date.toISOString();
    return formatBackendDateToFrontend(formattedDate);
  };

  // Formata valores monetários para o input
  const formatCurrencyForInput = (value: string): string => {
    let digits = value.replace(/\D/g, "");
    digits = digits.padStart(3, "0");
    let formatted = digits.replace(/(\d{2})$/, ",$1");
    formatted = formatted.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    if (formatted.startsWith("0") && formatted.length > 4) {
      formatted = formatted.replace(/^0+/, "");
    }
    return formatted;
  };

  // Inicializa os dados da venda
  useEffect(() => {
    if (sale) {
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

  // Busca dados necessários
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          sallersRes,
          tourOperatorsRes,
          clientsRes,
          companionsRes,
          hostingsRes,
          ticketsRes,
        ] = await Promise.all([
          fetch("/api/saller/list").then((res) => res.json()),
          fetch("/api/touroperator/list").then((res) => res.json()),
          fetch("/api/client/list").then((res) => res.json()),
          fetch("/api/companion/list").then((res) => res.json()),
          fetch("/api/hosting/list").then((res) => res.json()),
          fetch("/api/ticket/list").then((res) => res.json()),
        ]);

        setSallers(sallersRes);
        setTourOperators(tourOperatorsRes);
        setClients(clientsRes);
        setAvailableCompanions(companionsRes);
        setAvailableHostings(hostingsRes);
        setAvailableTickets(ticketsRes);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Erro ao carregar dados");
      }
    };

    fetchData();
  }, []);

  // Manipulação de hospedagens
  const handleAddHosting = () => {
    if (!newHosting.hostingId || !newHosting.rooms || !newHosting.price) {
      toast.error("Preencha todos os campos");
      return;
    }

    const priceNumber = parseFloat(newHosting.price.replace(",", "."));

    setEditedSale((prev) => ({
      ...prev,
      saleHosting: [
        ...(prev.saleHosting || []),
        {
          hostingId: newHosting.hostingId,
          rooms: newHosting.rooms,
          price: priceNumber,
          id: Date.now(),
        },
      ],
    }));

    setNewHosting({
      hostingId: 0,
      rooms: 1,
      price: "",
    });
  };

  const handleRemoveHosting = (index: number) => {
    setEditedSale((prev) => ({
      ...prev,
      saleHosting: (prev.saleHosting || []).filter((_, i) => i !== index),
    }));
  };

  // Manipulação de ingressos
  const handleAddTicket = () => {
    if (!newTicket.date || !newTicket.ticketId || !newTicket.price) {
      toast.error("Preencha data, ingresso e valor");
      return;
    }

    const priceNumber = parseFloat(newTicket.price.replace(",", "."));

    setEditedSale((prev) => ({
      ...prev,
      saleTicket: [
        ...(prev.saleTicket || []),
        {
          ticketId: newTicket.ticketId,
          date: formatDateWithSlashes(newTicket.date),
          adults: newTicket.adults,
          kids: newTicket.kids,
          halfPriceTicket: newTicket.halfPriceTicket,
          price: priceNumber,
          id: Date.now(),
        },
      ],
    }));

    setNewTicket({
      date: "",
      ticketId: 0,
      adults: 0,
      kids: 0,
      halfPriceTicket: 0,
      price: "",
    });
  };

  const handleRemoveTicket = (index: number) => {
    setEditedSale((prev) => ({
      ...prev,
      saleTicket: (prev.saleTicket || []).filter((_, i) => i !== index),
    }));
  };

  // Atualização da venda
  const handleUpdateSale = async () => {
    setIsLoading(true);
    try {
      if (!editedSale.id) {
        toast.error("Nenhuma venda selecionada para edição");
        return;
      }

      const prepareDateForBackend = (date: string | undefined): string => {
        if (!date) return "";
        return date.includes("/") ? date : formatDateWithSlashes(date);
      };

      const updateData = {
        id: editedSale.id,
        idInTourOperator: Number(editedSale.idInTourOperator),
        sallerId: editedSale.sallerId,
        tourOperatorId: editedSale.tourOperatorId,
        clientId: editedSale.clientId,
        paymentMethod: editedSale.paymentMethod,
        saleDate: prepareDateForBackend(editedSale.saleDate),
        checkIn: prepareDateForBackend(editedSale.checkIn),
        checkOut: prepareDateForBackend(editedSale.checkOut),
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
            date: prepareDateForBackend(t.date),
            adults: t.adults,
            kids: t.kids,
            halfPriceTicket: t.halfPriceTicket,
            price: t.price.toString().replace(".", ","),
          })) || [],
        invoice: {
          issuedInvoice: editedSale.invoice?.issuedInvoice || "PENDENTE",
          estimatedIssueDate: prepareDateForBackend(
            editedSale.invoice?.estimatedIssueDate,
          ),
          invoiceNumber: editedSale.invoice?.invoiceNumber,
          invoiceDate: prepareDateForBackend(editedSale.invoice?.invoiceDate),
          expectedReceiptDate: prepareDateForBackend(
            editedSale.invoice?.expectedReceiptDate,
          ),
          invoiceReceived: editedSale.invoice?.invoiceReceived || "PENDENTE",
          receiptDate: prepareDateForBackend(editedSale.invoice?.receiptDate),
        },
      };

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
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar venda",
      );
    } finally {
      setIsLoading(false);
    }
  };

  //função para o resumo da venda
  const getResumoVenda = () => {
    // Formata valores monetários
    const formatCurrencyDisplay = (
      value: number | string | undefined,
    ): string => {
      if (!value) return "R$ 0,00";
      if (typeof value === "string") {
        return value.includes("R$") ? value : `R$ ${value}`;
      }
      return `R$ ${value.toFixed(2).replace(".", ",")}`;
    };

    // Encontra nomes pelos IDs
    const getNomePorId = (
      id: number | undefined,
      lista: Array<{ id: number; name: string }>,
    ): string => {
      if (!id) return "Não selecionado";
      const item = lista.find((item) => item.id === id);
      return item ? item.name : "Não encontrado";
    };

    return {
      gerais: {
        "ID na Operadora": editedSale.idInTourOperator || "Não informado",
        Vendedor: getNomePorId(editedSale.sallerId, sallers),
        Operadora: getNomePorId(editedSale.tourOperatorId, tourOperators),
        Cliente: getNomePorId(editedSale.clientId, clients),
        "Forma de Pagamento": editedSale.paymentMethod || "Não informado",
        "Data da Venda": editedSale.saleDate || "Não informado",
        "Check-in": editedSale.checkIn || "Não informado",
        "Check-out": editedSale.checkOut || "Não informado",
        "Desconto Ingresso": formatCurrencyDisplay(editedSale.ticketDiscount),
        "Desconto Hospedagem": formatCurrencyDisplay(
          editedSale.hostingDiscount,
        ),
        Observações: editedSale.observation || "Nenhuma",
        "Venda Cancelada": editedSale.canceledSale ? "Sim" : "Não",
      },
      acompanhantes:
        editedSale.companions?.map((c) =>
          getNomePorId(c.companionId, availableCompanions),
        ) || [],
      hospedagens:
        editedSale.saleHosting?.map((h) => {
          const hosting = availableHostings.find((ah) => ah.id === h.hostingId);
          return {
            Hospedagem: hosting?.name || "Não encontrada",
            Quartos: h.rooms,
            Valor: formatCurrencyDisplay(h.price),
          };
        }) || [],
      ingressos:
        editedSale.saleTicket?.map((t) => {
          const ticket = availableTickets.find((at) => at.id === t.ticketId);
          return {
            Data: t.date,
            Ingresso: ticket?.name || "Não encontrado",
            Adultos: t.adults,
            Crianças: t.kids,
            Meias: t.halfPriceTicket,
            Valor: formatCurrencyDisplay(t.price),
          };
        }) || [],
      notaFiscal: {
        "NF Emitida?": editedSale.invoice?.issuedInvoice || "Não informado",
        "Data Prevista Emissão":
          editedSale.invoice?.estimatedIssueDate || "Não informado",
        "Número NF": editedSale.invoice?.invoiceNumber || "Não informado",
        "Data NF": editedSale.invoice?.invoiceDate || "Não informado",
        "NF Recebida?": editedSale.invoice?.invoiceReceived || "Não informado",
        "Data Recebimento": editedSale.invoice?.receiptDate || "Não informado",
      },
    };
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
            "resumo",
          ].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 ${
                activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200"
              } rounded`}
              onClick={() => setActiveTab(tab)}
            >
              {
                {
                  gerais: "Gerais",
                  acompanhantes: "Acompanhantes",
                  hospedagem: "Hospedagens",
                  ingresso: "Ingressos",
                  "nt-fiscal": "Nota Fiscal",
                  resumo: "Resumo",
                }[tab]
              }
            </button>
          ))}
        </div>

        <ScrollArea className="h-[400px] overflow-auto">
          {activeTab === "gerais" && (
            <div className="space-y-4 p-5">
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Forma de Pagamento</Label>
                <select
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.paymentMethod || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      paymentMethod: e.target.value as PaymentMethodType,
                    })
                  }
                >
                  <option value="">Selecione</option>
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="DEBITO">Débito</option>
                  <option value="CREDITO">Crédito</option>
                </select>
              </div>

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
                  {tourOperators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data da Venda</Label>
                <IMaskInput
                  mask="00/00/0000"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.saleDate || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      saleDate: formatDateWithSlashes(value),
                    })
                  }
                  unmask={true}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-in</Label>
                <IMaskInput
                  mask="00/00/0000"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.checkIn || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      checkIn: formatDateWithSlashes(value),
                    })
                  }
                  unmask={true}
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Check-out</Label>
                <IMaskInput
                  mask="00/00/0000"
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editedSale.checkOut || ""}
                  onAccept={(value) =>
                    setEditedSale({
                      ...editedSale,
                      checkOut: formatDateWithSlashes(value),
                    })
                  }
                  unmask={true}
                />
              </div>

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
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className="grid grid-cols-4 gap-4">
                <Label className="self-start pt-2 text-right">Observação</Label>
                <textarea
                  className="col-span-3 rounded-md border p-2"
                  rows={4}
                  value={editedSale.observation || ""}
                  onChange={(e) =>
                    setEditedSale({
                      ...editedSale,
                      observation: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Venda Cancelada</Label>
                <div className="col-span-3 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="canceledSale"
                      checked={editedSale.canceledSale === true}
                      onChange={() =>
                        setEditedSale({ ...editedSale, canceledSale: true })
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
                        setEditedSale({ ...editedSale, canceledSale: false })
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
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = formatCurrencyForInput(digits);
                    setNewHosting({ ...newHosting, price: formatted });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value.includes(",")) {
                      const formatted = formatCurrencyForInput(
                        e.target.value + "00",
                      );
                      setNewHosting({ ...newHosting, price: formatted });
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Data</Label>
                <IMaskInput
                  mask="00/00/0000"
                  value={newTicket.date}
                  onAccept={(value) =>
                    setNewTicket({
                      ...newTicket,
                      date: formatDateWithSlashes(value),
                    })
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
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const formatted = formatCurrencyForInput(digits);
                    setNewTicket({ ...newTicket, price: formatted });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value.includes(",")) {
                      const formatted = formatCurrencyForInput(
                        e.target.value + "00",
                      );
                      setNewTicket({ ...newTicket, price: formatted });
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
                        estimatedIssueDate: formatDateWithSlashes(value),
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

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
                        invoiceDate: formatDateWithSlashes(value),
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

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
                        expectedReceiptDate: formatDateWithSlashes(value),
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

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
                        receiptDate: formatDateWithSlashes(value),
                      },
                    })
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}

          {activeTab === "resumo" && (
            <div className="space-y-6 p-5">
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">
                  Informações Gerais
                </h3>
                {Object.entries(getResumoVenda().gerais).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-4 py-1">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="col-span-2">{value || "-"}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">Acompanhantes</h3>
                {getResumoVenda().acompanhantes.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {getResumoVenda().acompanhantes.map((nome, index) => (
                      <li key={index}>{nome}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">
                    Nenhum acompanhante adicionado
                  </p>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">Hospedagens</h3>
                {getResumoVenda().hospedagens.length > 0 ? (
                  <div className="space-y-3">
                    {getResumoVenda().hospedagens.map((hospedagem, index) => (
                      <div key={index} className="rounded border p-3">
                        {Object.entries(hospedagem).map(([key, value]) => (
                          <div
                            key={key}
                            className="grid grid-cols-3 gap-4 py-1"
                          >
                            <span className="font-medium text-gray-600">
                              {key}:
                            </span>
                            <span className="col-span-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhuma hospedagem adicionada</p>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">Ingressos</h3>
                {getResumoVenda().ingressos.length > 0 ? (
                  <div className="space-y-3">
                    {getResumoVenda().ingressos.map((ingresso, index) => (
                      <div key={index} className="rounded border p-3">
                        {Object.entries(ingresso).map(([key, value]) => (
                          <div
                            key={key}
                            className="grid grid-cols-3 gap-4 py-1"
                          >
                            <span className="font-medium text-gray-600">
                              {key}:
                            </span>
                            <span className="col-span-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum ingresso adicionado</p>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 text-lg font-semibold">Nota Fiscal</h3>
                {Object.entries(getResumoVenda().notaFiscal).map(
                  ([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-4 py-1">
                      <span className="font-medium text-gray-600">{key}:</span>
                      <span className="col-span-2">{value || "-"}</span>
                    </div>
                  ),
                )}
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
