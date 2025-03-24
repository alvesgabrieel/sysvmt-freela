"use client";

import { useEffect, useState } from "react";
import { IMaskInput } from "react-imask"; // Importe o IMaskInput
import Select from "react-select";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCitiesByState, fetchStates } from "@/services/ibge";

interface Tag {
  id: string;
  name: string;
  color: string;
}

const RegisterClientDialog = () => {
  const [name, setName] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [primaryPhone, setPrimaryPhone] = useState<string>("");
  const [secondaryPhone, setSecondaryPhone] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [tags, setTags] = useState<Tag[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tag/read");
        if (response.ok) {
          const result = await response.json();
          setTags(result.tags);
        } else {
          toast.error("Erro ao carregar as tags");
        }
      } catch (Err) {
        toast.error("Erro ao carregar as tags");
        console.error("Erro ao carregar as tags", Err);
      }
    };
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/client/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        login,
        cpf,
        dateOfBirth,
        email,
        primaryPhone,
        secondaryPhone,
        state,
        city,
        tags: selectedTags,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      toast.success(result.message);
      setIsOpen(false);
      setName("");
      setLogin("");
      setCpf("");
      setDateOfBirth("");
      setEmail("");
      setPrimaryPhone("");
      setSecondaryPhone("");
      setState("");
      setCity("");
      setSelectedTags([]);
    } else {
      const error = await response.json();
      toast.error(error.message);
    }
  };

  // Transforma as tags no formato que o react-select espera
  const tagOptions = tags.map((tag) => ({
    value: tag.id,
    label: tag.name,
    color: tag.color,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Cliente</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo e cadastre um cliente.
          </DialogDescription>
        </DialogHeader>

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
            <Label htmlFor="tags" className="text-right">
              Tags
            </Label>
            <Select
              id="tags"
              options={tagOptions}
              isMulti
              value={tagOptions.filter((option) =>
                selectedTags.includes(option.value),
              )}
              onChange={(selectedOptions) => {
                setSelectedTags(selectedOptions.map((option) => option.value));
              }}
              className="col-span-3"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#e2e8f0",
                  "&:hover": {
                    borderColor: "#e2e8f0",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#e2e8f0",
                }),
                multiValueLabel: (base) => ({
                  ...base,
                  color: "#1e293b",
                }),
                multiValueRemove: (base) => ({
                  ...base,
                  color: "#1e293b",
                  ":hover": {
                    backgroundColor: "#cbd5e1",
                    color: "#1e293b",
                  },
                }),
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="login" className="text-right">
              Login
            </Label>
            <Input
              id="login"
              type="text"
              className="col-span-3"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cpf" className="text-right">
              CPF
            </Label>
            <IMaskInput
              id="cpf"
              mask="000.000.000-00"
              className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={cpf}
              onAccept={(value) => setCpf(value)} // Usando onAccept para capturar o valor
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data-nascimento" className="text-right">
              Data de Nascimento
            </Label>
            <IMaskInput
              id="data-nascimento"
              mask="00/00/0000"
              className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateOfBirth}
              onAccept={(value) => setDateOfBirth(value)} // Corrigido
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefone-princ" className="text-right">
              Telefone Principal
            </Label>
            <IMaskInput
              id="telefone-princ"
              mask="(00) 00000-0000"
              className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={primaryPhone}
              onAccept={(value) => setPrimaryPhone(value)} // Corrigido
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telefone-sec" className="text-right">
              Telefone Secundário
            </Label>
            <IMaskInput
              id="telefone-sec"
              mask="(00) 00000-0000"
              className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={secondaryPhone}
              onAccept={(value) => setSecondaryPhone(value)} // Corrigido
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estado" className="text-right">
              Estado
            </Label>
            <select
              id="estado"
              className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            >
              <option value="">Selecione um estado</option>
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
              className="col-span-3 rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!state}
            >
              <option value="">Selecione uma cidade</option>
              {cities.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit">Cadastrar cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterClientDialog;
