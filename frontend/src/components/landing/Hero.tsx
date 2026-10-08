import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ProductMock } from "./ProductMock";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,rgba(184,137,59,.22),transparent),radial-gradient(40rem_25rem_at_-10%_110%,rgba(53,81,127,.45),transparent)]" />
      <div className="container-x relative grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_1fr] lg:py-28">
        <div>
          <p className="eyebrow !text-gold-400">Para abogados litigantes y gestores de cobranza</p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
            De pagaré a demanda ejecutiva, con cada peso <span className="text-gold-400">calculado y trazable.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-300">
            Extraiga los datos del título, liquide la deuda día a día con las tasas CMF topadas a la TMC
            y obtenga un borrador de demanda listo para la revisión y firma del abogado.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/app" className="btn-gold">Probar el motor <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            <a href="#como-funciona" className="inline-flex items-center rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">Ver cómo funciona</a>
          </div>
          <p className="mt-8 flex items-center gap-2 text-sm text-ink-300">
            <ShieldCheck className="h-4 w-4 text-gold-400" aria-hidden />
            Cálculo determinista · Sin presentación automática en la OJV · Sin retención de documentos
          </p>
        </div>
        <ProductMock />
      </div>
    </section>
  );
}
