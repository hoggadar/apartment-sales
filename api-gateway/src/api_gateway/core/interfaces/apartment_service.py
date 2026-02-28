from abc import ABC, abstractmethod
from api_gateway.core.schemas.apartment_schema import ApartmentPredictRequest


class IApartmentService(ABC):
    @abstractmethod
    def predict(self, request: ApartmentPredictRequest) -> float:
        pass