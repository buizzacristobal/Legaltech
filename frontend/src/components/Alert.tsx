export function Alert({ kind = "error", children }: { kind?: "error" | "warn"; children: React.ReactNode }) {
  const cls = kind === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-amber-300 bg-amber-50 text-amber-900";
  return <div role="alert" className={`rounded border px-3 py-2 text-sm ${cls}`}>{children}</div>;
}
