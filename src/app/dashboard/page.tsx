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

import CurrencyInput from "../components/currency-input";
import Loader from "../components/loader";
import Metrics from "../components/metrics";
import Sidebar from "../components/sidebar";
import TopBar from "../components/top-bar";
import { formatCurrency } from "../functions/frontend/format-backend-currency-to-frontend";
import { formatBackendDateToFrontend } from "../functions/frontend/format-backend-date-to-frontend";
import EditSaleDialog from "./components/edit-sale-dialog";
import RegisterSaleDialog from "./components/register-sale-dialog";

export default function Dashboard() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempFilters, setTempFilters] = useState({
    "Id na Operadora": "",
    checkin: "",
    checkout: "",
    operadora: "",
    cliente: "",
    "total bruto": "",
    "total cashback": "",
    "total desconto": "",
    "total líquido": "",
  });
  const [activeFilters, setActiveFilters] = useState(tempFilters);
  const filterKeysMap: Record<string, string> = {
    "Id na Operadora": "idInTourOperator",
    checkin: "checkIn",
    checkout: "checkOut",
    operadora: "tourOperator.name",
    cliente: "client.name",
    "total bruto": "grossTotal",
    "total cashback": "totalCashback",
    "total desconto": "totalDiscount",
    "total líquido": "netTotal",
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

      const formattedData = data.map((sale: Sale) => ({
        ...sale,
        checkIn: formatBackendDateToFrontend(sale.checkIn),
        checkOut: formatBackendDateToFrontend(sale.checkOut),
        grossTotal: formatCurrency(sale.grossTotal),
        totalCashback: formatCurrency(sale.totalCashback),
        totalDiscount: formatCurrency(sale.totalDiscount),
        netTotal: formatCurrency(sale.netTotal),
      }));

      console.log(formattedData);
      setSales(formattedData);
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = (newSale: Sale) => {
    const formattedSale = {
      ...newSale,
      checkIn: formatBackendDateToFrontend(newSale.checkIn),
      checkOut: formatBackendDateToFrontend(newSale.checkOut),
    };

    setSales((prevSales) => [formattedSale, ...prevSales]);
    setTimeout(() => fetchSales(), 1000);
  };

  const formatDateInput = (value: string): string => {
    const nums = value.replace(/\D/g, "");
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`;
  };

  const itemsPerPage = 10;

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

  const filteredSales = sales.filter((sale) =>
    Object.keys(filterKeysMap).every((displayKey) => {
      const realKey = filterKeysMap[displayKey];
      let value: unknown;

      if (realKey.includes(".")) {
        value = getNestedValue(sale, realKey);
      } else {
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
            value = sale.tourOperator?.name || "";
            break;
          case "client.name":
            value = sale.client?.name || "";
            break;
          case "grossTotal":
            value = sale.grossTotal;
            break;
          case "totalCashback":
            value = sale.totalCashback;
            break;
          case "totalDiscount":
            value = sale.totalDiscount;
            break;
          case "netTotal":
            value = sale.netTotal;
            break;
          default:
            value = "";
        }
      }

      const filterValue =
        activeFilters[displayKey as keyof typeof activeFilters];
      return (
        filterValue === "" ||
        String(value ?? "")
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }),
  );

  const formatDateForFilter = (date: string) => {
    if (date.length === 8) {
      return `${date.slice(0, 2)}/${date.slice(2, 4)}/${date.slice(4, 8)}`;
    }
    return date;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

  if (!isAuthenticated || loading) {
    return <Loader />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        <TopBar />
        <Metrics />
        <RegisterSaleDialog onSaleSuccess={handleNewSale} />

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-5 items-end gap-4">
            <Input
              placeholder="Id na Operadora"
              value={tempFilters["Id na Operadora"]}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  "Id na Operadora": e.target.value,
                })
              }
            />

            <Input
              placeholder="Check-in "
              value={tempFilters.checkin}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  checkin: formatDateInput(e.target.value),
                })
              }
            />

            <Input
              placeholder="Check-out "
              value={tempFilters.checkout}
              onChange={(e) =>
                setTempFilters({
                  ...tempFilters,
                  checkout: formatDateInput(e.target.value),
                })
              }
            />

            <Input
              placeholder="Operadora"
              value={tempFilters.operadora}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, operadora: e.target.value })
              }
            />

            <Input
              placeholder="Cliente"
              value={tempFilters.cliente}
              onChange={(e) =>
                setTempFilters({ ...tempFilters, cliente: e.target.value })
              }
            />

            <CurrencyInput
              placeholder="total bruto"
              value={tempFilters["total bruto"]}
              onChange={(value) =>
                setTempFilters({ ...tempFilters, "total bruto": value })
              }
            />

            <CurrencyInput
              placeholder="total cashback"
              value={tempFilters["total cashback"]}
              onChange={(value) =>
                setTempFilters({ ...tempFilters, "total cashback": value })
              }
            />

            <CurrencyInput
              placeholder="total desconto"
              value={tempFilters["total desconto"]}
              onChange={(value) =>
                setTempFilters({ ...tempFilters, "total desconto": value })
              }
            />

            <CurrencyInput
              placeholder="total líquido"
              value={tempFilters["total líquido"]}
              onChange={(value) =>
                setTempFilters({ ...tempFilters, "total líquido": value })
              }
            />

            <Button
              onClick={() => {
                setActiveFilters({
                  ...tempFilters,
                  checkin: formatDateForFilter(tempFilters.checkin),
                  checkout: formatDateForFilter(tempFilters.checkout),
                });
                setTempFilters({
                  "Id na Operadora": "",
                  checkin: "",
                  checkout: "",
                  operadora: "",
                  cliente: "",
                  "total bruto": "",
                  "total cashback": "",
                  "total desconto": "",
                  "total líquido": "",
                });
              }}
              className="w-full"
            >
              Buscar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendas Filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID da venda</TableHead>
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
                    <TableCell className="text-center">{sale.id}</TableCell>
                    <TableCell className="text-center">
                      {sale.idInTourOperator}
                    </TableCell>
                    <TableCell>{sale.checkIn}</TableCell>
                    <TableCell>{sale.checkOut}</TableCell>
                    <TableCell>{sale.tourOperator.name}</TableCell>
                    <TableCell>{sale.client.name}</TableCell>
                    <TableCell className="text-center">
                      {sale.saleTicket.length}
                    </TableCell>
                    <TableCell className="text-center">
                      {sale.saleHosting.length}
                    </TableCell>
                    <TableCell>R$ {sale.grossTotal}</TableCell>
                    <TableCell>R$ {sale.totalCashback}</TableCell>
                    <TableCell>R$ {sale.totalDiscount}</TableCell>
                    <TableCell>R$ {sale.netTotal}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsEditDialogOpen(true);
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
            setSelectedSale(null);
          }}
          sale={selectedSale}
        />
      </div>
    </div>
  );
}
