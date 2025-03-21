import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";



const TopBar = () => {
    return (   

      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <Input placeholder="Buscar..." className="w-1/3" />
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/avatar.jpg" alt="User" />
              <AvatarFallback>RP</AvatarFallback>
            </Avatar>
            <span className="font-semibold">Rogério Pereira</span>
          </div>
        </div>        
     );

}
export default TopBar;