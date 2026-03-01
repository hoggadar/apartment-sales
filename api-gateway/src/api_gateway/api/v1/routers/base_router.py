from fastapi import APIRouter
from api_gateway.api.v1.routers.apartment_router import apartment_router

from api_gateway.core.config import config


v1 = APIRouter()
v1.include_router(apartment_router, prefix=config.api.v1.apartment_prefix, tags=['apartment'])
