"use client";

import { useState } from "react";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Sale {
  id: number;
  idInTourOperator: string | null;
  checkIn: string;
  checkOut: string;
  saleDate: string | null;
  paymentMethod: string | null;
  grossTotal: number;
  totalDiscount: number;
  netTotal: number;
  agencyCommissionValue: number;
  sallerCommissionValue: number;
  client: { name: string };
  tourOperator?: { name: string };
}

const RelatorioDeVendas = () => {
  const [filters, setFilters] = useState({
    dataInicio: "",
    dataFim: "",
    checkinInicio: "",
    checkinFim: "",
    checkoutInicio: "",
    checkoutFim: "",
    operadora: "",
    ingresso: "",
    hospedagem: "",
  });

  const [sales, setSales] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const buscarRelatorio = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.dataInicio && { saleDateFrom: filters.dataInicio }),
        ...(filters.dataFim && { saleDateTo: filters.dataFim }),
        ...(filters.checkinInicio && { checkInFrom: filters.checkinInicio }),
        ...(filters.checkinFim && { checkInTo: filters.checkinFim }),
        ...(filters.checkoutInicio && { checkOutFrom: filters.checkoutInicio }),
        ...(filters.checkoutFim && { checkOutTo: filters.checkoutFim }),
        ...(filters.operadora && { tourOperator: filters.operadora }),
        ...(filters.ingresso && { ticket: filters.ingresso }),
        ...(filters.hospedagem && { hosting: filters.hospedagem }),
      });

      const response = await fetch(`/api/sale/filter-for-report?${params}`);
      const data = await response.json();
      setSales(data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Erro ao buscar relatório:", error);
    }
  };

  const gerarPDF = async () => {
    try {
      const response = await fetch("/api/sale/report-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sales }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  const paginatedSales = sales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const totalPages = Math.ceil(sales.length / rowsPerPage);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        <TopBar />
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div className="col-span-4">
              <Label>Data da Venda</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.dataInicio || undefined}
                  onChange={(e) =>
                    setFilters({ ...filters, dataInicio: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) =>
                    setFilters({ ...filters, dataFim: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-span-4">
              <Label>Check-in</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.checkinInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, checkinInicio: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={filters.checkinFim}
                  onChange={(e) =>
                    setFilters({ ...filters, checkinFim: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-span-4">
              <Label>Check-out</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.checkoutInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, checkoutInicio: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={filters.checkoutFim}
                  onChange={(e) =>
                    setFilters({ ...filters, checkoutFim: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="col-span-2">
              <Label>Operadora</Label>
              <Input
                value={filters.operadora}
                onChange={(e) =>
                  setFilters({ ...filters, operadora: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Ingresso</Label>
              <Input
                value={filters.ingresso}
                onChange={(e) =>
                  setFilters({ ...filters, ingresso: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Hospedagem</Label>
              <Input
                value={filters.hospedagem}
                onChange={(e) =>
                  setFilters({ ...filters, hospedagem: e.target.value })
                }
              />
            </div>
          </CardContent>
          <div className="flex gap-4 px-6 pb-4">
            <Button
              className="w-32"
              variant="outline"
              onClick={buscarRelatorio}
            >
              Buscar
            </Button>
            <Button
              className="w-32"
              onClick={gerarPDF}
              disabled={sales.length === 0}
            >
              Gerar PDF
            </Button>
          </div>
        </Card>

        {sales.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Vendas Encontradas</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Operadora</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Total Bruto</TableHead>
                    <TableHead>Descontos</TableHead>
                    <TableHead>Total Líquido</TableHead>
                    <TableHead>Agência</TableHead>
                    <TableHead>Vendedor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{sale.id}</TableCell>
                      <TableCell>{sale.client?.name}</TableCell>
                      <TableCell>{sale.tourOperator?.name || "N/A"}</TableCell>
                      <TableCell>{sale.checkIn?.slice(0, 10)}</TableCell>
                      <TableCell>{sale.checkOut?.slice(0, 10)}</TableCell>
                      <TableCell>R$ {sale.grossTotal.toFixed(2)}</TableCell>
                      <TableCell>R$ {sale.totalDiscount.toFixed(2)}</TableCell>
                      <TableCell>R$ {sale.netTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        R$ {sale.agencyCommissionValue?.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        R$ {sale.sallerCommissionValue?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="self-center">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RelatorioDeVendas;
