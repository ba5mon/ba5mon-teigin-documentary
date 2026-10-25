"""Assemble the 11 scene narration tracks from the per-sentence Kokoro recordings of the previous version
(every sentence of the new script exists there and passed the speech check). Writes audio/sNN.wav and audio/timings.json.
Each scene: (title, [paragraphs], each paragraph = list of (part, sentence index 1-based))."""
import json, numpy as np, soundfile as sf
from pathlib import Path
F2 = Path(__file__).resolve().parent.parent; OLD = F2.parent / 'film'
T = json.loads((OLD / 'audio/timings.json').read_text()); P = {c['n']: c for c in T['chapters']}
W = json.loads((OLD / 'voice/words.json').read_text())
r = lambda part, a, b: [(part, i) for i in range(a, b + 1)]
SCENES = [
  ('Cold open', [r(1, 1, 4), r(1, 5, 5)]),
  ('Japan in 1948', [r(2, 1, 5)]),
  ('The visitor', [r(3, 1, 2), r(3, 3, 6)]),
  ('The medicine', [r(4, 1, 4), r(4, 7, 10), r(4, 11, 13)]),
  ('The money left behind', [r(6, 1, 3), r(6, 4, 7)]),
  ('The earlier attempts', [r(8, 1, 3), r(8, 4, 7)]),
  ('The suspect', [r(11, 1, 2), r(11, 3, 7)]),
  ('The confession', [r(13, 1, 4), r(13, 5, 7)]),
  ('The Unit 731 theory', [r(15, 1, 1), r(15, 2, 5), r(15, 6, 9)]),
  ('The verdict', [r(17, 1, 2), r(17, 3, 6)]),
  ('The ending', [r(20, 1, 3), r(22, 1, 4)]),
]
SENT_GAP, PARA_GAP, LEAD, TAIL, SR = .42, .9, .3, 1.0, 24000
out = {'voice': 'am_michael', 'engine': 'kokoro-onnx v1.0 (reused sentence recordings)', 'chapters': []}; words = {}
for n, (title, paras) in enumerate(SCENES, 1):
    buf, t, cues = [np.zeros(int(LEAD * SR), np.float32)], LEAD, []
    for pi, para in enumerate(paras):
        for si, (part, i) in enumerate(para):
            x, sr = sf.read(OLD / f'voice/lines/c{part:02d}_{i:02d}.wav', dtype='float32'); assert sr == SR
            q = P[part]['cues'][i - 1]
            cues.append({'start': round(t, 3), 'end': round(t + len(x) / SR, 3), 'text': q['text'], 'say': q['say'], 'src': f'c{part:02d}_{i:02d}'})
            words[f's{n:02d}_{len(cues):02d}'] = W.get(f'c{part:02d}_{i:02d}', [])
            buf.append(x); t += len(x) / SR
            gap = SENT_GAP if si < len(para) - 1 else (PARA_GAP if pi < len(paras) - 1 else TAIL)
            buf.append(np.zeros(int(gap * SR), np.float32)); t += gap
    sf.write(F2 / f'audio/s{n:02d}.wav', np.concatenate(buf), SR)
    out['chapters'].append({'n': n, 'title': title, 'duration': round(t, 3), 'cues': cues}); print(f's{n:02d} {t:6.1f}s {title}')
(F2 / 'audio/timings.json').write_text(json.dumps(out, indent=1, ensure_ascii=False)); (F2 / 'words.json').write_text(json.dumps(words, ensure_ascii=False))
print('narration', round(sum(c['duration'] for c in out['chapters']) / 60, 2), 'min')
