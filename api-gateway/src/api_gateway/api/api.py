from fastapi import APIRouter
from api_gateway.core.config import config
from api_gateway.api.v1.routers.base_router import v1


api = APIRouter(prefix=config.api.prefix)
api.include_router(v1, prefix=config.api.v1.prefix)