from abc import ABC, abstractmethod
from pathlib import Path


class IMinioService(ABC):
    @abstractmethod
    def list_buckets(self) -> list[str]:
        pass

    @abstractmethod
    def list_objects(self, bucket: str) -> list[str]:
        pass

    @abstractmethod
    def bucket_exists(self, bucket: str) -> bool:
        pass

    @abstractmethod
    def create_bucket(self, bucket: str) -> None:
        pass

    @abstractmethod
    def download_to_file(self, bucket: str, object_name: str, dest_path: Path) -> Path:
        pass

    @abstractmethod
    def download_bytes(self, bucket: str, object_name: str) -> bytes:
        pass