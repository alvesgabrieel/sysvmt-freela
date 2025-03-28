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

import { EditHostingDialog } from "./components/edit-hosting-dialog";
import RegisterHostingDialog from "./components/register-hosting-dialog";

type Hosting = {
  id: number;
  name: string;
  state: string;
  city: string;
  observation?: string;
};

const Hospedagem = () => {
  const [hosting, setHosting] = useState<Hosting[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    state: "",
    city: "",
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
  const [selectedHosting, setSelectedHosting] = useState<Hosting | null>(null);

  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  // Função para abrir o diálogo de edição
  const handleViewMore = (hosting: Hosting) => {
    setSelectedHosting(hosting); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedHosting(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveHosting = (updatedHosting: Hosting) => {
    setHosting((prevHosting) =>
      prevHosting.map((hosting) =>
        hosting.id === updatedHosting.id ? updatedHosting : hosting,
      ),
    );
  };

  const handleAddHosting = (newHosting: Hosting) => {
    setHosting((prevHosting) => [newHosting, ...prevHosting]);
  };

  useEffect(() => {
    fetchHosting(); // Busca tudo (paginação já está ativa por padrão)
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

  const fetchHosting = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      const response = await fetch(`/api/hosting/read?${queryParams}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const { hostings, totalPages } = await response.json();
        setHosting(hostings);
        setTotalPages(totalPages);
      } else {
        toast.error("Erro ao carregar hospedagens");
      }
    } catch (err) {
      toast.error("Erro na requisição");
      console.error(err);
    }
  };

  const handleDeleteHosting = async (hostingId: number) => {
    try {
      const response = await fetch(`/api/hosting/delete?id=${hostingId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Hopedagem excluída com sucesso!");
        // Atualiza a lista de ingressos após a exclusão
        setHosting((prevHosting) =>
          prevHosting.filter((hosting) => hosting.id !== hostingId),
        );
      } else {
        toast.error("Erro ao excluir a hospedagem");
      }
    } catch (error) {
      toast.error("Erro ao excluir a hospedagem");
      console.error("Erro ao excluir a hospedagem:", error);
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
      await fetchHosting(); // Busca os tickets com os filtros aplicados
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchHosting(); // Busca os tickets para a nova página
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1); // Atualiza o estado primeiro
    }
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

        <RegisterHostingDialog onAddHosting={handleAddHosting} />
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
              <option value="">Cidade</option>
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

        {/* Tabela de hospedagens */}
        <Card>
          <CardHeader>
            <CardTitle>Hospedagens Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {hosting.length > 0 ? (
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
                  {hosting.map((hosting) => (
                    <TableRow key={hosting.id}>
                      <TableCell>{hosting.name}</TableCell>
                      <TableCell>{hosting.state}</TableCell>
                      <TableCell>{hosting.city}</TableCell>
                      <TableCell>{hosting.observation}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(hosting)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteHosting(hosting.id)}
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
            {hosting.length > 0 && (
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
        {selectedHosting && (
          <EditHostingDialog
            hosting={selectedHosting}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveHosting}
          />
        )}
      </div>
    </div>
  );
};

export default Hospedagem;
