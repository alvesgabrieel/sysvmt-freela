"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface Route {
  name: string;
  path: string;
  menuPai: string; // Adicionamos o menu pai aqui
}

const TopBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Rotas com menu pai
  const routes: Route[] = [
    { name: "Acompanhantes", path: "/clientes/acompanhante", menuPai: "Clientes" },
    { name: "Clientes", path: "/clientes/cliente", menuPai: "Clientes" },
    { name: "Vendas", path: "/dashboard", menuPai: "Dashboard" },
    { name: "Cashback", path: "/dashboard/cashback", menuPai: "Dashboard" },
    { name: "Tags", path: "/configuracoes/tags", menuPai: "Configurações" },
    { name: "Ingressos", path: "/configuracoes/ingressos", menuPai: "Configurações" },
    { name: "Vendedor", path: "/configuracoes/vendedor", menuPai: "Configurações" },
    { name: "Hospedagem", path: "/configuracoes/hospedagem", menuPai: "Configurações" },
    { name: "Operadora", path: "/configuracoes/operadora", menuPai: "Configurações" },
    { name: "Vendas", path: "/relatorios/vendas", menuPai: "Relatórios" },
    { name: "Agência", path: "/comissoes/agencia", menuPai: "Comissões" },
    { name: "Vendedor", path: "/comissoes/vendedor", menuPai: "Comissões" },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredRoutes([]);
      return;
    }

    // Filtra as rotas que correspondem ao termo de busca
    const filtered = routes.filter((route) =>
      route.name.toLowerCase().includes(query.toLowerCase()) ||
      route.menuPai.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRoutes(filtered);
  };

  const handleSearchSubmit = () => {
    if (!isClient || filteredRoutes.length === 0) return;
    router.push(filteredRoutes[0].path);
    setFilteredRoutes([]);
    setSearchQuery("");
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow relative">
      <div className="flex items-center w-full max-w-md gap-2">
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          className="flex-1"
        />
        <button
          onClick={handleSearchSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Buscar
        </button>
      </div>
      {filteredRoutes.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 z-10">
          {filteredRoutes.map((route) => (
            <li
              key={route.path}
              onClick={() => router.push(route.path)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-semibold">{route.menuPai}</div>
              <div className="text-sm text-gray-600">{route.name}</div>
            </li>
          ))}
        </ul>
      )}
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