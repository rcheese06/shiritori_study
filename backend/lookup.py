import re
import sqlite3
from contextlib import closing
from pathlib import Path

from rom_converter import rom_to_kan

DB_PATH = Path(__file__).resolve().parent / "dictionary.db"

if not DB_PATH.exists():
    raise FileNotFoundError(f"{DB_PATH} not found.")

def _connect():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

_JP = re.compile(r"[\u3005\u3040-\u30ff\u31f0-\u31ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]")

#clean user inputs
def _fts_query(text, prefix=True):
    tokens = [t.replace('"', "") for t in text.split()]
    tokens = [t for t in tokens if t]
    if not tokens:
        return None
    suffix = "*" if prefix else ""
    return " ".join(f'"{t}"{suffix}' for t in tokens)

#dict structure for jitendex words
def _dict_entries(row):
    return {
        "expression": row["expression"],
        "reading": row["reading"],
        "tags": row["tags"].split() if row["tags"] else [],
        "score": row["score"],
        "part-of-speech-info": row["part_of_speech_info"].split(",") if row["part_of_speech_info"] else "",
        "definitions": row["definition"].split(",") if row["definition"] else [],
        "example-sentence-a": row["example_sentence_a"] if row["example_sentence_a"] else "",
        "example-sentence-b": row["example_sentence_b"] if row["example_sentence_b"] else "",
        "sequence_id": row["sequence_id"]
            }

#lookup word from jitendex
def word_info(word): #takes a word in japanese script (kanji & kana only)
    with closing(_connect()) as con:
        rows = con.execute("""
            SELECT * FROM entries WHERE expression = ? OR reading = ?
        """, (word, word)).fetchall()
    return [_dict_entries(row) for row in rows]

#lookup by english meaning
def word_by_meaning(meaning):
    query = _fts_query(meaning)
    if not query:
        return []
    with closing(_connect()) as con:
        rows = con.execute("""
            SELECT e.* FROM glossary_fts f
            JOIN entries e ON e.id = f.rowid
            WHERE glossary_fts MATCH ?
            ORDER BY f.rank, e.score DESC
            LIMIT ?
        """, (query, 50)).fetchall()
    return [_dict_entries(row) for row in rows]

def search_word(text):
    print("debug:", repr(text))
    text = text.strip()
    #jp to en
    if _JP.search(text):
        return word_info(text)
    #alphabet to jp (note: alphabet does not mean english)
    else:
        rom = word_info(rom_to_kan(text))
        if rom != []: #there is a match, it is romaji
            return rom
        else: #no exact match, english
            return word_by_meaning(text)


#lookup kanji from kanjidic2
def _is_kanji(char):
    return '\u4e00' <= char <= '\u9faf' or '\u3400' <= char <= '\u4dbf' #idk if this is right pls check

#lookup by exact kanji
def kanji_info(kanji):
    chars = [c for c in dict.fromkeys(kanji) if _is_kanji(c)] #take all kanji from input
    if not chars:
        return []
    marks = ",".join("?" * len(chars)) #"?" placeholders

    with closing(_connect()) as con:
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
    with closing(_connect()) as con:
        return [dict(r) for r in con.execute(sql, params)]

#lookup by meanings
def kanji_by_meaning(meaning): #switch to fts5 maybe? faster
    with closing(_connect()) as con:
        rows = con.execute("""
            SELECT k.* from kanji k
            JOIN kanji_meanings m ON k.literal = m.literal
            WHERE m.meaning LIKE ?
            GROUP BY k.literal
            ORDER BY k.freq IS NULL, k.freq
        """, (f"%{meaning}%",)).fetchall()
    return kanji_info("".join([r["literal"] for r in rows]))

def search_kanji(text):
    text = text.strip()
    if _JP.search(text):
        return kanji_info(text)
    #alphabet to jp (note: alphabet does not mean english)
    else:
        rom = kanji_info(rom_to_kan(text)) #kunyomi stored as hiragana
        rom_katakana = kanji_info((rom_to_kan(text, katakana=True))) #onyomi stored as katakana
        if rom != []: #hiragana priority
            return rom
        elif rom_katakana != []: 
            return rom_katakana
        else: #no exact match, english
            return kanji_by_meaning(text)