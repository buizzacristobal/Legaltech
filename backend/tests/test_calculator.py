"""Calculator tests. Expected values are computed by hand (see comments), not by
the engine. NOTE: these are arithmetic reference cases on a synthetic rate table;
they are not transcriptions of real court rulings."""
from datetime import date
from decimal import Decimal as D

import pytest
from pydantic import ValidationError

from app.engine.calculator import (
    apply_tmc_cap, calculate_day_by_day_ledger, get_applicable_rate, select_category,
)
from app.engine.cmf_rates import RateNotFoundError, RateTable, load_default_table
from app.schemas.liquidation import Currency, LiquidationParams, RateCategory

def _rates(corr_a, corr_b, corr_uf):
    r = lambda c: {"corriente": str(c), "tmc": str(D(str(c)) * D("1.5"))}
    return {"clp_lt_200": r(corr_a), "clp_gte_200": r(corr_b), "uf": r(corr_uf)}

TABLE = RateTable({
    "metadata": {"verified": True, "source": "synthetic test table"},
    "uf_10th": {"2023-12": "36000.00", "2024-01": "36000.00", "2024-02": "36360.00",
                "2024-03": "36720.00", "2024-04": "37000.00"},
    "rates": {
        "2024-01": _rates("28.00", "12.00", "5.00"),
        "2024-02": _rates("30.00", "13.00", "5.00"),
        "2024-03": _rates("30.00", "13.00", "5.00"),
    },
})

def clp(**kw):
    base = dict(principal=D(1_000_000), currency=Currency.CLP, issue_date=date(2024, 1, 1))
    return LiquidationParams(**{**base, **kw})

def test_single_month_corriente():
    # 1,000,000 * 30% * 29 / 365 = 23,835.616 -> 23,836
    led = calculate_day_by_day_ledger(
        clp(maturity_date=date(2024, 1, 31), cutoff_date=date(2024, 2, 29)), TABLE)
    assert led.interest_clp == D(23836) and led.total_clp == D(1_023_836)
    assert len(led.days) == 59 and led.category is RateCategory.CLP_LT_200
    assert led.warnings == []

def test_no_interest_before_maturity_without_agreed_rate():
    led = calculate_day_by_day_ledger(
        clp(maturity_date=date(2024, 1, 20), cutoff_date=date(2024, 1, 20)), TABLE)
    assert led.interest_clp == 0 and led.total_clp == D(1_000_000)

def test_cross_month_rate_change_and_cumulative_rounding():
    # Jan 21-31: 11d @28% = 8,438.356 ; Feb 1-10: 10d @30% = 8,219.178
    # total 16,657.534 -> 16,658 ; Jan cum 8,438 ; Feb row = 16,658 - 8,438 = 8,220
    led = calculate_day_by_day_ledger(
        clp(maturity_date=date(2024, 1, 20), cutoff_date=date(2024, 2, 10)), TABLE)
    assert led.interest_clp == D(16658)
    jan, feb = led.months
    assert (jan.period, jan.days, jan.interest) == ("2024-01", 30, D(8438))
    assert jan.interest + feb.interest == D(16658)
    assert feb.interest == D(8220)

def test_tmc_cap_and_warning():
    # agreed 60% > TMC 45% (30*1.5): 1,000,000*45%*29/365 = 35,753.42 -> 35,753
    led = calculate_day_by_day_ledger(
        clp(maturity_date=date(2024, 1, 31), cutoff_date=date(2024, 2, 29),
            issue_date=date(2024, 1, 31), agreed_rate=D(60)), TABLE)
    assert led.interest_clp == D(35753)
    assert any("excede la TMC" in w for w in led.warnings)

def test_agreed_rate_below_cap_applies_both_phases():
    # 59 days @24% : 1,000,000*24%*59/365 = 38,794.52 -> 38,795
    led = calculate_day_by_day_ledger(
        clp(maturity_date=date(2024, 1, 31), cutoff_date=date(2024, 2, 29),
            agreed_rate=D(24)), TABLE)
    assert led.interest_clp == D(38795) and led.warnings == []

def test_bracket_gte_200_uf():
    # 10,000,000 / 36,000 = 277.8 UF -> >=200 ; 13% : *13%*29/365 = 103,287.67->103,288
    led = calculate_day_by_day_ledger(
        clp(principal=D(10_000_000), maturity_date=date(2024, 1, 31),
            cutoff_date=date(2024, 2, 29)), TABLE)
    assert led.category is RateCategory.CLP_GTE_200 and led.interest_clp == D(103288)

def test_uf_value_anchors_and_interpolation():
    assert TABLE.uf_value(date(2024, 2, 10)) == D("36360.00")
    expected = 36000 * (36360 / 36000) ** (26 / 31)  # Feb 5 is day 26 of 31
    assert abs(float(TABLE.uf_value(date(2024, 2, 5))) - expected) <= 0.0051

def test_uf_operation_ledger():
    # 100 UF, 10 days @5% : 100*0.05*10/365 = 0.136986 -> 0.1370 UF
    led = calculate_day_by_day_ledger(
        LiquidationParams(principal=D(100), currency=Currency.UF,
                          issue_date=date(2024, 2, 10), maturity_date=date(2024, 2, 10),
                          cutoff_date=date(2024, 2, 20)), TABLE)
    assert led.interest_native == D("0.1370") and led.category is RateCategory.UF
    uf_cut = 36360 * (36720 / 36360) ** (10 / 29)
    assert abs(float(led.total_clp) - 100.1370 * uf_cut) <= 1.0
    assert led.days[-1].readjustment_factor == led.days[-1].uf_value / TABLE.uf_value(date(2024, 2, 10))
    assert led.total_clp == led.principal_clp + led.interest_clp

def test_get_applicable_rate_and_cap_helpers():
    d = get_applicable_rate(date(2024, 2, 15), Currency.CLP, D(50), None, TABLE)
    assert (d.annual_rate, d.tmc, d.source) == (D("30.00"), D("45.00"), "corriente")
    assert apply_tmc_cap(D(50), D(45)) == (D(45), True)
    assert apply_tmc_cap(D(40), D(45)) == (D(40), False)
    assert select_category(Currency.CLP, D("199.99")) is RateCategory.CLP_LT_200
    assert select_category(Currency.CLP, D(200)) is RateCategory.CLP_GTE_200
    assert select_category(Currency.UF, D(5000)) is RateCategory.UF

def test_validation_errors():
    with pytest.raises(ValidationError):
        clp(maturity_date=date(2024, 1, 31), cutoff_date=date(2024, 1, 30))
    with pytest.raises(ValidationError):
        clp(principal=D(0), maturity_date=date(2024, 1, 31), cutoff_date=date(2024, 2, 1))
    with pytest.raises(RateNotFoundError):
        calculate_day_by_day_ledger(
            clp(maturity_date=date(2024, 1, 31), cutoff_date=date(2024, 6, 1)), TABLE)

def test_seed_file_integrity_and_unverified_flag():
    t = load_default_table()
    assert t.verified is False
    for y in range(2021, 2027):
        for m in range(1, 13):
            for cat in RateCategory:
                c, tmc = t.rate(date(y, m, 1), cat)
                assert tmc == (c * D("1.5")).quantize(D("0.01"), "ROUND_HALF_UP")
    led = calculate_day_by_day_ledger(
        clp(issue_date=date(2024, 1, 1), maturity_date=date(2024, 3, 1),
            cutoff_date=date(2025, 3, 1)))
    assert any("NO verificadas" in w for w in led.warnings)
    assert sum(m.interest for m in led.months) == led.interest_native
