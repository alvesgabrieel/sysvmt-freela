"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatCurrency } from "../functions/frontend/format-backend-currency-to-frontend";

const Metrics = () => {
  const [totalSales, setTotalSales] = useState<number>(0);

  const [totalSalesMonth, setTotalSalesMonth] = useState<number>(0);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);

  const [totalSalesCount, setTotalSalesCount] = useState<number | null>(null);

  const [totalSalesMonthCount, setTotalSalesMonthCount] = useState<number>(0);
  const [percentageChangeMonthCount, setPercentageChangeMonthCount] = useState<
    number | null
  >(null);

  // Função para buscar o total das vendas
  const fetchTotalSales = async () => {
    try {
      const response = await fetch("/api/dashboard/totalsales");
      const data = await response.json();
      if (response.ok) {
        setTotalSales(data.totalSales);
      } else {
        toast.error("Erro ao buscar o total das vendas");
      }
    } catch (error) {
      toast.error("Erro ao buscar o total das vendas");
      console.error("Erro ao buscar o total das vendas:", error);
    }
  };

  useEffect(() => {
    fetchTotalSales(); // Chama a função ao carregar o componente
  }, []);

  // Função para buscar o total das vendas do mês e a variação percentual
  const fetchTotalSalesMonth = async () => {
    try {
      const response = await fetch("/api/dashboard/totalsalesmonth");
      const data = await response.json();

      if (response.ok) {
        setTotalSalesMonth(data.totalMonthlySales);
        setPercentageChange(data.percentageChange);
      } else {
        toast.error("Erro ao buscar o total das vendas do mês");
      }
    } catch (error) {
      toast.error("Erro ao buscar o total das vendas do mês");
      console.error("Erro ao buscar o total das vendas:", error);
    }
  };

  useEffect(() => {
    fetchTotalSalesMonth(); // Chama a função ao carregar o componente
  }, []);

  const fetchTotalSalesCount = async () => {
    try {
      const response = await fetch("/api/dashboard/totalsalescount");
      const data = await response.json();

      if (response.ok) {
        setTotalSalesCount(data.totalSalesCount);
      } else {
        toast.error("Erro ao buscar o total das vendas (contador)");
      }
    } catch (error) {
      toast.error("Erro ao buscar o total das vendas (contador)");
      console.error("Erro ao buscar o total das vendas (contador):", error);
    }
  };

  useEffect(() => {
    fetchTotalSalesCount(); // Chama a função ao carregar o componente
  }, []);

  const fetchTotalSalesCountMonth = async () => {
    try {
      const response = await fetch("/api/dashboard/totalsalescountmonth");
      const data = await response.json();

      if (response.ok) {
        setTotalSalesMonthCount(data.totalSalesCountMonth);
        setPercentageChangeMonthCount(data.percentageChange);
      } else {
        toast.error("Erro ao buscar o total das vendas do mês (contador)");
      }
    } catch (error) {
      toast.error("Erro ao buscar o total das vendas do mês (contador)");
      console.error(
        "Erro ao buscar o total das vendas do mês (contador):",
        error,
      );
    }
  };

  useEffect(() => {
    fetchTotalSalesCountMonth(); // Chama a função ao carregar o componente
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4">
      {[
        { title: "Vendas", value: `R$ ${formatCurrency(totalSales)}` },
        {
          title: "Vendas no mês",
          value: `R$ ${formatCurrency(totalSalesMonth)}`, // Exibe o total das vendas do mês
          change:
            percentageChange !== null
              ? `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(2)}%`
              : null, // Exibe a porcentagem de variação
        },
        { title: "Vendas totais", value: totalSalesCount },
        {
          title: "Vendas no mês",
          value: totalSalesMonthCount,
          change:
            percentageChangeMonthCount !== null
              ? `${percentageChangeMonthCount > 0 ? "+" : ""}${percentageChangeMonthCount.toFixed(2)}%`
              : null,
        },
      ].map((card, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            {card.change && (
              <p
                className={`text-sm ${
                  card.change.includes("-") ? "text-red-500" : "text-green-500"
                }`}
              >
                {card.change}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Metrics;
