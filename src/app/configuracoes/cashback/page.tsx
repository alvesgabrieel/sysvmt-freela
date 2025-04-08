"use client";

import { CashbackType } from "@prisma/client";
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
  const [percentageRaw, setPercentageRaw] = useState("");

  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCashback, setSelectedCashback] = useState<Cashback | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleViewMore = (cashback: Cashback) => {
    setSelectedCashback(cashback);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedCashback(null);
  };

  const handleSaveCashback = (updatedCashback: Cashback) => {
    setCashbacks((prevCashbacks) =>
      prevCashbacks.map((cb) =>
        cb.id === updatedCashback.id
          ? {
              ...updatedCashback,
              startDate: updatedCashback.startDate,
              endDate: updatedCashback.endDate,
            }
          : cb,
      ),
    );
    setSelectedCashback(null);
    setIsEditDialogOpen(false);
  };

  const handleAddCashback = (newCashback: Cashback) => {
    setCashbacks((prevCashbacks) => [newCashback, ...prevCashbacks]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await filterCashbacks({ filters, page: currentPage });
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
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
    };

    loadInitialData();
  }, []);

  const filterCashbacks = async ({
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

      const response = await fetch(`/api/cashback/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
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
        toast.success("Cashback excluído com sucesso!");
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

  const handlePercentageKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (!/[0-9]|Backspace/.test(e.key)) {
      e.preventDefault();
      return;
    }

    let newValue = percentageRaw.replace(/\D/g, "");

    if (e.key === "Backspace") {
      newValue = newValue.slice(0, -1);
    } else {
      newValue += e.key;
    }

    if (newValue.length > 5) return;
    setPercentageRaw(newValue);
  };

  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const cleanedFilters = {
        ...filters,
        percentage: percentageRaw
          ? (Number(percentageRaw) / 100).toFixed(2).replace(".", ",")
          : "",
      };

      await filterCashbacks({ filters: cleanedFilters, page: 1 });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    filterCashbacks({ filters, page });
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
        <TopBar />
        <RegisterCashbackDialog onAddCashback={handleAddCashback} />

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
            <IMaskInput
              mask="00/00/0000"
              placeholder="Data inicial da vigência"
              value={filters.startDate}
              onAccept={(value) =>
                setFilters((prev) => ({ ...prev, startDate: value }))
              }
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <IMaskInput
              mask="00/00/0000"
              placeholder="Data final da vigência"
              value={filters.endDate}
              onAccept={(value) =>
                setFilters((prev) => ({ ...prev, endDate: value }))
              }
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Input
              type="text"
              placeholder="Percentual (%)"
              value={
                percentageRaw
                  ? (Number(percentageRaw) / 100).toFixed(2).replace(".", ",") +
                    "%"
                  : ""
              }
              onKeyDown={handlePercentageKeyDown}
              onChange={() => {}}
            />
            <Input
              type="number"
              placeholder="Validade (dias)"
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
              {isLoading ? <Loader className="h-4 w-4" /> : "Buscar"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cashbacks Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader fullScreen={false} />
            ) : cashbacks.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data inicial</TableHead>
                      <TableHead>Data final</TableHead>
                      <TableHead>Percentual</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ações</TableHead>
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
                          %
                        </TableCell>
                        <TableCell>{cashback.validityDays} dias</TableCell>
                        <TableCell>
                          {getCashbackTypeLabel(cashback.selectType)}
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewMore(cashback)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteCashbacks(cashback.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              </>
            ) : (
              <div className="text-muted-foreground flex h-32 items-center justify-center">
                Nenhum registro encontrado
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCashback && (
          <EditCashbackDialog
            cashback={selectedCashback}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveCashback}
          />
        )}
      </div>
    </div>
  );
};

export default CashbackComponent;
