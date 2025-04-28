"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

import Loader from "@/app/components/loader";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { formatCurrency } from "@/app/functions/frontend/format-backend-currency-to-frontend";
import { formatPercentage } from "@/app/functions/frontend/format-backend-percentage-to-frontend";
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

interface ComissaoAgencia {
  id: number;
  client: string;
  saller: string;
  tourOperator: string;
  grossTotal: number;
  discountTotal: number;
  netTotal: number;
  agencyHostingCommissionPercentage: number;
  agencyTicketCommissionPercentage: number;
  agencyCommissionValue: number;
}

const ComissoesAgencia = () => {
  const [filters, setFilters] = useState({
    idVenda: "",
    idNaOperadora: "",
    operadora: "",
    cliente: "",
  });

  const [comissoes, setComissoes] = useState<ComissaoAgencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [erro, setErro] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        await buscarComissoes();
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarComissoes = async () => {
    setCurrentPage(1);
    setLoading(true);
    setErro("");
    setComissoes([]);

    try {
      const params = new URLSearchParams();

      if (filters.idVenda) params.append("saleId", filters.idVenda);
      if (filters.idNaOperadora)
        params.append("idInTourOperator", filters.idNaOperadora);
      if (filters.operadora) params.append("tourOperator", filters.operadora);
      if (filters.cliente) params.append("client", filters.cliente);

      const res = await fetch(
        `/api/sale/agency-commission?${params.toString()}`,
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao buscar comissões.");
      }

      const data = await res.json();
      setComissoes(Array.isArray(data) ? data : [data]);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao buscar comissões.",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(comissoes.length / itemsPerPage);
  const paginatedData = comissoes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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

        <Card>
          <CardHeader>
            <CardTitle>Comissões Agência - Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Input
                placeholder="Id da venda"
                id="idVenda"
                value={filters.idVenda}
                onChange={(e) =>
                  setFilters({ ...filters, idVenda: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Id na Operadora"
                id="idNaOperadora"
                value={filters.idNaOperadora}
                onChange={(e) =>
                  setFilters({ ...filters, idNaOperadora: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Operadora"
                id="operadora"
                value={filters.operadora}
                onChange={(e) =>
                  setFilters({ ...filters, operadora: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Cliente"
                id="cliente"
                value={filters.cliente}
                onChange={(e) =>
                  setFilters({ ...filters, cliente: e.target.value })
                }
              />
            </div>

            <Button
              onClick={buscarComissoes}
              disabled={loading}
              className="col-span-4"
              variant="outline"
            >
              {loading ? "Buscando..." : "Buscar Comissões"}
            </Button>
          </CardContent>
        </Card>

        {erro && (
          <Card>
            <CardContent className="p-4 text-red-500">{erro}</CardContent>
          </Card>
        )}

        {comissoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Resultados ({comissoes.length}{" "}
                {comissoes.length === 1 ? "venda" : "vendas"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Operadora</TableHead>
                    <TableHead>Total Bruto</TableHead>
                    <TableHead>Descontos</TableHead>
                    <TableHead>Total Líquido</TableHead>
                    <TableHead className="text-center">
                      Comissão Hospedagem
                    </TableHead>
                    <TableHead className="text-center">
                      Comissão Ingresso
                    </TableHead>
                    <TableHead>Valor Comissão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((comissao) => (
                    <TableRow key={comissao.id}>
                      <TableCell>{comissao.id}</TableCell>
                      <TableCell>{comissao.client}</TableCell>
                      <TableCell>{comissao.saller}</TableCell>
                      <TableCell>{comissao.tourOperator}</TableCell>
                      <TableCell>
                        R$ {formatCurrency(comissao.grossTotal)}
                      </TableCell>
                      <TableCell>
                        R$ {formatCurrency(comissao.discountTotal)}
                      </TableCell>
                      <TableCell>
                        R$ {formatCurrency(comissao.netTotal)}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatPercentage(
                          comissao.agencyHostingCommissionPercentage,
                        )}
                        %
                      </TableCell>
                      <TableCell className="text-center">
                        {formatPercentage(
                          comissao.agencyTicketCommissionPercentage,
                        )}
                        %
                      </TableCell>
                      <TableCell>
                        R$ {formatCurrency(comissao.agencyCommissionValue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </Button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
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

export default ComissoesAgencia;
