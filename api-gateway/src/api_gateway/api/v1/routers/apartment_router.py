from fastapi import APIRouter
from api_gateway.core.schemas.apartment_schema import ProcessedFeaturesRequest


apartment_router = APIRouter()


@apartment_router.post("/predict")
async def get_apartment(schema: ProcessedFeaturesRequest):
    return None
