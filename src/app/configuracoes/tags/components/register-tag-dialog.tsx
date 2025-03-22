"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RegisterTagDialogProps {
  onTagCreated: (tag: { id: number; name: string; color: string }) => void;
}

const RegisterTagDialog: React.FC<RegisterTagDialogProps> = ({ onTagCreated }) => {
    const [name, setName] = useState("");
    const [color, setColor] = useState("#000000");
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar a visibilidade do modal

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await fetch("/api/tag/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, color }),
        });

        if (response.ok) {
            const result = await response.json();
            toast.success(result.message);
            onTagCreated(result.tag); // Atualiza a lista no componente pai
            setIsOpen(false); // Fecha o modal após o cadastro
            setName(""); // Limpa os campos do formulário
            setColor("#000000");
        } else {
            const error = await response.json();
            toast.error(error.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setIsOpen(true)}>Cadastrar Tag</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar Tag</DialogTitle>
                    <DialogDescription>Preencha as informações abaixo e cadastre uma TAG.</DialogDescription>
                </DialogHeader>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-4 p-5 w-3xs">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nome</Label>
                        <Input
                            id="name"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">Cor</Label>
                        <Input
                            id="color"
                            type="color"
                            className="col-span-3"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Salvar Tag</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterTagDialog;
