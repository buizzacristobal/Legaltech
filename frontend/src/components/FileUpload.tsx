"use client";
import { FileText, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { extract } from "@/lib/api";
import { SAMPLE_FACTURA, SAMPLE_FACTURA_TEXT, SAMPLE_PAGARE, SAMPLE_PAGARE_TEXT } from "@/lib/samples";
import type { Instrument } from "@/lib/types";
import { Alert } from "./Alert";

export function FileUpload({ onExtracted }: { onExtracted: (i: Instrument) => void }) {
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
    <section className="card space-y-6">
      <div>
        <h2 className="text-xl font-semibold">1. Ingreso del título</h2>
        <p className="mt-1 text-sm text-ink-600">Pegue el texto del pagaré o factura, o la salida de su OCR. La IA transcribe los campos; el sistema valida RUT, fechas y totales.</p>
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="label !mb-0 mr-1">Cargar</span>
          <button className="btn-ghost !py-1.5" onClick={() => setText(SAMPLE_PAGARE_TEXT)}><FileText className="h-4 w-4" aria-hidden />Ejemplo Pagaré</button>
          <button className="btn-ghost !py-1.5" onClick={() => setText(SAMPLE_FACTURA_TEXT)}><FileText className="h-4 w-4" aria-hidden />Ejemplo Factura</button>
          <label className="btn-ghost cursor-pointer !py-1.5">
            <Upload className="h-4 w-4" aria-hidden />Archivo .txt
            <input type="file" accept=".txt,.md,text/plain" className="sr-only"
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
          </label>
        </div>
        <label htmlFor="doc-text" className="sr-only">Texto del título</label>
        <textarea id="doc-text" className="input h-64 font-mono text-[13px] leading-relaxed" value={text}
          onChange={(e) => setText(e.target.value)} placeholder="Pegue aquí el texto del pagaré o factura…" />
      </div>
      {error && <Alert>{error}</Alert>}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button className="btn" disabled={busy || !text.trim()} onClick={run}>
          <Sparkles className="h-4 w-4" aria-hidden />{busy ? "Extrayendo…" : "Extraer con IA"}
        </button>
        <span className="text-xs text-ink-500">o continúe sin IA con datos de ejemplo:</span>
        <button className="btn-ghost !py-1.5" onClick={() => onExtracted(SAMPLE_PAGARE)}>Pagaré</button>
        <button className="btn-ghost !py-1.5" onClick={() => onExtracted(SAMPLE_FACTURA)}>Factura</button>
      </div>
    </section>
  );
}
