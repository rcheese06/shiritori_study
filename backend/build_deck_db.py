import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "decks.db"

def build_deck_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")
    con.executescript("""
        CREATE TABLE IF NOT EXISTS decks (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,  --one deck will have only vocab or only kanji
            question_settings TEXT NOT NULL DEFAULT '{}',
            session_size INTEGER NOT NULL DEFAULT 20
        );

        CREATE TABLE IF NOT EXISTS deck_words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deck_id INTEGER,
            word TEXT NOT NULL,
            FOREIGN KEY (deck_id) REFERENCES decks (id) ON DELETE CASCADE,
            UNIQUE (deck_id, word)
        );
    """)

if __name__ == "__main__":
    build_deck_db()