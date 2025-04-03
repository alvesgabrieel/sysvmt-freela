"use client";

import { CashbackType } from "@prisma/client";
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

const CASHBACK_TYPE_LABELS: Record<CashbackType, string> = {
  CHECKIN: "Check-in",
  CHECKOUT: "Check-out",
  PURCHASEDATE: "Data da Compra",
};

// Função helper para obter o label
const getCashbackTypeLabel = (type: CashbackType): string => {
  return CASHBACK_TYPE_LABELS[type] || type;
};

interface Cashback {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  percentage: string;
  validityDays: number;
  selectType: CashbackType;
}

const CashbackComponent = () => {
  const [filters, setFilters] = useState({
    name: "",
    startDate: "",
    endDate: "",
    percentage: "",
    validityDays: "",
    selectType: "",
  });

  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  // const [isLoading, setIsLoading] = useState(true); // Adicionei estado de loading

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Quantos itens por página
  const [totalPages, setTotalPages] = useState(1);

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCashback, setSelectedCashback] = useState<Cashback | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);

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

  const handleAddCashback = (newCashback: Cashback) => {
    setCashbacks((prevCashbacks) => [newCashback, ...prevCashbacks]);
  };

  useEffect(() => {
    filterCashbacks(); // Busca tudo (paginação já está ativa por padrão)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Executa apenas no mount

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // setIsLoading(true);
        const response = await fetch("/api/cashback/filter", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setCashbacks(result.cashbacks || []);
        } else {
          toast.error("Erro ao carregar os cashbacks");
        }
      } catch (err) {
        toast.error("Erro ao carregar os cashbacks");
        console.error("Erro ao carregar os cashbacks", err);
      }
      // } finally {
      //   setIsLoading(false);
      // }
    };

    loadInitialData();
  }, []); // Array vazio para executar apenas na montagem do componente

  const filterCashbacks = async () => {
    // Só aplica filtros se pelo menos um campo estiver preenchido
    // const hasFilters = Object.values(filters).some((value) => value !== "");

    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: currentPage.toString(),
        itemsPerPage: itemsPerPage.toString(),
      }).toString();

      const response = await fetch(`/api/cashback/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setCashbacks(result.cashbacks || []);
        setTotalPages(result.pagination.totalPages);
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

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const cleanedFilters = {
        name: "",
        startDate: "",
        endDate: "",
        percentage: "",
        validityDays: "",
        selectType: "",
        ...Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(filters).filter(([_, value]) => value !== ""),
        ),
      };
      setFilters(cleanedFilters); // Atualiza os filtros
      setCurrentPage(1); // Reseta para a primeira página após filtro
      await filterCashbacks(); // Busca os tickets com os filtros aplicados
    } finally {
      setIsLoading(false);
    }
  };

  // Funções de navegação de página
  // 2. Funções de paginação - IMPORTANTE: atualize o estado PRIMEIRO
  const handlePageChange = (page: number) => {
    setCurrentPage(page); // Atualiza a página primeiro
    filterCashbacks();
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

        <RegisterCashbackDialog onAddCashback={handleAddCashback} />
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
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
            <div className="grid w-full items-center gap-1.5">
              <select
                value={filters.selectType}
                onChange={(e) =>
                  setFilters({ ...filters, selectType: e.target.value })
                }
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Tipo do cashback</option>
                {Object.entries(CASHBACK_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
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
                    <TableHead>Tipo</TableHead>
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
                        {getCashbackTypeLabel(cashback.selectType)}
                      </TableCell>
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
              <Loader fullScreen={false} />
            )}

            {/* Paginação Personalizada */}
            {cashbacks.length > 0 && (
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
