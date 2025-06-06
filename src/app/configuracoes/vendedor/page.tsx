"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask"; // Importe o IMaskInput
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
import { fetchCitiesByState, fetchStates } from "@/services/ibge"; // Importando o serviço do IBGE

import { EditSallerDialog } from "./components/edit-saller-dialog";
import RegisterSallerDialog from "./components/register-saller-dialog";

interface Commission {
  id?: number;
  tourOperatorId: number;
  tourOperatorName: string;
  upfrontCommission: number;
  installmentCommission: number;
}

interface Saller {
  id: number;
  name: string;
  login: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  observation?: string;
  pix: string;
  photo?: string;
  state: string;
  city: string;
  adress: string;
  number: string;
  complement?: string;
  commissions?: Commission[];
}

const Vendedores = () => {
  const [sallers, setSallers] = useState<Saller[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    login: "",
    email: "",
    state: "",
    city: "",
    phone: "",
  });

  // Estados e cidades
  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Quantos itens por página
  const [totalPages, setTotalPages] = useState(1);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSaller, setSelectedSaller] = useState<Saller | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);

  // Função para abrir o diálogo de edição
  const handleViewMore = (saller: Saller) => {
    // Busca o vendedor atualizado da lista principal
    const updatedSaller = sallers.find((s) => s.id === saller.id) || saller;
    setSelectedSaller(updatedSaller); // Usa o vendedor atualizado
    setIsEditDialogOpen(true);
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedSaller(null); // Limpa o vendedor selecionado
  };

  // Função para salvar as alterações
  const handleSaveSaller = async (updatedSaller: Saller) => {
    // Atualiza o estado local imediatamente para uma resposta rápida
    setSallers((prev) =>
      prev.map((s) => (s.id === updatedSaller.id ? updatedSaller : s)),
    );

    // Força uma recarga dos dados do servidor para garantir sincronização
    setRefreshKey((prev) => prev + 1);
  };

  const handleAddSaller = (newSaller: Saller) => {
    setSallers((prevSallers) => [newSaller, ...prevSallers]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSallers({ filters, page: currentPage });
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, currentPage]);

  // Buscar estados ao carregar a página
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

  // Função para buscar vendedores com base nos filtros
  const fetchSallers = async ({
    filters: customFilters = filters,
    page = currentPage,
  }: {
    filters?: typeof filters;
    page?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams({
        ...customFilters,
        page: page.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      const response = await fetch(`/api/saller/read?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        // console.log("Dados brutos da API:", result); // Adicione para debug

        // Garante que todos os campos estejam presentes
        const sallersWithDefaults = result.sallers.map((saller: Saller) => ({
          id: saller.id,
          name: saller.name,
          login: saller.login,
          email: saller.email,
          phone: saller.phone,
          cpf: saller.cpf || "",
          rg: saller.rg || "",
          observation: saller.observation || "",
          pix: saller.pix || "",
          photo: saller.photo || "",
          state: saller.state,
          city: saller.city,
          adress: saller.adress || "",
          number: saller.number || "",
          complement: saller.complement || "",
          commissions: saller.commissions || [],
        }));

        setSallers(sallersWithDefaults);
        setTotalPages(result.totalPages);
      } else {
        toast.error("Erro ao carregar os vendedores");
      }
    } catch (err) {
      toast.error("Erro ao carregar os vendedores");
      console.error("Erro ao carregar os vendedores", err);
    }
  };

  const handleDeleteSaller = async (sallerId: number) => {
    try {
      const response = await fetch(`/api/saller/delete?id=${sallerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Vendedor excluído com sucesso!");
        // Atualiza a lista de vendedor após a exclusão
        setSallers((prevSaller) =>
          prevSaller.filter((saller) => saller.id !== sallerId),
        );
      } else {
        toast.error("Erro ao excluir o vendedor");
      }
    } catch (error) {
      toast.error("Erro ao excluir o vendedor");
      console.error("Erro ao excluir o vendedor:", error);
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
        email: "",
        state: "",
        city: "",
        phone: "",
        ...Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(filters).filter(([_, value]) => value !== ""),
        ),
      };
      setFilters(cleanedFilters);
      setCurrentPage(1);
      await fetchSallers({ filters: cleanedFilters, page: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchSallers({ filters, page });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  if (initialLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader fullScreen={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima */}
        <TopBar />

        <RegisterSallerDialog onAddSaller={handleAddSaller} />

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
            <Input
              type="text"
              name="email"
              placeholder="Email"
              value={filters.email || ""}
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
                  {state.nome}
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
            <IMaskInput
              name="phone"
              mask="(00) 00000-0000" // Máscara para telefone
              placeholder="Telefone"
              value={filters.phone || ""}
              onAccept={(value) =>
                setFilters((prev) => ({ ...prev, phone: value }))
              }
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* Tabela de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Vendedores Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader fullScreen={false} />
            ) : sallers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sallers.map((saller) => (
                    <TableRow key={saller.id}>
                      <TableCell>{saller.id}</TableCell>
                      <TableCell>{saller.name}</TableCell>
                      <TableCell>{saller.login}</TableCell>
                      <TableCell>{saller.email}</TableCell>
                      <TableCell>{saller.state}</TableCell>
                      <TableCell>{saller.city}</TableCell>
                      <TableCell>{saller.phone}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(saller)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteSaller(saller.id)}
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
              <div className="text-muted-foreground flex h-32 items-center justify-center">
                Nenhum registro encontrado
              </div>
            )}

            {/* Paginação Personalizada */}
            {sallers.length > 0 && (
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
        {selectedSaller && (
          <EditSallerDialog
            saller={selectedSaller}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveSaller}
          />
        )}
      </div>
    </div>
  );
};

export default Vendedores;
