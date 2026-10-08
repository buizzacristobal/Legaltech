"""LLM entity extraction -> validated instrument schemas.

The LLM only transcribes fields (JSON). It never does arithmetic: totals and RUT
check digits are validated by deterministic Python in the schemas.
Zero data retention: nothing is persisted; the document text lives only in memory
for the duration of the call.
"""
from __future__ import annotations

import json
from typing import Protocol

from pydantic import TypeAdapter, ValidationError

from app.schemas.instrument import ExtractionResult, Instrument

DEFAULT_MODEL = "claude-sonnet-5-5"
MAX_ATTEMPTS = 2

SYSTEM_PROMPT = """Eres un extractor de datos de títulos de crédito chilenos.
Devuelve SOLO un objeto JSON, sin texto adicional ni markdown.
Reglas: transcribe literalmente; NO calcules ni infieras montos; si un dato no
aparece, omite el campo. Fechas en ISO (YYYY-MM-DD). Montos como cadenas decimales
sin separador de miles. RUT tal como figura en el documento.
Campo "kind": "pagare" o "factura".
Pagaré: creditor, debtor, amount, currency (CLP|UF), issue_date, maturity_date,
agreed_rate_annual (porcentaje anual), guarantors, signature_authorized,
creditor_representatives, debtor_representatives, jurisdiction{court_name,city}.
Factura: creditor (emisor), debtor (receptor), folio, net_amount, vat_amount,
total_amount, issue_date, due_date, receipt_acknowledged, jurisdiction.
Party = {name, rut, address, commune}. Representante añade capacity."""


class LLMClient(Protocol):
    def complete(self, system: str, user: str) -> str: ...


class ExtractionError(RuntimeError):
    """The model output could not be turned into a valid instrument."""


class AnthropicClient:
    """Thin adapter over the Anthropic SDK (imported lazily)."""

    def __init__(self, model: str = DEFAULT_MODEL, api_key: str | None = None) -> None:
        import anthropic

        self._client = anthropic.Anthropic(api_key=api_key)
        self._model = model

    def complete(self, system: str, user: str) -> str:
        msg = self._client.messages.create(
            model=self._model, max_tokens=4096, temperature=0,
            system=system, messages=[{"role": "user", "content": user}],
        )
        return "".join(b.text for b in msg.content if getattr(b, "type", "") == "text")


def _first_json_object(text: str) -> dict:
    start = text.find("{")
    if start < 0:
        raise ValueError("la respuesta no contiene un objeto JSON")
    obj, _ = json.JSONDecoder().raw_decode(text[start:])
    if not isinstance(obj, dict):
        raise ValueError("la respuesta JSON no es un objeto")
    return obj


def extract_instrument(document_text: str, client: LLMClient) -> ExtractionResult:
    """Extract and validate an instrument from raw text / OCR output."""
    if not document_text.strip():
        raise ExtractionError("documento vacío")
    adapter = TypeAdapter(Instrument)
    user = f"Documento:\n\"\"\"\n{document_text}\n\"\"\""
    last_error = ""
    for _ in range(MAX_ATTEMPTS):
        prompt = user if not last_error else (
            f"{user}\n\nTu respuesta anterior fue inválida: {last_error}\nCorrígela."
        )
        raw = client.complete(SYSTEM_PROMPT, prompt)
        try:
            instrument = adapter.validate_python(_first_json_object(raw))
            return ExtractionResult(instrument=instrument)
        except (ValueError, ValidationError) as exc:
            last_error = str(exc)[:800]
    raise ExtractionError(f"extracción inválida tras {MAX_ATTEMPTS} intentos: {last_error}")
