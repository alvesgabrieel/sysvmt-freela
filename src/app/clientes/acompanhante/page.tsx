"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
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
    id: "",
    name: "",
    phone: "",
    email: "",
    dateOfBirth: "",
  });

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Quantos itens por página

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(
    null,
  );

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

  //filtrar acompanhantes
  const fetchCompanions = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      const response = await fetch(`/api/companion/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCompanion(result.companions);
        console.log("Resposta da API:", result);
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
  const applyFilters = () => {
    // Remove campos vazios dos filtros, mas mantém todas as chaves
    const cleanedFilters = {
      id: "",
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
    fetchCompanions(); // Busca os tickets com os filtros aplicados
  };

  // Lógica de paginação
  const indexOfLastCompanion = currentPage * itemsPerPage;
  const indexOfFirstCompanion = indexOfLastCompanion - itemsPerPage;
  const currentCompanion = companion.slice(
    indexOfFirstCompanion,
    indexOfLastCompanion,
  );

  // Funções de navegação de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCompanions(); // Busca os tickets para a nova página
  };

  const handlePrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(companion.length / itemsPerPage);
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  const totalPages = Math.ceil(companion.length / itemsPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima  */}
        <TopBar />
        {/* Cards de métricas */}
        <Metrics />
        <RegisterCompanionDialog />

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
            <Input
              type="text"
              name="phone"
              placeholder="Telefone"
              value={filters.phone || ""}
              onChange={handleFilterChange}
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
              name="data-nascimento"
              placeholder="Data de nascimento"
              value={filters.dateOfBirth || ""}
              onChange={handleFilterChange}
            />
            <Button onClick={applyFilters} variant="outline">
              Buscar
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de acompanhantes filtrados */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes filtrados</CardTitle>
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
                  {currentCompanion.map((companion) => (
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
