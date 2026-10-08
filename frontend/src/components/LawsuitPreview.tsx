"use client";
import { useState } from "react";
import { generateLawsuit } from "@/lib/api";
import { fmtClp } from "@/lib/format";
import { normalizeRut } from "@/lib/rut";
import type { Attorney, DayCount, Instrument, Ledger } from "@/lib/types";
import { Alert } from "./Alert";

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
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">3. Demanda ejecutiva</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Abogado patrocinante</label>
          <input className="input" value={attorney.name} onChange={(e) => att({ name: e.target.value })} /></div>
        <div><label className="label">RUT</label>
          <input className="input" value={attorney.rut} onChange={(e) => att({ rut: e.target.value })} placeholder="11.111.111-1" /></div>
        <div><label className="label">Domicilio</label>
          <input className="input" value={attorney.address} onChange={(e) => att({ address: e.target.value })} /></div>
        <div><label className="label">Correo (opcional)</label>
          <input className="input" value={attorney.email ?? ""} onChange={(e) => att({ email: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Colegio / registro profesional (opcional)</label>
          <input className="input" value={attorney.bar_details ?? ""} onChange={(e) => att({ bar_details: e.target.value })} /></div>
        <div><label className="label">Tribunal</label>
          <input className="input" value={court.court_name} onChange={(e) => onInstrument({ ...instrument, jurisdiction: { ...court, court_name: e.target.value } })} /></div>
        <div><label className="label">Ciudad</label>
          <input className="input" value={court.city} onChange={(e) => onInstrument({ ...instrument, jurisdiction: { ...court, city: e.target.value } })} /></div>
      </div>
      <div className="rounded bg-slate-50 p-3 text-sm">
        <p><b>Acreedor:</b> {instrument.creditor.name} ({instrument.creditor.rut})</p>
        <p><b>Deudor:</b> {instrument.debtor.name} ({instrument.debtor.rut})</p>
        <p><b>Monto demandado al {cutoff}:</b> {fmtClp(ledger.total_clp)} ({ledger.day_count})</p>
        <p><b>Secciones:</b> Suma, Hechos, Derecho, Petitorio; otrosíes: {otrosies.join(" · ")}; anexo de liquidación.</p>
      </div>
      <Alert kind="warn">Borrador sujeto a revisión y firma del abogado. El sistema no presenta nada en la OJV.</Alert>
      {!ledger.rate_table_verified && <Alert kind="warn">Las tasas CMF cargadas no están verificadas.</Alert>}
      {error && <Alert>{error}</Alert>}
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={onBack}>Volver</button>
        <button className="btn" disabled={busy} onClick={download}>{busy ? "Generando…" : "Descargar Demanda (.docx)"}</button>
      </div>
    </section>
  );
}
