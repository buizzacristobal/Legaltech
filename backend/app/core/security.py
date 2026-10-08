from __future__ import annotations

import hmac

from fastapi import Depends, Header, HTTPException

from app.core.config import Settings, get_settings


def require_api_key(
    x_api_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    """If API_KEY is configured, every request must present it."""
    if settings.api_key and not hmac.compare_digest(x_api_key or "", settings.api_key):
        raise HTTPException(status_code=401, detail="API key inválida")
