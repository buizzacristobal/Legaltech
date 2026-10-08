"""Parametric Chilean executive-lawsuit templates (CPC art. 434 y ss.).

Deterministic text only: every figure comes from the ledger / instrument. The output
is a DRAFT for attorney review; citations must be verified before filing.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Literal

from app.schemas.instrument import (
    Attorney, FacturaElectronica, Instrument, LegalRepresentative, Pagare, Party,
)
from app.schemas.liquidation import Currency, LiquidationLedger

BlockKind = Literal["banner", "suma", "heading", "paragraph", "pagebreak"]

BANNER = "BORRADOR — sujeto a revisión y firma del abogado patrocinante"
_MONTHS = ("enero febrero marzo abril mayo junio julio agosto septiembre octubre "
           "noviembre diciembre").split()
_ORDINALS = ["PRIMER", "SEGUNDO", "TERCER", "CUARTO", "QUINTO"]


@dataclass(frozen=True)
class Block:
    kind: BlockKind
    text: str = ""


def fmt_clp(value: Decimal) -> str:
    return "$" + f"{int(value):,}".replace(",", ".")


def fmt_uf(value: Decimal) -> str:
    whole, _, frac = f"{value:.4f}".partition(".")
    return f"{int(whole):,}".replace(",", ".") + f",{frac} UF"


def fmt_pct(value: Decimal) -> str:
    return f"{value:.2f}".replace(".", ",") + "%"


def fmt_date(d: date) -> str:
    return f"{d.day} de {_MONTHS[d.month - 1]} de {d.year}"


def _person(p: Party) -> str:
    where = ", ".join(x for x in (p.address, p.commune) if x)
    return f"{p.name}, RUT {p.rut}" + (f", domiciliado en {where}" if where else "")


def _title(instr: Instrument) -> tuple[str, str]:
    if isinstance(instr, Pagare):
        return "PAGARÉ", "COBRO DE PAGARÉ"
    return "FACTURA ELECTRÓNICA", "COBRO DE FACTURA"


def _money(instr: Instrument, ledger: LiquidationLedger) -> tuple[str, str]:
    """(capital text, interest text) in the instrument's native currency."""
    if ledger.params.currency is Currency.UF:
        return (f"{fmt_uf(ledger.params.principal)} ({fmt_clp(ledger.principal_clp)} al "
                f"{fmt_date(ledger.params.cutoff_date)})",
                f"{fmt_uf(ledger.interest_native)} ({fmt_clp(ledger.interest_clp)})")
    return fmt_clp(ledger.principal_clp), fmt_clp(ledger.interest_clp)


def _facts(instr: Instrument, ledger: LiquidationLedger) -> list[str]:
    cap, intr = _money(instr, ledger)
    p = ledger.params
    out: list[str]
    if isinstance(instr, Pagare):
        rate = (f" pactándose un interés anual de {fmt_pct(instr.agreed_rate_annual)},"
                if instr.agreed_rate_annual is not None else "")
        out = [f"1. Con fecha {fmt_date(instr.issue_date)}, don(ña) {instr.debtor.name} suscribió "
               f"a favor de mi representada un pagaré por {cap},{rate} pagadero el "
               f"{fmt_date(instr.maturity_date)}."]
    else:
        due = fmt_date(instr.due_date) if instr.due_date else fmt_date(p.maturity_date)
        out = [f"1. Mi representada emitió la factura electrónica folio N° {instr.folio}, con "
               f"fecha {fmt_date(instr.issue_date)}, a cargo de {instr.debtor.name}, por "
               f"{cap}, con vencimiento el {due}."]
    out.append(f"2. El deudor no ha pagado el título, encontrándose en mora desde el "
               f"{fmt_date(p.maturity_date)}.")
    out.append(f"3. Según la liquidación que se acompaña (anexo), al {fmt_date(p.cutoff_date)} "
               f"se adeuda por capital {cap} e intereses por {intr}, sin perjuicio de los que "
               f"se devenguen hasta el pago efectivo.")
    return out


def _law(instr: Instrument) -> list[str]:
    base = ["El artículo 434 del Código de Procedimiento Civil confiere mérito ejecutivo a los "
            "títulos señalados en dicha norma; la obligación es líquida, actualmente exigible "
            "y la acción no se encuentra prescrita."]
    if isinstance(instr, Pagare):
        base.append("El pagaré se rige por la Ley N° 18.092 y, en lo pertinente, por las "
                    "reglas de la letra de cambio; su suscripción consta en el título que se "
                    "acompaña (art. 434 N° 4 CPC; arts. 102 y siguientes de la Ley N° 18.092).")
    else:
        base.append("La factura electrónica tiene mérito ejecutivo conforme al artículo 434 "
                    "N° 7 del Código de Procedimiento Civil, en relación con el artículo 5 de "
                    "la Ley N° 19.983, no habiendo sido reclamada dentro de ocho días corridos "
                    "(art. 3) y habiéndose acreditado el recibo de las mercaderías o servicios.")
    base.append("Los intereses se devengan conforme a la Ley N° 18.010, sin exceder la tasa "
                "máxima convencional.")
    return base


