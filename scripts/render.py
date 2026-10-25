"""Render chapter videos: storyboard plates + Ken Burns + crossfades + film look + burned-in subtitles.

usage: render.py preview            -> previews/chXX.png (one sample frame per chapter) + contact sheet
       render.py chapters [n ...]   -> build/chXX.mp4 (silent video; audio is muxed in assemble.py)
"""
import json, re, sys, subprocess, math
from multiprocessing import Pool
import numpy as np, cv2
from PIL import Image, ImageDraw
sys.path.insert(0, "/home/user/lemo-opuscar/scripts")
import visuals as V
from storyboard import S

ROOT = "/home/user/lemo-opuscar"
FPS, OW, OH = 30, 1920, 1080
CARD = 4.0        # chapter title card length (seconds); chapter 1 has none
XF = 1.0          # crossfade between scenes / states
T = json.load(open(f"{ROOT}/audio/timings.json"))["chapters"]


def para_starts(ch):
    """Start time of every (paragraph, sentence) in a chapter, from the narration timings."""
    src = open(f"{ROOT}/script_body.md").read()
    body = re.split(r"^## ", src, flags=re.M)[ch].split("\n", 1)[1]
    body = re.sub(r"\s*\[VERIFY[^\]]*\]", "", body)
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    cues, k, out = T[ch - 1]["cues"], 0, {}
    for pi, p in enumerate(paras):
        for si, _ in enumerate([s for s in re.split(r"(?<=[.?!])\s+(?=[A-Z])", p) if s]):
            out[(pi, si)] = cues[k]["start"]; k += 1
    assert k == len(cues), (ch, k, len(cues))
    return out


def chapter_plan(ch):
    """[(start, end, builder, scene_index)] in chapter-local time (title card included)."""
    off = 0.0 if ch == 1 else CARD
    dur = off + T[ch - 1]["duration"]
    starts = para_starts(ch)
    items = [(0.0 if i == 0 else starts[(p, s)], b) for i, (p, s, b) in enumerate(S[ch])]
    # scenes that share an anchor split the time evenly
    plan, i = [], 0
    while i < len(items):
        j = i
        while j + 1 < len(items) and items[j + 1][0] == items[i][0]:
            j += 1
        nxt = items[j + 1][0] if j + 1 < len(items) else dur - off
        step = (nxt - items[i][0]) / (j - i + 1)
        for k in range(i, j + 1):
            plan.append([off + items[i][0] + (k - i) * step, off + items[i][0] + (k - i + 1) * step, items[k][1]])
        i = j + 1
    plan[-1][1] = dur
    if ch != 1:
        title = T[ch - 1]["title"]
        plan.insert(0, [0.0, CARD, lambda t=title, n=ch: V.title_card(n - 1, t)])
        plan[1][0] = CARD
    return plan, dur, off


# ---------------------------------------------------------------- film look
_rng = np.random.default_rng(7)
GRAIN = [(cv2.GaussianBlur(_rng.normal(0, 1, (OH, OW)).astype(np.float32), (0, 0), 0.8) * 9).astype(np.float32) for _ in range(8)]
yy, xx = np.mgrid[0:OH, 0:OW].astype(np.float32)
VIGNETTE = (1 - 0.32 * (((xx - OW / 2) / (OW / 2)) ** 2 + ((yy - OH / 2) / (OH / 2)) ** 2) ** 1.4).clip(0.45, 1)[..., None]
TONE = np.array([1.02, 0.99, 0.93], np.float32)  # gentle warm, muted grade


def kb_matrix(k, u, jitter):
    """Ken Burns: zoom/pan over the plate. k = scene index picks direction; u in [0,1]."""
    u = u * u * (3 - 2 * u)  # ease
    z0, z1 = (1.0, 1.10) if k % 2 == 0 else (1.10, 1.0)
    z = z0 + (z1 - z0) * u
    dirs = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1)]
    dx, dy = dirs[k % len(dirs)]
    vw, vh = V.W / z, V.H / z  # view size in plate px (full plate at z=1)
    cx = V.W / 2 + dx * (u - 0.5) * (V.W - vw) * 0.8 + jitter[0]
    cy = V.H / 2 + dy * (u - 0.5) * (V.H - vh) * 0.8 + jitter[1]
    s = OW / vw
    return np.array([[s, 0, OW / 2 - s * cx], [0, s, OH / 2 - s * cy]], np.float32)


