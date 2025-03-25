"use client";

import { EyeIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask"; // Importe o IMaskInput
import { toast } from "sonner";

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

import { EditSallerDialog } from "./components/edit-saller-dialog";
import RegisterSallerDialog from "./components/register-saller-dialog";

interface Saller {
  id: number;
  name: string;
  login: string;
  email: string;
  phone: string;
  cpf: string;
  rg: string;
  observation?: string;
  pix: string;
  photo?: string;
  state: string;
  city: string;
  adress: string;
  number: string;
  complement?: string;
}

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

  const [sallers, setSallers] = useState<Saller[]>([]);

  // Estados e cidades
  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSaller, setSelectedSaller] = useState<Saller | null>(null);

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

  // Função para abrir o diálogo de edição
  const handleViewMore = (saller: Saller) => {
    setSelectedSaller(saller); // Define o vendedor selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedSaller(null); // Limpa o vendedor selecionado
  };

  // Função para salvar as alterações
  const handleSaveSaller = (updatedSaller: Saller) => {
    setSallers((prevSallers) =>
      prevSallers.map((saller) =>
        saller.id === updatedSaller.id ? updatedSaller : saller,
      ),
    );
  };

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

        // Garante que todos os campos estejam presentes
        const sallersWithDefaults = result.sallers.map((saller: Saller) => ({
          id: saller.id,
          name: saller.name,
          login: saller.login,
          email: saller.email,
          phone: saller.phone,
          cpf: saller.cpf || "", // Valor padrão para cpf
          rg: saller.rg || "", // Valor padrão para rg
          observation: saller.observation || "", // Valor padrão para observation
          pix: saller.pix || "", // Valor padrão para pix
          photo: saller.photo || "", // Valor padrão para photo
          state: saller.state,
          city: saller.city,
          adress: saller.adress || "", // Valor padrão para adress
          number: saller.number || "", // Valor padrão para number
          complement: saller.complement || "", // Valor padrão para complement
        }));

        setSallers(sallersWithDefaults);
      } else {
        toast.error("Erro ao carregar os vendedores");
      }
    } catch (err) {
      toast.error("Erro ao carregar os vendedores");
      console.error("Erro ao carregar os vendedores", err);
    }
  };

  const handleDeleteSaller = async (sallerId: number) => {
    try {
      const response = await fetch(`/api/saller/delete?id=${sallerId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Vendedor excluído com sucesso!");
        // Atualiza a lista de vendedor após a exclusão
        setSallers((prevSaller) =>
          prevSaller.filter((saller) => saller.id !== sallerId),
        );
      } else {
        toast.error("Erro ao excluir o vendedor");
      }
    } catch (error) {
      toast.error("Erro ao excluir o vendedor");
      console.error("Erro ao excluir o vendedor:", error);
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
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Estado</option>
              {states.map((state) => (
                <option key={state.id} value={state.nome}>
                  {state.nome}
                </option>
              ))}
            </select>
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!filters.state} // Desabilita se nenhum estado for selecionado
            >
              <option value="">Cidade</option>
              {cities.map((city) => (
                <option key={city.id} value={city.nome}>
                  {city.nome}
                </option>
              ))}
            </select>
            <IMaskInput
              mask="(00) 00000-0000" // Máscara para telefone
              placeholder="Telefone"
              value={filters.phone}
              onAccept={(value) => setFilters({ ...filters, phone: value })}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewMore(saller)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteSaller(saller.id)}
                          className="ml-3"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>Nenhum vendedor encontrado com os filtros aplicados.</p>
            )}
          </CardContent>
        </Card>
        {selectedSaller && (
          <EditSallerDialog
            saller={selectedSaller}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog}
            onSave={handleSaveSaller}
          />
        )}
      </div>
    </div>
  );
};

export default Vendedores;
