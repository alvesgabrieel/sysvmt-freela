import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterCompanionDialog = () => {
    return ( 
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Cadastrar Acompanhante</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
                <DialogHeader>
                <DialogTitle>Cadastrar Acompanhante</DialogTitle>
                <DialogDescription>
                    Preencha as informações abaixo e cadastre um acompanhante.
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
                    telefone
                </Label>
                <Input id="telefone" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                    E-mail
                </Label>
                <Input id="email" type="text" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-nascimento" className="text-right">
                    Data de nascimento
                </Label>
                <Input id="data-nascimento" type="text" className="col-span-3" />
              </div>
             
            </div>          
        

        <DialogFooter>
          <Button type="submit">Cadastrar acompanhante</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     );
}
 
export default RegisterCompanionDialog;