"""timeline.json for the 11-scene production script (single source of truth for page, mix and subtitles).
Scene 1 starts the film; the main title (5 s) follows it; chapter cards (3 s, no narration) precede scenes 2, 3, 5, 6, 7, 9, 10, 11;
scenes 4 and 8 follow straight on; the final card ends the film. Subtitles: one line per cue, timed from the Whisper word times."""
import json, re
from pathlib import Path

F2 = Path(__file__).resolve().parent.parent
CARD, MAIN, FINAL = 3.0, 5.0, 7.0
MAXC = 72
CARDS = {2: 'Chapter 1: A City in Ruins', 3: 'Chapter 2: The Visitor', 5: 'Chapter 3: The Money Left Behind', 6: 'Chapter 4: Two Rehearsals',
         7: 'Chapter 5: The Painter', 9: 'Chapter 6: The Shadow of Unit 731', 10: 'Chapter 7: The Verdict', 11: 'Chapter 8: Thirty-Two Years'}
MAIN_TITLE = ('THE TEIGIN INCIDENT', 'The Imperial Bank Poisoning, 1948')
FINAL_CARD = ('The case remains officially closed.', 'The questions remain open.')


def chunks(s):
    if len(s) <= MAXC: return [s]
    best = None
    for m in re.finditer(r"[,:;] ", s):
        k = m.end()
        if 26 <= k <= len(s) - 26:
            d = abs(k - len(s) / 2)
            if best is None or d < best[0]: best = (d, k)
    k = best[1] if best else min((m.start() for m in re.finditer(" ", s)), key=lambda i: abs(i - len(s) / 2)) + 1
    return chunks(s[:k].strip()) + chunks(s[k:].strip())


def main():
    T = json.loads((F2 / 'audio/timings.json').read_text()); WORDS = json.loads((F2 / 'words.json').read_text())
    segs, subs, sent, t = [], [], [], 0.0
    for c in T['chapters']:
        n = c['n']
        if n in CARDS: segs.append({'kind': 'card', 'scene': n, 'title': CARDS[n], 't0': round(t, 3), 't1': round(t + CARD, 3)}); t += CARD
        t0 = t
        seg = {'kind': 'scene', 'scene': n, 'title': c['title'], 't0': round(t0, 3), 't1': round(t0 + c['duration'], 3), 'audio': f'audio/s{n:02d}.wav', 'cues': [], 'follows': n not in CARDS and n > 1}
        for i, q in enumerate(c['cues'], 1):
            a, b = t0 + q['start'], t0 + q['end']; seg['cues'].append([round(a, 3), round(b, 3)])
            sent.append({'scene': n, 'i': i, 't0': round(a, 3), 't1': round(b, 3), 'text': q['text']})
            parts, words = chunks(q['text']), WORDS.get(f's{n:02d}_{i:02d}', [])
            spans = []
            if words and sum(len(p.split()) for p in parts) == len(words):
                k = 0
                for p in parts:
                    nw = len(p.split()); ws = words[k:k + nw]; k += nw; spans.append((a + max(0, ws[0][1]), a + min(q['end'] - q['start'], ws[-1][2])))
            else:
                tot = sum(len(p) for p in parts); acc = 0
                for p in parts: spans.append((a + (b - a) * acc / tot, a + (b - a) * (acc + len(p)) / tot)); acc += len(p)
            for p, (s0, s1) in zip(parts, spans): subs.append({'scene': n, 't0': round(s0 - .05, 3), 'speech_end': round(s1, 3), 'text': p})
        segs.append(seg); t = t0 + c['duration']
        if n == 1: segs.append({'kind': 'main', 't0': round(t, 3), 't1': round(t + MAIN, 3), 'text': MAIN_TITLE}); t += MAIN
    segs.append({'kind': 'final', 't0': round(t, 3), 't1': round(t + FINAL, 3), 'text': FINAL_CARD}); t += FINAL
    merged = []
    for s in subs:
        if merged and merged[-1]['scene'] == s['scene'] and merged[-1]['speech_end'] - merged[-1]['t0'] < 1.25 and len(merged[-1]['text']) + len(s['text']) + 1 <= 76:
            merged[-1]['text'] += ' ' + s['text']; merged[-1]['speech_end'] = s['speech_end']
        else: merged.append(dict(s))
    subs = merged
    end = {s['scene']: s['t1'] for s in segs if s['kind'] == 'scene'}
    for i, s in enumerate(subs):
        nxt = subs[i + 1]['t0'] if i + 1 < len(subs) and subs[i + 1]['scene'] == s['scene'] else end[s['scene']] - .1
        s['t1'] = round(min(max(s['speech_end'] + .6, s['t0'] + 1.8), nxt - .02), 3)
    (F2 / 'timeline.json').write_text(json.dumps({'dur': round(t, 3), 'segs': segs, 'subs': subs, 'sentences': sent}, indent=1, ensure_ascii=False))
    short = [s for s in subs if s['t1'] - s['t0'] < 1.8]
    print(f"dur {t:.1f}s = {t / 60:.2f} min · {len(subs)} subtitles · {len(short)} shorter than 1.8 s · longest {max(len(s['text']) for s in subs)} chars")
    for s in short: print('  short', s['t0'], round(s['t1'] - s['t0'], 2), s['text'])


if __name__ == '__main__':
    main()
