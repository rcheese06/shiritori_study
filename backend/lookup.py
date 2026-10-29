#TO-DO: run build_db.py to create dictionary.db

import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "dictionary.db"

if not DB_PATH.exists():
    raise FileNotFoundError(f"{DB_PATH} not found.")

con = sqlite3.connect(DB_PATH)
con.row_factory = sqlite3.Row

#lookup word from jitendex
def word_info(word): #no en->jp yet
    rows = con.execute("""
        SELECT * FROM entries WHERE expression = ? OR reading = ?
    """, (word, word)).fetchall()
    return [
        {
            "expression": row["expression"],
            "reading": row["reading"],
            "tags": row["tags"].split() if row["tags"] else [],
            "score": row["score"],
            "definitions": json.loads(row["definitions"]),
            "sequence_id": row["sequence_id"]
        }
        for row in rows
    ]

#lookup kanji from kanjidic2
def _is_kanji(char):
    return '\u4e00' <= char <= '\u9faf' or '\u3400' <= char <= '\u4dbf' #idk if this is right pls check

#lookup by exact kanji
def kanji_info(kanji):
    chars = [c for c in dict.fromkeys(kanji) if _is_kanji(c)] #take all kanji from input
    if not chars:
        return []
    marks = ",".join("?" * len(chars)) #"?" placeholders

    info = {
        r["literal"]: {**dict(r), "on": [], "kun": [], "nanori": [], "meanings": []}
        for r in con.execute(f"SELECT * FROM kanji WHERE literal IN ({marks})", chars)
    }

    for r in con.execute(
        f"SELECT literal, reading, type FROM kanji_readings WHERE literal IN ({marks}) ORDER BY id", 
        chars
    ):
        info[r["literal"]][f"{r['type']}"].append(r["reading"])

    for r in con.execute(
        f"SELECT literal, meaning FROM kanji_meanings WHERE literal IN ({marks}) ORDER BY id", 
        chars
    ):
        info[r["literal"]]["meanings"].append(r["meaning"])

    return [info[c] for c in chars if c in info]

#lookup by readings (can be on, kun, nanori)
def kanji_by_reading(reading):
    sql = """
        SELECT DISTINCT k.* from kanji k
        JOIN kanji_readings r ON k.literal = r.literal
        WHERE r.plaintext_reading = ?
    """
    params = [reading]
    if type:
        sql += " AND r.type = ?"
        params.append(type)

    sql += " ORDER BY k.freq IS NULL, k.freq" #order by most common, null last
    return [dict(r) for r in con.execute(sql, params)]

#lookup by meanings
def kanji_by_meaning(meaning): #switch to fts5 maybe? faster
    rows = con.execute("""
        SELECT k.* from kanji k
        JOIN kanji_meanings m ON k.literal = m.literal
        WHERE m.meaning LIKE ? 
        GROUP BY k.literal
        ORDER BY k.freq IS NULL, k.freq
    """, (f"%{meaning}%",)).fetchall()
    return kanji_info("".join([r["literal"] for r in rows]))