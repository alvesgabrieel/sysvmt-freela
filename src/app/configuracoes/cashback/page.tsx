"use client";

import { EyeIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { formatBackendDateToFrontend } from "@/app/functions/frontend/format-backend-date-to-frontend";
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

import { EditCashbackDialog } from "./components/edit-cashback-dialog";
import RegisterCashbackDialog from "./components/register-cashback-dialog";

interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: string;
  validityDays: number;
}

const CashbackComponent = () => {
  const [filters, setFilters] = useState({
    Id: "",
    name: "",
    startDate: "",
    endDate: "",
    percentage: "",
    validityDays: "",
  });

  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCashback, setSelectedCashback] = useState<Cashback | null>(
    null,
  );

  // Função para abrir o diálogo de edição
  const handleViewMore = (cashback: Cashback) => {
    setSelectedCashback(cashback); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedCashback(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveCashback = (updatedCashback: Cashback) => {
    console.log("Dados recebidos para atualização:", updatedCashback);

    setCashbacks((prevCashbacks) =>
      prevCashbacks.map((cb) =>
        cb.id === updatedCashback.id
          ? {
              ...updatedCashback,
              // Mantém as datas no formato correto
              startDate: updatedCashback.startDate,
              endDate: updatedCashback.endDate,
            }
          : cb,
      ),
    );

    setSelectedCashback(null); // Reseta o cashback selecionado
    setIsEditDialogOpen(false); // Fecha o diálogo
  };

  const filterCashbacks = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
      }).toString();

      const response = await fetch(`/api/cashback/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Dados retornados da API:", result);
        setCashbacks(result.cashbacks || []); // Garante que sallers seja um array
      } else {
        toast.error("Erro ao carregar os cashbacks");
      }
    } catch (err) {
      toast.error("Erro ao carregar os cashbacks filtrados");
      console.error("Erro ao carregar os cashbacks", err);
    }
  };

  const handleDeleteCashbacks = async (cashbackId: number) => {
    try {
      const response = await fetch(`/api/cashback/delete?id=${cashbackId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Cashback com sucesso!");
        // Atualiza a lista de cashback após a exclusão
        setCashbacks((prevCashback) =>
          prevCashback.filter((cashback) => cashback.id !== cashbackId),
        );
      } else {
        toast.error("Erro ao excluir o cashback");
      }
    } catch (error) {
      toast.error("Erro ao excluir o cashback");
      console.error("Erro ao excluir o cashback:", error);
    }
  };

  const applyFilters = () => {
    filterCashbacks(); // Busca os vendedores com os filtros aplicados
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima  */}
        <TopBar />

        <RegisterCashbackDialog />
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
              placeholder="Data inicial da vigência"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Data final da vigência"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Percentual"
              value={filters.percentage}
              onChange={(e) =>
                setFilters({ ...filters, percentage: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Validade"
              value={filters.validityDays}
              onChange={(e) =>
                setFilters({ ...filters, validityDays: e.target.value })
              }
            />
            <Button onClick={applyFilters} variant="outline">
              Buscar
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Cashbacks */}
        <Card>
          <CardHeader>
            <CardTitle>Cashbacks Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {cashbacks && cashbacks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data inicial da vigência</TableHead>
                    <TableHead>Data final da vigência</TableHead>
                    <TableHead>Percentual</TableHead>
                    <TableHead>Validade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashbacks.map((cashback) => (
                    <TableRow key={cashback.id}>
                      <TableCell>{cashback.id}</TableCell>
                      <TableCell>{cashback.name}</TableCell>
                      <TableCell>
                        {formatBackendDateToFrontend(cashback.startDate)}
                      </TableCell>
                      <TableCell>
                        {formatBackendDateToFrontend(cashback.endDate)}
                      </TableCell>
                      <TableCell>
                        {Number(cashback.percentage).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>{cashback.validityDays}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(cashback)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          className="ml-3"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteCashbacks(cashback.id)} // Função de exclusão
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum cashback encontrado com os filtros aplicados.</p>
            )}
          </CardContent>
        </Card>
        {selectedCashback && (
          <EditCashbackDialog
            cashback={selectedCashback}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveCashback}
          />
        )}
      </div>
    </div>
  );
};

export default CashbackComponent;
