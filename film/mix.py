#!/usr/bin/env python3
"""The Teigin Incident — score, foley, room tone and narration → out/mix.wav (48 kHz stereo).
Timing comes from timeline.json (segments, sentence cues) and events.json (exported from the page: cuts, photos, ticks…).
Score: core/audio/sampler (VSCO 2 CE / VCSL, CC0), D minor, in the Visual Investigation palette:
low D bed (contrabass + cellos) · pendulum tick in the minute-scale chapters · quiet pizzicato ostinato Dm–B♭–Gm–A ·
tremolo minor seconds for the confession and the theory · slow chords for the court and the board · D minor add9 + vibraphone at the end.
Foley is procedural (core/audio/sfx). Music ducks ≈ 9 dB under the voice; two near-silences (ch. 4 the count, ch. 20 the death)."""
import json, os, sys
import numpy as np, soundfile as sf, soxr
D = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or '/home/user/lemo-opuscar'
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, hp, lp, noise, env_exp, t_, whoosh, thump, norm, limit, brown, compress

T = json.load(open(os.path.join(D, 'timeline.json'))); EV = json.load(open(os.path.join(D, 'events.json')))['ev']
DUR = T['dur']; N = int(DUR * SR) + SR
mus = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32); voc = np.zeros((N, 2), np.float32)
S.seed(11); rng = np.random.default_rng(5)
CH = {s['ch']: s for s in T['segs'] if s['kind'] == 'ch'}; CARD = {s['ch']: s for s in T['segs'] if s['kind'] == 'card'}
MAIN = [s for s in T['segs'] if s['kind'] == 'main'][0]; CRED = [s for s in T['segs'] if s['kind'] == 'credits'][0]
q = lambda ch, i: CH[ch]['cues'][i][0]                       # absolute start of sentence i
# near-silences: (start, end) where only room tone and the chosen sounds remain
SILENT = [(q(4, 6) - .05, CH[4]['t1']), (q(20, 2) - 1.2, CH[20]['t1'])]
def silent(t): return any(a <= t < b for a, b in SILENT)

ev = []
def E(t, inst, p, d, v, pan=0, g=1.0):
    if not silent(t): ev.append((float(t), inst, p, float(d), float(v), float(pan), float(g)))

# ───────── Score ─────────
PROG = [('D2', ['D4', 'F4', 'A4', 'F4']), ('Bb1', ['D4', 'F4', 'Bb4', 'F4']), ('G2', ['D4', 'G4', 'Bb4', 'G4']), ('A1', ['C#4', 'E4', 'A4', 'E4'])]
def bed(a, b, root='D2', fifth='A2', v=.5):              # low sustained bed, in 10 s pieces (seamless extension inside the sampler)
    t = a
    while t < b - .5:
        d = min(10.0, b - t); E(t, 'contrabass', root, d + .4, v, -.2, .5); E(t, 'cellos', fifth, d + .4, v * .9, .2, .4); t += d
