from __future__ import annotations

from fastapi import APIRouter

from app.engine.calculator import calculate_day_by_day_ledger
from app.schemas.liquidation import LiquidationLedger, LiquidationParams

router = APIRouter()


@router.post("/liquidate", response_model=LiquidationLedger)
def liquidate(params: LiquidationParams) -> LiquidationLedger:
    """The rate bracket is derived from principal and issue-date UF, never supplied."""
    return calculate_day_by_day_ledger(params)
