import json
import logging
from pathlib import Path
from typing import Any
from catboost import CatBoostRegressor

from api_gateway.core.config import config
from api_gateway.app.service.minio_service import MinioServiceImpl


logger = logging.getLogger(__name__)


def load_model_from_minio() -> tuple[CatBoostRegressor, dict[str, Any]]:
    minio = MinioServiceImpl()
    cfg = config.storage.minio
    bucket = cfg.bucket

    tmp_dir = Path("/tmp/api_gateway_model")
    tmp_dir.mkdir(parents=True, exist_ok=True)
    model_path = tmp_dir / cfg.model_filename

    logger.info("Downloading model from MinIO: bucket=%s object=%s", bucket, cfg.model_filename)
    minio.download_to_file(bucket, cfg.model_filename, model_path)

    logger.info("Downloading metadata from MinIO: bucket=%s object=%s", bucket, cfg.metadata_filename)
    meta_bytes = minio.download_bytes(bucket, cfg.metadata_filename)
    metadata = json.loads(meta_bytes.decode("utf-8"))

    model = CatBoostRegressor()
    model.load_model(str(model_path))
    logger.info("Model loaded successfully")

    return model, metadata
