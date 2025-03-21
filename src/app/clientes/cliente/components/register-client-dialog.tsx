import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterCompanionDialog = () => {
    return ( 
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Cadastrar Cliente</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
                <DialogHeader>
                <DialogTitle>Cadastrar Cliente</DialogTitle>
                <DialogDescription>
                    Preencha as informações abaixo e cadastre um cliente.
                </DialogDescription>
                </DialogHeader>

       
        {/* Scrollable Area */}
        
          {/* Conteúdo das Abas */}
          {/* Gerais */}
            <div className="space-y-4 p-5">

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nome" className="text-right">
                  Nome
                </Label>
                <Input id="nome" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="login" className="text-right">
                  Login
                </Label>
                <Input id="login" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cpf" className="text-right">
                  Cpf
                </Label>
                <Input id="cpf" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-nascimento" className="text-right">
                    Data de nascimento
                </Label>
                <Input id="data-nascimento" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    E-mail
                </Label>
                <Input id="email" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone-princ" className="text-right">
                    Telefone principal
                </Label>
                <Input id="telefone-princ" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefone-sec" className="text-right">
                    Telefone secundário
                </Label>
                <Input id="telefone-sec" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estado" className="text-right">
                    Estado
                </Label>
                <Input id="estado" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cidade" className="text-right">
                    Cidade
                </Label>
                <Input id="cidade" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <select
                  id="tags"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma tag</option>
                  <option value="1">TAG1</option>
                  <option value="2">TAG2</option>
                  <option value="3">TAG3</option>
                </select>
              </div>
              
              
             
            </div>          
        

        <DialogFooter>
          <Button type="submit">Cadastrar cliente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     );
}
 
export default RegisterCompanionDialog;