from pydantic import BaseModel


class ProcessedFeaturesRequest(BaseModel):
    bedrooms: float         # Number of bedrooms.
    bathrooms: float        # Number of bathrooms (can be fractional, e.g. 1.5).
    sqft_living: float      # Interior living area in square feet.
    sqft_lot: float         # Lot area in square feet.
    floors: float           # Number of floors.
    waterfront: str         # Waterfront flag/category as used during training.
    view: str               # View quality category as used during training.
    condition: str          # Overall condition category as used during training.
    sqft_basement: float    # Basement area in square feet.
    city: str               # City name.
    zip: str                # ZIP code extracted from statezip.
    house_age: float        # House age in years (current_year - yr_built).
    was_renovated: str      # Renovation flag/category ("0" or "1").
    total_rooms: float      # Derived feature: bedrooms + bathrooms.
    sqft_per_room: float    # Derived feature: sqft_living / (total_rooms + 1).
    lot_utilization: float  # Derived feature: sqft_living / (sqft_lot + 1).
    zip_price_level: float  # Median price proxy for ZIP area from training data.