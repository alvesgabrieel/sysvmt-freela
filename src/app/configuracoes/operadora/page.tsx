"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask";
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

import { EditTourOperatorDialog } from "./components/edit-tour-operator-dialog";
import RegisterTourOperatorDialog from "./components/register-tour-operator-dialog";

interface TourOperator {
  id: number;
  name: string;
  phone: string;
  contact: string;
  email: string;
  site: string;
  login: string;
  password: string;
  observation?: string | null;
  hostingCommissionUpfront: string;
  hostingCommissionInstallment: string;
  ticketCommissionUpfront: string;
  ticketCommissionInstallment: string;
}

const Operadoras = () => {
  const [tourOperators, setTourOperators] = useState<TourOperator[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    contact: "",
    phone: "",
    email: "",
    site: "",
  });

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTourOperator, setSelectedTourOperator] =
    useState<TourOperator | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Quantos itens por página
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Função para abrir o diálogo de edição
  const handleViewMore = (toutOperator: TourOperator) => {
    setSelectedTourOperator(toutOperator); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedTourOperator(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveTourOperator = (updatedTourOperator: TourOperator) => {
    setTourOperators((prevTourOperator) =>
      prevTourOperator.map((TourOperator) =>
        TourOperator.id === updatedTourOperator.id
          ? updatedTourOperator
          : TourOperator,
      ),
    );
  };

  const handleAddCompanion = (newTourOperator: TourOperator) => {
    setTourOperators((prevTourOperator) => [
      newTourOperator,
      ...prevTourOperator,
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTourOperators({ filters, page: currentPage });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTourOperators = async ({
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

      const response = await fetch(`/api/touroperator/read?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { tourOperators, totalPages } = await response.json();
        setTourOperators(tourOperators);
        setTotalPages(totalPages);
      } else {
        toast.error("Erro ao carregar os vendedores");
      }
    } catch (err) {
      toast.error("Erro ao carregar as operadoras filtradas");
      console.error("Erro ao carregar as operadoras", err);
    }
  };

  const handleDeleteTourOperator = async (tourOperatorId: number) => {
    try {
      const response = await fetch(
        `/api/touroperator/delete?id=${tourOperatorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        toast.success("Operadora excluída com sucesso!");
        // Atualiza a lista de ingressos após a exclusão
        setTourOperators((prevTourOperator) =>
          prevTourOperator.filter(
            (tourOperator) => tourOperator.id !== tourOperatorId,
          ),
        );
      } else {
        toast.error("Erro ao excluir a operadora");
      }
    } catch (error) {
      toast.error("Erro ao excluir a operadora");
      console.error("Erro ao excluir a operadora:", error);
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
  };

  // Função para aplicar os filtros
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const cleanedFilters = {
        name: "",
        contact: "",
        phone: "",
        email: "",
        site: "",
        ...Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(filters).filter(([_, value]) => value !== ""),
        ),
      };
      setFilters(cleanedFilters); // Atualiza os filtros
      setCurrentPage(1); // Reseta para a primeira página após filtro
      await fetchTourOperators({ filters: cleanedFilters, page: 1 }); // Busca os tickets com os filtros aplicados
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação de página
  // 2. Funções de paginação - IMPORTANTE: atualize o estado PRIMEIRO
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // Atualiza a página primeiro
    fetchTourOperators({ filters, page }); // Busca os dados da nova página
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
        {/* Barra de cima  */}
        <TopBar />

        <RegisterTourOperatorDialog onAddTourOperator={handleAddCompanion} />
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
              value={filters.name}
              onChange={handleFilterChange}
            />
            <Input
              type="text"
              name="contact"
              placeholder="Contato"
              value={filters.contact || ""}
              onChange={handleFilterChange}
            />
            <IMaskInput
              mask="(00) 00000-0000"
              name="phone"
              placeholder="Telefone"
              value={filters.phone || ""}
              onAccept={(value) =>
                setFilters((prev) => ({ ...prev, phone: value }))
              }
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Input
              type="text"
              name="email"
              placeholder="E-mail"
              value={filters.email || ""}
              onChange={handleFilterChange}
            />
            <Input
              type="text"
              name="site"
              placeholder="Site"
              value={filters.site || ""}
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

        {/* Tabela de Operadoras */}
        <Card>
          <CardHeader>
            <CardTitle>Operadoras Filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader fullScreen={false} />
            ) : tourOperators.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Site</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tourOperators.map((tourOperator) => (
                    <TableRow key={tourOperator.id}>
                      <TableCell>{tourOperator.id}</TableCell>
                      <TableCell>{tourOperator.name}</TableCell>
                      <TableCell>{tourOperator.contact}</TableCell>
                      <TableCell>{tourOperator.phone}</TableCell>
                      <TableCell>{tourOperator.email}</TableCell>
                      <TableCell>{tourOperator.site}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(tourOperator)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          className="ml-3"
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            handleDeleteTourOperator(tourOperator.id)
                          } // Função de exclusão
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
            {tourOperators.length > 0 && (
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
        {selectedTourOperator && (
          <EditTourOperatorDialog
            tourOperator={selectedTourOperator}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveTourOperator}
          />
        )}
      </div>
    </div>
  );
};

export default Operadoras;