class Scene:
    def __init__(self, start, end, builder, k):
        self.start, self.end, self.k = start, end, k
        st = builder()
        st = st if isinstance(st, list) else [st]
        self.states = [np.asarray(im.convert("RGB")) for im in st]

    def frame(self, t, jitter):
        dur = self.end - self.start
        u = min(1, max(0, (t - self.start + XF / 2) / (dur + XF)))
        M = kb_matrix(self.k, u, jitter)
        n = len(self.states)
        pos = min(max(t - self.start, 0) / dur, 0.9999) * n
        i = int(pos)
        a = cv2.warpAffine(self.states[i], M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
        frac = (pos - i) * dur / n  # seconds into this state
        if i + 1 < n and frac > dur / n - XF:
            w = (frac - (dur / n - XF)) / XF
            b = cv2.warpAffine(self.states[i + 1], M, (OW, OH), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)
            a = a * (1 - w) + b * w
        return a


# ---------------------------------------------------------------- subtitles
def sub_chunks(ch, off):
    """Split long sentences into <=84-char cues, preferring breaks after punctuation."""
    out = []
    for c in T[ch - 1]["cues"]:
        words, parts, cur = c["text"].split(), [], []
        for i, w in enumerate(words):
            cur.append(w)
            L = len(" ".join(cur))
            rest = len(" ".join(words[i + 1:]))
            if rest and (L > 84 or (L > 40 and w[-1] in ",;:" and rest > 20)):
                if L > 84:
                    cur.pop(); parts.append(" ".join(cur)); cur = [w]
                else:
                    parts.append(" ".join(cur)); cur = []
        if cur:
            parts.append(" ".join(cur))
        total = sum(len(p) for p in parts); t = c["start"]
        for p in parts:
            d = (c["end"] - c["start"]) * len(p) / total
            out.append((off + t, off + t + d, p)); t += d
    return out


SUBF = V.font("serif", 46)


def sub_overlay(s):
    lines = V.wrap(s, SUBF, 1500).split("\n")
    h = 66 * len(lines) + 30
    im = Image.new("RGBA", (OW, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    wmax = max(SUBF.getlength(l) for l in lines)
    d.rounded_rectangle([OW / 2 - wmax / 2 - 26, 0, OW / 2 + wmax / 2 + 26, h], radius=10, fill=(0, 0, 0, 130))
    for i, l in enumerate(lines):
        d.text((OW / 2, 15 + 66 * i + 33), l, font=SUBF, fill=(240, 234, 220, 255), anchor="mm")
    a = np.asarray(im).astype(np.float32) / 255
    return a[..., :3] * 255, a[..., 3:4], OH - 70 - h


def finish(img, fi, sub):
    img = img * TONE
    lum = img.mean(axis=2, keepdims=True)
    img = img * 0.82 + lum * 0.18          # mute saturation
    img = img * VIGNETTE * (1 + 0.012 * math.sin(fi * 1.7) + 0.008 * math.sin(fi * 0.37))
    img += GRAIN[fi % len(GRAIN)][..., None]
    if sub is not None:
        rgb, a, y = sub
        h = rgb.shape[0]
        img[y:y + h] = img[y:y + h] * (1 - a) + rgb * a
    return np.clip(img, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------- drivers
def frames(ch, t_list=None):
    plan, dur, off = chapter_plan(ch)
    scenes = [Scene(s, e, b, k + ch) for k, (s, e, b) in enumerate(plan)]
    subs = sub_chunks(ch, off)
    cache = {}
    n = int(round(dur * FPS))
    idx = range(n) if t_list is None else [int(t * FPS) for t in t_list]
    for fi in idx:
        t = fi / FPS
        jitter = (0.6 * math.sin(fi * 2.3), 0.6 * math.cos(fi * 1.9))   # gentle gate weave
        i = max(k for k, sc in enumerate(scenes) if sc.start <= t + 1e-6)
        img = scenes[i].frame(t, jitter)
        if i + 1 < len(scenes) and t > scenes[i].end - XF:
            w = (t - (scenes[i].end - XF)) / XF
            img = img * (1 - w) + scenes[i + 1].frame(t, jitter) * w
        if t < 0.6:   # fade from black at chapter start
            img = img * (t / 0.6)
        if t > dur - 0.6:
            img = img * max(0, (dur - t) / 0.6)
        sub = next((s for s in subs if s[0] <= t < s[1]), None)
        ov = None
        if sub:
            ov = cache.get(sub[2]) or cache.setdefault(sub[2], sub_overlay(sub[2]))
        yield fi, finish(img, fi, ov)


def render_chapter(ch):
    plan, dur, off = chapter_plan(ch)
    out = f"{ROOT}/build/ch{ch:02d}.mp4"
    p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{OW}x{OH}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
                          "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    for _, f in frames(ch):
        p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    return ch, dur


def preview():
    import os
    os.makedirs(f"{ROOT}/previews", exist_ok=True)
    thumbs = []
    for ch in range(1, 23):
        plan, dur, off = chapter_plan(ch)
        # sample the middle of the chapter's most "characteristic" scene (the longest one)
        s, e, _ = max(plan[1:] if ch != 1 else plan, key=lambda x: x[1] - x[0])
        t = (s + e) / 2
        _, f = next(frames(ch, [t]))
        Image.fromarray(f).save(f"{ROOT}/previews/ch{ch:02d}.jpg", quality=88)
        thumbs.append(Image.fromarray(f).resize((480, 270)))
        print("preview", ch, flush=True)
    sheet = Image.new("RGB", (480 * 4 + 50, 270 * 6 + 70 + 120), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    for i, th in enumerate(thumbs):
        x, y = 10 + (i % 4) * 490, 10 + (i // 4) * 310
        sheet.paste(th, (x, y))
        d.text((x, y + 274), f"{i + 1:02d}  {T[i]['title']}", fill=(220, 210, 190), font=V.font("serif", 26))
    sheet.save(f"{ROOT}/previews/contact_sheet.jpg", quality=88)


if __name__ == "__main__":
    if sys.argv[1] == "preview":
        preview()
    else:
        import os
        os.makedirs(f"{ROOT}/build", exist_ok=True)
        chs = [int(x) for x in sys.argv[2:]] or list(range(1, 23))
        with Pool(4) as pool:
            for ch, dur in pool.imap_unordered(render_chapter, chs):
                print(f"rendered ch{ch:02d} ({dur:.1f}s)", flush=True)
