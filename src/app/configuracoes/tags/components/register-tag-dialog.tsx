"use client";

import { Loader } from "lucide-react";
import { useState } from "react";
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

interface RegisterTagDialogProps {
  onTagCreated: (tag: { id: number; name: string; color: string }) => void;
}

const RegisterTagDialog: React.FC<RegisterTagDialogProps> = ({
  onTagCreated,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setIsLoading(true);

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
        onTagCreated(result.tag);
        setIsOpen(false);
        setName("");
        setColor("#000000");
      }
    } catch {
      toast.error("Erro ao cadastrar tag");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setIsOpen(true)}>
          Cadastrar tag
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cadastrar tag</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Cor
            </Label>
            <div className="col-span-3 flex items-center">
              <div className="relative">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute h-10 w-10 cursor-pointer opacity-0"
                />
                <div
                  className="h-10 w-10 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                />
              </div>
              <span className="ml-2 text-sm text-gray-600">{color}</span>
            </div>
          </div>

          <DialogFooter className="justify-end">
            {isLoading ? (
              <Button type="submit" variant="outline" disabled>
                <Loader />
              </Button>
            ) : (
              <Button type="submit" variant="outline">
                Cadastrar tag
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterTagDialog;
