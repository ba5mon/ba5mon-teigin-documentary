"""Narration with Kokoro (local, voice am_michael): one WAV per chapter + per-sentence timings.

The locked script is read from script.md (VERIFY notes stripped). Numbers are spelled out and
Japanese names are given hand-written phonemes; subtitles keep the script wording.
usage: python gen.py [chapter numbers...]   (default: all)
"""
import json, re, sys
from pathlib import Path
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

HERE = Path(__file__).resolve().parent
FILM = HERE.parent
LIB = FILM.parent.parent
VOICE = "am_michael"
SOLEMN = {1, 4, 5, 20, 21, 22}            # slower, heavier read
SPEED_SOLEMN, SPEED = 0.86, 0.91
SENT_GAP, PARA_GAP, LEAD, TAIL = 0.42, 0.9, 0.3, 1.0

# Spoken forms (applied in order). Subtitles keep the original text.
SAY = [
    (r"January 26, 1948", "January twenty-sixth, nineteen forty-eight"),
    (r"January 19, 1948", "January nineteenth, nineteen forty-eight"),
    (r"May 10, 1987", "May tenth, nineteen eighty-seven"),
    (r"3:20 pm", "three twenty P.M."),
    (r"164,000 yen", "a hundred and sixty-four thousand yen"),
    (r"17,000 yen", "seventeen thousand yen"),
    (r"56-year-old", "fifty-six-year-old"),
    (r"almost 39 years", "almost thirty-nine years"),
    (r"32 of them", "thirty-two of them"),
    (r"age of 95", "age of ninety-five"),
    (r"Unit 731", "Unit seven thirty-one"),
    (r"1892", "eighteen ninety-two"),
    (r"1925", "nineteen twenty-five"),
    (r"1940s", "nineteen-forties"), (r"1960s", "nineteen-sixties"),
    (r"1970s", "nineteen-seventies"), (r"1980s", "nineteen-eighties"),
    (r"1947", "nineteen forty-seven"), (r"1948", "nineteen forty-eight"),
    (r"1949", "nineteen forty-nine"), (r"1950", "nineteen fifty"),
    (r"1955", "nineteen fifty-five"), (r"1964", "nineteen sixty-four"),
    (r"1985", "nineteen eighty-five"), (r"1987", "nineteen eighty-seven"),
    (r"Shirō", "Shiro"), (r"Seichō", "Seicho"), (r"Tetsurō", "Tetsuro"),
]
# Japanese names: phonemes close to the Japanese, in Kokoro's (espeak) inventory.
NAMES = {
    "Shiinamachi": "ʃˌiːnɑːmˈɑːtʃi",
    "Teigin": "tˈeɪɡɪn",
    "Hirasawa": "hˌiːɹɑːsˈɑːwɑː",
    "Sadamichi": "sˌɑːdɑːmˈiːtʃi",
    "Otaru": "oʊtˈɑːɹuː",
    "Noborito": "nˌoʊboʊɹˈiːtoʊ",
    "Ishii": "iːʃˈiː",
    "Seicho": "sˈeɪtʃoʊ",
    "Matsumoto": "mˌɑːtsuːmˈoʊtoʊ",
    "Tetsuro": "tɛtsˈuːɹoʊ",
    "Morikawa": "mˌoʊɹiːkˈɑːwɑː",
    "Kumai": "kuːmˈaɪ",
    "Matsui": "mɑːtsˈuːi",
    "Shigeru": "ʃˌiːɡɛɹˈuː",
    "Yasuda": "jɑːsˈuːdɑː",
    "Hokkaido": "hoʊkˈaɪdoʊ",
}

# Phoneme touch-ups for endings Kokoro swallows (found by the speech check).
PH_FIX = [("mˈænɪdʒd", "mˈænɪdʒd,"), ("lˈʊkt", "lˈʊkt,"), ("ænd hɪz pˈæst", "ˈænd hɪz pˈæst")]


def chapters():
    src = (FILM / "script.md").read_text()
    for c in re.split(r"^### ", src, flags=re.M)[1:]:
        head, body = c.split("\n", 1)
        body = re.sub(r"\s*\[VERIFY[^\]]*\]", "", body)
        yield head.strip(), [" ".join(p.split()) for p in body.split("\n\n") if p.strip()]


def sentences(p):
    return [s for s in re.split(r"(?<=[.?!])\s+(?=[A-Z])", p) if s]


def spoken(s):
    for a, b in SAY:
        s = re.sub(a, b, s)
    return s


def phonemes(tok, text):
    ph = tok.phonemize(text, "en-us")
    for name, good in NAMES.items():
        if re.search(rf"\b{name}\b", text):
            bad = tok.phonemize(name, "en-us")
            if bad not in ph:
                raise SystemExit(f"phoneme override for {name} not found in: {ph}")
            ph = ph.replace(bad, good)
    for bad, good in PH_FIX:
        ph = ph.replace(bad, good)
    return ph


def main():
    only = {int(a) for a in sys.argv[1:]}
    k = Kokoro(str(LIB / "core/tts/kokoro-v1.0.onnx"), str(LIB / "core/tts/voices-v1.0.bin"))
    tok = Tokenizer()
    tpath = FILM / "audio/timings.json"
    old = {c["n"]: c for c in json.loads(tpath.read_text())["chapters"]} if tpath.exists() else {}
    (FILM / "audio").mkdir(exist_ok=True)
    lines = []                              # for asr_check: one entry per sentence
    timings = []
    for n, (title, paras) in enumerate(chapters(), 1):
        if only and n not in only:
            timings.append(old[n]); continue
        speed = SPEED_SOLEMN if n in SOLEMN else SPEED
        sr = 24000
        out, t, cues = [np.zeros(int(LEAD * sr), np.float32)], LEAD, []
        for pi, p in enumerate(paras):
            ss = sentences(p)
            for si, s in enumerate(ss):
                say = spoken(s)
                audio, sr = k.create(phonemes(tok, say), voice=VOICE, speed=speed, is_phonemes=True)
                audio = audio.astype(np.float32)
                cues.append({"start": round(t, 3), "end": round(t + len(audio) / sr, 3), "text": s, "say": say})
                sf.write(HERE / "lines" / f"c{n:02d}_{len(cues):02d}.wav", audio, sr) if (HERE / "lines").exists() else None
                out.append(audio); t += len(audio) / sr
                gap = SENT_GAP if si < len(ss) - 1 else (PARA_GAP if pi < len(paras) - 1 else TAIL)
                out.append(np.zeros(int(gap * sr), np.float32)); t += gap
        sf.write(FILM / f"audio/ch{n:02d}.wav", np.concatenate(out), sr)
        timings.append({"n": n, "title": title, "duration": round(t, 3), "cues": cues})
        print(f"ch{n:02d} {t:6.1f}s  {title}", flush=True)
    total = sum(c["duration"] for c in timings)
    tpath.write_text(json.dumps({"voice": VOICE, "engine": "kokoro-onnx v1.0", "chapters": timings}, indent=1, ensure_ascii=False))
    print(f"TOTAL narration {total:.1f}s = {total/60:.2f} min")


if __name__ == "__main__":
    main()
