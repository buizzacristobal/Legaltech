from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.config import Settings, get_settings
from app.schemas.instrument import ExtractionResult
from app.services.extractor import AnthropicClient, LLMClient, extract_instrument

router = APIRouter()


class ExtractRequest(BaseModel):
    text: str = Field(min_length=1, max_length=200_000, description="Texto / salida OCR")


def get_llm_client(settings: Settings = Depends(get_settings)) -> LLMClient:
    return AnthropicClient(model=settings.llm_model)


@router.post("/extract", response_model=ExtractionResult)
def extract(req: ExtractRequest, client: LLMClient = Depends(get_llm_client)) -> ExtractionResult:
    return extract_instrument(req.text, client)
