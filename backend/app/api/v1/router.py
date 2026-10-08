from fastapi import APIRouter, Depends

from app.api.v1.endpoints import document, extraction, liquidation
from app.core.security import require_api_key

api_router = APIRouter(prefix="/api/v1", dependencies=[Depends(require_api_key)])
api_router.include_router(extraction.router, tags=["extraction"])
api_router.include_router(liquidation.router, tags=["liquidation"])
api_router.include_router(document.router, tags=["document"])
