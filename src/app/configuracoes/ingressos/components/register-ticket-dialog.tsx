"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCitiesByState,fetchStates } from "@/services/ibge"; // Importando o serviço

interface RegisterTicketDialogProps {
  onTicketCreated: (ticket: { id: number, name: string; state: string; city: string, observation: string }) => void;
}

const RegisterTicketDialog: React.FC<RegisterTicketDialogProps> = ({ onTicketCreated }) => {
    const [name, setName] = useState(""); 
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [observation, setObservation] = useState("");
    const [isOpen, setIsOpen] = useState(false);

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
                console.log(error)
                setCities([]);
            }
        };
        loadCities();
    }, [state, states]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await fetch("/api/ticket/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, state, city, observation }),
        });

        if (response.ok) {
            const result = await response.json();
            toast.success(result.message);
            onTicketCreated(result.ticket);
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
                <Button variant="outline" onClick={() => setIsOpen(true)}>Cadastrar Ingresso</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar Ingresso</DialogTitle>
                    <DialogDescription>
                        Preencha as informações abaixo e cadastre um ingresso.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <Input id="name" type="text" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    {/* Estados */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="estado" className="text-right">
                            Estado
                        </Label>
                        <select
                            id="estado"
                            className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={state} 
                            onChange={(e) => setState(e.target.value)} 
                            required
                        >
                            <option value="">Selecione um estado</option>
                            {states.map((s) => (
                                <option key={s.id} value={s.nome}>
                                    {s.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Cidades */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cidade" className="text-right">
                            Cidade
                        </Label>
                        <select
                            id="cidade"
                            className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
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

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="observacao" className="text-right">
                            Observação
                        </Label>
                        <textarea
                            id="observacao"
                            className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Digite suas observações..."
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Cadastrar ingresso</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterTicketDialog;
