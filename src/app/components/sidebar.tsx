"use client";

import {
  ChevronDown,
  DollarSign,
  FileText,
  Home,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
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
    icon: Users,
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
      { name: "Cashback", path: "/configuracoes/cashback" },
    ],
  },
  {
    name: "Relatórios",
    icon: FileText,
    subItems: [{ name: "Vendas", path: "/relatorios/vendas" }],
  },
  {
    name: "Comissões",
    icon: DollarSign,
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
      className={`sticky top-0 flex h-screen flex-col bg-[#343a40] p-4 shadow-md transition-all duration-300 ${
        isOpen ? "w-64" : "w-18"
      } overflow-hidden`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={handleMouseLeave}
    >
      <h2
        className={`mb-6 text-center text-2xl font-bold text-white transition-all ${
          isOpen ? "opacity-100" : "opacity-100"
        }`}
      >
        {isOpen ? "SysVMT" : "S"}
      </h2>

      {/* Menu de Navegação */}
      <nav className="flex-1 space-y-4 overflow-hidden group-hover:overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.name}>
            <button
              onClick={() => toggleMenu(item.name)}
              className="flex w-full items-center gap-4 rounded-lg p-3 transition hover:bg-gray-800"
            >
              <item.icon className="h-5 w-5 text-white" />
              <span
                className={`flex-1 text-white transition-opacity ${isOpen ? "opacity-100" : "hidden"}`}
              >
                {item.name}
              </span>
              {isOpen && (
                <ChevronDown
                  className={`text-white transition-transform ${activeMenu === item.name ? "rotate-180" : ""}`}
                />
              )}
            </button>
            {activeMenu === item.name && (
              <div className="ml-8 space-y-2">
                {item.subItems.map((sub) => (
                  <Link
                    key={sub.name}
                    href={sub.path}
                    className="block rounded p-2 text-sm text-white hover:bg-gray-800"
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
          className="flex w-full items-center gap-4 rounded-lg p-3 transition hover:bg-red-700"
        >
          <LogOut className="h-5 w-5 text-white" />
          <span
            className={`flex-1 text-white transition-opacity ${isOpen ? "opacity-100" : "hidden"}`}
          >
            Sair
          </span>
        </button>
      </div>
    </div>
  );
}
