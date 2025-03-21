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
    {
    id: "U2349SD12",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD13",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD14",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD15",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD16",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD17",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD18",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD19",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD20",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD21",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
    {
    id: "U2349SD22",
    data: "19/02/2025",
    checkin: "19:20:22",
    checkout: "18:20:22",
    operadora: "operadora2",
    cliente: "Lucas",
    ingresso: "ingresso1",
    hospedagem: "hospedagem1",
    totalBruto: "R$ 1000",
    totalCashback: "R$ 100",
    totalDesconto: "R$ 100",
    totalLiquido: "R$ 800",
    },
];

export default function Dashboard() {
  const [filters, setFilters] = useState({
    id: "",
    data: "",
    checkin: "",
    checkout: "",
    operadora: "",
    cliente: "",
    ingresso: "",
    hospedagem: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Estado para a página atual
  // const [itemsPerPage, setItemsPerPage] = useState(10); // Estado para itens por página
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
    Object.keys(filters).every(
      (key) =>
        filters[key as keyof typeof filters] === "" ||
        order[key as keyof typeof order]
          .toLowerCase()
          .includes(filters[key as keyof typeof filters].toLowerCase())
    )
  );

  // Lógica de paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  // Função para mudar de página
  // const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {/* Barra de cima  */}
        <TopBar />
        {/* Cards de métricas */}
        <Metrics />
        {/* Botão para abrir o dialog para cadastar venda */}
        <RegisterSaleDialog />
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
        {/* Tabela de vendas filtradas com paginação */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas Filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(filters).map((key) => (
                    <TableHead key={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((order) => (
                  <TableRow key={order.id}>
                    {Object.keys(filters).map((key) => (
                      <TableCell key={key}>
                        {order[key as keyof typeof order]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Controles de paginação */}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
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
                      Math.ceil(filteredOrders.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(filteredOrders.length / itemsPerPage)
                }
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
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