"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCitiesByState, fetchStates } from "@/services/ibge";

const RegisterHostingDialog = () => {
  const [name, setName] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [observation, setObservation] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [states, setStates] = useState<{ id: number; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);

  // Buscar estados
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await fetchStates();
        setStates(statesData);
      } catch (error) {
        toast.error("Erro ao buscar estados");
        console.log(error);
      }
    };
    loadStates();
  }, []);

  // Buscar cidades do estado selecionado
  useEffect(() => {
    if (!state) return;
    const loadCities = async () => {
      try {
        const selectedState = states.find((s) => s.nome === state);
        if (selectedState) {
          const citiesData = await fetchCitiesByState(selectedState.id);
          setCities(citiesData);
        }
      } catch (error) {
        toast.error("Erro ao buscar cidades");
        console.log(error);
        setCities([]);
      }
    };
    loadCities();
  }, [state, states]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/hosting/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, state, city, observation }),
    });

    if (response.ok) {
      const result = await response.json();
      toast.success(result.message);
      setIsOpen(false);
      setName("");
      setState("");
      setCity("");
      setObservation("");
    } else {
      const error = await response.json();
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar hospedagem
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar hospedagem</DialogTitle>
        </DialogHeader>

        {/* Conteúdo das Abas */}
        {/* Gerais */}
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              type="text"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estado" className="text-right">
              Estado
            </Label>
            <select
              id="estado"
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            >
              <option value=""></option>
              {states.map((state) => (
                <option key={state.id} value={state.nome}>
                  {state.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cidade" className="text-right">
              Cidade
            </Label>
            <select
              id="cidade"
              className="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border bg-[#e5e5e5]/30 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!state}
            >
              <option value=""></option>
              {cities.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="observacao" className="text-right">
              Observação
            </Label>
            <textarea
              id="observacao"
              className="col-span-3 rounded-md border bg-[#e5e5e5]/30 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="outline">
              Cadastrar hospedagem
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterHostingDialog;
