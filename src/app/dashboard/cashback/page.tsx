"use client";

import { useState } from "react";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
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

const salesData = [
  {
    id: 1,
    cliente: "João Silva",
    produto: "Produto A",
    valor: "R$ 100,00",
    data: "20/03/2025",
    valiade: "20/03/2026",
    status: "Aprovado",
  },
  {
    id: 2,
    cliente: "Maria Souza",
    produto: "Produto B",
    valor: "R$ 150,00",
    data: "21/03/2025",
    valiade: "20/03/2026",
    status: "Aprovado",
  },
  {
    id: 3,
    cliente: "Carlos Lima",
    produto: "Produto C",
    valor: "R$ 200,00",
    data: "22/03/2025",
    valiade: "20/03/2026",
    status: "Aprovado",
  },
  {
    id: 4,
    cliente: "Ana Pereira",
    produto: "Produto D",
    valor: "R$ 250,00",
    data: "23/03/2025",
    valiade: "20/03/2026",
    status: "Aprovado",
  },
  {
    id: 5,
    cliente: "Bruno Rocha",
    produto: "Produto E",
    valor: "R$ 300,00",
    data: "24/03/2025",
    valiade: "20/03/2026",
    status: "Aprovado",
  },
  {
    id: 6,
    cliente: "Fernanda Almeida",
    produto: "Produto F",
    valor: "R$ 350,00",
    data: "25/03/2025",
    valiade: "20/03/2026",
    status: "Aprovado",
  },
  {
    id: 7,
    cliente: "Lucas Santos",
    produto: "Produto G",
    valor: "R$ 400,00",
    data: "26/03/2025",
  },
];

const Cashback = () => {
  const [filters, setFilters] = useState({ idVenda: "", cliente: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Número de vendas por página

  // Paginação - calcula os itens da página atual
  const totalPages = Math.ceil(salesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSales = salesData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima */}
        <TopBar />
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            {Object.keys(filters).map((key) => (
              <Input
                key={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={filters[key as keyof typeof filters]}
                onChange={(e) =>
                  setFilters({ ...filters, [key]: e.target.value })
                }
              />
            ))}
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
                  <TableHead>Produto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.id}</TableCell>
                    <TableCell>{sale.cliente}</TableCell>
                    <TableCell>{sale.produto}</TableCell>
                    <TableCell>{sale.valor}</TableCell>
                    <TableCell>{sale.data}</TableCell>
                    <TableCell>{sale.valiade}</TableCell>
                    <TableCell>{sale.status}</TableCell>
                  </TableRow>
                ))}
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
                  Página {currentPage} de {totalPages}
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
