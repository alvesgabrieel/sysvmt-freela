"use client";

import { useState } from "react";

import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ComissoesVendedor = () => {
    const [filters, setFilters] = useState({ idVenda: "" });
    return ( 
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6 space-y-6">
                {/* Barra de cima  */}
                <TopBar />
                {/* Cards de métricas */}
                <Metrics />

                {/* Filtros */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-4 gap-4">
                        {Object.keys(filters).map((key) => (
                        <Input
                            key={key}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={filters[key as keyof typeof filters]}
                            onChange={(e) =>
                            setFilters({ ...filters, [key]: e.target.value })
                            }
                        />
                        ))}
                    </CardContent>
                </Card>
                
            </div>
        </div>
     );
}
 
export default ComissoesVendedor;