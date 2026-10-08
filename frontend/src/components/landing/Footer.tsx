import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md space-y-3">
          <Logo />
          <p className="text-xs leading-relaxed text-ink-500">
            Herramienta de apoyo para profesionales del derecho. No constituye asesoría legal. Los borradores deben ser revisados y
            firmados por un abogado habilitado. El sistema no presenta escritos en la Oficina Judicial Virtual.
          </p>
        </div>
        <p className="text-xs text-ink-500">© {new Date().getFullYear()} LegalTech Chile · Prototipo</p>
      </div>
    </footer>
  );
}
