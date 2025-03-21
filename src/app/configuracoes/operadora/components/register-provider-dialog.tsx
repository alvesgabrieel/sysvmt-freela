import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterHostingDialog = () => {
    return ( 
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Cadastrar operadora</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
                <DialogHeader>
                <DialogTitle>Cadastrar operadora</DialogTitle>
                <DialogDescription>
                    Preencha as informações abaixo e cadastre uma operadora.
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
                <Label htmlFor="telefone" className="text-right">
                  Telefone
                </Label>
                <Input id="telefone" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contato" className="text-right">
                  Contato
                </Label>
                <Input id="contato" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  E-mail
                </Label>
                <Input id="email" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="site" className="text-right">
                  Site
                </Label>
                <Input id="site" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="login" className="text-right">
                  Login
                </Label>
                <Input id="login" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="senha" className="text-right">
                  Senha
                </Label>
                <Input id="senha" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comissao-a-vista" className="text-right">
                  Comissão à vista
                </Label>
                <Input id="comissao-a-vista" type="number" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comissao-parcelada" className="text-right">
                  Comissão parcelada
                </Label>
                <Input id="comissao-parcelada" type="number" className="col-span-3" />
              </div>
             
            </div>          
        

        <DialogFooter>
          <Button type="submit">Cadastrar operadora</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     );
}
 
export default RegisterHostingDialog;