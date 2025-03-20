"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import DialogDemo from "../components/register-sale-dialog";
import Sidebar from "../components/sidebar";

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

  const filteredOrders = initialOrders.filter((order) =>
    Object.keys(filters).every(
      (key) =>
        filters[key as keyof typeof filters] === "" ||
        order[key as keyof typeof order]
          .toLowerCase()
          .includes(filters[key as keyof typeof filters].toLowerCase())
    )
  );

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <Input placeholder="Search..." className="w-1/3" />
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/avatar.jpg" alt="User" />
              <AvatarFallback>RP</AvatarFallback>
            </Avatar>
            <span className="font-semibold">Rogério Pereira</span>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { title: "Vendas", value: "$52.6k", change: "+3.4%" },
            { title: "Vendas no mês", value: "$12.87k", change: "-2.5%" },
            { title: "Vendas feitas hoje", value: "236" },
            { title: "Vendas", value: "22" },
          ].map((card, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.change && (
                  <p className="text-sm text-green-500">{card.change}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogDemo />

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

        {/* Tabela de vendas filtradas */}
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
                {filteredOrders.map((order) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
