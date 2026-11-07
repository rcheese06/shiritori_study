import json
import re
import sqlite3
import zipfile
from pathlib import Path

import jitendex_parser as jparser
import kanjidic2_parser as kparser

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
JIT_PATH = DATA_DIR / "jitendex-yomitan.zip"
KAN_PATH = DATA_DIR / "kanjidic2.xml"
DB_PATH = BASE_DIR / "dictionary.db"

def index(name):
    return int(re.search(r"(\d+)", Path(name).stem).group(1))

def build_db():
    if DB_PATH.exists(): #rebuild if already exists
        DB_PATH.unlink() 
    con = sqlite3.connect(DB_PATH)
    con.execute("PRAGMA foreign_keys = ON")

    build_words(con)
    build_kanji(con)

def build_words(con):
    con.execute("""
        CREATE TABLE entries (
            id INTEGER PRIMARY KEY,
            expression TEXT NOT NULL,
            reading TEXT,
            tags TEXT,
            score INTEGER,
            part_of_speech_info TEXT,
            definition TEXT,
            example_sentence_a TEXT,
            example_sentence_b TEXT,
            sequence_id TEXT
        )
    """)

    with zipfile.ZipFile(JIT_PATH, "r") as zf:
        names = [n for n in zf.namelist() if re.fullmatch(r"(?:.*/)?term_bank_\d+\.json", n)]
        rows = []
        for name in sorted(names, key=index):
            with zf.open(name) as file:
                data = json.load(file)
  
            for entry in data:
                definitions = jparser.parse_glossary(entry[5]) if entry[5] else {}
                rows.append((
                    entry[0],
                    entry[1],
                    " ".join(entry[2]) if entry[2] else None,
                    entry[4],
                    definitions.get("part-of-speech-info", ""),
                    definitions.get("glossary", ""),
                    definitions.get("example-sentence-a", ""),
                    definitions.get("example-sentence-b", ""),
                    entry[6] if entry[6] else None,
                ))

    con.executemany("""
        INSERT INTO entries (expression, reading, tags, score, part_of_speech_info, definition, example_sentence_a, example_sentence_b, sequence_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, rows)
    con.commit()

    #indexes
    con.execute("CREATE INDEX jit_index_expression ON entries(expression)")
    con.execute("CREATE INDEX jit_index_reading ON entries(reading)")
    con.commit()

    #FTS5 for english meaning search
    con.execute("""
        CREATE VIRTUAL TABLE glossary_fts USING fts5(
            definition,
            content='entries',
            content_rowid='id',
            tokenize = 'porter unicode61'
        )
    """)
    #fts_rows = []
    #for id, definition in con.execute("SELECT id, definition FROM entries").fetchall():
    #    if definition and definition.strip():
    #        fts_rows.append((id, definition))
    #con.executemany("INSERT INTO glossary_fts (rowid, text) VALUES (?, ?)", fts_rows)
    con.execute("INSERT INTO glossary_fts(glossary_fts) VALUES('rebuild')")
    con.commit()

def build_kanji(con):
    #normalised 3 tables for kanji
    con.executescript("""
        CREATE TABLE kanji (
            literal TEXT PRIMARY KEY,
            jlpt INTEGER,
            stroke INTEGER,
            freq INTEGER
        );

        CREATE TABLE kanji_readings (
            id INTEGER PRIMARY KEY,
            literal TEXT NOT NULL,
            reading TEXT NOT NULL,
            plaintext_reading TEXT,
            type TEXT NOT NULL,
            FOREIGN KEY (literal) REFERENCES kanji(literal)
        );

        CREATE TABLE kanji_meanings (
            id INTEGER PRIMARY KEY,
            literal TEXT NOT NULL,
            meaning TEXT NOT NULL,
            FOREIGN KEY (literal) REFERENCES kanji(literal)
        );
    """)

    for kanji_row, readings, meanings in kparser.parse_kanji(KAN_PATH):
        con.execute("""
            INSERT INTO kanji (literal, jlpt, stroke, freq)
            VALUES (?, ?, ?, ?)
        """, 
        kanji_row
        )
        con.executemany("""
            INSERT INTO kanji_readings (literal, reading, plaintext_reading, type)
            VALUES (?, ?, ?, ?)
        """,
        readings
        )
        con.executemany("""
            INSERT INTO kanji_meanings (literal, meaning)
            VALUES (?, ?)
        """,
        meanings
        )
    con.commit()

    #indexes
    con.execute("CREATE INDEX kan_index_rd_literal ON kanji_readings(literal)")
    con.execute("CREATE INDEX kan_index_rd_reading ON kanji_readings(reading)")
    con.execute("CREATE INDEX kan_index_mn_literal ON kanji_meanings(literal)")
    con.execute("CREATE INDEX kan_index_mn_meaning ON kanji_meanings(meaning)")
    con.commit()

if __name__ == "__main__":
    build_db()