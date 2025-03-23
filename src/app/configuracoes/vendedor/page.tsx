"use client";

import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask"; // Importe o IMaskInput
import { toast } from "sonner";

import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
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
import { fetchCitiesByState, fetchStates } from "@/services/ibge"; // Importando o serviço do IBGE

import RegisterSallerDialog from "./components/register-saller-dialog";

const Vendedores = () => {
  const [filters, setFilters] = useState({
    Id: "",
    name: "",
    login: "",
    email: "",
    state: "",
    city: "",
    phone: "",
  });

  const [sallers, setSallers] = useState<
    {
      id: number;
      name: string;
      login: string;
      email: string;
      state: string;
      city: string;
      phone: string;
    }[]
  >([]);

  // Estados e cidades
  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  // Buscar estados ao carregar a página
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        toast.error("Erro ao carregar estados");
        console.error("Erro ao carregar estados:", error);
      }
    };
    loadStates();
  }, []);

  // Buscar cidades quando um estado é selecionado
  useEffect(() => {
    if (!filters.state) return;

    const loadCities = async () => {
      try {
        const selectedState = states.find((s) => s.nome === filters.state);
        if (selectedState) {
          const citiesData = await fetchCitiesByState(selectedState.id);
          setCities(citiesData);
        }
      } catch (error) {
        toast.error("Erro ao carregar cidades");
        console.error("Erro ao carregar cidades:", error);
        setCities([]);
      }
    };
    loadCities();
  }, [filters.state, states]);

  // Função para buscar vendedores com base nos filtros
  const fetchSallers = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...filters,
      }).toString();

      const response = await fetch(`/api/saller/filter?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Dados retornados da API:", result);
        setSallers(result.sallers || []); // Garante que sallers seja um array
      } else {
        toast.error("Erro ao carregar os vendedores");
      }
    } catch (err) {
      toast.error("Erro ao carregar os vendedores");
      console.error("Erro ao carregar os vendedores", err);
    }
  };

  // Função para aplicar os filtros
  const applyFilters = () => {
    fetchSallers(); // Busca os vendedores com os filtros aplicados
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        {/* Barra de cima */}
        <TopBar />
        {/* Cards de métricas */}
        <Metrics />
        <RegisterSallerDialog />

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Id"
              value={filters.Id}
              onChange={(e) => setFilters({ ...filters, Id: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Nome"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Login"
              value={filters.login}
              onChange={(e) =>
                setFilters({ ...filters, login: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Email"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
            />
            <select
              value={filters.state}
              onChange={(e) =>
                setFilters({ ...filters, state: e.target.value })
              }
              className="rounded border p-2"
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.nome}>
                  {state.nome}
                </option>
              ))}
            </select>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="rounded border p-2"
              disabled={!filters.state} // Desabilita se nenhum estado for selecionado
            >
              <option value="">Selecione uma cidade</option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
            <IMaskInput
              mask="(00) 00000-0000" // Máscara para telefone
              placeholder="(00) 00000-0000"
              value={filters.phone}
              onAccept={(value) => setFilters({ ...filters, phone: value })}
              className="rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={applyFilters} variant="outline">
              Buscar
            </Button>
          </CardContent>
        </Card>

        {/* Tabela de Vendedores */}
        <Card>
          <CardHeader>
            <CardTitle>Vendedores Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            {sallers && sallers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Login</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Telefone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sallers.map((saller) => (
                    <TableRow key={saller.id}>
                      <TableCell>{saller.id}</TableCell>
                      <TableCell>{saller.name}</TableCell>
                      <TableCell>{saller.login}</TableCell>
                      <TableCell>{saller.email}</TableCell>
                      <TableCell>{saller.state}</TableCell>
                      <TableCell>{saller.city}</TableCell>
                      <TableCell>{saller.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum vendedor encontrado com os filtros aplicados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Vendedores;
