"use client";

import { useState } from "react";
import { IMaskInput } from "react-imask";
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

const RegisterTourOperatorDialog = () => {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [site, setSite] = useState<string>("");
  const [login, setLogin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [upfrontComission, setUpfrontComission] = useState<string>("");
  const [installmentComission, setInstallmentComission] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/touroperator/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        contact,
        email,
        site,
        login,
        password,
        upfrontComission,
        installmentComission,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      toast.success(result.message);
      setIsOpen(false);
      setName("");
      setPhone("");
      setContact("");
      setEmail("");
      setSite("");
      setLogin("");
      setPassword("");
      setUpfrontComission("");
      setInstallmentComission("");
    } else {
      const error = await response.json();
      toast.error(error.message);
    }
  };

  const handleFloatInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const value = e.target.value;

    // Permitir números flutuantes (pode ter um ponto decimal, mas não mais de um)
    if (/^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar operadora
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Cadastrar operadora</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo e cadastre uma operadora.
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
            <Label htmlFor="telefone" className="text-right">
              Telefone
            </Label>
            <IMaskInput
              id="telefone"
              mask="(00) 0000-0000" // Máscara para telefone
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring col-span-3 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={phone}
              onAccept={(value) => setPhone(value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contato" className="text-right">
              Contato
            </Label>
            <Input
              id="contato"
              type="text"
              className="col-span-3"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-mail
            </Label>
            <Input
              id="email"
              type="text"
              className="col-span-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="site" className="text-right">
              Site
            </Label>
            <Input
              id="site"
              type="text"
              className="col-span-3"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              required
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
            <Label htmlFor="senha" className="text-right">
              Senha
            </Label>
            <Input
              id="senha"
              type="text"
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comissao-a-vista" className="text-right">
              Comissão à vista
            </Label>
            <Input
              id="comissao-a-vista"
              type="text" // Usando tipo text para controlar a entrada
              className="col-span-3"
              value={upfrontComission}
              onChange={(e) => handleFloatInput(e, setUpfrontComission)}
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comissao-parcelada" className="text-right">
              Comissão parcelada
            </Label>
            <Input
              id="comissao-parcelada"
              type="text" // Usando tipo text para controlar a entrada
              className="col-span-3"
              value={installmentComission}
              onChange={(e) => handleFloatInput(e, setInstallmentComission)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Cadastrar operadora</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterTourOperatorDialog;
