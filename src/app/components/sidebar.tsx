"use client";

import { Home, ShoppingCart, Users, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const menuItems = [
  {
    name: "Vendas",
    icon: Home,
    subItems: [
      { name: "Vendas", path: "/dashboard/overview" },
      { name: "Cashback", path: "/dashboard/analytics" },
    ],
  },
  {
    name: "Clientes",
    icon: ShoppingCart,
    subItems: [
      { name: "Acompanhantes", path: "/orders/all" },
      { name: "Clientes", path: "/orders/pending" },
    ],
  },
  {
    name: "Configurações",
    icon: Users,
    subItems: [
      { name: "Tags", path: "/users/customers" },
      { name: "Ingressos", path: "/users/admins" },
      { name: "Vendedor", path: "/users/admins" },
      { name: "Hospedagem", path: "/users/admins" },
      { name: "Operadora", path: "/users/admins" },
    ],
  },
  {
    name: "Relatórios",
    icon: Settings,
    subItems: [{ name: "Vendas", path: "/settings/profile" }],
  },
  {
    name: "Comissões",
    icon: Settings,
    subItems: [
      { name: "Agência", path: "/settings/profile" },
      { name: "Vendedor", path: "/settings/profile" },
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div
      className={`h-screen bg-[#343a40] shadow-md flex flex-col p-4 transition-all duration-300 ${
        isOpen ? "w-64" : "w-18"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <h2
        className={`text-2xl font-bold text-center mb-6 transition-all text-white ${
          isOpen ? "opacity-100" : "opacity-100"
        }`}
      >
        {isOpen ? "SysVMT" : "S"}
      </h2>
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.name}>
            <button
              onClick={() => toggleMenu(item.name)}
              className="flex items-center gap-4 p-3 w-full rounded-lg hover:bg-gray-800 transition"
            >
              <item.icon
                className={`transition-all text-white ${
                  isOpen ? "w-5 h-5" : "w-5 h-5"
                }`}
              />
              <span
                className={`flex-1 transition-opacity text-white ${
                  isOpen ? "opacity-100" : "hidden"
                }`}
              >
                {item.name}
              </span>
              {isOpen && (
                <ChevronDown
                  className={`transition-transform text-white ${
                    openMenus[item.name] ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
            {openMenus[item.name] && (
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
    </div>
  );
}
