const fmt = new Intl.NumberFormat("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

/** Format integer LKR cents as "Rs. 12,500" */
export function formatLKR(cents: number) {
  return `Rs. ${fmt.format(Math.round(cents / 100))}`;
}

/** Format direct LKR Rupee amount as "Rs. 12,500" */
export function formatRupees(rupees: number) {
  if (rupees === undefined || rupees === null || isNaN(rupees)) return "Rs. 0";
  return `Rs. ${fmt.format(Math.round(rupees))}`;
}

export const lkr = (rupees: number) => Math.round(rupees * 100);

export function stockLabel(stock: number) {
  if (stock <= 0) return { text: "Out of stock", tone: "out" as const };
  if (stock <= 5) return { text: `Only ${stock} left`, tone: "low" as const };
  return { text: "In stock", tone: "in" as const };
}
