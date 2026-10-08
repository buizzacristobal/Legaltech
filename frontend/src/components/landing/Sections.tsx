import { ArrowRight, Calculator, FileCheck2, FileText, Gavel, Lock, PenLine, ScanText, ScrollText, ShieldCheck, Table2, UserCheck } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { icon: ScanText, title: "Ingrese el título", text: "Pegue el texto o la salida del OCR de un pagaré o factura. La IA solo transcribe los campos y el sistema valida RUT, fechas y totales." },
  { icon: Calculator, title: "Revise la liquidación", text: "Capital, reajuste UF e intereses día a día con la tasa CMF vigente, topada a la TMC. Ajuste fechas y base de días antes de continuar." },
  { icon: FileText, title: "Descargue el borrador", text: "Demanda ejecutiva con suma, hechos, derecho, petitorio, otrosíes y anexo de liquidación en .docx, lista para su revisión." },
];

const FEATURES = [
  { icon: ScrollText, title: "Extracción estructurada", text: "Pagarés (Ley 18.092) y facturas electrónicas (Ley 19.983) a datos validados: partes, montos, fechas y tribunal." },
  { icon: Calculator, title: "Aritmética determinista", text: "Todo el cálculo corre en Python con precisión decimal. La IA no suma, no reajusta ni calcula intereses." },
  { icon: Table2, title: "Planilla auditable", text: "Cada día y cada mes quedan a la vista, con la tasa aplicada, el tramo y las advertencias de tope TMC." },
  { icon: Gavel, title: "Escrito con estructura forense", text: "Citas por tipo de título, intereses compensatorios y moratorios diferenciados, y los otrosíes habituales." },
  { icon: UserCheck, title: "El abogado decide", text: "El sistema genera un borrador editable. La revisión, los bienes a embargar y la firma son suyos." },
  { icon: Lock, title: "Diseñado para la confidencialidad", text: "No almacena los documentos y los mensajes de error no reproducen datos del cliente." },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 py-20 sm:py-24">
      <div className="container-x">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Tres pasos, del título al escrito.</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative">
              <span className="absolute right-5 top-4 font-serif text-5xl font-semibold text-gold-200">{i + 1}</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-900 text-gold-400"><s.icon className="h-5 w-5" aria-hidden /></span>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section id="capacidades" className="scroll-mt-20 border-y border-line bg-white py-20 sm:py-24">
      <div className="container-x">
        <p className="eyebrow">Capacidades</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Precisión donde importa, criterio donde corresponde.</h2>
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <f.icon className="h-6 w-6 text-gold-600" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: UserCheck, title: "Humano en el circuito", text: "Todo documento es un borrador marcado «BORRADOR», sujeto a revisión y firma del abogado patrocinante." },
  { icon: ShieldCheck, title: "Sin automatización en la OJV", text: "El sistema nunca presenta escritos en la Oficina Judicial Virtual. La presentación es siempre manual." },
  { icon: Lock, title: "Cero retención", text: "Los documentos no se guardan ni se registran. Revise los términos de retención de su proveedor de IA antes de usar datos reales." },
  { icon: FileCheck2, title: "Datos verificables", text: "Cada planilla indica la base de días y si las tasas CMF cargadas están verificadas." },
];

export function Trust() {
  return (
    <section id="seguridad" className="scroll-mt-20 bg-ink-950 py-20 text-white sm:py-24">
      <div className="container-x">
        <p className="eyebrow !text-gold-400">Seguridad y ética profesional</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Hecho para el ejercicio responsable de la profesión.</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TRUST.map((t) => (
            <div key={t.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <t.icon className="h-6 w-6 text-gold-400" aria-hidden />
              <h3 className="mt-4 text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{t.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 rounded-lg border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-gold-200">
          <strong>Estado: prototipo.</strong> Las tasas CMF y los valores de UF incluidos son de demostración y no están verificados.
          Reemplácelos por las cifras oficiales antes de cualquier uso real.
        </p>
      </div>
    </section>
  );
}

const FAQ = [
  ["¿La IA calcula los intereses?", "No. La IA solo transcribe los datos del título. El cálculo de capital, reajuste, intereses y tope TMC lo hace un motor determinista con aritmética decimal."],
  ["¿Qué títulos soporta?", "Pagarés (Ley 18.092, art. 434 N° 4 CPC) y facturas electrónicas (Ley 19.983, art. 434 N° 7 CPC). Las citas del escrito cambian según el tipo."],
  ["¿Presenta la demanda por mí?", "No. Genera un borrador .docx. La presentación en la OJV es manual, por diseño."],
  ["¿Qué base de días usa el cálculo?", "Es configurable (ACT/360 o ACT/365) y queda registrada en cada planilla. Confirme con su criterio profesional cuál aplica."],
  ["¿Guarda mis documentos?", "No. El sistema no persiste los documentos ni los incluye en mensajes de error."],
  ["¿Puedo usarlo en un caso real hoy?", "Todavía no sin cargar tasas CMF y UF verificadas. Es un prototipo y no constituye asesoría legal."],
];

export function Faq() {
  return (
    <section id="preguntas" className="scroll-mt-20 py-20 sm:py-24">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Preguntas frecuentes</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Lo que un abogado preguntaría primero.</h2>
        </div>
        <div className="divide-y divide-line rounded-xl border border-line bg-white shadow-card">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {q}<span aria-hidden className="text-xl text-gold-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="container-x pb-20">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink-900 p-8 text-white sm:flex-row sm:items-center sm:p-12">
        <div>
          <PenLine className="h-6 w-6 text-gold-400" aria-hidden />
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Pruebe el flujo completo con un caso de ejemplo.</h2>
          <p className="mt-2 text-sm text-ink-300">Sin registro. Cargue un pagaré de muestra y descargue el borrador en minutos.</p>
        </div>
        <Link href="/app" className="btn-gold shrink-0">Probar el motor <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </div>
    </section>
  );
}
