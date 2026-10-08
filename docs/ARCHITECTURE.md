# Architecture

- `engine/cmf_rates.py` — rate periods (`valid_from..valid_to`), UF interpolation (10th-to-10th, geometric).
- `engine/calculator.py` — pure `Decimal` ledger: simple interest, TMC cap, bracket fixed at issue date, cumulative rounding.
- `schemas/` — Pydantic v2 models (RUT módulo 11, factura totals).
- `services/extractor.py` — LLM → JSON → schema validation, one retry; LLM injected via `LLMClient` protocol.
- `engine/legal_templates.py` + `services/generator.py` — deterministic Spanish templates → `.docx` (Times New Roman 12, 1.5 spacing).
- `api/v1` — `/extract`, `/liquidate`, `/generate-lawsuit` (ledger recomputed server-side).
- Open items: see "Disclaimers" in the root README and `docs/LEGAL_SPEC.md` §5.
