"use client";

import { EyeIcon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/app/components/loader";
import Sidebar from "@/app/components/sidebar";
import TopBar from "@/app/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EditTagDialog } from "./components/edit-tag-dialog";
import RegisterTagDialog from "./components/register-tag-dialog";

interface Tag {
  id: number;
  name: string;
  color: string;
}

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);

  // Adicione o estado para controlar o diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);

  // Função para abrir o diálogo de edição
  const handleViewMore = (tag: Tag) => {
    setSelectedTag(tag); // Define o ingresso selecionado
    setIsEditDialogOpen(true); // Abre o diálogo
  };

  // Função para fechar o diálogo e limpar o estado
  const handleCloseDialog = () => {
    setIsEditDialogOpen(false); // Fecha o diálogo
    setSelectedTag(null); // Limpa o ingresso selecionado
  };

  // Função para salvar as alterações
  const handleSaveTag = (updatedTag: Tag) => {
    setTags((prevTag) =>
      prevTag.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)),
    );
  };

  // Função para adicionar uma nova tag à lista
  const handleTagCreated = (newTag: {
    id: number;
    name: string;
    color: string;
  }) => {
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
      } finally {
        setInitialLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleDeleteTag = async (tagId: number) => {
    try {
      const response = await fetch(`/api/tag/delete?id=${tagId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Tag excluída com sucesso!");

        setTags((prevTag) => prevTag.filter((tag) => tag.id !== tagId));
      } else {
        toast.error("Erro ao excluir a tag");
      }
    } catch (error) {
      toast.error("Erro ao excluir a tag");
      console.error("Erro ao excluir a tag:", error);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-1 items-center justify-center p-6">
          <Loader fullScreen={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 space-y-6 p-6">
        <TopBar />

        <RegisterTagDialog onTagCreated={handleTagCreated} />

        {/* Tabela de Tags */}
        {tags.length > 0 ? (
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
                    <div
                      className="h-6 w-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleViewMore(tag)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteTag(tag.id)}
                      className="ml-3"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Loader fullScreen={false} />
        )}

        {selectedTag && (
          <EditTagDialog
            tag={selectedTag}
            isOpen={isEditDialogOpen}
            onClose={handleCloseDialog} // Fecha o diálogo e limpa o estado
            onSave={handleSaveTag}
          />
        )}
      </div>
    </div>
  );
};

export default Tags;
