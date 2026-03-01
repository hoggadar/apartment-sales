from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseModel):
    host: str
    port: int


class ApiV1Config(BaseModel):
    prefix: str = 'v1'
    apartment_prefix: str = 'apartment'


class ApiConfig(BaseModel):
    prefix: str = 'api'
    v1: ApiV1Config


class MinioConfig(BaseModel):
    endpoint: str
    access_key: str
    secret_key: str
    bucket: str
    model_filename: str = "model.cbm"
    metadata_filename: str = "metadata.json"


class StorageConfig(BaseModel):
    minio: MinioConfig


class Config(BaseSettings):
    app: AppConfig
    api: ApiConfig
    storage: StorageConfig
    model_config = SettingsConfigDict(
        env_file='.env',
        env_file_encoding='utf-8',
        env_prefix='CONFIG__',
        env_nested_delimiter="__",
        case_sensitive=False,
    )


config = Config()