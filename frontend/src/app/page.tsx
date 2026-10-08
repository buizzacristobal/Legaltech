"use client";
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { LawsuitPreview } from "@/components/LawsuitPreview";
import { LiquidationLedger } from "@/components/LiquidationLedger";
import type { Attorney, DayCount, Instrument, Ledger } from "@/lib/types";

const STEPS = ["Ingreso", "Liquidación", "Demanda"];

export default function Home() {
  const [step, setStep] = useState(0);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [cutoff, setCutoff] = useState(new Date().toISOString().slice(0, 10));
  const [dayCount, setDayCount] = useState<DayCount>("ACT/360");
  const [attorney, setAttorney] = useState<Attorney>({ name: "", rut: "", address: "" });

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">Liquidación CMF y demanda ejecutiva</h1>
        <ol className="mt-3 flex gap-2 text-sm">
          {STEPS.map((s, i) => (
            <li key={s} className={`rounded px-3 py-1 ${i === step ? "bg-slate-900 text-white" : "bg-slate-200"}`}>{i + 1}. {s}</li>
          ))}
        </ol>
      </header>
      {step === 0 && <FileUpload onExtracted={(i) => { setInstrument(i); setLedger(null); setStep(1); }} />}
      {step === 1 && instrument && (
        <LiquidationLedger instrument={instrument} cutoff={cutoff} dayCount={dayCount} ledger={ledger}
          onChange={(i, c, d) => { setInstrument(i); setCutoff(c); setDayCount(d); }}
          onLedger={setLedger} onBack={() => setStep(0)} onNext={() => setStep(2)} />
      )}
      {step === 2 && instrument && ledger && (
        <LawsuitPreview instrument={instrument} ledger={ledger} cutoff={cutoff} dayCount={dayCount}
          attorney={attorney} onAttorney={setAttorney} onInstrument={setInstrument} onBack={() => setStep(1)} />
      )}
    </main>
  );
}
