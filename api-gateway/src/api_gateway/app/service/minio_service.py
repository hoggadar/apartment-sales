from pathlib import Path

from minio import Minio
from api_gateway.core.config import config
from api_gateway.core.interfaces.minio_service import IMinioService


class MinioServiceImpl(IMinioService):
    def __init__(self):
        cfg = config.storage.minio
        self._minio_client = Minio(
            endpoint=cfg.endpoint,
            access_key=cfg.access_key,
            secret_key=cfg.secret_key,
            secure=False,
        )

    @property
    def minio_client(self):
        return self._minio_client

    def list_buckets(self) -> list[str]:
        return [b.name for b in self._minio_client.list_buckets()]

    def list_objects(self, bucket: str) -> list[str]:
        return [obj.object_name for obj in self._minio_client.list_objects(bucket)]

    def bucket_exists(self, bucket: str) -> bool:
        return self._minio_client.bucket_exists(bucket)

    def create_bucket(self, bucket: str) -> None:
        self._minio_client.make_bucket(bucket)

    def download_to_file(self, bucket: str, object_name: str, dest_path: Path) -> Path:
        self._minio_client.fget_object(bucket, object_name, str(dest_path))
        return dest_path

    def download_bytes(self, bucket: str, object_name: str) -> bytes:
        response = self._minio_client.get_object(bucket, object_name)
        try:
            return response.read()
        finally:
            response.close()