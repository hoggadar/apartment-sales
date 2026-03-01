import numpy as np

from fastapi import APIRouter, Request
from api_gateway.core.schemas.apartment_schema import ApartmentPredictRequest


apartment_router = APIRouter()


@apartment_router.get("/metadata")
async def get_metadata(request: Request):
    metadata: dict = request.app.state.model_metadata
    return {
        "categorical_values": metadata.get("categorical_values", {}),
        "zips": metadata.get("categorical_values", {}).get("zip", []),
        "cities": metadata.get("categorical_values", {}).get("city", []),
    }


@apartment_router.post("/predict")
async def predict_price(request: Request, schema: ApartmentPredictRequest):
    model = request.app.state.model
    metadata: dict = request.app.state.model_metadata
    feature_order = metadata["feature_order"]
    zip_price_map = metadata.get("zip_price_map") or {}

    row = schema.to_model_features(zip_price_map)
    X = np.array([[row[f] for f in feature_order]])
    pred_log = model.predict(X)[0]
    price_usd = float(np.expm1(pred_log))
    return {"price_usd": round(price_usd, 2)}
