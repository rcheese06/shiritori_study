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

#part_of_speech_info(POS): noun, verb, etc.
#each entry has multiple POS (sense table)
#each POS has multiple definitions (gloss table)
#each POS can have a example sentence (sentence table)
def build_words(con):
    con.executescript("""
        CREATE TABLE vocab (
            id INTEGER PRIMARY KEY,
            expression TEXT NOT NULL,
            reading TEXT,
            tags TEXT,
            score INTEGER,
            sequence_id TEXT
        );

        CREATE TABLE vocab_senses (
            id INTEGER PRIMARY KEY,
            entry_id INTEGER NOT NULL,
            position INTEGER,
            part_of_speech_info TEXT,
            FOREIGN KEY (entry_id) REFERENCES vocab(id)
        );

        CREATE TABLE vocab_glosses (
            id INTEGER PRIMARY KEY,
            sense_id INTEGER NOT NULL,
            entry_id INTEGER NOT NULL,
            position INTEGER,
            definition TEXT,
            FOREIGN KEY (entry_id) REFERENCES vocab(id),
            FOREIGN KEY (sense_id) REFERENCES vocab_senses(id)
        );

        CREATE TABLE vocab_sentences(
            id INTEGER PRIMARY KEY,
            sense_id INTEGER NOT NULL,
            jp TEXT,
            en TEXT,
            FOREIGN KEY (sense_id) REFERENCES vocab_senses(id)
        );
    """)

    entry_rows, sense_rows, gloss_rows, example_rows = [], [], [], []
    entry_id = sense_id = gloss_id = example_id = 0

    with zipfile.ZipFile(JIT_PATH, "r") as zf:
        names = [n for n in zf.namelist() if re.fullmatch(r"(?:.*/)?term_bank_\d+\.json", n)]
        rows = []
        for name in sorted(names, key=index):
            with zf.open(name) as file:
                data = json.load(file)
  
            for entry in data:
                parsed = jparser.parse_glossary(entry[5]) if entry[5] else {}
                entry_id += 1
                entry_rows.append((
                    entry_id, 
                    entry[0], 
                    entry[1],
                    entry[2] or None, 
                    entry[4], 
                    entry[6] or None
                ))

                for s_pos, sense in enumerate(parsed.get("senses", [])):
                    sense_id += 1
                    sense_rows.append((sense_id, entry_id, s_pos, ",".join(sense["part_of_speech_info"])))

                    for g_pos, text in enumerate(sense["glosses"]):
                        gloss_id += 1
                        gloss_rows.append((gloss_id, sense_id, entry_id, g_pos, text))

                    for ex in sense["examples"]:
                        example_id += 1
                        example_rows.append((example_id, sense_id, ex["a"], ex["b"]))

    con.executemany("INSERT INTO vocab VALUES (?, ?, ?, ?, ?, ?)", entry_rows)
    con.executemany("INSERT INTO vocab_senses VALUES (?, ?, ?, ?)", sense_rows)
    con.executemany("INSERT INTO vocab_glosses VALUES (?, ?, ?, ?, ?)", gloss_rows)
    con.executemany("INSERT INTO vocab_sentences VALUES (?, ?, ?, ?)", example_rows)
    con.commit()

    #indexes
    con.execute("CREATE INDEX index_entries_expression ON vocab(expression)")
    con.execute("CREATE INDEX index_entries_reading ON vocab(reading)")
    con.execute("CREATE INDEX index_senses_entry ON vocab_senses(entry_id)")
    con.execute("CREATE INDEX index_glosses_sense ON vocab_glosses(sense_id)")
    con.execute("CREATE INDEX index_glosses_entry ON vocab_glosses(entry_id)")
    con.execute("CREATE INDEX index_examples_sense ON vocab_sentences(sense_id)")
    con.commit()

    #FTS5 for english meaning search
    con.execute("""
        CREATE VIRTUAL TABLE glossary_fts USING fts5(
            definition,
            content='vocab_glosses',
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

#normalised 3 tables for kanji info, reading, meaning
def build_kanji(con):
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