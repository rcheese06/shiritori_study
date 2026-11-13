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
def _fts_query(text, prefix=False):
    tokens = [t.replace('"', "") for t in text.split()]
    tokens = [t for t in tokens if t]
    if not tokens:
        return None
    suffix = "*" if prefix else ""
    return " ".join(f'"{t}"{suffix}' for t in tokens)

def dict_entries(con, rows):
    rows = [int(i[0]) if isinstance(i, sqlite3.Row) else int(i) for i in rows]
    if not rows:
        return []
    marks = ",".join("?" * len(rows))

    entries = {r["id"]: {
        "expression": r["expression"], "reading": r["reading"],
        "tags": r["tags"].split() if r["tags"] else [],
        "score": r["score"], "sequence_id": r["sequence_id"], "senses": [],
    } for r in con.execute(f"SELECT * FROM vocab WHERE id IN ({marks})", rows)}

    senses = {}
    for r in con.execute(
        f"SELECT * FROM vocab_senses WHERE entry_id IN ({marks}) ORDER BY entry_id, position", rows
    ):
        senses[r["id"]] = {"part_of_speech_info": r["part_of_speech_info"].split(",") if r["part_of_speech_info"] else [], "glosses": [], "examples": []}
        entries[r["entry_id"]]["senses"].append(senses[r["id"]])

    for r in con.execute(
        f"SELECT sense_id, definition FROM vocab_glosses WHERE entry_id IN ({marks}) ORDER BY sense_id, position", rows
    ):
        senses[r["sense_id"]]["glosses"].append(r["definition"])

    for r in con.execute(
        f"SELECT sense_id, jp, en FROM vocab_sentences WHERE sense_id IN "
        f"(SELECT id FROM vocab_senses WHERE entry_id IN ({marks}))", rows
    ):
        senses[r["sense_id"]]["examples"].append({"a": r["jp"], "b": r["en"]})

    return [entries[i] for i in rows if i in entries]
    

#lookup word from jitendex
def word_info(word): #takes a word in japanese script (kanji & kana only)
    with closing(_connect()) as con:
        rows = con.execute("""
            SELECT * FROM vocab WHERE expression = ? OR reading = ?
        """, (word, word)).fetchall()
        return dict_entries(con, rows)

#lookup by english meaning
def word_by_meaning(meaning):
    exact = _fts_query(meaning, prefix=False)
    if not exact:
        return []
    non_exact = _fts_query(meaning, prefix=True)
    old_sql = """
            SELECT g.entry_id
            FROM glosses_fts
            JOIN vocab_glosses g ON g.id = glosses_fts.rowid
            JOIN vocab_senses s ON s.id = g.sense_id
            JOIN vocab v ON v.id = g.entry_id
            WHERE glosses_fts MATCH ?
            AND instr(
                ' ' || replace(replace(replace(replace(replace(
                    lower(g.definition), ';', ' '), ',', ' '), '(', ' '), ')', ' '), '/', ' ') || ' ',
                ' ' || ? || ' '
            ) > 0
            GROUP BY g.entry_id
            ORDER BY MIN(s.position * 1000 + g.position), MAX(v.score) DESC
            LIMIT 30
        """
    
    sql = """
            WITH hits AS (
                SELECT
                    g.entry_id,
                    s.position AS sp,
                    g.position AS gp,
                    instr(
                        ' ' || replace(replace(replace(replace(replace(
                            lower(g.definition), ';', ' '), ',', ' '), '(', ' '), ')', ' '), '/', ' ') || ' ',
                        ' ' || ? || ' '
                    ) AS hit
                FROM glosses_fts
                JOIN vocab_glosses g ON g.id = glosses_fts.rowid
                JOIN vocab_senses s ON s.id = g.sense_id
                WHERE glosses_fts MATCH ?
            )
            SELECT h.entry_id
            FROM hits h
            JOIN vocab v ON v.id = h.entry_id
            WHERE h.hit > 0
            GROUP BY h.entry_id
            ORDER BY
                MIN(h.hit),
                MIN(h.sp * 1000 + h.gp),
                MAX(v.score) DESC,
                h.entry_id
            LIMIT 30
        """
    with closing(_connect()) as con:
        rows = [r[0] for r in con.execute(sql, (meaning.lower(), exact))]
        #show non_exact results after exact results
        if len(rows) < 30:
            for r in con.execute(sql, (non_exact,)):
                if r[0] not in rows:
                    rows.append(r[0])
                if len(rows) >= 30:
                    break
        return dict_entries(con, rows)

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
    return (
        '\u4e00' <= char <= '\u9fff'
        or '\u3400' <= char <= '\u4dbf'
        or '\uf900' <= char <= '\ufaff'
        or '\U00020000' <= char <= '\U0002fa1f'
        or char == '\u3005'
    ) 

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
    print("debug: kanji reading search")
    sql = """
        SELECT DISTINCT k.* from kanji k
        JOIN kanji_readings r ON k.literal = r.literal
        WHERE r.plaintext_reading = ?
    """
    params = [reading]
    #if reading_type:
        #sql += " AND r.type = ?"
        #params.append(reading_type)

    sql += " ORDER BY k.freq IS NULL, k.freq" #order by most common, null last
    with closing(_connect()) as con:
        rows = con.execute(sql, params).fetchall()
    return kanji_info("".join(r["literal"] for r in rows))

#lookup by meanings
def kanji_by_meaning(meaning): #switch to fts5 maybe? faster
    print("debug: kanji meaning search")
    with closing(_connect()) as con:
        rows = con.execute("""
            SELECT k.* from kanji k
            JOIN kanji_meanings m ON k.literal = m.literal
            WHERE m.meaning LIKE ? COLLATE NOCASE
            GROUP BY k.literal
            ORDER BY k.freq IS NULL, k.freq
        """, (f"%{meaning}%",)).fetchall()
    return kanji_info("".join([r["literal"] for r in rows]))

def search_kanji(text):
    text = text.strip()
    if _JP.search(text):
        for char in text: #if at least one kanji
            if _is_kanji(char): 
                print("kanji search")
                return kanji_info(text)
        return kanji_by_reading(text) #does not contain kanji, hira/kata reading
    #alphabet to jp (note: alphabet does not mean english)
    else:
        rom = kanji_by_reading(rom_to_kan(text)) #kunyomi stored as hiragana
        rom_katakana = kanji_by_reading((rom_to_kan(text, katakana=True))) #onyomi stored as katakana
        if rom != []: #hiragana priority
            return rom
        elif rom_katakana != []: 
            return rom_katakana
        else: #no exact match, english
            return kanji_by_meaning(text)