import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterHostingDialog = () => {
    return ( 
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Cadastrar Hospedagem</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px]">
                <DialogHeader>
                <DialogTitle>Cadastrar Hospedagem</DialogTitle>
                <DialogDescription>
                    Preencha as informações abaixo e cadastre uma hospedagem.
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
                <Label htmlFor="estado" className="text-right">
                  Estado
                </Label>
                <select
                  id="estado"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um estado</option>
                  <option value="1">RN</option>
                  <option value="2">SP</option>
                  <option value="3">RJ</option>
                </select>
              </div><div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cidade" className="text-right">
                  Cidade
                </Label>
                <select
                  id="cidade"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma cidade</option>
                  <option value="1">Natal</option>
                  <option value="2">São Paulo</option>
                  <option value="3">Rio de Janeiro</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observacao" className="text-right">
                  Observação
                </Label>
                <textarea
                  id="observacao"
                  className="col-span-3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4} // Define o número de linhas visíveis
                  placeholder="Digite suas observações..."
                />
              </div>
             
            </div>          
        

        <DialogFooter>
          <Button type="submit">Cadastrar hospedagem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
     );
}
 
export default RegisterHostingDialog;