"use client";

import { useState } from "react";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ComissoesAgencia = () => {
  const [filters, setFilters] = useState({ idVenda: "" });
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima  */}
        <TopBar />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões agência - Filtros</CardTitle>
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
      </div>
    </div>
  );
};

export default ComissoesAgencia;
