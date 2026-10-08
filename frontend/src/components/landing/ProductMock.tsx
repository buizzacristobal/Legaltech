const ROWS = [
  ["15 ene – 14 feb", "30", "14,40%", "$120.000"],
  ["15 feb – 15 mar", "30", "13,80%", "$115.000"],
];

export function ProductMock() {
  return (
    <figure className="relative">
      <div className="rounded-xl bg-white p-5 text-ink-900 shadow-lift ring-1 ring-black/5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Liquidación · Pagaré</p>
            <p className="font-serif text-lg font-semibold">Capital $10.000.000</p>
          </div>
          <span className="badge">≥ 200 UF</span>
        </div>
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="pb-2 font-semibold">Período</th><th className="pb-2 text-right font-semibold">Días</th>
              <th className="pb-2 text-right font-semibold">Tasa anual</th><th className="pb-2 text-right font-semibold">Interés</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r[0]} className="border-b border-line/70">
                <td className="py-2.5">{r[0]}</td>
                <td className="py-2.5 text-right tabular-nums">{r[1]}</td>
                <td className="py-2.5 text-right tabular-nums">{r[2]}</td>
                <td className="py-2.5 text-right font-medium tabular-nums">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-5 flex items-end justify-between rounded-lg bg-ink-900 p-4 text-white">
          <span className="text-xs uppercase tracking-wide text-ink-300">Total demandado</span>
          <span className="font-serif text-2xl font-semibold">$10.235.000</span>
        </div>
        <div className="mt-4 rounded-lg border border-gold-200 bg-gold-100/60 px-3 py-2 text-xs text-ink-800">
          Tasa pactada 45% &gt; TMC → se aplicó la TMC (art. 6 Ley 18.010)
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-ink-300">Ejemplo ilustrativo con datos de prueba, no son cifras oficiales.</figcaption>
    </figure>
  );
}
