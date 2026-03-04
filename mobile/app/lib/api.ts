const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";
const API_PREFIX = `${API_BASE}/api/v1/apartment`;

export type Metadata = {
  categorical_values: {
    city: string[];
    zip: string[];
    waterfront: string[];
    view: string[];
    condition: string[];
    was_renovated: string[];
  };
  zips: string[];
  cities: string[];
};

export type PredictRequest = {
  bedrooms: number;
  bathrooms: number;
  sqft_living: number;
  sqft_lot: number;
  floors: number;
  waterfront: number;
  view: number;
  condition: number;
  sqft_basement: number;
  city: string;
  statezip: string;
  yr_built: number;
  yr_renovated: number;
};

export type PredictResponse = {
  price_usd: number;
};

export async function fetchMetadata(): Promise<Metadata> {
  const res = await fetch(`${API_PREFIX}/metadata`);
  if (!res.ok) throw new Error(`Metadata: ${res.status}`);
  return res.json();
}

export async function predictPrice(body: PredictRequest): Promise<PredictResponse> {
  const res = await fetch(`${API_PREFIX}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Predict: ${res.status}`);
  }
  return res.json();
}
