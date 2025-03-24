"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchCitiesByState, fetchStates } from "@/services/ibge"; // Importe as funções do IBGE

import { EditTicketDialog } from "./components/edit-ticket-dialog";
import RegisterTicketDialog from "./components/register-ticket-dialog";

// Defina o tipo Ticket
type Ticket = {
  id: number;
  name: string;
  state: string;
  city: string;
  observation?: string; // O campo observation é opcional
};

const Ingressos = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState({
    id: "",
    name: "",
    state: "", // Armazena o ID do estado
    city: "", // Armazena o nome da cidade
    observation: "",
  });

  // Estados e cidades
  const [states, setStates] = useState<
    { id: number; sigla: string; nome: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Quantos itens por página

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Função para abrir o diálogo de edição
  const handleViewMore = (ticket: Ticket) => {
    setSelectedTicket(ticket); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedTicket(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveTicket = (updatedTicket: Ticket) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === updatedTicket.id ? updatedTicket : ticket,
      ),
    );
  };

  // Busca os estados ao carregar a página
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        toast.error("Erro ao carregar estados");
        console.error("Erro ao carregar estados:", error);
      }
    };

    loadStates();
  }, []);

  // Busca as cidades quando um estado é selecionado
  const handleStateChange = async (stateId: number) => {
    try {
      const citiesData = await fetchCitiesByState(stateId);
      setCities(citiesData);
      setFilters((prevFilters) => ({
        ...prevFilters,
        city: "", // Reseta a cidade selecionada ao mudar o estado
      }));
    } catch (error) {
      toast.error("Erro ao carregar cidades");
      console.error("Erro ao carregar cidades:", error);
    }
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setTickets((prevTickets) => [...prevTickets, newTicket]);
  };

  // Função para buscar tickets com base nos filtros
  const fetchTickets = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      // Log dos filtros sendo enviados
      console.log("Filtros sendo enviados:", {
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/ticket/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setTickets(result.tickets);
      } else {
        toast.error("Erro ao carregar os tickets");
      }
    } catch (err) {
      toast.error("Erro ao carregar os tickets");
      console.error("Erro ao carregar os tickets", err);
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/ticket/delete?id=${ticketId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Ingresso excluído com sucesso!");
        // Atualiza a lista de ingressos após a exclusão
        setTickets((prevTickets) =>
          prevTickets.filter((ticket) => ticket.id !== ticketId),
        );
      } else {
        toast.error("Erro ao excluir o ingresso");
      }
    } catch (error) {
      toast.error("Erro ao excluir o ingresso");
      console.error("Erro ao excluir o ingresso:", error);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));

    // Se o estado for alterado, busca as cidades correspondentes
    if (name === "state") {
      const selectedState = states.find((s) => s.nome === value);
      if (selectedState) {
        handleStateChange(selectedState.id); // Passa o ID para buscar as cidades
      } else {
        setCities([]); // Limpa as cidades se nenhum estado for selecionado
      }
    }
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    // Remove campos vazios dos filtros, mas mantém todas as chaves
    const cleanedFilters = {
      id: "",
      name: "",
      state: "",
      city: "",
      observation: "",
      ...Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(filters).filter(([_, value]) => value !== ""),
      ),
    };

    setFilters(cleanedFilters); // Atualiza os filtros
    setCurrentPage(1); // Reseta para a primeira página após filtro
    fetchTickets(); // Busca os tickets com os filtros aplicados
  };

  // Lógica de paginação
  const indexOfLastTicket = currentPage * itemsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);

  // Funções de navegação de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTickets(); // Busca os tickets para a nova página
  };

  const handlePrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(tickets.length / itemsPerPage);
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima */}
        <TopBar />
        {/* Cards de métricas */}
        <Metrics />
        <RegisterTicketDialog onTicketCreated={handleTicketCreated} />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <Input
              type="text"
              name="id"
              placeholder="ID"
              value={filters.id || ""}
              onChange={handleFilterChange}
            />
            <Input
              type="text"
              name="name"
              placeholder="Nome"
              value={filters.name || ""}
              onChange={handleFilterChange}
            />
            <select
              name="state"
              value={filters.state || ""}
              onChange={handleFilterChange}
              className="rounded border p-2"
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.nome}>
                  {state.nome} ({state.sigla})
                </option>
              ))}
            </select>
            <select
              name="city"
              value={filters.city || ""}
              onChange={handleFilterChange}
              className="rounded border p-2"
              disabled={!filters.state} // Desabilita se nenhum estado for selecionado
            >
              <option value="">Selecione uma cidade</option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
            <Input
              type="text"
              name="observation"
              placeholder="Observação"
              value={filters.observation || ""}
              onChange={handleFilterChange}
            />
            <Button onClick={applyFilters} variant="outline">
              Buscar
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Ingressos */}
        <Card>
          <CardHeader>
            <CardTitle>Ingressos Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.name}</TableCell>
                      <TableCell>{ticket.state}</TableCell>
                      <TableCell>{ticket.city}</TableCell>
                      <TableCell>{ticket.observation}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(ticket)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          className="ml-2"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteTicket(ticket.id)} // Função de exclusão
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum ingresso encontrado com os filtros aplicados.</p>
            )}

            {/* Paginação Personalizada */}
            {tickets.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </Button>
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTicket && (
          <EditTicketDialog
            ticket={selectedTicket}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveTicket}
          />
        )}
      </div>
    </div>
  );
};

export default Ingressos;
