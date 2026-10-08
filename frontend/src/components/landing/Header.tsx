import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const NAV = [["Cómo funciona", "#como-funciona"], ["Capacidades", "#capacidades"], ["Seguridad", "#seguridad"], ["Preguntas", "#preguntas"]];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm font-medium text-ink-700 md:flex">
          {NAV.map(([l, h]) => <a key={h} href={h} className="hover:text-ink-900">{l}</a>)}
        </nav>
        <Link href="/app" className="btn">Probar el motor</Link>
      </div>
    </header>
  );
}