def ostinato(a, b, v=.3, eighth=1 / 3, bars=2):          # pizzicato eighths, one chord per `bars` bars of 4/4 (8 eighths)
    k = 0; t = a
    while t < b - .05:
        ci = (k // (8 * bars)) % 4; root, pat = PROG[ci]
        E(t, 'violas_pizz', pat[k % 4], .3, v + .08 * (k % 8 == 0), .25, .5)
        if k % 8 == 0: E(t, 'contrabass_pizz', root.replace('1', '2') if root.endswith('1') else root, .6, v + .15, -.25, .6)
        k += 1; t += eighth
def chords(a, b, seq, every=4.0, v=.32):                 # slow string chords (cellos, violas, violins) + harp
    t = a; i = 0
    while t < b - 1:
        n = seq[i % len(seq)]; d = min(every, b - t) + .6
        E(t, 'cellos', n[0], d, v + .05, .15, .45); E(t, 'violas', n[1], d, v, -.1, .32); E(t, 'violins', n[2], d, v - .04, .3, .22); E(t, 'harp', n[0], 2.0, .4, -.2, .25)
        t += every; i += 1
def trem(a, b, v=.22):                                    # tremolo minor second, soft
    E(a, 'violins_trem', 'E5', b - a, v, .35, .2); E(a + 1.2, 'violins_trem', 'F5', b - a - 1.2, v + .03, -.35, .2)
DM = [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4'], ['G2', 'D3', 'Bb3'], ['A2', 'E3', 'C#4']]
seg = lambda c: (CH[c]['t0'], CH[c]['t1'])

# slates: a soft timpani + low string under every chapter card; the main title lands on gran cassa + timpani
for c, s in CARD.items():
    E(s['t0'] + .05, 'timpani', 'D2', 2.0, .45, 0, .45); E(s['t0'], 'contrabass', 'D2', 4.2, .38, 0, .35)
E(MAIN['t0'], 'gran_cassa', 'hit', 2.0, .8, 0, .8); E(MAIN['t0'], 'timpani', 'D2', 2.4, .8, 0, .75); E(MAIN['t0'] + .1, 'sus_cymbal', 'roll', 1.6, .3, .2, .2)
E(MAIN['t0'], 'cellos', 'D3', 4.6, .5, .1, .45); E(MAIN['t0'] + .3, 'violins', 'A4', 4.2, .35, .3, .2)

# Act I · minutes
a, b = seg(1); bed(a, b, v=.42); E(q(1, 3), 'cellos', 'F3', 9, .35, .1, .3); E(q(1, 4), 'timpani', 'D2', 2, .5)
a, b = seg(2); bed(a, b); ostinato(q(2, 1), b - 1, .26)
a, b = seg(3); bed(a, b, v=.45); ostinato(q(3, 1), b - .6, .3); trem(q(3, 2), q(3, 4))
a, b = seg(4); bed(a, q(4, 6), v=.42); E(a, 'cellos', 'D3', q(4, 6) - a, .3, .1, .3)
a, b = seg(5); bed(a, b, 'D2', 'F2', .45); ostinato(q(5, 3), b - 1, .28); E(q(5, 7), 'timpani', 'A2', 2, .45)
a, b = seg(6); bed(a, b); ostinato(a + .3, b - .6, .3)
# Act II · dates
a, b = seg(7); bed(a, b, 'D2', 'A2', .4); chords(q(7, 5), b, DM[::-1], 5.0, .26)
a, b = seg(8); bed(a, b); ostinato(a + .3, b - .6, .28)
a, b = seg(9); bed(a, b); ostinato(a + .3, b - .6, .3)
a, b = seg(10); bed(a, b, 'F2', 'C3', .38); chords(a + .5, q(10, 3), [['F3', 'C4', 'A4'], ['Bb2', 'F3', 'D4']], 6.0, .24); chords(q(10, 3), b, DM, 4.0, .26)
a, b = seg(11); bed(a, b); ostinato(q(11, 2), b - .6, .3)
# Act III · months and years
a, b = seg(12); bed(a, b, 'D2', 'A2', .42); chords(a + .5, b, [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4']], 6.0, .24)
a, b = seg(13); bed(a, b, 'D2', 'Eb3', .42); trem(q(13, 2), q(13, 4)); chords(q(13, 4), b, DM, 5.0, .24)
a, b = seg(14); bed(a, b); chords(q(14, 1), b, DM, 4.5, .27)
a, b = seg(15); bed(a, b, 'D2', 'Eb3', .45); trem(q(15, 3), q(15, 6) + 3); trem(q(15, 7), b - .4)
for t in np.arange(q(15, 3), b - .5, 1.0): E(t, 'contrabass_pizz', 'D2', .5, .55, 0, .5)        # heartbeat-like low pulse under the theory
a, b = seg(16); bed(a, b, 'D2', 'A2', .42); chords(q(16, 2), b, DM, 5.0, .26)
# Act IV · decades
a, b = seg(17); bed(a, b, 'D2', 'A2', .45); E(a + .2, 'timpani', 'D2', 2, .55); E(q(17, 1), 'timpani', 'A2', 2, .5); chords(q(17, 2), b, DM, 4.0, .26)
a, b = seg(18); bed(a, b, 'D2', 'A2', .4); chords(q(18, 4), b, [['D3', 'A3', 'F4'], ['G2', 'D3', 'Bb3']], 6.0, .22)
a, b = seg(19); bed(a, b, 'F2', 'C3', .38); chords(a + .3, b, [['F3', 'C4', 'A4'], ['Bb2', 'F3', 'D4'], ['C3', 'G3', 'E4'], ['F3', 'C4', 'A4']], 4.5, .24)
a, b = seg(20); bed(a, q(20, 2) - 1.2, 'D2', 'A2', .42)
E(q(20, 2) + .1, 'cellos', 'D3', 9.0, .3, 0, .4)                                         # one cello note after the silence
a, b = seg(21); bed(a, b, 'D2', 'A2', .42); chords(q(21, 2), q(21, 5), DM, 5.0, .24); E(q(21, 5), 'cellos', 'D3', b - q(21, 5) + 1, .32, 0, .4)
a, b = seg(22); bed(a, b, 'D2', 'A2', .4)
fin = q(22, 3) + 7.6                                                                      # the last unresolved question → D minor add9 + vibraphone
for p, pan in [('D2', 0), ('D3', -.2), ('A3', .2), ('E4', -.3), ('F4', .3)]: E(fin, 'cellos' if p != 'D2' else 'contrabass', p, CRED['t1'] - fin, .36, pan, .36)
for i, p in enumerate(['D4', 'A4', 'E5', 'F5', 'A5', 'D6']): E(fin + .25 * i, 'vibraphone', p, 3.0, .42, -.3 + .12 * i, .32)
for i, p in enumerate(['D3', 'A3', 'E4', 'F4', 'A4']): E(CRED['t0'] + .2 + .6 * i, 'harp', p, 3.0, .42, -.2 + .1 * i, .3)
E(CRED['t0'] + 17.5, 'cellos', 'D3', 10, .3, 0, .35)

print('score events', len(ev), flush=True)
mus += S.render([e for e in ev if e[0] < DUR], dur=N / SR, master=False)[:N]
mus = S.room(mus, size=.5, mix=.2)

# ───────── Foley (procedural), driven by the page's events ─────────
def tick(v=1.0, f=2400): d = .03; tt = t_(d); return (hp(noise(d), 1800) * env_exp(d, .003) + np.sin(2 * np.pi * f * tt) * env_exp(d, .004) * .6) * v
def paper(v=1.0): d = .25; return bp(noise(d), 1200, 6000) * env_exp(d, .05) * (1 - np.exp(-t_(d) / .01)) * v
def shutter(v=1.0):
    d = .09; a = hp(noise(d), 2000) * env_exp(d, .006); b = np.pad(hp(noise(.05), 1500) * env_exp(.05, .005), (int(.045 * SR), 0))[:len(a)]; return norm(a + b * .8) * v
def typekey(v=1.0): d = .035; return norm(bp(noise(d), 900, 5000) * env_exp(d, .004) + np.sin(2 * np.pi * 180 * t_(d)) * env_exp(d, .008) * .4) * v
def pencil(d=.6, v=1.0): tt = t_(d); return bp(noise(d), 2500, 7000) * (.5 + .5 * np.abs(np.sin(tt * 2 * np.pi * 9))) * np.sin(np.pi * tt / d) ** .5 * .5 * v
def knock(v=1.0): d = .18; tt = t_(d); return norm(bp(noise(d), 180, 900) * env_exp(d, .03) + np.sin(2 * np.pi * 110 * tt) * env_exp(d, .05)) * v
def click(v=1.0): d = .02; return hp(noise(d), 3000) * env_exp(d, .002) * v
mallets = ['D6', 'F6', 'A6', 'C7', 'D7']; nm = 0
for e in EV:
    t, ty = e['t'], e['type']
    if silent(t) and ty not in ('thump',): continue
    pan = float(rng.uniform(-.35, .35))
    if ty == 'tick': add(fx, tick(.9 if e.get('loud') else .6, 2400 if rng.random() < .5 else 2200), t, .4 if e.get('loud') else .22, -.2)
    elif ty == 'cut': add(fx, click(1), t, .18, pan)
    elif ty == 'shutter': add(fx, shutter(1), t, .45, pan)
    elif ty in ('paper', 'flip'): add(fx, paper(1), t, .4 if ty == 'paper' else .18, pan)
    elif ty == 'pencil': add(fx, pencil(.5), t, .35, pan)
    elif ty == 'scratch': add(fx, pencil(.35, 1.2), t, .45, pan)
    elif ty == 'knock': add(fx, knock(1), t, .7, .25)
    elif ty == 'keys':
        for k in range(8): add(fx, typekey(.8 + .2 * rng.random()), t + k * .045, .3, .2)
    elif ty in ('mallet', 'pin', 'dot'):
        if ty == 'dot': add(fx, tick(.5, 3000), t, .12, pan)
        else: x = S.note('glockenspiel', mallets[nm % 5], .8, vel=.5); add(mus, x, t, .25 if ty == 'mallet' else .3, pan); nm += 1
    elif ty == 'stamp': add(fx, thump(.5 if e.get('soft') else .8, 70), t, .35 if e.get('soft') else .55, pan); add(fx, paper(1), t, .25, pan)
    elif ty == 'thump': add(fx, thump(1.0, 46), t, .9, 0)
    elif ty == 'sweep': add(fx, whoosh(.35, 1), t, .3, 0)
    elif ty == 'theory': add(fx, whoosh(.6, .6), t, .2, 0)
    elif ty == 'card': add(fx, click(1), t, .25, 0); add(fx, paper(.8), t + .02, .25, 0)
    elif ty == 'main': add(fx, thump(.8, 50), t, .5, 0)
    elif ty == 'chord': x = S.note('vibraphone', 'A4', 1.5, vel=.35); add(mus, x, t, .2, pan)
# credits: the twelve rings are silent; the pages turn on paper
fx += np.repeat(lp(brown(N / SR), 400)[:N, None] * .012, 2, axis=1).astype(np.float32)   # room tone, everywhere (also in the silences)

# ───────── Narration: compress, then balance by RMS ─────────
VO = []
for c, s in CH.items():
    x, sr = sf.read(os.path.join(D, s['audio'])); x = x if x.ndim == 1 else x.mean(1)
    x = soxr.resample(x, sr, SR).astype(np.float32)
    x = x / (np.abs(x).max() + 1e-9) * .9; x = compress(x, thr=.25, ratio=3.0)
    x = x / (np.sqrt(np.mean(x[np.abs(x) > .01] ** 2)) + 1e-9) * .11
    add(voc, x, s['t0'], 1.0, 0); VO += [(s['t0'] + a0, s['t0'] + b0) for a0, b0 in [(q0[0] - s['t0'], q0[1] - s['t0']) for q0 in s['cues']]]

# ───────── Ducking: music −9 dB under each spoken sentence; foley a little; silences forced down ─────────
g = np.ones(N)
for a, b in VO: g[int((a - .08) * SR):int((b + .15) * SR)] = .355
from scipy.ndimage import uniform_filter1d
g = uniform_filter1d(g, int(.25 * SR))
sil = np.ones(N)
for a, b in SILENT: sil[int(a * SR):int(b * SR)] = 0.0
sil = uniform_filter1d(sil, int(.6 * SR))
mus *= (g * sil)[:, None]; fx *= (.6 + .4 * g)[:, None]
out = mus * 2.6 + fx * .8 + voc
out = out[:int(DUR * SR)]
tail = int(2.0 * SR); out[-tail:] *= np.linspace(1, 0, tail)[:, None]
def tp_limit(x, ceil):
    from scipy.signal import resample_poly
    from scipy.ndimage import maximum_filter1d, minimum_filter1d
    up = resample_poly(x, 4, 1); n = int(.004 * SR * 4)
    gg = np.minimum(1, ceil / np.maximum(maximum_filter1d(np.abs(up), 2 * n + 1), 1e-9)); gg = uniform_filter1d(minimum_filter1d(gg, 2 * n + 1), n)
    return resample_poly(up * gg, 1, 4)[:len(x)]
out = np.stack([tp_limit(limit(out[:, c], .5), .45) for c in range(2)], 1)
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out/mix.wav'), out.astype(np.float32), SR)
print('mix', out.shape, round(out.shape[0] / SR, 2), 's · peak', float(np.abs(out).max()))
# instruments used (for credits)
print('instruments', sorted({e[1] for e in ev} | {'glockenspiel', 'vibraphone'}))
