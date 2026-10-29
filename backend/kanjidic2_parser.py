import xml.etree.ElementTree as ET  

def _to_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

def _plain(text):
    return text.replace(".", "").replace("-", "")
    
def parse_kanji(xml):
    for event, elem in ET.iterparse(xml):
        if elem.tag == 'character':
            k = elem.findtext("literal"),

            kanji_row = (
                k,
                _to_int(elem.findtext("misc/jlpt")),
                _to_int(elem.findtext("misc/stroke_count")),
                _to_int(elem.findtext("misc/freq"))
            )

            readings = []
            for r_type, label in [("ja_on", "on"), ("ja_kun", "kun")]:
                for r in elem.findall(f"reading_meaning/rmgroup/reading[@r_type='{r_type}']"):
                    readings.append((k, r.text, _plain(r.text), label))
            for x in elem.findall("reading_meaning/nanori"):
                readings.append((k, x.text, _plain(x.text), "nanori"))

            meanings = [
                (k, x.text)
                for x in elem.findall("reading_meaning/rmgroup/meaning")
                if x.get("m_lang") is None #english only
            ]

            yield kanji_row, readings, meanings
            elem.clear()