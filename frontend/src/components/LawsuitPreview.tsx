"use client";
import { ArrowLeft, Download } from "lucide-react";
import { useState } from "react";
import { generateLawsuit } from "@/lib/api";
import { fmtClp } from "@/lib/format";
import { normalizeRut } from "@/lib/rut";
import type { Attorney, DayCount, Instrument, Ledger } from "@/lib/types";
import { Alert } from "./Alert";
import { Field } from "./ui/Field";

interface Props {
  instrument: Instrument;
  ledger: Ledger;
  cutoff: string;
  dayCount: DayCount;
  attorney: Attorney;
  onAttorney: (a: Attorney) => void;
  onInstrument: (i: Instrument) => void;
  onBack: () => void;
}

export function LawsuitPreview({ instrument, ledger, cutoff, dayCount, attorney, onAttorney, onInstrument, onBack }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const court = instrument.jurisdiction ?? { court_name: "", city: "" };
  const att = (patch: Partial<Attorney>) => onAttorney({ ...attorney, ...patch });
  const rutBad = attorney.rut.trim() !== "" && !normalizeRut(attorney.rut);
  const otrosies = ["Acompaña título en custodia", "Señala bienes para el embargo",
    ...(instrument.creditor_representatives?.length ? ["Acredita personería"] : []), "Patrocinio y poder"];

  async function download() {
    setError(null);
    const rut = normalizeRut(attorney.rut);
    if (!attorney.name.trim() || !attorney.address.trim()) return setError("Complete nombre y domicilio del abogado.");
    if (!rut) return setError("RUT del abogado inválido (verifique el dígito verificador).");
    if (!court.court_name.trim() || !court.city.trim()) return setError("Indique el tribunal y la ciudad.");
    setBusy(true);
    try {
      const blob = await generateLawsuit(
        instrument, { ...attorney, rut, email: attorney.email || undefined, bar_details: attorney.bar_details || undefined },
        cutoff, dayCount);
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: "demanda_ejecutiva.docx" });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-6">
      <div>
        <h2 className="text-xl font-semibold">3. Demanda ejecutiva</h2>
        <p className="mt-1 text-sm text-ink-600">Datos del abogado patrocinante y del tribunal. El documento se genera como borrador editable.</p>
      </div>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold">Abogado patrocinante</legend>
        <Field label="Nombre completo" value={attorney.name} onChange={(e) => att({ name: e.target.value })} />
        <div>
          <Field label="RUT" value={attorney.rut} placeholder="11.111.111-1" aria-invalid={rutBad}
            className={rutBad ? "!border-red-400" : ""} onChange={(e) => att({ rut: e.target.value })} />
          {rutBad && <p className="mt-1 text-xs text-red-700">Dígito verificador inválido.</p>}
        </div>
        <Field label="Domicilio" value={attorney.address} onChange={(e) => att({ address: e.target.value })} />
        <Field label="Correo (opcional)" type="email" value={attorney.email ?? ""} onChange={(e) => att({ email: e.target.value })} />
        <Field wide label="Colegio / registro profesional (opcional)" value={attorney.bar_details ?? ""} onChange={(e) => att({ bar_details: e.target.value })} />
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-semibold">Tribunal competente</legend>
        <Field label="Tribunal" value={court.court_name} placeholder="12° Juzgado Civil de Santiago"
          onChange={(e) => onInstrument({ ...instrument, jurisdiction: { ...court, court_name: e.target.value } })} />
        <Field label="Ciudad" value={court.city}
          onChange={(e) => onInstrument({ ...instrument, jurisdiction: { ...court, city: e.target.value } })} />
      </fieldset>
      <div className="rounded-lg border border-line bg-paper p-4 text-sm">
        <p className="label">Contenido del borrador</p>
        <p>Monto demandado al {cutoff}: <strong>{fmtClp(ledger.total_clp)}</strong> ({ledger.day_count})</p>
        <p className="mt-1 text-ink-700">Suma · Hechos · Derecho · Petitorio · Otrosíes: {otrosies.join(" · ")} · Anexo de liquidación</p>
      </div>
      <Alert kind="warn">Borrador sujeto a revisión y firma del abogado. El sistema no presenta nada en la OJV.</Alert>
      {!ledger.rate_table_verified && <Alert kind="warn">Las tasas CMF cargadas no están verificadas.</Alert>}
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-3 border-t border-line pt-5">
        <button className="btn-ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" aria-hidden />Volver</button>
        <button className="btn-gold" disabled={busy} onClick={download}>
          <Download className="h-4 w-4" aria-hidden />{busy ? "Generando…" : "Descargar Demanda (.docx)"}
        </button>
      </div>
    </section>
  );
}
