import { fmtClp } from "@/lib/format";
import type { Instrument, Ledger } from "@/lib/types";

export function CaseSummary({ instrument, ledger, cutoff }: { instrument: Instrument | null; ledger: Ledger | null; cutoff: string }) {
  return (
    <aside className="card sticky top-6 space-y-4 text-sm" aria-label="Resumen del caso">
      <h2 className="font-serif text-base font-semibold">Resumen del caso</h2>
      {!instrument ? (
        <p className="text-ink-500">Aún no hay un título cargado. Pegue el texto de un pagaré o factura, o use un ejemplo.</p>
      ) : (
        <dl className="space-y-3">
          <div><dt className="label">Instrumento</dt><dd className="font-medium">{instrument.kind === "pagare" ? "Pagaré (Ley 18.092)" : `Factura N° ${instrument.folio} (Ley 19.983)`}</dd></div>
          <div><dt className="label">Acreedor</dt><dd>{instrument.creditor.name}<br /><span className="text-ink-500">{instrument.creditor.rut}</span></dd></div>
          <div><dt className="label">Deudor</dt><dd>{instrument.debtor.name}<br /><span className="text-ink-500">{instrument.debtor.rut}</span></dd></div>
          {ledger && (
            <div className="rounded-lg bg-ink-900 p-4 text-white">
              <dt className="text-xs uppercase tracking-wide text-ink-300">Total al {cutoff}</dt>
              <dd className="mt-1 font-serif text-2xl font-semibold">{fmtClp(ledger.total_clp)}</dd>
              <dd className="mt-1 text-xs text-ink-300">Capital {fmtClp(ledger.principal_clp)} · Intereses {fmtClp(ledger.interest_clp)}</dd>
            </div>
          )}
        </dl>
      )}
    </aside>
  );
}
