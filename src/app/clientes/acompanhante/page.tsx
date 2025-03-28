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

import { EditCompanionDialog } from "./components/edit-companion-dialog";
import RegisterCompanionDialog from "./components/register-companion-dialog";

interface Companion {
  id: number;
  name: string;
  phone: string;
  email: string;
  dateOfBirth: string;
}

const Acompanhante = () => {
  const [companion, setCompanion] = useState<Companion[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);

  // Função para abrir o diálogo de edição
  const handleViewMore = (companion: Companion) => {
    setSelectedCompanion(companion); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedCompanion(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveCompanion = (updatedCompanion: Companion) => {
    setCompanion((prevCompanion) =>
      prevCompanion.map((companion) =>
        companion.id === updatedCompanion.id ? updatedCompanion : companion,
      ),
    );
  };

  const handleAddCompanion = (newCompanion: Companion) => {
    setCompanion((prevCompanions) => [newCompanion, ...prevCompanions]);
  };

  useEffect(() => {
    fetchCompanions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  //filtrar acompanhantes
  const fetchCompanions = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      const response = await fetch(`/api/companion/read?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const { companions, totalPages } = await response.json();
        setCompanion(companions);
        setTotalPages(totalPages || 1);
      } else {
        toast.error("Erro ao carregar os acompanhantes");
      }
    } catch (err) {
      toast.error("Erro ao carregar os acompanhantes");
      console.error("Erro ao carregar os acompanhantes", err);
    }
  };

  //excluir acompanhantes
  const handleDeleteCompanion = async (companionId: number) => {
    try {
      const response = await fetch(`/api/companion/delete?id=${companionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Acompanhante excluído com sucesso!");
        // Atualiza a lista de ingressos após a exclusão
        setCompanion((prevCompanion) =>
          prevCompanion.filter((companion) => companion.id !== companionId),
        );
      } else {
        toast.error("Erro ao excluir o acompanhante");
      }
    } catch (error) {
      toast.error("Erro ao excluir o acompanhante");
      console.error("Erro ao excluir o acompanhante:", error);
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
    setIsLoading(true); // Ativa o loading

    try {
      // Remove campos vazios dos filtros, mas mantém todas as chaves
      const cleanedFilters = {
        name: "",
        phone: "",
        email: "",
        dateOfBirth: "",
        ...Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(filters).filter(([_, value]) => value !== ""),
        ),
      };

      setFilters(cleanedFilters); // Atualiza os filtros
      setCurrentPage(1); // Reseta para a primeira página após filtro
      await fetchCompanions(); // Busca os tickets com os filtros aplicados
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

        <RegisterCompanionDialog onAddCompanion={handleAddCompanion} />

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

            <IMaskInput
              mask="00/00/0000"
              name="dateOfBirth"
              placeholder="Data de nascimento"
              value={filters.dateOfBirth || ""}
              onAccept={(value) =>
                setFilters((prev) => ({ ...prev, dateOfBirth: value }))
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

        {/* Tabela de acompanhantes filtrados */}
        <Card>
          <CardHeader>
            <CardTitle>Acompanhantes filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {companion.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data de nascimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companion.map((companion) => (
                    <TableRow key={companion.id}>
                      <TableCell>{companion.name}</TableCell>
                      <TableCell>{companion.phone}</TableCell>
                      <TableCell>{companion.email}</TableCell>
                      <TableCell>{companion.dateOfBirth}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(companion)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteCompanion(companion.id)} // Função de exclusão
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
            {companion.length > 0 && (
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
        {selectedCompanion && (
          <EditCompanionDialog
            companion={selectedCompanion}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveCompanion}
          />
        )}
      </div>
    </div>
  );
};

export default Acompanhante;
