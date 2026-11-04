import sqlite3
from contextlib import closing
from fastapi import APIRouter, HTTPException
from pathlib import Path
from pydantic import BaseModel

DB_PATH = Path(__file__).resolve().parent.parent / "decks.db"

router = APIRouter()

class DeckInput(BaseModel):
    name: str

class WordInput(BaseModel):
    word: str

def connect_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con

@router.post("/deck")
def create_deck(deck: DeckInput):
    with closing(connect_db()) as con:
        with con:
            cursor = con.execute(
                "INSERT INTO decks (name) VALUES (?)",
                (deck.name,),
            )
            return {"id": cursor.lastrowid, "name": deck.name}


@router.get("/deck")
def get_decks():
    with closing(connect_db()) as con:
        rows = con.execute("SELECT id, name FROM decks ORDER BY id").fetchall()
        return [dict(row) for row in rows]


@router.post("/deck/{deck_id}/words")
def add_word(deck_id: int, item: WordInput):
    with closing(connect_db()) as con:
        deck = con.execute(
            "SELECT id FROM decks WHERE id = ?", (deck_id,)
        ).fetchone()
        if deck is None:
            raise HTTPException(status_code=404, detail="Deck not found")

        try:
            with con:
                con.execute(
                    "INSERT INTO deck_words (deck_id, word) VALUES (?, ?)",
                    (deck_id, item.word),
                )
        except sqlite3.IntegrityError:
            raise HTTPException(
                status_code=409,
                detail="That word is already in this deck",
            )

    return {"deck_id": deck_id, "word": item.word}


@router.get("/deck/{deck_id}/words")
def get_deck_words(deck_id: int):
    with closing(connect_db()) as con:
        deck = con.execute(
            "SELECT id FROM decks WHERE id = ?", (deck_id,)
        ).fetchone()
        if deck is None:
            raise HTTPException(status_code=404, detail="Deck not found")

        rows = con.execute(
            "SELECT word FROM deck_words WHERE deck_id = ? ORDER BY word",
            (deck_id,),
        ).fetchall()
        return [row["word"] for row in rows]


@router.delete("/deck/{deck_id}/words")
def remove_word(deck_id: int, item: WordInput):
    with closing(connect_db()) as con:
        deck = con.execute(
            "SELECT id FROM decks WHERE id = ?", (deck_id,)
        ).fetchone()
        if deck is None:
            raise HTTPException(status_code=404, detail="Deck not found")

        with con:
            con.execute(
                "DELETE FROM deck_words WHERE deck_id = ? AND word = ?",
                (deck_id, item.word),
            )

    return {"deck_id": deck_id, "word": item.word}