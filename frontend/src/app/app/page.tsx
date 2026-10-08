"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { LawsuitPreview } from "@/components/LawsuitPreview";
import { LiquidationLedger } from "@/components/LiquidationLedger";
import { CaseSummary } from "@/components/ui/CaseSummary";
import { Logo } from "@/components/ui/Logo";
import { Stepper } from "@/components/ui/Stepper";
import type { Attorney, DayCount, Instrument, Ledger } from "@/lib/types";

const STEPS = ["Ingreso del título", "Liquidación", "Demanda"];

export default function Workspace() {
  const [step, setStep] = useState(0);
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [ledger, setLedger] = useState<Ledger | null>(null);
  const [cutoff, setCutoff] = useState(new Date().toISOString().slice(0, 10));
  const [dayCount, setDayCount] = useState<DayCount>("ACT/360");
  const [attorney, setAttorney] = useState<Attorney>({ name: "", rut: "", address: "" });
  const reachable = !instrument ? 0 : !ledger ? 1 : 2;

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="container-x flex h-16 items-center justify-between">
          <Logo />
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al sitio
          </Link>
        </div>
      </header>
      <main className="container-x py-8">
        <div className="mb-8 space-y-6">
          <div className="min-w-0">
            <p className="eyebrow">Espacio de trabajo</p>
            <h1 className="mt-1 text-3xl font-semibold">Liquidación y demanda ejecutiva</h1>
          </div>
          <Stepper steps={STEPS} current={step} reachable={reachable} onGo={setStep} />
        </div>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
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
          </div>
          <CaseSummary instrument={instrument} ledger={ledger} cutoff={cutoff} />
        </div>
      </main>
    </div>
  );
}
