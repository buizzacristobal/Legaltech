export const fmtClp = (v: string) => "$" + Number(v).toLocaleString("es-CL", { maximumFractionDigits: 0 });
export const fmtUf = (v: string) =>
  Number(v).toLocaleString("es-CL", { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + " UF";
export const fmtPct = (v: string) => Number(v).toFixed(2).replace(".", ",") + "%";
export const fmtMoney = (v: string, currency: "CLP" | "UF") => (currency === "UF" ? fmtUf(v) : fmtClp(v));
export const CATEGORY_LABEL: Record<string, string> = {
  non_reajustable_clp_under_50_uf: "No reajustable CLP ≤ 50 UF",
  non_reajustable_clp_50_to_200_uf: "No reajustable CLP 50–200 UF",
  non_reajustable_clp_over_200_uf: "No reajustable CLP ≥ 200 UF",
  reajustable_uf_all: "Reajustable UF",
};
