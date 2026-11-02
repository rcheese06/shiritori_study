from fastapi import FastAPI
from routers.decks import router as deck_router

app = FastAPI()
app.include_router(deck_router)
