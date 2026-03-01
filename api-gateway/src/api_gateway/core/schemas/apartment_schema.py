import re
from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ApartmentPredictRequest(BaseModel):
    """User-friendly request: send raw listing data, backend computes features."""

    bedrooms: float = Field(..., ge=0, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0, description="Number of bathrooms (e.g. 1.5)")
    sqft_living: float = Field(..., gt=0, description="Interior living area (sq ft)")
    sqft_lot: float = Field(..., ge=0, description="Lot area (sq ft)")
    floors: float = Field(..., ge=0, description="Number of floors")
    waterfront: int = Field(0, ge=0, le=1, description="1 if waterfront, else 0")
    view: int = Field(0, ge=0, le=4, description="View quality 0-4")
    condition: int = Field(..., ge=1, le=5, description="Overall condition 1-5")
    sqft_basement: float = Field(0, ge=0, description="Basement area (sq ft)")
    city: str = Field(..., description="City name")
    statezip: str = Field(..., description="State + ZIP, e.g. 'WA 98103'")
    yr_built: int = Field(..., ge=1800, description="Year built")
    yr_renovated: int = Field(0, ge=0, description="Year renovated, 0 if never")

    def to_model_features(self, zip_price_map: dict[str, float]) -> dict:
        """Transform raw input to model features (same logic as training)."""
        current_year = datetime.now(timezone.utc).year
        zip_match = re.search(r"(\d+)", self.statezip)
        zip_code = zip_match.group(1) if zip_match else ""

        total_rooms = self.bedrooms + self.bathrooms
        zip_price_level = zip_price_map.get(zip_code) or 0.0

        return {
            "bedrooms": self.bedrooms,
            "bathrooms": self.bathrooms,
            "sqft_living": self.sqft_living,
            "sqft_lot": self.sqft_lot,
            "floors": self.floors,
            "waterfront": str(self.waterfront),
            "view": str(self.view),
            "condition": str(self.condition),
            "sqft_basement": self.sqft_basement,
            "city": self.city,
            "zip": zip_code,
            "house_age": current_year - self.yr_built,
            "was_renovated": "1" if self.yr_renovated > 0 else "0",
            "total_rooms": total_rooms,
            "sqft_per_room": self.sqft_living / (total_rooms + 1),
            "lot_utilization": self.sqft_living / (self.sqft_lot + 1),
            "zip_price_level": zip_price_level,
        }
