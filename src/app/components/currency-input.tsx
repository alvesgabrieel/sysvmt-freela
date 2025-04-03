const CurrencyInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const formatCurrencyForInput = (value: string): string => {
    let digits = value.replace(/\D/g, "");
    digits = digits.padStart(3, "0");
    let formatted = digits.replace(/(\d{2})$/, ",$1");
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (formatted.startsWith("0") && formatted.length > 4) {
      formatted = formatted.replace(/^0+/, "");
    }
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    onChange(formatCurrencyForInput(digits));
  };

  const handleBlur = () => {
    if (!value.includes(",")) {
      onChange(formatCurrencyForInput(value + "00"));
    }
  };

  return (
    <input
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
};

export default CurrencyInput;