def _otrosi_label(i: int) -> str:
    return f"{_ORDINALS[i]} OTROSÍ"


def build_lawsuit(instr: Instrument, ledger: LiquidationLedger, attorney: Attorney) -> list[Block]:
    if instr.jurisdiction is None:
        raise ValueError("El tribunal competente (jurisdiction) es obligatorio")
    reps: list[LegalRepresentative] = instr.creditor_representatives
    title, subject = _title(instr)
    cap, intr = _money(instr, ledger)

    otrosies: list[tuple[str, list[str]]] = [
        (f"Acompaña {title.lower()} en custodia",
         [f"Solicito a US. tener por acompañado el {title.lower()} que sirve de título "
          f"ejecutivo, y disponer su custodia en el tribunal (art. 434 N° 4 o N° 7 CPC, según corresponda; "
          f"Ley N° 19.983), junto con la liquidación de la deuda."]),
        ("Señala bienes para la traba del embargo",
         ["Solicito a US. tener presente que, sin perjuicio de lo que se señale en la "
          "oportunidad correspondiente, se designan para la traba del embargo los bienes "
          "que se indicarán por escrito separado."]),
    ]
    if reps:
        names = "; ".join(f"{r.name}, RUT {r.rut}, {r.capacity}" for r in reps)
        otrosies.append(("Acredita personería",
                         [f"Solicito a US. tener presente que actúa por mi representada: {names}, "
                          f"cuya personería consta en los documentos que se acompañan."]))
    otrosies.append(("Patrocinio y poder",
                     [f"Solicito a US. tener presente que designo abogado patrocinante y "
                      f"confiero poder a don(ña) {attorney.name}, RUT {attorney.rut}, "
                      f"domiciliado en {attorney.address}"
                      + (f", correo {attorney.email}" if attorney.email else "")
                      + ", habilitado para el ejercicio de la profesión (Ley N° 18.120)."]))

    suma = f"SUMA: {subject.capitalize()}. " + " ".join(
        f"{_otrosi_label(i)}: {t}." for i, (t, _) in enumerate(otrosies))

    blocks = [
        Block("banner", BANNER),
        Block("suma", suma),
        Block("heading", f"S.J.L. EN LO CIVIL DE {instr.jurisdiction.city.upper()}"),
        Block("paragraph", f"({instr.jurisdiction.court_name})"),
        Block("paragraph",
              f"{attorney.name}, abogado, en representación de {_person(instr.creditor)}, "
              f"en juicio ejecutivo contra {_person(instr.debtor)}, a US. respetuosamente digo:"),
        Block("heading", "LO PRINCIPAL: DEMANDA EJECUTIVA Y MANDAMIENTO DE EJECUCIÓN Y EMBARGO"),
        Block("heading", "HECHOS"),
        *[Block("paragraph", t) for t in _facts(instr, ledger)],
        Block("heading", "DERECHO"),
        *[Block("paragraph", t) for t in _law(instr)],
        Block("heading", "PETITORIO"),
        Block("paragraph",
              f"POR TANTO, solicito a US. tener por interpuesta demanda ejecutiva en contra de "
              f"{instr.debtor.name}, acogerla a tramitación y despachar mandamiento de ejecución "
              f"y embargo por la suma de {cap} por concepto de capital, más {intr} por concepto "
              f"de intereses calculados al {fmt_date(ledger.params.cutoff_date)}, más los "
              f"intereses que se devenguen hasta el pago efectivo y las costas de la causa; "
              f"requerir de pago al deudor y, de no pagar, trabar embargo sobre bienes "
              f"suficientes, ordenando seguir adelante la ejecución hasta hacer entero y "
              f"cumplido pago."),
    ]
    for i, (t, paras) in enumerate(otrosies):
        blocks.append(Block("heading", f"{_otrosi_label(i)}: {t}"))
        blocks.extend(Block("paragraph", x) for x in paras)
    blocks.append(Block("paragraph", f"{fmt_date(ledger.params.cutoff_date)}"))
    blocks.append(Block("paragraph", "____________________________\n" + attorney.name))
    return blocks
