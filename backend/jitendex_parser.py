import json
from pathlib import Path

def concat_child(node):
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "".join(concat_child(n) for n in node)
    if isinstance(node, dict):
        return concat_child(node.get("content"))
    return ""

def walk(node):
    if isinstance(node, list):
        for n in node:
            yield from walk(n)
    elif isinstance(node, dict):
        yield node
        yield from walk(node.get("content"))

def find(node, key):
    for n in walk(node):
        data = n.get("data")
        if isinstance(data, dict) and data.get("content") == key:
            yield n

def first_text(node, key):
    for n in find(node, key):
        return concat_child(n)
    return None

def parse_glossary(array):
    result = []

    for a in array:
        for group in find(a, "sense-group"):
            pos = sorted({concat_child(n) for n in find(group, "part-of-speech-info")})
 
            for sense in find(group, "sense"):
                if pos:
                    result.append({"part-of-speech-info": ", ".join(pos)})
 
                glosses = [concat_child(li)
                           for g in find(sense, "glossary")
                           for li in walk(g.get("content"))
                           if li.get("tag") == "li"]
                if glosses:
                    result.append({"glossary": ", ".join(glosses)})
 
                for ex in find(sense, "example-sentence"):
                    jp = first_text(ex, "example-sentence-a")
                    en = first_text(ex, "example-sentence-b")
                    if jp is not None:
                        result.append({"example-sentence-a": jp})
                    if en is not None:
                        result.append({"example-sentence-b": en})
 
        attribution = first_text(a, "attribution")
        if attribution is not None:
            result.append({"attribution": attribution})
    return result

#with open("term_bank_18.json", "r", encoding="utf-8") as file: #update for all
   #data = json.load(file)

'''
parsed = []

for entry in data:
   expression = entry[0]
   reading = entry[1]
   tags = entry[2].split() if entry[2] else []
   rules = entry[3]
   score = entry[4]
   glossary = entry[5]
   sequence = entry[6] if len(entry) > 6 else None


   clean_defs = parse_glossary(glossary)

   parsed.append(
      {
         "expression": expression,
         "reading": reading,
         "tags": tags,
         "score": score,
         "definitions": clean_defs,
         "sequence_id": sequence
         }
      )
'''