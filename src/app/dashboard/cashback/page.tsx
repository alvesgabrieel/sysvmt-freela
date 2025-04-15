"use client";

import { useEffect, useState } from "react";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Sale = {
  saleId: number;
  clientName: string;
  amount: number;
  saleDate: string;
  expiryDate: string | null;
  status: string;
  totalCashback: number;
};

const Cashback = () => {
  const [filters, setFilters] = useState({ saleId: "", clientName: "" });
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  // const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 5;

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.saleId) queryParams.append("saleId", filters.saleId);
      if (filters.clientName)
        queryParams.append("clientName", filters.clientName);

      const response = await fetch(
        `/api/cashback/filter-cashback-for-sale?${queryParams.toString()}`,
      );
      if (!response.ok) throw new Error("Erro ao buscar os dados");

      const data: Sale[] = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // const refreshData = () => {
  //   setRefreshKey((prev) => prev + 1);
  // };

  const totalPages = Math.ceil(salesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSales = salesData.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        <TopBar />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              placeholder="ID Venda"
              value={filters.saleId}
              onChange={(e) =>
                setFilters({ ...filters, saleId: e.target.value })
              }
            />
            <Input
              placeholder="Nome do Cliente"
              value={filters.clientName}
              onChange={(e) =>
                setFilters({ ...filters, clientName: e.target.value })
              }
            />
            <Button onClick={fetchSales} disabled={isLoading}>
              {isLoading ? "Buscando..." : "Pesquisar"}
            </Button>
            {/* <Button
              variant="outline"
              onClick={refreshData}
              disabled={isLoading}
            >
              {isLoading ? "Atualizando..." : "Atualizar Dados"}
            </Button> */}
          </CardContent>
        </Card>

        {/* Tabela de vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas com Cashback</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2 border-t-2"></div>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Cashback</TableHead>
                      <TableHead>Total Cashback</TableHead>
                      <TableHead>Data Venda</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSales.length > 0 ? (
                      currentSales.map((sale) => (
                        <TableRow key={sale.saleId}>
                          <TableCell>{sale.saleId}</TableCell>
                          <TableCell>{sale.clientName}</TableCell>
                          <TableCell>{formatCurrency(sale.amount)}</TableCell>
                          <TableCell>
                            {formatCurrency(sale.totalCashback)}
                          </TableCell>
                          <TableCell>{formatDate(sale.saleDate)}</TableCell>
                          <TableCell>{formatDate(sale.expiryDate)}</TableCell>
                          <TableCell>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                sale.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : sale.status === "USED"
                                    ? "bg-blue-100 text-blue-800"
                                    : sale.status === "EXPIRED"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {sale.status === "ACTIVE"
                                ? "Ativo"
                                : sale.status === "USED"
                                  ? "Utilizado"
                                  : sale.status === "EXPIRED"
                                    ? "Expirado"
                                    : "N/A"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-4 text-center">
                          Nenhuma venda encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Paginação */}
                {salesData.length > 0 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            currentPage > 1 && setCurrentPage(currentPage - 1)
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      <span className="px-4">
                        Página {currentPage} de {totalPages || 1}
                      </span>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            currentPage < totalPages &&
                            setCurrentPage(currentPage + 1)
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashback;
