from fastapi import FastAPI
from routers.decks import router as deck_router
from routers.dictionary import router as dictionary_router

app = FastAPI()
app.include_router(deck_router, prefix="/api")
app.include_router(dictionary_router, prefix="/api")
