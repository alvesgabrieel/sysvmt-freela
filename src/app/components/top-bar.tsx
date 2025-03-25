import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TopBar: React.FC = () => {
  return (
    <div className="relative flex items-center justify-end rounded-lg bg-white p-4 shadow">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User" />
          <AvatarFallback>RP</AvatarFallback>
        </Avatar>
        <span className="font-semibold">Rogério Pereira</span>
      </div>
    </div>
  );
};

export default TopBar;
