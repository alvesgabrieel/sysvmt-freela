"use client"

import { useState } from "react";

import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent,CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RelatorioDeVendas = () => {
  // Estado para armazenar os filtros
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

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        {/* Barra de cima */}
        <TopBar />

        {/* Cards de métricas */}
        <Metrics />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            {/* Data da Venda */}
            <div className="col-span-4">
              <Label className="mb-1">Data da Venda</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={filters.dataInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, dataInicio: e.target.value })
                  }
                />
                <Input
                  type="date"
                  placeholder="Data final"
                  value={filters.dataFim}
                  onChange={(e) =>
                    setFilters({ ...filters, dataFim: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Checkin */}
            <div className="col-span-4">
              <Label className="mb-1">Checkin</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  placeholder="Checkin inicial"
                  value={filters.checkinInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, checkinInicio: e.target.value })
                  }
                />
                <Input
                  type="time"
                  placeholder="Checkin final"
                  value={filters.checkinFim}
                  onChange={(e) =>
                    setFilters({ ...filters, checkinFim: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Checkout */}
            <div className="col-span-4">
              <Label className="mb-1">Checkout</Label>
              <div className="flex gap-2">
                <Input
                  type="time"
                  placeholder="Checkout inicial"
                  value={filters.checkoutInicio}
                  onChange={(e) =>
                    setFilters({ ...filters, checkoutInicio: e.target.value })
                  }
                />
                <Input
                  type="time"
                  placeholder="Checkout final"
                  value={filters.checkoutFim}
                  onChange={(e) =>
                    setFilters({ ...filters, checkoutFim: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Operadora */}
            <div className="col-span-2">
              <Label className="mb-1">Operadora</Label>
              <select
                value={filters.operadora}
                onChange={(e) =>
                  setFilters({ ...filters, operadora: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a operadora</option>
                <option value="Operadora A">Operadora A</option>
                <option value="Operadora B">Operadora B</option>
                <option value="Operadora C">Operadora C</option>
              </select>
            </div>

            {/* Ingresso */}
            <div className="col-span-2">
              <Label className="mb-1">Ingresso</Label>
              <select
                value={filters.ingresso}
                onChange={(e) =>
                  setFilters({ ...filters, ingresso: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione o ingresso</option>
                <option value="Ingresso A">Ingresso A</option>
                <option value="Ingresso B">Ingresso B</option>
                <option value="Ingresso C">Ingresso C</option>
              </select>
            </div>

            {/* Hospedagem */}
            <div className="col-span-2">
              <Label className="mb-1">Hospedagem</Label>
              <select
                value={filters.hospedagem}
                onChange={(e) =>
                  setFilters({ ...filters, hospedagem: e.target.value })
                }
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a hospedagem</option>
                <option value="Hospedagem A">Hospedagem A</option>
                <option value="Hospedagem B">Hospedagem B</option>
                <option value="Hospedagem C">Hospedagem C</option>
              </select>
            </div>
          </CardContent>
          <Button className="ml-6 w-32">Buscar</Button>
        </Card>
      </div>
    </div>
  );
};

export default RelatorioDeVendas;