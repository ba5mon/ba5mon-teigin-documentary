"""Generate per-chapter narration with Kokoro (local, Apache-2.0) and sentence timings for subtitles."""
import re, json, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

VOICE = sys.argv[1] if len(sys.argv) > 1 else "am_michael"
ROOT = "/home/user/lemo-opuscar"
# Slower, heavier pacing for the solemn chapters; a touch quicker for investigation.
SOLEMN = {"Cold Open", "The Medicine", "After the Alarm", "Thirty-Nine Years", "Legacy", "The Questions Remain"}
SENT_GAP, PARA_GAP, LEAD, TAIL = 0.45, 0.95, 0.6, 1.4

# Spoken-form fixes (subtitles keep the script wording).
SAY = [(r"3:20 pm", "three twenty p.m."), (r"Shirō", "Shiro"), (r"Seichō", "Seicho"), (r"Tetsurō", "Tetsuro"),
       (r"Teikoku Ginkō", "Teikoku Ginko"), (r"164,000 yen", "a hundred and sixty-four thousand yen"),
       (r"17,000 yen", "seventeen thousand yen"), (r"56-year-old", "fifty-six-year-old"),
       (r"39 years", "thirty-nine years"), (r"32 of them", "thirty-two of them"), (r"Hachiōji", "Hachioji")]

def chapters():
    src = open(f"{ROOT}/script_body.md").read()
    for c in re.split(r"^## ", src, flags=re.M)[1:]:
        head, body = c.split("\n", 1)
        title = re.sub(r"\s*\{.*\}", "", head).strip()
        body = re.sub(r"\s*\[VERIFY[^\]]*\]", "", body)
        paras = [p.strip() for p in body.split("\n\n") if p.strip()]
        yield title, paras

def sentences(p):
    return [s for s in re.split(r"(?<=[.?!])\s+(?=[A-Z])", p) if s]

k = Kokoro(f"{ROOT}/models/kokoro-v1.0.onnx", f"{ROOT}/models/voices-v1.0.bin")
timings, total = [], 0.0
for i, (title, paras) in enumerate(chapters(), 1):
    speed = 0.86 if title in SOLEMN else 0.92
    sr = 24000
    out, t, cues = [np.zeros(int(LEAD * sr), np.float32)], LEAD, []
    for pi, p in enumerate(paras):
        for si, s in enumerate(sentences(p)):
            spoken = s
            for a, b in SAY: spoken = re.sub(a, b, spoken)
            audio, sr = k.create(spoken, voice=VOICE, speed=speed, lang="en-us")
            cues.append({"start": t, "end": t + len(audio) / sr, "text": s})
            out.append(audio.astype(np.float32)); t += len(audio) / sr
            gap = SENT_GAP if si < len(sentences(p)) - 1 else (PARA_GAP if pi < len(paras) - 1 else TAIL)
            out.append(np.zeros(int(gap * sr), np.float32)); t += gap
    wav = f"{ROOT}/audio/ch{i:02d}.wav"
    sf.write(wav, np.concatenate(out), sr)
    timings.append({"n": i, "title": title, "duration": t, "cues": cues})
    total += t
    print(f"ch{i:02d} {t/60:5.2f} min  {title}", flush=True)
json.dump({"voice": VOICE, "chapters": timings}, open(f"{ROOT}/audio/timings.json", "w"), indent=1)
print(f"TOTAL {total/60:.2f} min")
