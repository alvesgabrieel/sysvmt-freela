"use client";

import { ChevronDown, Home, LogOut, Settings, ShoppingCart, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const menuItems = [
  {
    name: "Vendas",
    icon: Home,
    subItems: [
      { name: "Vendas", path: "/dashboard" },
      { name: "Cashback", path: "/dashboard/cashback" },
    ],
  },
  {
    name: "Clientes",
    icon: ShoppingCart,
    subItems: [
      { name: "Acompanhantes", path: "/clientes/acompanhante" },
      { name: "Clientes", path: "/clientes/cliente" },
    ],
  },
  {
    name: "Configurações",
    icon: Settings,
    subItems: [
      { name: "Tags", path: "/configuracoes/tags" },
      { name: "Ingressos", path: "/configuracoes/ingressos" },
      { name: "Vendedor", path: "/configuracoes/vendedor" },
      { name: "Hospedagem", path: "/configuracoes/hospedagem" },
      { name: "Operadora", path: "/configuracoes/operadora" },
    ],
  },
  {
    name: "Relatórios",
    icon: Users,
    subItems: [{ name: "Vendas", path: "/relatorios/vendas" }],
  },
  {
    name: "Comissões",
    icon: User,
    subItems: [
      { name: "Agência", path: "/comissoes/agencia" },
      { name: "Vendedor", path: "/comissoes/vendedor" },
    ],
  },
];

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setActiveMenu((prev) => (prev === name ? null : name));
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // 🔥 Remove o token do usuário
    router.push("/signin"); // 🔄 Redireciona para a tela de login
    toast.success("Logout realizado com sucesso!");
  };

  return (
    <div
      className={`h-screen bg-[#343a40] shadow-md flex flex-col p-4 transition-all duration-300 sticky top-0 ${
        isOpen ? "w-64" : "w-18"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={handleMouseLeave}
    >
      <h2
        className={`text-2xl font-bold text-center mb-6 transition-all text-white ${
          isOpen ? "opacity-100" : "opacity-100"
        }`}
      >
        {isOpen ? "SysVMT" : "S"}
      </h2>

      {/* Menu de Navegação */}
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.name}>
            <button
              onClick={() => toggleMenu(item.name)}
              className="flex items-center gap-4 p-3 w-full rounded-lg hover:bg-gray-800 transition"
            >
              <item.icon className="w-5 h-5 text-white" />
              <span className={`flex-1 transition-opacity text-white ${isOpen ? "opacity-100" : "hidden"}`}>
                {item.name}
              </span>
              {isOpen && (
                <ChevronDown className={`transition-transform text-white ${activeMenu === item.name ? "rotate-180" : ""}`} />
              )}
            </button>
            {activeMenu === item.name && (
              <div className="ml-8 space-y-2">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.path}
                    className="block p-2 text-sm text-white hover:bg-gray-800 rounded"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Botão de Logout */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 p-3 w-full rounded-lg hover:bg-red-700 transition"
        >
          <LogOut className="w-5 h-5 text-white" />
          <span className={`flex-1 transition-opacity text-white ${isOpen ? "opacity-100" : "hidden"}`}>
            Sair
          </span>
        </button>
      </div>
    </div>
  );
}