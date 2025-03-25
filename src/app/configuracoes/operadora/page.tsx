"use client";

import { EyeIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  upfrontComission: number;
  installmentComission: number;
  observation?: string | null;
}

const Operadoras = () => {
  const [filters, setFilters] = useState({
    Id: "",
    name: "",
    contact: "",
    phone: "",
    email: "",
    site: "",
  });

  const [tourOperators, setTourOperators] = useState<TourOperator[]>([]);

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTourOperator, setSelectedTourOperator] =
    useState<TourOperator | null>(null);

  // Função para abrir o diálogo de edição
  const handleViewMore = (ticket: TourOperator) => {
    setSelectedTourOperator(ticket); // Define o ingresso selecionado
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

  const fetchTourOperators = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
      }).toString();

      const response = await fetch(`/api/touroperator/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Dados retornados da API:", result);
        setTourOperators(result.tourOperator || []); // Garante que sallers seja um array
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

  const applyFilters = () => {
    fetchTourOperators(); // Busca os vendedores com os filtros aplicados
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima  */}
        <TopBar />

        <RegisterTourOperatorDialog />
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Id"
              value={filters.Id}
              onChange={(e) => setFilters({ ...filters, Id: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Nome"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Contato"
              value={filters.contact}
              onChange={(e) =>
                setFilters({ ...filters, contact: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Telefone"
              value={filters.phone}
              onChange={(e) =>
                setFilters({ ...filters, phone: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="E-mail"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Site"
              value={filters.site}
              onChange={(e) => setFilters({ ...filters, site: e.target.value })}
            />
            <Button onClick={applyFilters} variant="outline">
              Buscar
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Operadoras */}
        <Card>
          <CardHeader>
            <CardTitle>Operadoras Filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            {tourOperators && tourOperators.length > 0 ? (
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
              <p>Nenhuma operadora encontrado com os filtros aplicados.</p>
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
