export function formatPercentage(value: number): string {
  // Converte o número para string e substitui ponto por vírgula
  return value.toString().replace(".", ",");
}
