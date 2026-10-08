import { AlertTriangle, ShieldAlert } from "lucide-react";

export function Alert({ kind = "error", children }: { kind?: "error" | "warn"; children: React.ReactNode }) {
  const err = kind === "error";
  const Icon = err ? ShieldAlert : AlertTriangle;
  return (
    <div role="alert" className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${
      err ? "border-red-200 bg-red-50 text-red-900" : "border-gold-200 bg-gold-100/60 text-ink-900"}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${err ? "text-red-600" : "text-gold-600"}`} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
