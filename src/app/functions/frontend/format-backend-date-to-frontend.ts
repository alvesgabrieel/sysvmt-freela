// // Função para formatar a data ISO (backend) para DD/MM/AAAA (frontend)
// export function formatBackendDateToFrontend(backendDate: string): string {
//   if (!backendDate) return "";

//   try {
//     // Tenta parsear a data diretamente
//     const date = new Date(backendDate);
//     if (isNaN(date.getTime())) throw new Error("Data inválida");

//     const day = date.getDate().toString().padStart(2, "0");
//     const month = (date.getMonth() + 1).toString().padStart(2, "0");
//     const year = date.getFullYear();

//     return `${day}/${month}/${year}`;
//   } catch (error) {
//     console.error("Erro ao formatar data:", backendDate, error);
//     return "";
//   }
// }

export function formatBackendDateToFrontend(dateString: string): string {
  if (!dateString) return "";

  // Cria a data no UTC para evitar problemas de fuso horário
  const date = new Date(dateString);

  // Se a data for inválida, retorna string vazia
  if (isNaN(date.getTime())) return "";

  // Usa os métodos UTC para obter dia, mês e ano corretos
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}
