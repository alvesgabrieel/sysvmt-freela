"use client";

import { useState } from "react";

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

// Definir a estrutura dos dados
type Sale = {
  saleId: number;
  clientName: string;
  totalCashback: number;
  saleDate: string;
  expiryDate: string | null;
  status: string;
};

const Cashback = () => {
  const [filters, setFilters] = useState({ saleId: "", clientName: "" });
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de vendas por página

  const fetchSales = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.saleId) queryParams.append("saleId", filters.saleId);
      if (filters.clientName)
        queryParams.append("clientName", filters.clientName);

      const response = await fetch(
        `/api/cashback/filter-cashback-for-sale${queryParams}`,
      );
      if (!response.ok) throw new Error("Erro ao buscar os dados");

      const data: Sale[] = await response.json(); // Aplicando a tipagem correta
      setSalesData(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    }
  };

  // Paginação - calcula os itens da página atual
  const totalPages = Math.ceil(salesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSales = salesData.slice(startIndex, startIndex + itemsPerPage);

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
          <CardContent className="grid grid-cols-4 gap-4">
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
            <Button onClick={fetchSales}>Pesquisar</Button>
          </CardContent>
        </Card>

        {/* Tabela de vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
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
                      <TableCell>R$ {sale.totalCashback.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sale.expiryDate
                          ? new Date(sale.expiryDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{sale.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-4 text-center">
                      Nenhuma venda encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Paginação */}
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && setCurrentPage(currentPage - 1)
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashback;
