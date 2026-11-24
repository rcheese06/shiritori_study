import sqlite3
from contextlib import closing
from fastapi import APIRouter, HTTPException
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional
import json

DB_PATH = Path(__file__).resolve().parent.parent / "decks.db"

router = APIRouter()

class DeckCreateInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    deck_type: str = Field(default="vocab", alias="type", min_length=1)

class QuestionSettingsInput(BaseModel):
    kanji_to_kana: Optional[bool] = None
    kana_to_kanji: Optional[bool] = None
    jp_to_meaning: Optional[bool] = None
    meaning_to_jp: Optional[bool] = None

class DeckEditInput(BaseModel):
    name: Optional[str] = Field(min_length=1, max_length=100)
    question_settings: Optional[QuestionSettingsInput]
    session_size: Optional[int] = Field(default=20, min_length=5, max_length=200)

class WordInput(BaseModel):
    word: str

DEFAULT_QUESTION_SETTINGS = {
    "kanji_to_kana": True,
    "kana_to_kanji": True,
    "jp_to_meaning": True,
    "meaning_to_jp": True,
}
def load_question_settings(raw):
    stored = json.loads(raw) if raw else {}
    return {k: stored.get(k, default) for k, default in DEFAULT_QUESTION_SETTINGS.items()}

def connect_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con

@router.post("/deck")
def create_deck(deck: DeckCreateInput):
    with closing(connect_db()) as con:
        try:
            cursor = con.execute(
                "INSERT INTO decks (name, type) VALUES (?, ?)",
                (deck.name,deck.deck_type),
            )
            con.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="A deck with that name already exists")
        return {"id": cursor.lastrowid, "name": deck.name, "type": deck.deck_type}


@router.get("/deck")
def list_decks():
    with closing(connect_db()) as con:
        rows = con.execute("SELECT id, name FROM decks ORDER BY id").fetchall()
        return [dict(row) for row in rows]

@router.get("/deck/{deck_id}")
def get_deck(deck_id: int):
    with closing(connect_db()) as con:
        deck = con.execute(
            "SELECT * FROM decks WHERE id = ?", (deck_id,)
        ).fetchone()
        if deck is None:
            raise HTTPException(status_code=404, detail="Deck not found")

        terms = con.execute(
            "SELECT id, deck_id, word FROM deck_words WHERE deck_id = ? ORDER BY id",
            (deck_id,),
        ).fetchall()
        
    return {
        "id": deck_id,
        "name": deck["name"],
        "settings": load_question_settings(deck["question_settings"]),
        "session_size": deck["session_size"],
        "terms": [{"id": t["id"], "deck_id": t["deck_id"], "word": t["word"]} for t in terms],
        "length": len(terms),
    }

@router.patch("/deck/{deck_id}")
def edit_deck(deck_id: int, item: DeckEditInput):
    if (
        item.name is None
        and item.question_settings is None
        and item.session_size is None
    ):
        raise HTTPException(status_code=400, detail="Nothing to update")
    
    with closing(connect_db()) as con:
        deck = con.execute(
            "SELECT name, question_settings, session_size FROM decks WHERE id = ?", (deck_id,)
        ).fetchone()
        if deck is None:
            raise HTTPException(status_code=404, detail="Deck not found")
        new_name, stored_settings, session_size = deck

        #update name
        if item.name is not None:
            new_name = item.name.strip()
            if not new_name:
                raise HTTPException(status_code=400, detail="Deck name cannot be empty")

        #update question settings
        settings = {**DEFAULT_QUESTION_SETTINGS, **json.loads(stored_settings)}
        if item.question_settings is not None:
            settings.update(item.question_settings.model_dump(exclude_none=True))
            if not any(settings.values()):
                raise HTTPException(
                    status_code=400,
                    detail="At least one question type must be enabled",
                )   
        
        #update session size
        if item.session_size is not None:
            session_size = item.session_size
        
        try:
            con.execute("UPDATE decks SET name = ?, question_settings = ?, session_size = ? "
                "WHERE id = ?",
                (new_name, json.dumps(settings), session_size, deck_id),)
            con.commit()
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="A deck with that name already exists")

        return {"id": deck_id, "name": new_name, "question_settings": settings, "session_size": session_size}
    

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


#@router.get("/deck/{deck_id}/words")
#def get_deck_words(deck_id: int):
#    with closing(connect_db()) as con:
#        deck = con.execute(
#            "SELECT id FROM decks WHERE id = ?", (deck_id,)
#        ).fetchone()
#        if deck is None:
#            raise HTTPException(status_code=404, detail="Deck not found")
#
#        rows = con.execute(
#            "SELECT id, deck_id, word FROM deck_words WHERE deck_id = ? ORDER BY word",
#            (deck_id,),
#        ).fetchall()
#        return [{"id": row["id"], "deck_id": row["deck_id"], "word": row["word"]} for row in rows]


@router.delete("/deck/{deck_id}/words")
def delete_word(deck_id: int, item: WordInput):
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

@router.delete("/deck/{deck_id}")
def delete_deck(deck_id: int):
    with closing(connect_db()) as con:
        deck = con.execute(
            "SELECT id FROM decks WHERE id = ?", (deck_id,)
        ).fetchone()
        if deck is None:
            raise HTTPException(status_code=404, detail="Deck not found")

        with con:
            con.execute(
                "DELETE FROM deck WHERE deck_id = ?",
                (deck_id,),
            )
    return {"deck_id": deck_id,}