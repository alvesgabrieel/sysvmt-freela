"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/app/components/loader";
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
import { fetchCitiesByState, fetchStates } from "@/services/ibge";

import { EditClientDialog } from "./components/edit-client-dialog";
import RegisterCompanionDialog from "./components/register-client-dialog";

interface Client {
  id: number;
  name: string;
  login: string;
  cpf: string;
  dateOfBirth: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  state: string;
  city: string;
  tags: [];
}

const Cliente = () => {
  const [client, setClient] = useState<Client[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    login: "",
    state: "",
    city: "",
    primaryPhone: "",
  });

  // Estados e cidades
  const [states, setStates] = useState<
    { id: number; sigla: string; nome: string }[]
  >([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Quantos itens por página
  const [totalPages, setTotalPages] = useState(1);

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Função para abrir o diálogo de edição
  const handleViewMore = (client: Client) => {
    setSelectedClient(client); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedClient(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveClient = (updatedClient: Client) => {
    setClient((prevClient) =>
      prevClient.map((client) =>
        client.id === updatedClient.id ? updatedClient : client,
      ),
    );
  };

  const handleAddClient = (newClient: Client) => {
    setClient((prevClient) => [newClient, ...prevClient]);
  };

  useEffect(() => {
    fetchClient(); // Busca tudo (paginação já está ativa por padrão)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Executa apenas no mount

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

  //filtrar clientes
  const fetchClient = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      const response = await fetch(`/api/client/read?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { clients, totalPages } = await response.json();
        setClient(clients);
        setTotalPages(totalPages);
      }
    } catch (err) {
      toast.error("Erro ao carregar os clientes");
      console.error("Erro ao carregar os clientes", err);
    }
  };

  //excluir cliente
  const handleDeleteClient = async (clientId: number) => {
    try {
      const response = await fetch(`/api/client/delete?id=${clientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Cliente excluído com sucesso!");
        // Atualiza a lista de ingressos após a exclusão
        setClient((prevClient) =>
          prevClient.filter((client) => client.id !== clientId),
        );
      } else {
        toast.error("Erro ao excluir o cliente");
      }
    } catch (error) {
      toast.error("Erro ao excluir o cliente");
      console.error("Erro ao excluir o cliente:", error);
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
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const cleanedFilters = {
        name: "",
        login: "",
        cpf: "",
        dateOfBirth: "",
        email: "",
        primaryPhone: "",
        secondaryPhone: "",
        state: "",
        city: "",
        tags: [],
        ...Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(filters).filter(([_, value]) => value !== ""),
        ),
      };

      setFilters(cleanedFilters); // Atualiza os filtros
      setCurrentPage(1); // Reseta para a primeira página após filtro
      await fetchClient(); // Busca os tickets com os filtros aplicados
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchClient(); // Busca os tickets para a nova página
  };

  const handlePrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima  */}
        <TopBar />

        <RegisterCompanionDialog onAddClient={handleAddClient} />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <Input
              type="text"
              name="name"
              placeholder="Nome"
              value={filters.name || ""}
              onChange={handleFilterChange}
            />
            <Input
              type="text"
              name="login"
              placeholder="Login"
              value={filters.login || ""}
              onChange={handleFilterChange}
            />
            <select
              name="state"
              value={filters.state || ""}
              onChange={handleFilterChange}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Estado</option>
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
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              name="phone"
              placeholder="Telefone"
              value={filters.primaryPhone || ""}
              onChange={handleFilterChange}
            />
            <Button
              onClick={applyFilters}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-4 w-4" /> // Ou qualquer outro componente de loading
              ) : (
                "Buscar"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de clientes filtrados */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {client.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.login}</TableCell>
                      <TableCell>{client.state}</TableCell>
                      <TableCell>{client.city}</TableCell>
                      <TableCell>{client.primaryPhone}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(client)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClient(client.id)} // Função de exclusão
                          className="ml-3"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Loader fullScreen={false} />
            )}

            {/* Paginação Personalizada */}
            {client.length > 0 && (
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
        {selectedClient && (
          <EditClientDialog
            client={selectedClient}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveClient}
          />
        )}
      </div>
    </div>
  );
};

export default Cliente;
