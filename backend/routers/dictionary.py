from fastapi import APIRouter, Query

from lookup import search_word, search_kanji

router = APIRouter(prefix="/dictionary")


@router.get("/search")
def search_words(text: str = Query(min_length=1)):
    return search_word(text)


@router.get("/kanji")
def search_kanji(text: str = Query(min_length=1)):
    return search_kanji(text)