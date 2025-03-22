"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import Metrics from "@/app/components/metrics";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import RegisterTagDialog from "./components/register-tag-dialog";

const Tags = () => {
    const [tags, setTags] = useState<{ id: number; name: string; color: string }[]>([]);

    // Função para adicionar uma nova tag à lista
    const handleTagCreated = (newTag: { id: number; name: string; color: string }) => {
        setTags((prevTags) => [...prevTags, newTag]);
    };

    // Buscar as tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch("/api/tag/read");
                if (response.ok) {
                    const result = await response.json();
                    setTags(result.tags);
                } else {
                    toast.error("Erro ao carregar as tags");
                }
            } catch (Err) {
                toast.error("Erro ao carregar as tags");
                console.error("Erro ao carregar as tags", Err);
            }
        };
        fetchTags();
    }, []);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6 space-y-6">
                <TopBar />
                <Metrics />
                <RegisterTagDialog onTagCreated={handleTagCreated} />
                
                {/* Tabela de Tags */}
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Cor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell>{tag.name}</TableCell>
                                <TableCell>
                                    <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: tag.color }}></div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Tags;
