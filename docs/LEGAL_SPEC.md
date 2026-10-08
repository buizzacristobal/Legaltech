# LEGAL_SPEC — Juicio Ejecutivo y liquidación de deuda (Chile)

> Working specification for engineers. It is **not legal advice**. Every citation
> must be checked by the supervising attorney before the output is filed.

## 1. Juicio ejecutivo (CPC, Libro III, Título I, art. 434 y ss.)

- **Título ejecutivo (art. 434 CPC)**: among others, the pagaré (Ley 18.092, with the
  signature authorized/ratified as required by art. 434 N° 4) and the factura with
  mérito ejecutivo under Ley 19.983 (copia cedible, acuse de recibo, and the
  *cobranza* requirements of that statute).
- **Requirements**: obligation actually due (*actualmente exigible*), liquid or
  liquidable, and not prescribed. The liquidation engine exists to make "liquid" concrete.
- **Mandamiento de ejecución y embargo**: the court orders the debtor to pay and
  seizes assets if unpaid (art. 438 CPC).
- **Defences**: oposición in 4 days (art. 459 CPC), limited to the exceptions in art. 464.

## 2. Ley 18.010 interest mechanics

| Concept | Meaning | Used by the engine |
|---|---|---|
| Interés corriente | Average rate charged by the banking system for each operation category, published monthly by the CMF | Default rate in mora when nothing was agreed (art. 16 inc. 2 Ley 18.010 / art. 2 Ley 18.010) |
| Interés convencional | Rate agreed by the parties | Applied from issue date to cut-off if present |
| Tasa Máxima Convencional (TMC) | Ceiling = 1.5 × interés corriente (art. 6) | Agreed rate is capped; a warning is emitted |

- Interest is **simple**: interest on interest (anatocismo) is not modelled.
- The engine uses **annual rate / 365** per calendar day; the basis is a single constant
  (`DAY_COUNT_BASIS`) and is a documented convention to confirm with the supervising attorney.
- The rate is the one published for the **calendar month** containing each day.

### 2.1 Operation categories

- **No reajustables (CLP)**: `clp_lt_200` (< 200 UF) and `clp_gte_200` (≥ 200 UF).
  The bracket is fixed by the capital's UF value on the **issue date**.
- **Reajustables (UF)**: `uf` category. Capital and interest accrue in UF; CLP
  equivalents use the UF of each date; final amounts convert at the cut-off date.

> **Scope note**: the CMF publishes finer categories (e.g. ≤ 50 UF operations have a
> different ceiling under Ley 18.010 art. 6, as amended). They are **out of scope** for
> now; the two brackets above follow the product specification. Extend `RateCategory`
> and the seed file to add them.

### 2.2 UF value

The UF changes daily by geometric interpolation between the values at the 10th of
consecutive months: `UF(d) = UF₁₀(m) · (UF₁₀(m+1) / UF₁₀(m))^(k/n)`, where `k` is days
since the 10th and `n` the length of the period (rounded half-up to 2 decimals).

### 2.3 Accrual periods

1. `(issue, maturity]` — conventional interest, only if an agreed rate exists.
2. `(maturity, cut-off]` — moratory interest at the agreed rate, else interés corriente;
   always ≤ TMC.

Monthly ledger rows use **cumulative rounding** (CLP to 1 peso, UF to 0.0001) so the
rows add up exactly to the total.

## 3. Estructura del escrito de demanda ejecutiva

- **Suma** and header: *S.J.L. en lo Civil* (presidencia del tribunal).
- **Lo principal**: demanda ejecutiva, mandamiento de ejecución y embargo.
  Sections: hechos, derecho, petitorio.
- **Primer otrosí**: acompaña título ejecutivo en custodia (art. 434 N° 4 CPC / Ley 19.983).
- **Segundo otrosí**: señala bienes para la traba del embargo.
- **Tercer otrosí**: acredita personería (if acting as legal representative).
- **Cuarto otrosí**: patrocinio y poder (Ley 18.120).

## 4. Compliance constraints

- Human-in-the-loop: output is an editable draft for attorney review and signature.
- No automated or headless submission to the Oficina Judicial Virtual.
- Zero data retention for client documents; personal-data handling per Ley 21.719.

## 5. Data provenance (important)

`backend/data/cmf_rates_seed.json` currently holds **illustrative, unverified figures**
(`"verified": false`). Every ledger produced from it carries a warning. Before real use,
replace the figures with those transcribed from CMF publications and set `verified: true`.
