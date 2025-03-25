export function parseBrazilianNumber(numberString: string): number {
  // Remove pontos (separadores de milhar) e substitui vírgula por ponto
  const cleanNumber = numberString.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleanNumber);
}
