import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = { title: "LegalTech Chile — Liquidación y demanda ejecutiva" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
