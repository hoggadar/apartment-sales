import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api_gateway.core.config import config
from api_gateway.api.api import api



app = FastAPI(title='Apartment Sales')

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
    print(config)
    uvicorn.run(app, host=config.app.host, port=config.app.port)