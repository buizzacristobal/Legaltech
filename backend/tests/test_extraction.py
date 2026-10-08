import json
from datetime import date
from decimal import Decimal as D

import pytest
from pydantic import ValidationError

from app.schemas.instrument import FacturaElectronica, Pagare, normalize_rut
from app.services.extractor import ExtractionError, extract_instrument


class FakeClient:
    def __init__(self, *replies: str) -> None:
        self.replies, self.calls = list(replies), []

    def complete(self, system: str, user: str) -> str:
        self.calls.append(user)
        return self.replies.pop(0)


PAGARE = {
    "kind": "pagare", "amount": "1000000", "currency": "CLP",
    "issue_date": "2024-01-01", "maturity_date": "2024-06-30", "agreed_rate_annual": "24",
    "creditor": {"name": "Banco Ejemplo SpA", "rut": "76.086.428-5"},
    "debtor": {"name": "Juan Pérez", "rut": "12.345.678-5"},
}


def test_rut_validation():
    assert normalize_rut("12345678-5") == "12.345.678-5"
    assert normalize_rut("76086428-5") == "76.086.428-5"
    assert normalize_rut("11.111.111-1") == "11.111.111-1"
    for bad in ("12.345.678-9", "abc", "1-"):
        with pytest.raises(ValueError):
            normalize_rut(bad)


def test_extract_pagare_from_fenced_json():
    client = FakeClient("Aquí está:\n```json\n" + json.dumps(PAGARE) + "\n```")
    res = extract_instrument("PAGARE ...", client)
    p = res.instrument
    assert isinstance(p, Pagare) and p.amount == D(1_000_000)
    assert p.maturity_date == date(2024, 6, 30) and p.debtor.rut == "12.345.678-5"


def test_retry_on_invalid_then_success():
    bad = dict(PAGARE, maturity_date="2023-01-01")
    client = FakeClient(json.dumps(bad), json.dumps(PAGARE))
    assert isinstance(extract_instrument("doc", client).instrument, Pagare)
    assert "inválida" in client.calls[1]


def test_gives_up_after_max_attempts():
    with pytest.raises(ExtractionError):
        extract_instrument("doc", FakeClient("no json", "{ nope"))
    with pytest.raises(ExtractionError):
        extract_instrument("   ", FakeClient())


def test_factura_total_checked_deterministically():
    base = {
        "kind": "factura", "folio": "1234", "net_amount": "100000", "vat_amount": "19000",
        "total_amount": "119000", "issue_date": "2024-02-01",
        "creditor": PAGARE["creditor"], "debtor": PAGARE["debtor"],
    }
    assert isinstance(extract_instrument("f", FakeClient(json.dumps(base))).instrument,
                      FacturaElectronica)
    with pytest.raises(ValidationError):
        FacturaElectronica(**{**base, "total_amount": "120000"})
