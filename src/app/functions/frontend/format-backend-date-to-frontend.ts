// Função para formatar a data ISO (backend) para DD/MM/AAAA (frontend)
export function formatBackendDateToFrontend(backendDate: string): string {
  if (!backendDate) return "";

  try {
    // Tenta parsear a data diretamente
    const date = new Date(backendDate);
    if (isNaN(date.getTime())) throw new Error("Data inválida");

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Erro ao formatar data:", backendDate, error);
    return "";
  }
}
