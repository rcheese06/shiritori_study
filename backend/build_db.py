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

def build_words(con):
    con.execute("""
        CREATE TABLE entries (
            id INTEGER PRIMARY KEY,
            expression TEXT NOT NULL,
            reading TEXT,
            tags TEXT,
            score INTEGER,
            definitions TEXT,
            sequence_id TEXT
        )
    """)

    with zipfile.ZipFile(JIT_PATH, "r") as zf:
        with zf.open("jitendex-yomitan.json", "r") as f:
            data = json.load(f)

        rows = [
            (
                entry["expression"],
                entry["reading"],
                " ".join(entry["tags"]) if entry["tags"] else None,
                entry["score"],
                json.dumps(entry["definitions"], ensure_ascii=False), #set up FTS5/Tatoeba for english meaning search
                entry["sequence_id"] if entry["sequence_id"] else None
            )
            for entry in data
        ]

    con.executemany("""
        INSERT INTO entries (expression, reading, tags, score, definitions, sequence_id)
        VALUES (?, ?, ?, ?, ?, ?)
    """, rows)
    con.commit()

    #indexes
    con.execute("CREATE INDEX index_expression ON entries(expression)")
    con.execute("CREATE INDEX index_reading ON entries(reading)")
    con.commit()

def build_kanji(con):
    #normalised 3 tables for kanji
    con.executescript("""
        CREATE TABLE kanji (
            literal TEXT PRIMARY KEY,
            jlpt INTEGER,
            stroke INTEGER,
            freq INTEGER,
        )

        CREATE TABLE kanji_readings (
            id INTEGER PRIMARY KEY,
            literal TEXT NOT NULL,
            reading TEXT NOT NULL,
            type TEXT NOT NULL,
            FOREIGN KEY (literal) REFERENCES kanji(literal)
        )

        CREATE TABLE kanji_meanings (
            id INTEGER PRIMARY KEY,
            literal TEXT NOT NULL,
            meaning TEXT NOT NULL,
            FOREIGN KEY (literal) REFERENCES kanji(literal)
        )
    """)

    for kanji_row, readings, meanings in kparser.parse_kanji(KAN_PATH):
        con.executemany("""
            INSERT INTO kanji (literal, jlpt, stroke, freq)
            VALUES (?, ?, ?, ?)
        """, 
        kanji_row
        )
        con.executemany("""
            INSERT INTO kanji_readings (literal, reading, type)
            VALUES (?, ?, ?)
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
    con.execute("CREATE INDEX index_rd_literal ON kanji_readings(literal)")
    con.execute("CREATE INDEX index_reading ON kanji_readings(reading)")
    con.execute("CREATE INDEX index_mn_literal ON kanji_meanings(literal)")
    con.execute("CREATE INDEX index_meaning ON kanji_meanings(meaning)")
    con.commit()