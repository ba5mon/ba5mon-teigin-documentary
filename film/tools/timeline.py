"""Build timeline.json (the single source of truth) from the measured narration.

Layout: [card I][chapter 1][main title][card II][chapter 2] ... [card XXII][chapter 22][credits]
Each chapter segment = its narration WAV (lead 0.3 s, tail 1.0 s); the paper peel runs in the tail.
Subtitles: each sentence split at punctuation into chunks of at most two lines, timed from the
Whisper word timestamps (voice/words.json); falls back to proportional timing by characters.
"""
import json, re
from pathlib import Path

FILM = Path(__file__).resolve().parent.parent
CARD, MAIN, CREDITS = 4.0, 4.6, 28.0
MAXC = 78            # characters per subtitle cue: one line ≤ 1,500 px at 34 px (checked in the page by SUBCHECK)
ROMAN = "I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII".split()


def chunks(s):
    if len(s) <= MAXC:
        return [s]
    # split at the punctuation closest to the middle
    best = None
    for m in re.finditer(r"[,:;] ", s):
        k = m.end()
        if 30 <= k <= len(s) - 30:
            d = abs(k - len(s) / 2)
            if best is None or d < best[0]:
                best = (d, k)
    if best is None:   # no punctuation: split at the space nearest the middle
        k = min((m.start() for m in re.finditer(" ", s)), key=lambda i: abs(i - len(s) / 2)) + 1
    else:
        k = best[1]
    return chunks(s[:k].strip()) + chunks(s[k:].strip())


def main():
    T = json.loads((FILM / "audio/timings.json").read_text())
    try:
        WORDS = json.loads((FILM / "voice/words.json").read_text())
    except FileNotFoundError:
        WORDS = {}
    segs, subs, sent = [], [], []
    t = 0.0
    for c in T["chapters"]:
        n = c["n"]
        segs.append({"kind": "card", "ch": n, "num": ROMAN[n - 1], "title": c["title"], "t0": round(t, 3), "t1": round(t + CARD, 3)}); t += CARD
        t0 = t
        segs.append({"kind": "ch", "ch": n, "title": c["title"], "t0": round(t0, 3), "t1": round(t0 + c["duration"], 3), "audio": f"audio/ch{n:02d}.wav"})
        cues = []
        for i, q in enumerate(c["cues"], 1):
            a, b = t0 + q["start"], t0 + q["end"]
            cues.append([round(a, 3), round(b, 3)])
            sent.append({"ch": n, "i": i, "t0": round(a, 3), "t1": round(b, 3), "text": q["text"]})
            parts = chunks(q["text"])
            words = [w for w in WORDS.get(f"c{n:02d}_{i:02d}", [])]
            # time each chunk: by words when the counts line up, else by characters
            spans = []
            if words and sum(len(p.split()) for p in parts) == len(words):
                k = 0
                for p in parts:
                    nw = len(p.split()); ws = words[k:k + nw]; k += nw
                    spans.append((a + max(0, ws[0][1]), a + min(q["end"] - q["start"], ws[-1][2])))
            else:
                tot = sum(len(p) for p in parts); acc = 0
                for p in parts:
                    spans.append((a + (b - a) * acc / tot, a + (b - a) * (acc + len(p)) / tot)); acc += len(p)
            for p, (s0, s1) in zip(parts, spans):
                subs.append({"ch": n, "t0": round(s0 - .05, 3), "speech_end": round(s1, 3), "text": p})
        segs[-1]["cues"] = cues
        t = t0 + c["duration"]
        if n == 1:
            segs.append({"kind": "main", "t0": round(t, 3), "t1": round(t + MAIN, 3)}); t += MAIN
    segs.append({"kind": "credits", "t0": round(t, 3), "t1": round(t + CREDITS, 3)}); t += CREDITS
    # merge a cue that would be too short with the next one when both fit on one line
    merged = []
    for s in subs:
        if merged and merged[-1]["ch"] == s["ch"] and merged[-1]["speech_end"] - merged[-1]["t0"] < 1.25 and len(merged[-1]["text"]) + len(s["text"]) + 1 <= 80:
            merged[-1]["text"] += " " + s["text"]; merged[-1]["speech_end"] = s["speech_end"]
        else:
            merged.append(dict(s))
    subs = merged
    # subtitle ends: speech + 0.6 s, at least 1.8 s, never past the next subtitle or the end of its chapter
    chap_end = {s["ch"]: s["t1"] for s in segs if s["kind"] == "ch"}
    for i, s in enumerate(subs):
        nxt = subs[i + 1]["t0"] if i + 1 < len(subs) and subs[i + 1]["ch"] == s["ch"] else chap_end[s["ch"]] - .1
        s["t1"] = round(min(max(s["speech_end"] + .6, s["t0"] + 1.8), nxt - .02), 3)
    out = {"dur": round(t, 3), "card": CARD, "segs": segs, "subs": subs, "sentences": sent}
    (FILM / "timeline.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    short = [s for s in subs if s["t1"] - s["t0"] < 1.8]
    print(f"dur {t:.1f}s = {t/60:.2f} min · {len(subs)} subtitles · {len(short)} shorter than 1.8 s")
    for s in short[:10]:
        print("  short", s["t0"], round(s["t1"] - s["t0"], 2), s["text"][:60])


if __name__ == "__main__":
    main()
