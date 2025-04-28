"use client";

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const TopBar: React.FC = () => {
  const [userName, setUserName] = useState<string>("Usuário");

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  return (
    <div className="relative flex items-center justify-end rounded-lg bg-white p-4 shadow">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold">{userName}</span>
      </div>
    </div>
  );
};

export default TopBar;
