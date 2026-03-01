import logging
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api_gateway.api.api import api
from api_gateway.core.config import config
from api_gateway.app.utils.model_loader import load_model_from_minio


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up: downloading model from MinIO...")
    try:
        model, metadata = load_model_from_minio()
        app.state.model = model
        app.state.model_metadata = metadata
        logger.info("Model ready. feature_order=%s", metadata.get("feature_order", [])[:5])
    except Exception as e:
        logger.exception("Failed to load model from MinIO: %s", e)
        raise
    yield
    logger.info("Shutting down")


app = FastAPI(title="Apartment Sales", lifespan=lifespan)

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"message": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host=config.app.host, port=config.app.port)