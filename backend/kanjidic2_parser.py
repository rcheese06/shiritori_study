import xml.etree.ElementTree as ET  

xml = "kanjidic2.xml"
   
entries = {}  
for event, elem in ET.iterparse(xml):
    if elem.tag == 'character':
         literal = elem.findtext("literal")
         entries[literal] = {
            "meaning": [x.text for x in elem.findall("reading_meaning/rmgroup/meaning") if x.get("m_lang") is None], #get the english meaning only
            "jlpt": elem.findtext("misc/jlpt"),
            "onyomi": [x.text for x in elem.findall("reading_meaning/rmgroup/reading[@r_type='ja_on']")],
            "kunyomi": [x.text for x in elem.findall("reading_meaning/rmgroup/reading[@r_type='ja_kun']")],
            "nanori": [x.text for x in elem.findall("reading_meaning/nanori")]
         }
         elem.clear()