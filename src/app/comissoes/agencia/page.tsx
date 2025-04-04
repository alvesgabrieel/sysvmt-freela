"use client";

import { useState } from "react";

import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ComissaoAgencia {
  id: string;
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
  const [filters, setFilters] = useState({ idVenda: "" });
  const [comissao, setComissao] = useState<ComissaoAgencia | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const buscarComissao = async () => {
    setLoading(true);
    setErro("");
    setComissao(null);

    try {
      const res = await fetch(
        `/api/sale/agency-commission?saleId=${filters.idVenda}`,
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erro ao buscar comissão.");
      }

      const data = await res.json();
      setComissao(data);
    } catch {
      setErro("Erro ao buscar comissão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima */}
        <TopBar />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Comissões Agência - Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 items-end gap-4">
            <div>
              <Label htmlFor="idVenda">ID da Venda</Label>
              <Input
                id="idVenda"
                placeholder="ID da Venda"
                value={filters.idVenda}
                onChange={(e) =>
                  setFilters({ ...filters, idVenda: e.target.value })
                }
              />
            </div>
            <Button onClick={buscarComissao} disabled={loading}>
              {loading ? "Buscando..." : "Buscar Comissão"}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        {erro && (
          <Card>
            <CardContent className="p-4 text-red-500">{erro}</CardContent>
          </Card>
        )}

        {comissao && (
          <Card>
            <CardHeader>
              <CardTitle>Informações da Comissão</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-sm">
              <p>
                <strong>ID da Venda:</strong> {comissao.id}
              </p>
              <p>
                <strong>Cliente:</strong> {comissao.client}
              </p>
              <p>
                <strong>Vendedor:</strong> {comissao.saller}
              </p>
              <p>
                <strong>Operadora:</strong> {comissao.tourOperator}
              </p>
              <p>
                <strong>Total Bruto:</strong> R${" "}
                {Number(comissao.grossTotal).toFixed(2)}
              </p>
              <p>
                <strong>Descontos:</strong> R${" "}
                {Number(comissao.discountTotal).toFixed(2)}
              </p>
              <p>
                <strong>Total Líquido:</strong> R${" "}
                {Number(comissao.netTotal).toFixed(2)}
              </p>
              <p>
                <strong>Comissão Hospedagem (%):</strong>{" "}
                {comissao.agencyHostingCommissionPercentage}%
              </p>
              <p>
                <strong>Comissão Ingresso (%):</strong>{" "}
                {comissao.agencyTicketCommissionPercentage}%
              </p>
              <p>
                <strong>Valor da Comissão:</strong> R${" "}
                {Number(comissao.agencyCommissionValue).toFixed(2)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComissoesAgencia;
