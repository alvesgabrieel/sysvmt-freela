"use client";

import { EyeIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { Sale } from "@/types/sale";

import Loader from "../components/loader";
import Metrics from "../components/metrics";
import Sidebar from "../components/sidebar";
import TopBar from "../components/top-bar";
import EditSaleDialog from "./components/edit-sale-dialog";
import RegisterSaleDialog from "./components/register-sale-dialog";

export default function Dashboard() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado dos filtros com rótulos personalizados
  const [filters, setFilters] = useState({
    "Id na Operadora": "",
    checkin: "",
    checkout: "",
    operadora: "",
    cliente: "",
    totalBruto: "",
    totalCashback: "",
    totalDesconto: "",
    totalLíquido: "",
  });

  // Mapeamento entre rótulos exibidos e chaves reais dos dados
  const filterKeysMap: Record<string, string> = {
    "Id na Operadora": "idInTourOperator",
    checkin: "checkIn",
    checkout: "checkOut",
    operadora: "tourOperator.name",
    cliente: "client.name",
    totalBruto: "grossTotal",
    totalCashback: "totalCashback",
    totalDesconto: "totalDiscount",
    totalLíquido: "netTotal",
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
    } else {
      setIsAuthenticated(true);
      fetchSales();
    }
  }, [router]);

  const handleDeleteSale = async (saleId: number) => {
    try {
      const response = await fetch(`/api/sale/delete?id=${saleId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Venda excluída com sucesso!");
        // Atualiza a lista de cashback após a exclusão
        setSales((prevSale) => prevSale.filter((sale) => sale.id !== saleId));
      } else {
        toast.error("Erro ao excluir a venda");
      }
    } catch (error) {
      toast.error("Erro ao excluir a venda");
      console.error("Erro ao excluir a venda:", error);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sale/list");
      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const itemsPerPage = 10;

  if (!isAuthenticated || loading) {
    return <Loader />;
  }

  // Função para formatar a data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função auxiliar para acessar propriedades aninhadas com tipos seguros
  const getNestedValue = (obj: Sale, path: string): unknown => {
    return path.split(".").reduce((acc: unknown, part: string) => {
      if (
        acc &&
        typeof acc === "object" &&
        part in (acc as Record<string, unknown>)
      ) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  // Filtra as vendas com base nos filtros aplicados
  const filteredSales = sales.filter((sale) =>
    Object.keys(filterKeysMap).every((displayKey) => {
      const realKey = filterKeysMap[displayKey];
      let value: unknown;

      if (realKey.includes(".")) {
        value = getNestedValue(sale, realKey);
      } else {
        // Type-safe access using a switch case
        switch (realKey) {
          case "idInTourOperator":
            value = sale.idInTourOperator;
            break;
          case "checkIn":
            value = sale.checkIn;
            break;
          case "checkOut":
            value = sale.checkOut;
            break;
          case "tourOperator.name":
            value = sale.tourOperator.name;
            break;
          case "client.name":
            value = sale.client.name;
            break;
          case "grossTotal":
            value = sale.grossTotal;
            break;
          case "totalCashback":
            value = sale.totalCashback;
            break;
          case "totalDiscount":
            value = sale.totalCashback;
            break;
          case "netTotal":
            value = sale.netTotal;
            break;
          default:
            value = "";
        }
      }

      const filterValue = filters[displayKey as keyof typeof filters];
      return (
        filterValue === "" ||
        String(value ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }),
  );

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima */}
        <TopBar />

        {/* Cards de métricas */}
        <Metrics />

        {/* Botão para abrir o dialog para cadastrar venda */}
        <RegisterSaleDialog />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            {Object.keys(filters).map((displayKey) => (
              <Input
                key={displayKey}
                placeholder={displayKey}
                value={filters[displayKey as keyof typeof filters]}
                onChange={(e) =>
                  setFilters({ ...filters, [displayKey]: e.target.value })
                }
              />
            ))}
          </CardContent>
        </Card>

        {/* Tabela de vendas filtradas com paginação */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID na Operadora</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Operadora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ingressos</TableHead>
                  <TableHead>Hospedagens</TableHead>
                  <TableHead>Total Bruto</TableHead>
                  <TableHead>Total Cashback</TableHead>
                  <TableHead>Total Desconto</TableHead>
                  <TableHead>Total Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-center">
                      {sale.idInTourOperator}
                    </TableCell>
                    <TableCell>{formatDate(sale.checkIn)}</TableCell>
                    <TableCell>{formatDate(sale.checkOut)}</TableCell>
                    <TableCell>{sale.tourOperator.name}</TableCell>
                    <TableCell>{sale.client.name}</TableCell>
                    <TableCell className="text-center">
                      {sale.saleTicket.length}
                    </TableCell>
                    <TableCell className="text-center">
                      {sale.saleHosting.length}
                    </TableCell>
                    <TableCell>{formatCurrency(sale.grossTotal)}</TableCell>
                    <TableCell>{formatCurrency(sale.totalCashback)}</TableCell>
                    <TableCell>{formatCurrency(sale.totalDiscount)}</TableCell>
                    <TableCell>{formatCurrency(sale.netTotal)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedSale(sale); // Define a venda selecionada
                          setIsEditDialogOpen(true); // Abre o dialog
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteSale(sale.id)}
                        className="ml-3"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Controles de paginação */}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
              >
                Anterior
              </button>

              <span>
                Página {currentPage} de{" "}
                {Math.ceil(filteredSales.length / itemsPerPage)}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredSales.length / itemsPerPage),
                    ),
                  )
                }
                disabled={
                  currentPage === Math.ceil(filteredSales.length / itemsPerPage)
                }
                className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </CardContent>
        </Card>

        <EditSaleDialog
          open={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedSale(null); // Limpa a venda selecionada ao fechar
          }}
          sale={selectedSale} // Adicione esta prop
        />
      </div>
    </div>
  );
}
