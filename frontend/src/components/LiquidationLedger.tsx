"use client";
import { useEffect, useState } from "react";
import { liquidate, paramsOf } from "@/lib/api";
import { CATEGORY_LABEL, fmtClp, fmtMoney, fmtPct, fmtUf } from "@/lib/format";
import type { DayCount, Instrument, Ledger } from "@/lib/types";
import { Alert } from "./Alert";

interface Props {
  instrument: Instrument;
  cutoff: string;
  dayCount: DayCount;
  onChange: (i: Instrument, cutoff: string, dayCount: DayCount) => void;
  onLedger: (l: Ledger | null) => void;
  onBack: () => void;
  onNext: () => void;
  ledger: Ledger | null;
}

export function LiquidationLedger({ instrument, cutoff, dayCount, onChange, onLedger, onBack, onNext, ledger }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState(false);
  const isPagare = instrument.kind === "pagare";

  async function run() {
    setError(null);
    setBusy(true);
    try {
      const p = paramsOf(instrument, cutoff, dayCount);
      if (p.maturity_date < p.issue_date) throw new Error("El vencimiento es anterior a la emisión.");
      if (p.cutoff_date < p.maturity_date) throw new Error("La fecha de corte es anterior al vencimiento.");
      if (!(Number(p.principal) > 0)) throw new Error("El capital debe ser mayor a cero.");
      onLedger(await liquidate(p));
    } catch (e) {
      onLedger(null);
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void run(); }, []);

  const set = (patch: Record<string, string | null>) => onChange({ ...instrument, ...patch } as Instrument, cutoff, dayCount);
  const cur = ledger?.params.currency ?? "CLP";

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">2. Liquidación de la deuda</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {isPagare && (
          <>
            <div><label className="label">Capital ({instrument.currency})</label>
              <input className="input" value={instrument.amount} onChange={(e) => set({ amount: e.target.value })} /></div>
            <div><label className="label">Emisión</label>
              <input type="date" className="input" value={instrument.issue_date} onChange={(e) => set({ issue_date: e.target.value })} /></div>
            <div><label className="label">Vencimiento</label>
              <input type="date" className="input" value={instrument.maturity_date} onChange={(e) => set({ maturity_date: e.target.value })} /></div>
            <div><label className="label">Tasa pactada anual % (opcional)</label>
              <input className="input" value={instrument.agreed_rate_annual ?? ""} onChange={(e) => set({ agreed_rate_annual: e.target.value || null })} /></div>
          </>
        )}
        <div><label className="label">Fecha de corte</label>
          <input type="date" className="input" value={cutoff} onChange={(e) => onChange(instrument, e.target.value, dayCount)} /></div>
        <div><label className="label">Base de días</label>
          <select className="input" value={dayCount} onChange={(e) => onChange(instrument, cutoff, e.target.value as DayCount)}>
            <option>ACT/360</option><option>ACT/365</option>
          </select></div>
      </div>
      <button className="btn" disabled={busy} onClick={run}>{busy ? "Calculando…" : "Recalcular"}</button>
      {error && <Alert>{error}</Alert>}

      {ledger && (
        <>
          {ledger.warnings.map((w) => <Alert key={w} kind="warn">{w}</Alert>)}
          <dl className="grid gap-3 text-sm sm:grid-cols-4">
            <div><dt className="label">Tramo</dt><dd>{CATEGORY_LABEL[ledger.category] ?? ledger.category}</dd></div>
            <div><dt className="label">Capital</dt><dd>{fmtClp(ledger.principal_clp)}</dd></div>
            <div><dt className="label">Intereses</dt><dd>{fmtClp(ledger.interest_clp)}</dd></div>
            <div><dt className="label">Total</dt><dd className="font-semibold">{fmtClp(ledger.total_clp)}</dd></div>
          </dl>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={daily} onChange={(e) => setDaily(e.target.checked)} /> Ver día por día
          </label>
          <div className="max-h-96 overflow-auto rounded border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="sticky top-0 bg-slate-100">
                {daily ? (
                  <tr><th className="p-2 text-left">Fecha</th><th>Fase</th><th>Tasa anual</th>
                    {cur === "UF" && <th>UF</th>}<th>Capital</th><th>Interés del día</th><th>Acumulado</th></tr>
                ) : (
                  <tr><th className="p-2 text-left">Período</th><th>Días</th><th>Tasa anual</th><th>Capital</th>
                    <th>Interés del mes</th><th>Interés acum.</th><th>Total acum. ($)</th></tr>
                )}
              </thead>
              <tbody>
                {daily
                  ? ledger.days.map((d) => (
                    <tr key={d.date} className="border-t">
                      <td className="p-1 text-left">{d.date}</td><td>{d.phase === "moratory" ? "mora" : "convencional"}</td>
                      <td>{fmtPct(d.annual_rate)}</td>{cur === "UF" && <td>{d.uf_value && fmtClp(d.uf_value)}</td>}
                      <td>{fmtMoney(d.capital, cur)}</td>
                      <td>{Number(d.daily_interest).toFixed(cur === "UF" ? 6 : 2)}</td>
                      <td>{Number(d.accrued_interest).toFixed(cur === "UF" ? 6 : 2)}</td>
                    </tr>))
                  : ledger.months.map((m) => (
                    <tr key={m.period} className="border-t">
                      <td className="p-1 text-left">{m.period}</td><td>{m.days}</td><td>{fmtPct(m.annual_rate)}</td>
                      <td>{fmtMoney(m.capital, cur)}</td><td>{fmtMoney(m.interest, cur)}</td>
                      <td>{fmtMoney(m.accrued_interest, cur)}</td><td>{fmtClp(m.accumulated_total_clp)}</td>
                    </tr>))}
              </tbody>
            </table>
          </div>
          {cur === "UF" && <p className="text-xs text-slate-500">Capital {fmtUf(ledger.params.principal)}; montos en UF, equivalente en $ al corte.</p>}
        </>
      )}
      <div className="flex gap-2">
        <button className="btn-ghost" onClick={onBack}>Volver</button>
        <button className="btn" disabled={!ledger} onClick={onNext}>Continuar</button>
      </div>
    </section>
  );
}
