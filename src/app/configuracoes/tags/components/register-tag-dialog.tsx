import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterTagDialog = () => {
    return ( 
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Cadastrar Tag</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
                <DialogHeader>
                <DialogTitle>Cadastrar Tag</DialogTitle>
                <DialogDescription>
                    Preencha as informações abaixo e cadastre uma TAG.
                </DialogDescription>
                </DialogHeader>

       
        {/* Scrollable Area */}
        
          {/* Conteúdo das Abas */}
          {/* Gerais */}
            <div className="space-y-4 p-5 w-3xs">

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cliente" className="text-right">
                  Nome
                </Label>
                <Input id="cliente" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cor" className="text-right">
                    Cor
                </Label>
                <Input id="cor" type="color" className="col-span-3" />
              </div>
             
            </div>          
        

        <DialogFooter>
          <Button type="submit">Salvar Tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     );
}
 
export default RegisterTagDialog;