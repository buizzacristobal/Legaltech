from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Literal


def _csv(name: str, default: str) -> list[str]:
    return [x.strip() for x in os.environ.get(name, default).split(",") if x.strip()]


@dataclass(frozen=True)
class Settings:
    cors_origins: list[str] = field(
        default_factory=lambda: _csv("CORS_ORIGINS", "http://localhost:3000"))
    api_key: str | None = field(default_factory=lambda: os.environ.get("API_KEY") or None)
    llm_provider: Literal["anthropic", "openai_compatible"] = field(
        default_factory=lambda: os.environ.get("LLM_PROVIDER", "anthropic"))  # type: ignore[arg-type]
    llm_base_url: str | None = field(default_factory=lambda: os.environ.get("LLM_BASE_URL") or None)
    llm_api_key: str | None = field(default_factory=lambda: os.environ.get("LLM_API_KEY") or None)
    llm_model: str = field(default_factory=lambda: os.environ.get("LLM_MODEL", "claude-sonnet-5-5"))


def get_settings() -> Settings:
    return Settings()
