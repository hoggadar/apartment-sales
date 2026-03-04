from api_gateway.core.interfaces.apartment_service import IApartmentService
from api_gateway.core.schemas.apartment_schema import ApartmentPredictRequest


class ApartmentServiceImpl(IApartmentService):
    def predict(self, request: ApartmentPredictRequest) -> float:
        pass
