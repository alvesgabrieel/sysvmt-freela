export const formatCurrency = (value: number | string): string => {
  // Converte para número se for string
  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  // Formata para o padrão brasileiro
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue);
};
