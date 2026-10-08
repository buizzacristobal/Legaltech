"use client";
import { useState } from "react";
import { extract } from "@/lib/api";
import {
  SAMPLE_FACTURA, SAMPLE_FACTURA_TEXT, SAMPLE_PAGARE, SAMPLE_PAGARE_TEXT,
} from "@/lib/samples";
import type { Instrument } from "@/lib/types";
import { Alert } from "./Alert";

interface Props { onExtracted: (i: Instrument) => void }

export function FileUpload({ onExtracted }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function readFile(f: File) {
    if (!/\.(txt|md)$/i.test(f.name) && f.type !== "text/plain") {
      setError("Solo se admiten archivos de texto (.txt). Para escaneos, pegue el texto del OCR.");
      return;
    }
    setError(null);
    setText(await f.text());
  }

  async function run() {
    setBusy(true);
    setError(null);
    try {
      onExtracted(await extract(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">1. Ingreso del título</h2>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => setText(SAMPLE_PAGARE_TEXT)}>Ejemplo Pagaré</button>
        <button className="btn-ghost" onClick={() => setText(SAMPLE_FACTURA_TEXT)}>Ejemplo Factura</button>
        <label className="btn-ghost cursor-pointer">
          Cargar .txt
          <input type="file" accept=".txt,.md,text/plain" className="hidden"
            onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
        </label>
      </div>
      <textarea className="input h-56 font-mono" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Pegue aquí el texto del pagaré o factura (o la salida del OCR)…" />
      {error && <Alert>{error}</Alert>}
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" disabled={busy || !text.trim()} onClick={run}>
          {busy ? "Extrayendo…" : "Extraer con IA"}
        </button>
        <span className="text-xs text-slate-500">o usar datos de ejemplo sin IA:</span>
        <button className="btn-ghost" onClick={() => onExtracted(SAMPLE_PAGARE)}>Pagaré</button>
        <button className="btn-ghost" onClick={() => onExtracted(SAMPLE_FACTURA)}>Factura</button>
      </div>
    </section>
  );
}
