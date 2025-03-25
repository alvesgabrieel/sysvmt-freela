"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

import Loader from "../components/loader";
import Metrics from "../components/metrics";
import Sidebar from "../components/sidebar";
import TopBar from "../components/top-bar";
import RegisterSaleDialog from "./components/register-sale-dialog";

const initialOrders = [
  {
    id: "I293DSA39",
    data: "18/02/2025",
    checkin: "18:20:22",
    checkout: "19:20:22",
    operadora: "operadora1",
    cliente: "João",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
  },
  // ... (mantenha os outros objetos de pedidos como estão)
];

export default function Dashboard() {
  // Estado dos filtros com rótulos personalizados
  const [filters, setFilters] = useState({
    "id na operadora": "",
    data: "",
    checkin: "",
    checkout: "",
    operadora: "",
    cliente: "",
    ingresso: "",
    hospedagem: "",
  });

  // Mapeamento entre rótulos exibidos e chaves reais dos dados
  const filterKeysMap = {
    "id na operadora": "id",
    data: "data",
    checkin: "checkin",
    checkout: "checkout",
    operadora: "operadora",
    cliente: "cliente",
    ingresso: "ingresso",
    hospedagem: "hospedagem",
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
    }
  }, [router]);

  const itemsPerPage = 10;

  if (!isAuthenticated) {
    return <Loader />;
  }

  // Filtra os pedidos com base nos filtros aplicados
  const filteredOrders = initialOrders.filter((order) =>
    Object.keys(filterKeysMap).every((displayKey) => {
      const realKey = filterKeysMap[displayKey as keyof typeof filterKeysMap];
      return (
        filters[displayKey as keyof typeof filters] === "" ||
        order[realKey as keyof typeof order]
          .toString()
          .toLowerCase()
          .includes(filters[displayKey as keyof typeof filters].toLowerCase())
      );
    }),
  );

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

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
                  {Object.keys(filterKeysMap).map((displayKey) => (
                    <TableHead key={displayKey}>{displayKey}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((order) => (
                  <TableRow key={order.id}>
                    {Object.values(filterKeysMap).map((realKey) => (
                      <TableCell key={realKey}>
                        {order[realKey as keyof typeof order]}
                      </TableCell>
                    ))}
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
                {Math.ceil(filteredOrders.length / itemsPerPage)}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredOrders.length / itemsPerPage),
                    ),
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredOrders.length / itemsPerPage)
                }
                className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
