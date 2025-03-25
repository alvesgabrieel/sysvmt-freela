export function parseBrazilianDate(dateString: string): Date {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day); // Mês é 0-indexed no JS (janeiro = 0)
}
