import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LegalTech Chile — Liquidación CMF y demanda ejecutiva",
  description: "Extraiga pagarés y facturas, liquide la deuda día a día con tasas CMF topadas a la TMC y obtenga un borrador de demanda ejecutiva para revisión del abogado.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
