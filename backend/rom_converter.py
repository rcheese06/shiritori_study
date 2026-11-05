ROM_DICT = {
    #standard
    "a": "あ", "i": "い", "u": "う", "e": "え", "o": "お",
    "ka": "か", "ki": "き", "ku": "く", "ke": "け", "ko": "こ",
    "sa": "さ", "su": "す", "se": "せ", "so": "そ",
    "ta": "た", "te": "て", "to": "と",
    "na": "な", "ni": "に", "nu": "ぬ", "ne": "ね", "no": "の",
    "ha": "は", "he": "へ", "ho": "ほ",
    "ma": "ま", "mi": "み", "mu": "む", "me": "め", "mo": "も",
    "ya": "や", "yu": "ゆ", "yo": "よ",
    "ra": "ら", "ri": "り", "ru": "る", "re": "れ", "ro": "ろ",
    "wa": "わ", "wi": "ゐ", "we": "ゑ", "wo": "を",
    "ga": "が", "gi": "ぎ", "gu": "ぐ", "ge": "げ", "go": "ご",
    "za": "ざ", "ze": "ぜ", "zo": "ぞ",
    "da": "だ", "de": "で", "do": "ど",
    "ba": "ば", "bi": "び", "bu": "ぶ", "be": "べ", "bo": "ぼ",
    "pa": "ぱ", "pi": "ぴ", "pu": "ぷ", "pe": "ぺ", "po": "ぽ",

    #combinations
    "kya": "きゃ", "kyu": "きゅ", "kyo": "きょ",
    "gya": "ぎゃ", "gyu": "ぎゅ", "gyo": "ぎょ",
    "nya": "にゃ", "nyu": "にゅ", "nyo": "にょ",
    "hya": "ひゃ", "hyu": "ひゅ", "hyo": "ひょ",
    "bya": "びゃ", "byu": "びゅ", "byo": "びょ",
    "pya": "ぴゃ", "pyu": "ぴゅ", "pyo": "ぴょ",
    "mya": "みゃ", "myu": "みゅ", "myo": "みょ",
    "rya": "りゃ", "ryu": "りゅ", "ryo": "りょ",

    #hepburn variant
    "shi": "し", "chi": "ち", "tsu": "つ", "fu": "ふ", "ji": "じ",
    "sha": "しゃ", "shu": "しゅ", "sho": "しょ",
    "cha": "ちゃ", "chu": "ちゅ", "cho": "ちょ",
    "ja": "じゃ", "ju": "じゅ", "jo": "じょ",

    #kunrei-shiki variant
    "si": "し", "ti": "ち", "tu": "つ", "hu": "ふ", "zi": "じ",
    "di": "ぢ", "du": "づ",
    "sya": "しゃ", "syu": "しゅ", "syo": "しょ",
    "tya": "ちゃ", "tyu": "ちゅ", "tyo": "ちょ",
    "zya": "じゃ", "zyu": "じゅ", "zyo": "じょ",
    "dya": "ぢゃ", "dyu": "ぢゅ", "dyo": "ぢょ",

    #small
    "xa": "ぁ", "xi": "ぃ", "xu": "ぅ", "xe": "ぇ", "xo": "ぉ",
    "la": "ぁ", "li": "ぃ", "lu": "ぅ", "le": "ぇ", "lo": "ぉ",
    "xya": "ゃ", "xyu": "ゅ", "xyo": "ょ",
    "lya": "ゃ", "lyu": "ゅ", "lyo": "ょ",
    "xtu": "っ", "xtsu": "っ", "ltu": "っ", "ltsu": "っ",
    "xwa": "ゎ", "lwa": "ゎ",

    #extended
    "fa": "ふぁ", "fi": "ふぃ", "fe": "ふぇ", "fo": "ふぉ",
    "je": "じぇ", "che": "ちぇ", "she": "しぇ",
    "thi": "てぃ", "dhi": "でぃ", "twu": "とぅ", "dwu": "どぅ",
    "tsa": "つぁ", "tsi": "つぃ", "tse": "つぇ", "tso": "つぉ",
    "wu": "う", "wha": "うぁ", "whi": "うぃ", "whe": "うぇ", "who": "うぉ",
    "vu": "ゔ", "va": "ゔぁ", "vi": "ゔぃ", "ve": "ゔぇ", "vo": "ゔぉ",
}

_VOWELS = set("aiueo")

def _to_katakana(s: str) -> str:
    return "".join(chr(ord(c) + 0x60) if "ぁ" <= c <= "ゖ" else c for c in s)

def rom_to_kan(text, katakana=False):
    rom = text.lower()
    index = 0
    result = ""

    while index < len(rom):
        char = rom[index]

        #nn -> ん
        if rom.startswith("nn"):
            result += "ん"
            index += 2
            continue
        #n' -> ん
        if rom.startswith("n'"):
            result += "ん"
            index += 2
            continue

        #double consonants -> っ
        if index + 1 < len(rom) and rom[index] == rom[index + 1] and rom[index] not in _VOWELS:
            result += "っ"
            index += 1
            continue

        #elongated vowels -> ー
        if char == "-":
            result += "ー"
            index += 1
            continue

        for length in range(min(4,len(rom)-index), 0, -1): #4 is the max length of chars in a single romaji string
            rom_str = rom[index:index + length]
            if rom_str in ROM_DICT:
                result += ROM_DICT[rom_str]
                index += length
                break
        else:
            result += char
            index += 1

    return _to_katakana(result) if katakana else result