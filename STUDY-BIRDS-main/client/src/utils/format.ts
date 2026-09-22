export const formatCurrency = (value?: number) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(value)
    : "Contact advisor";

export const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "Flexible";
