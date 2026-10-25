"""Original, code-drawn plates for the Teigin documentary.

Every plate is drawn here from primitives: no photos, no footage, no likenesses.
People appear only as flat silhouettes or name cards. A scene returns one or more
"states" (PIL images); the renderer crossfades through them with a slow Ken Burns move.
"""
import math, random
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

W, H = 2304, 1296            # plate size (1.2x of 1080p, headroom for pans)
CX, CY = W // 2, H // 2
FONTS = "/home/user/lemo-opuscar/assets/fonts/"

PAPER = (214, 203, 182); PAPER_D = (190, 176, 150); INK = (40, 36, 33)
INK_L = (92, 84, 76); RED = (128, 52, 40); SLATE = (70, 84, 94)
DUSK = (50, 54, 60); NIGHT = (24, 26, 30); AMBER = (205, 165, 100); FOG = (150, 150, 145)


@lru_cache(None)
def font(name, size):
    files = {"type": "SpecialElite-Regular.ttf", "mono": "CourierPrime-Regular.ttf",
             "monob": "CourierPrime-Bold.ttf", "serif": "OldStandard-Regular.ttf",
             "serifb": "OldStandard-Bold.ttf", "serifi": "OldStandard-Italic.ttf",
             "display": "PlayfairDisplay-VF.ttf", "jp": "NotoSerifJP.otf"}
    return ImageFont.truetype(FONTS + files[name], size)


# ---------------------------------------------------------------- primitives
def rng(seed):
    return random.Random(seed)


def paper(tone=PAPER, seed=0, size=(W, H), stain=True):
    r = np.random.default_rng(seed)
    w, h = size
    base = np.ones((h, w, 3), np.float32) * np.array(tone, np.float32)
    n = r.normal(0, 1, (h // 8, w // 8)).astype(np.float32)
    n = np.array(Image.fromarray(n).resize((w, h), Image.BICUBIC))
    fine = r.normal(0, 1, (h, w)).astype(np.float32)
    base += (n * 6 + fine * 4)[..., None]
    if stain:
        for _ in range(5):
            x, y, rad = r.integers(0, w), r.integers(0, h), r.integers(150, 500)
            yy, xx = np.ogrid[:h, :w]
            d = np.sqrt((xx - x) ** 2 + (yy - y) ** 2) / rad
            base -= (np.clip(1 - d, 0, 1) ** 2 * r.uniform(4, 12))[..., None]
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8))


def dark(tone=NIGHT, seed=0, glow=None):
    """Dark backdrop with optional soft glow (x, y, radius, colour)."""
    img = paper(tone, seed, stain=False)
    if glow:
        x, y, rad, col = glow
        g = Image.new("RGB", (W, H), (0, 0, 0))
        ImageDraw.Draw(g).ellipse([x - rad, y - rad, x + rad, y + rad], fill=col)
        g = g.filter(ImageFilter.GaussianBlur(rad * 0.5))
        img = ImageChops.add(img, g)
    return img


def text(d, xy, s, f, fill=INK, anchor="mm", spacing=10):
    if "\n" not in s:
        d.text(xy, s, font=f, fill=fill, anchor=anchor)
        return
    align = {"l": "left", "m": "center", "r": "right"}[anchor[0]]
    x0, y0, x1, y1 = d.multiline_textbbox((0, 0), s, font=f, spacing=spacing, align=align)
    w, h = x1 - x0, y1 - y0
    x = xy[0] - {"l": 0, "m": w / 2, "r": w}[anchor[0]] - x0
    y = xy[1] - {"a": 0, "t": 0, "m": h / 2, "b": h, "s": h, "d": h}[anchor[1]] - y0
    d.multiline_text((x, y), s, font=f, fill=fill, spacing=spacing, align=align)


def wrap(s, f, maxw):
    words, lines, cur = s.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if f.getlength(t) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = w_
    lines.append(cur)
    return "\n".join(lines)


def stamp(img, s, xy, angle=-12, col=RED, size=90, box=True):
    f = font("monob", size)
    tw = int(f.getlength(s)) + 60; th = size + 50
    layer = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if box:
        d.rectangle([4, 4, tw - 5, th - 5], outline=col + (220,), width=8)
    d.text((tw // 2, th // 2), s, font=f, fill=col + (220,), anchor="mm")
    # rough, inked edges
    a = np.array(layer); m = np.random.default_rng(len(s)).random(a.shape[:2]) < 0.18
    a[m, 3] = (a[m, 3] * 0.3).astype(np.uint8); layer = Image.fromarray(a)
    layer = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    img.paste(layer, (xy[0] - layer.width // 2, xy[1] - layer.height // 2), layer)


def person(d, x, y, h, col=INK, armband=None, child=False, seated=False, case=False):
    """Flat silhouette standing on (x, y). No facial features, deliberately generic."""
    s = h / 100.0
    if child:
        s *= 0.7
    head = 9 * s
    top = y - 100 * s
    d.ellipse([x - head, top, x + head, top + 2 * head], fill=col)
    sh = top + 2 * head + 2 * s
    if seated:
        d.polygon([(x - 15 * s, sh + 4 * s), (x + 15 * s, sh + 4 * s), (x + 13 * s, sh + 42 * s), (x - 13 * s, sh + 42 * s)], fill=col)
        d.rectangle([x - 13 * s, sh + 38 * s, x + 22 * s, sh + 48 * s], fill=col)
        d.rectangle([x + 14 * s, sh + 46 * s, x + 22 * s, y], fill=col)
        return
    d.rounded_rectangle([x - 16 * s, sh, x + 16 * s, sh + 46 * s], radius=int(8 * s), fill=col)
    d.polygon([(x - 16 * s, sh + 40 * s), (x + 16 * s, sh + 40 * s), (x + 12 * s, y), (x + 2 * s, y),
               (x, sh + 55 * s), (x - 2 * s, y), (x - 12 * s, y)], fill=col)
    d.rounded_rectangle([x - 22 * s, sh + 2 * s, x - 14 * s, sh + 44 * s], radius=int(4 * s), fill=col)
    d.rounded_rectangle([x + 14 * s, sh + 2 * s, x + 22 * s, sh + 44 * s], radius=int(4 * s), fill=col)
    if armband:
        d.rectangle([x - 23 * s, sh + 14 * s, x - 13 * s, sh + 21 * s], fill=armband)
    if case:
        d.rectangle([x + 18 * s, sh + 40 * s, x + 34 * s, sh + 54 * s], fill=col)


def clock(d, x, y, r, hh, mm, col=INK, face=PAPER):
    d.ellipse([x - r, y - r, x + r, y + r], fill=face, outline=col, width=max(3, r // 25))
    for i in range(12):
        a = math.radians(i * 30)
        d.line([x + math.sin(a) * r * 0.82, y - math.cos(a) * r * 0.82, x + math.sin(a) * r * 0.93, y - math.cos(a) * r * 0.93], fill=col, width=max(2, r // 30))
    am = math.radians(mm * 6); ah = math.radians((hh % 12) * 30 + mm * 0.5)
    d.line([x, y, x + math.sin(ah) * r * 0.5, y - math.cos(ah) * r * 0.5], fill=col, width=max(4, r // 14))
    d.line([x, y, x + math.sin(am) * r * 0.78, y - math.cos(am) * r * 0.78], fill=col, width=max(3, r // 20))
    d.ellipse([x - r * 0.05, y - r * 0.05, x + r * 0.05, y + r * 0.05], fill=col)


def card(img, box, lines, seed=0, tone=(232, 224, 205), angle=0):
    """A small paper card (business card, index card) with typed lines [(text, fontname, size)]."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    c = paper(tone, seed, (w, h), stain=False).convert("RGBA")
    d = ImageDraw.Draw(c)
    d.rectangle([0, 0, w - 1, h - 1], outline=INK_L, width=2)
    yy = h * 0.18
    for s, fn, sz in lines:
        f = font(fn, sz)
        text(d, (w / 2, yy), s, f, anchor="mt")
        yy += sz * 1.45
    sh = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rectangle([30, 36, w + 30, h + 36], fill=(0, 0, 0, 90))
    sh = sh.filter(ImageFilter.GaussianBlur(12))
    sh.paste(c, (30, 30), c)
    sh = sh.rotate(angle, expand=True, resample=Image.BICUBIC)
    img.paste(sh, (x0 + w // 2 - sh.width // 2, y0 + h // 2 - sh.height // 2), sh)


def label(d, xy, s, size=40, col=INK, fn="type", anchor="mm"):
    text(d, xy, s, font(fn, size), fill=col, anchor=anchor)


def caption_strip(img, s, sub=None, dark_=False):
    """Small archival-style caption at the top-left (kept inside the safe area)."""
    d = ImageDraw.Draw(img)
    col = (200, 192, 176) if dark_ else INK_L
    d.text((250, 170), s.upper(), font=font("mono", 34), fill=col)
    if sub:
        d.text((250, 214), sub, font=font("serifi", 32), fill=col)


# ---------------------------------------------------------------- scene builders
def title_card(n, title, sub=None):
    img = dark(NIGHT, n, glow=(CX, CY, 700, (40, 34, 26)))
    d = ImageDraw.Draw(img)
    if n:
        label(d, (CX, CY - 150), f"CHAPTER {n}", 42, (170, 150, 120), "mono")
        d.line([CX - 120, CY - 105, CX + 120, CY - 105], fill=(130, 110, 90), width=2)
    label(d, (CX, CY - 10), title, 110, (226, 214, 192), "display")
    if sub:
        label(d, (CX, CY + 110), sub, 44, (170, 160, 140), "serifi")
    return [img]


def main_title():
    img = dark(NIGHT, 7, glow=(CX, CY, 800, (46, 36, 26)))
    d = ImageDraw.Draw(img)
    label(d, (CX, CY - 170), "帝銀事件", 120, (150, 70, 55), "jp")
    label(d, (CX, CY), "THE TEIGIN INCIDENT", 130, (230, 218, 196), "display")
    label(d, (CX, CY + 130), "Tokyo · 26 January 1948", 50, (175, 165, 145), "serifi")
    return [img]


def quote_card(q, attrib=None, dark_=True, seed=3):
    img = dark(NIGHT, seed, glow=(CX, CY, 650, (34, 30, 26))) if dark_ else paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    col = (226, 214, 192) if dark_ else INK
    f = font("serifi", 72)
    s = wrap(q, f, 1500)
    text(d, (CX, CY - 20), "“" + s + "”", f, fill=col, spacing=26)
    if attrib:
        label(d, (CX, CY + 60 + s.count("\n") * 50 + 80), attrib, 36, (160, 150, 130), "mono")
    return [img]


def question_card(q, seed=11):
    img = dark(NIGHT, seed, glow=(CX, CY, 500, (30, 30, 34)))
    d = ImageDraw.Draw(img)
    f = font("display", 110)
    text(d, (CX, CY), wrap(q, f, 1600), f, fill=(222, 210, 190), spacing=30)
    return [img]


def questions_card(seed=12):
    img = dark(NIGHT, seed, glow=(CX, CY, 600, (30, 30, 34)))
    d = ImageDraw.Draw(img)
    qs = ["Who was the man at the bank door?", "Where did he learn to handle poison like that?",
          "Why did the investigation turn away from the people best equipped to commit the crime?"]
    f = font("serifi", 58)
    y = CY - 250
    for q in qs:
        s = wrap(q, f, 1500)
        text(d, (CX, y), s, f, fill=(222, 210, 190), anchor="ma", spacing=18)
        y += (s.count("\n") + 1) * 80 + 70
    return img


def street_dusk(seed=1, clock_time=None, people=0, title=None):
    """Stylised low-rise street at dusk; generic wooden buildings, the bank at centre."""
    img = Image.new("RGB", (W, H))
    top, bot = np.array([62, 66, 74]), np.array([150, 132, 110])
    grad = np.linspace(0, 1, H)[:, None, None]
    img = Image.fromarray((top * (1 - grad) + bot * grad).repeat(W, 1).astype(np.uint8))
    d = ImageDraw.Draw(img)
    r = rng(seed)
    x = -50
    while x < W:  # background roofs
        w_ = r.randint(140, 320); h_ = r.randint(180, 360)
        d.rectangle([x, 900 - h_, x + w_, 1100], fill=(70, 70, 72))
        d.polygon([(x - 20, 900 - h_), (x + w_ / 2, 900 - h_ - 70), (x + w_ + 20, 900 - h_)], fill=(62, 62, 66))
        x += w_ + r.randint(10, 60)
    for px in range(0, W, 260):  # utility poles and wires
        d.rectangle([px + 100, 380, px + 112, 1100], fill=(40, 40, 42))
        d.line([px + 70, 420, px + 142, 420], fill=(40, 40, 42), width=6)
    for k in range(3):
        d.line([(0, 440 + k * 16), (W, 460 + k * 16)], fill=(44, 44, 46), width=2)
    # the bank: two storeys, wooden
    bx, by = CX - 360, 520
    d.rectangle([bx, by, bx + 720, 1100], fill=(56, 50, 46))
    d.polygon([(bx - 50, by), (bx + 360, by - 110), (bx + 770, by)], fill=(46, 42, 40))
    d.rectangle([bx - 30, by + 270, bx + 750, by + 300], fill=(46, 42, 40))
    for i in range(4):
        d.rectangle([bx + 60 + i * 165, by + 70, bx + 170 + i * 165, by + 200], fill=(205, 170, 105) if i % 2 == 0 else (120, 104, 82))
        d.line([bx + 115 + i * 165, by + 70, bx + 115 + i * 165, by + 200], fill=(56, 50, 46), width=6)
    d.rectangle([bx + 80, by + 360, bx + 640, by + 580], fill=(80, 72, 64))  # shutters
    for yy in range(by + 370, by + 580, 18):
        d.line([bx + 80, yy, bx + 640, yy], fill=(64, 58, 52), width=4)
    d.rectangle([bx + 660, by + 380, bx + 715, by + 580], fill=(34, 30, 28))  # side door
    d.rectangle([0, 1100, W, H], fill=(58, 54, 50))
    for i in range(people):
        person(d, 300 + i * 190 + r.randint(-30, 30), 1150 + r.randint(0, 30), 230, (30, 30, 32))
    if clock_time:
        clock(d, W - 420, 330, 120, *clock_time, col=(40, 36, 33), face=(196, 186, 166))
    if title:
        label(d, (CX, 220), title, 64, (230, 220, 200), "serif")
    return img


def ruins(seed=2):
    img = Image.new("RGB", (W, H))
    top, bot = np.array([120, 118, 112]), np.array([176, 166, 148])
    grad = np.linspace(0, 1, H)[:, None, None]
    img = Image.fromarray((top * (1 - grad) + bot * grad).repeat(W, 1).astype(np.uint8))
    d = ImageDraw.Draw(img)
    r = rng(seed)
    for layer, (col, base) in enumerate([((140, 134, 124), 820), ((100, 96, 90), 930), ((60, 58, 56), 1060)]):
        x = -40
        while x < W:
            w_ = r.randint(60, 220); h_ = r.randint(30, 220) * (1 + layer * 0.3)
            if r.random() < 0.3:  # broken wall with jagged top
                pts = [(x, base)] + [(x + w_ * t / 6, base - h_ * r.uniform(0.3, 1)) for t in range(7)] + [(x + w_, base)]
                d.polygon(pts, fill=col)
            elif r.random() < 0.5:  # shack with lean-to roof
                d.rectangle([x, base - h_ * 0.6, x + w_, base], fill=col)
                d.polygon([(x - 10, base - h_ * 0.6), (x + w_ + 10, base - h_ * 0.75), (x + w_ + 10, base - h_ * 0.6)], fill=col)
            else:
                d.rectangle([x + w_ * 0.4, base - h_ * 1.4, x + w_ * 0.5, base], fill=col)  # chimney/pole
            x += w_ + r.randint(0, 40)
        d.rectangle([0, base, W, H], fill=col)
    for k in range(4):  # smoke
        sx = r.randint(200, W - 200)
        sm = Image.new("L", (W, H), 0)
        ImageDraw.Draw(sm).ellipse([sx - 80, 300, sx + 80, 900], fill=60)
        sm = sm.filter(ImageFilter.GaussianBlur(60))
        img = Image.composite(Image.new("RGB", (W, H), (190, 186, 178)), img, sm)
    caption_strip(img, "Tokyo, after the air raids", "Stylised illustration")
    return img


# ---------------------------------------------------------------- maps
# Stylised geography (schematic, not to scale). Coordinates in plate space.
TOKYO_BAY = [(1300, 1296), (1320, 1120), (1420, 1010), (1560, 940), (1720, 900), (1900, 930), (2050, 1010), (2304, 1050), (2304, 1296)]
YAMANOTE = dict(cx=1250, cy=640, rx=250, ry=330)
PLACES = {"Shiinamachi": (880, 420), "Ikebukuro": (1040, 410), "GHQ (Hibiya)": (1440, 720),
          "Imperial Palace": (1330, 650), "Shinjuku": (1010, 640), "Tokyo Bay": (1750, 1080)}


def tokyo_map(stage=3, seed=4):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    for gx in range(0, W, 120):  # survey grid
        d.line([gx, 0, gx, H], fill=PAPER_D, width=1)
    for gy in range(0, H, 120):
        d.line([0, gy, W, gy], fill=PAPER_D, width=1)
    d.polygon(TOKYO_BAY, fill=(170, 176, 172), outline=INK_L)
    for k in range(1, 4):
        d.line([(x, y + k * 30) for x, y in TOKYO_BAY[1:-2]], fill=(150, 158, 156), width=2)
    river = [(600, 200), (760, 330), (900, 520), (1050, 760), (1200, 930), (1340, 1080)]
    d.line(river, fill=(150, 160, 160), width=10, joint="curve")
    e = YAMANOTE
    d.ellipse([e["cx"] - e["rx"], e["cy"] - e["ry"], e["cx"] + e["rx"], e["cy"] + e["ry"]], outline=INK_L, width=6)
    label(d, (e["cx"] + e["rx"] + 30, e["cy"] - 40), "Yamanote line", 30, INK_L, "serifi", "lm")
    d.line([(1040, 410), (950, 415), (880, 420), (700, 440), (480, 470)], fill=INK_L, width=4)  # Seibu line, schematic
    label(d, (560, 490), "private railway to the west", 26, INK_L, "serifi", "mm")
    shown = ["Tokyo Bay"] + (["Imperial Palace", "GHQ (Hibiya)"] if stage >= 1 else []) + (["Ikebukuro", "Shinjuku"] if stage >= 2 else [])
    for name in shown:
        x, y = PLACES[name]
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=INK)
        label(d, (x + 22, y), name, 34, INK, "serif", "lm")
    if stage >= 3:
        x, y = PLACES["Shiinamachi"]
        for rr in (60, 40):
            d.ellipse([x - rr, y - rr, x + rr, y + rr], outline=RED, width=5)
        d.ellipse([x - 12, y - 12, x + 12, y + 12], fill=RED)
        label(d, (x - 30, y - 90), "Imperial Bank, Shiinamachi branch", 38, RED, "serifb", "rm")
        label(d, (x - 30, y - 50), "Toshima Ward", 30, RED, "serifi", "rm")
    label(d, (CX, 160), "TOKYO, 1948", 64, INK, "serifb")
    label(d, (CX, 220), "schematic map, not to scale", 28, INK_L, "serifi")
    compass(d, 2000, 300)
    return img


def compass(d, x, y):
    d.polygon([(x, y - 70), (x + 18, y), (x, y + 70), (x - 18, y)], outline=INK_L, width=3)
    d.polygon([(x, y - 70), (x + 18, y), (x - 18, y)], fill=INK_L)
    label(d, (x, y - 100), "N", 34, INK_L, "serifb")


JAPAN = {  # rough schematic outlines (hand-placed polygons)
    "hokkaido": [(1500, 120), (1640, 160), (1780, 120), (1860, 220), (1760, 300), (1640, 380), (1540, 330), (1470, 250)],
    "honshu": [(1460, 420), (1540, 400), (1580, 520), (1560, 660), (1520, 780), (1440, 880), (1300, 930), (1150, 960), (980, 1010),
               (860, 1050), (800, 1010), (900, 960), (1060, 900), (1230, 830), (1340, 760), (1410, 640), (1420, 520)],
    "shikoku": [(940, 1080), (1060, 1060), (1100, 1110), (980, 1140)],
    "kyushu": [(700, 1060), (790, 1080), (800, 1200), (720, 1250), (660, 1160)],
}


def japan_map(route=None, marks=(), title="", seed=5, progress=1.0):
    img = paper((200, 196, 180), seed)
    d = ImageDraw.Draw(img)
    for gx in range(0, W, 140):
        d.line([gx, 0, gx, H], fill=(186, 180, 162))
    for gy in range(0, H, 140):
        d.line([0, gy, W, gy], fill=(186, 180, 162))
    for poly in JAPAN.values():
        d.polygon(poly, fill=PAPER, outline=INK_L)
    pts = {"Tokyo": (1430, 760), "Otaru": (1540, 230), "Kawasaki (Noborito)": (1415, 790), "Aomori": (1520, 430), "Hakodate": (1520, 340)}
    if route:
        path = [pts[p] for p in route]
        seg = []
        total = sum(math.dist(path[i], path[i + 1]) for i in range(len(path) - 1)) * progress
        acc = 0; seg.append(path[0])
        for i in range(len(path) - 1):
            L = math.dist(path[i], path[i + 1])
            if acc + L <= total:
                seg.append(path[i + 1]); acc += L
            else:
                t = (total - acc) / L
                seg.append((path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t)); break
        for i in range(len(seg) - 1):  # dashed line
            a, b = seg[i], seg[i + 1]
            n = max(1, int(math.dist(a, b) / 24))
            for k in range(0, n, 2):
                p = (a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)
                q = (a[0] + (b[0] - a[0]) * min(n, k + 1) / n, a[1] + (b[1] - a[1]) * min(n, k + 1) / n)
                d.line([p, q], fill=RED, width=7)
    for m in marks:
        x, y = pts[m]
        d.ellipse([x - 13, y - 13, x + 13, y + 13], fill=RED)
        label(d, (x - 30, y), m, 40, INK, "serifb", "rm")
    if title:
        label(d, (650, 300), title, 64, INK, "serifb")
    label(d, (650, 370), "schematic, not to scale", 28, INK_L, "serifi")
    return img


def asia_map(highlight=("Harbin",), seed=6, note=None):
    img = paper((200, 196, 180), seed)
    d = ImageDraw.Draw(img)
    for gx in range(0, W, 140):
        d.line([gx, 0, gx, H], fill=(186, 180, 162))
    mainland = [(0, 100), (900, 80), (1300, 140), (1500, 260), (1420, 420), (1250, 520), (1180, 640), (1050, 700), (980, 860), (900, 1000), (700, 1150), (400, 1296), (0, 1296)]
    d.polygon(mainland, fill=PAPER, outline=INK_L)
    korea = [(1050, 700), (1150, 690), (1180, 820), (1120, 950), (1050, 930), (1020, 820)]
    d.polygon(korea, fill=PAPER, outline=INK_L)
    japan = [(1500, 600), (1580, 560), (1640, 700), (1600, 860), (1480, 980), (1330, 1040), (1300, 1000), (1420, 900), (1500, 760)]
    d.polygon(japan, fill=PAPER, outline=INK_L)
    d.polygon([(1580, 360), (1700, 330), (1760, 440), (1640, 500)], fill=PAPER, outline=INK_L)
    pts = {"Harbin": (1000, 360), "Tokyo": (1560, 860), "Noborito": (1530, 890)}
    label(d, (700, 520), "MANCHURIA (occupied NE China)", 38, INK_L, "serifi")
    for name in highlight:
        x, y = pts[name]
        d.ellipse([x - 14, y - 14, x + 14, y + 14], fill=RED)
        label(d, (x + 30, y), name, 42, INK, "serifb", "lm")
    if note:
        label(d, (CX, 180), note, 52, INK, "serifb")
    return img


# ---------------------------------------------------------------- documents
def document(title, lines, seed=8, stamp_s=None, header=None, signature=False, tilt=0):
    img = dark((60, 56, 52), seed)
    pw, ph = 1250, 1050
    pg = paper((228, 220, 200), seed + 1, (pw, ph))
    d = ImageDraw.Draw(pg)
    if header:
        label(d, (pw // 2, 90), header, 30, INK_L, "mono")
        d.line([120, 125, pw - 120, 125], fill=INK_L, width=2)
    label(d, (pw // 2, 190), title, 52, INK, "serifb")
    y = 290
    for ln in lines:
        f = font("mono", 36)
        s = wrap(ln, f, pw - 260)
        d.multiline_text((130, y), s, font=f, fill=INK, spacing=12)
        y += (s.count("\n") + 1) * 50 + 26
    if signature:
        d.line([pw - 560, ph - 170, pw - 140, ph - 170], fill=INK, width=2)
        label(d, (pw - 350, ph - 135), "signature", 26, INK_L, "serifi")
    pg = pg.convert("RGBA").rotate(tilt, expand=True, resample=Image.BICUBIC)
    sh = Image.new("RGBA", pg.size, (0, 0, 0, 0))
    img.paste((20, 18, 16), [CX - pg.width // 2 + 20, CY - pg.height // 2 + 26, CX + pg.width // 2 + 20, CY + pg.height // 2 + 26], None)
    img = img.filter(ImageFilter.GaussianBlur(0))
    img.paste(pg, (CX - pg.width // 2, CY - pg.height // 2), pg)
    if stamp_s:
        stamp(img, stamp_s, (CX + 300, CY + 300), -14)
    return img


def newspaper(headline, sub, date, seed=9, col_text=None):
    """Invented newspaper layout; the masthead is fictional and generic."""
    img = dark((50, 46, 42), seed)
    pw, ph = 1500, 1150
    pg = paper((222, 214, 194), seed, (pw, ph))
    d = ImageDraw.Draw(pg)
    label(d, (pw // 2, 90), "THE EVENING CHRONICLE", 74, INK, "display")
    label(d, (pw // 2, 150), "an illustrative, invented masthead", 24, INK_L, "serifi")
    d.line([60, 180, pw - 60, 180], fill=INK, width=4); d.line([60, 230, pw - 60, 230], fill=INK, width=2)
    label(d, (80, 205), date, 26, INK, "mono", "lm"); label(d, (pw - 80, 205), "EVENING EDITION", 26, INK, "mono", "rm")
    f = font("serifb", 92)
    text(d, (pw // 2, 360), wrap(headline, f, pw - 160), f, spacing=14)
    label(d, (pw // 2, 520), sub, 44, INK, "serifi")
    r = rng(seed)
    for c in range(4):  # columns of greeked body text
        x0 = 80 + c * 345
        for k in range(24):
            y = 600 + k * 22
            d.line([x0, y, x0 + r.randint(220, 310), y], fill=(150, 140, 125), width=8)
    pg = pg.rotate(-2, expand=True, resample=Image.BICUBIC, fillcolor=(50, 46, 42))
    img.paste(pg, (CX - pg.width // 2, CY - pg.height // 2))
    return img


def business_card(lines, note=None, seed=12, fan=False):
    img = dark((58, 52, 46), seed, glow=(CX, CY, 600, (40, 34, 26)))
    if fan:
        for i, a in enumerate((-14, -6, 3)):
            card(img, (CX - 420 + i * 60, CY - 240 + i * 20, CX + 280 + i * 60, CY + 160 + i * 20),
                 [("", "serif", 30)], seed + i, angle=a)
    card(img, (CX - 450, CY - 230, CX + 450, CY + 230), lines, seed, angle=2 if fan else 0)
    if note:
        d = ImageDraw.Draw(img)
        label(d, (CX, CY + 380), note, 36, (190, 180, 160), "serifi")
    return img


def evidence_board(items, links=(), focus=None, seed=13, title=None):
    """Cork-style board with index cards and red string. items: [(x, y, [lines])]."""
    img = paper((120, 96, 70), seed)
    a = np.array(img).astype(np.int16)
    a += np.random.default_rng(seed).integers(-14, 14, a.shape[:2])[..., None].astype(np.int16)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    for i, j in links:
        (x0, y0, _), (x1, y1, _) = items[i], items[j]
        d.line([x0, y0 - 80, x1, y1 - 80], fill=(150, 30, 26), width=5)
    for k, (x, y, lines) in enumerate(items):
        dim = focus is not None and k not in focus
        tone = (200, 192, 172) if dim else (236, 228, 208)
        card(img, (x - 230, y - 130, x + 230, y + 130), [(s, "type", 34) for s in lines], seed + k, tone=tone, angle=rng(k).uniform(-4, 4))
        d.ellipse([x - 14, y - 144, x + 14, y - 116], fill=(170, 40, 34))
    if title:
        d.rectangle([CX - 520, 120, CX + 520, 220], fill=(236, 228, 208))
        label(d, (CX, 170), title, 50, INK, "type")
    return img


def ledger(rows, title, checks=(), strike=(), seed=14, highlight=None):
    img = dark((54, 50, 46), seed)
    pw, ph = 1400, 1080
    pg = paper((226, 218, 196), seed, (pw, ph))
    d = ImageDraw.Draw(pg)
    label(d, (pw // 2, 90), title, 50, INK, "serifb")
    for k in range(len(rows) + 1):
        d.line([100, 170 + k * 70, pw - 100, 170 + k * 70], fill=(170, 160, 140), width=2)
    d.line([220, 150, 220, 170 + len(rows) * 70], fill=(180, 100, 90), width=2)
    for k, row in enumerate(rows):
        y = 170 + k * 70 + 36
        col = RED if highlight == k else INK
        label(d, (160, y), f"{k + 1:02d}", 32, INK_L, "mono")
        label(d, (260, y), row, 38, col, "type", "lm")
        if k in checks:
            d.line([pw - 220, y, pw - 195, y + 22, pw - 150, y - 26], fill=(60, 90, 60), width=7)
        if k in strike:
            d.line([250, y, pw - 260, y], fill=INK, width=4)
        if highlight == k:
            d.ellipse([240, y - 40, pw - 230, y + 40], outline=RED, width=5)
    img.paste(pg, (CX - pw // 2, CY - ph // 2))
    return img


def cheque(seed=15, cashed=False):
    img = dark((50, 46, 42), seed, glow=(CX, CY, 700, (40, 34, 26)))
    pw, ph = 1500, 620
    pg = paper((214, 216, 196), seed, (pw, ph))
    d = ImageDraw.Draw(pg)
    for k in range(0, pw, 16):
        d.line([k, 0, k - 300, ph], fill=(204, 206, 186), width=2)
    d.rectangle([20, 20, pw - 20, ph - 20], outline=SLATE, width=4)
    label(d, (60, 80), "CHEQUE  (illustrative)", 40, SLATE, "serifb", "lm")
    label(d, (pw - 60, 80), "No. ———", 34, SLATE, "mono", "rm")
    label(d, (60, 220), "PAY", 36, SLATE, "mono", "lm")
    d.line([170, 240, pw - 420, 240], fill=SLATE, width=2)
    d.rectangle([pw - 380, 180, pw - 60, 270], outline=SLATE, width=3)
    label(d, (pw - 220, 225), "¥ ≈17,000", 50, INK, "type")
    label(d, (60, 360), "THE SUM OF  approx. seventeen thousand yen", 34, INK, "type", "lm")
    d.line([pw - 600, 520, pw - 80, 520], fill=SLATE, width=2)
    img.paste(pg, (CX - pw // 2, CY - ph // 2))
    if cashed:
        stamp(img, "CASHED · 27 JAN 1948", (CX + 280, CY + 200), -10, size=70)
    return img


def cash_tally(seed=16):
    img = dark((48, 44, 40), seed, glow=(CX, CY, 700, (44, 36, 26)))
    d = ImageDraw.Draw(img)
    r = rng(seed)
    for i in range(14):  # bundles of notes, abstract rectangles
        x, y = CX - 820 + r.randint(0, 420), CY - 80 + r.randint(-120, 200)
        d.rounded_rectangle([x, y, x + 360, y + 160], radius=8, fill=(150 + r.randint(-10, 10), 146, 120), outline=(90, 86, 70), width=3)
        d.rectangle([x + 150, y, x + 200, y + 160], fill=(196, 186, 160))
    label(d, (CX + 450, CY - 60), "≈ ¥164,000", 110, (230, 218, 196), "display")
    label(d, (CX + 450, CY + 60), "in cash", 50, (190, 180, 160), "serifi")
    label(d, (CX + 450, CY + 160), "+ a cheque for ≈ ¥17,000", 46, (190, 180, 160), "serifi")
    return img


def vault(seed=17):
    img = dark((40, 40, 42), seed, glow=(CX, CY, 600, (40, 38, 34)))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([CX - 420, CY - 420, CX + 420, CY + 380], radius=30, fill=(76, 76, 76), outline=(30, 30, 30), width=10)
    d.ellipse([CX - 120, CY - 140, CX + 120, CY + 100], outline=(150, 146, 136), width=14)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        d.line([CX, CY - 20, CX + math.cos(rad) * 180, CY - 20 + math.sin(rad) * 180], fill=(150, 146, 136), width=10)
    label(d, (CX, CY + 300), "Far more money remained in the bank.", 46, (220, 210, 190), "serifi")
    return img


# ---------------------------------------------------------------- the bank interior (stylised reconstruction)
def bank_interior(stage=0, seed=18):
    """Cut-away interior seen from the side. Stages: 0 working, 1 visitor arrives,
    2 everyone gathered with cups, 3 the room afterwards (empty, lights low; no figures)."""
    lit = stage < 3
    wall = (150, 136, 112) if lit else (78, 74, 70)
    img = paper(wall, seed, stain=False)
    d = ImageDraw.Draw(img)
    floor_y = 1080
    d.rectangle([0, floor_y, W, H], fill=(96, 82, 66) if lit else (52, 48, 44))
    for x in range(0, W, 120):
        d.line([x, floor_y, x - 200, H], fill=(86, 72, 58) if lit else (46, 42, 40), width=3)
    for i in range(3):  # windows
        x = 300 + i * 620
        d.rectangle([x, 220, x + 380, 560], fill=(186, 176, 150) if lit else (66, 70, 78), outline=(70, 60, 50), width=12)
        d.line([x + 190, 220, x + 190, 560], fill=(70, 60, 50), width=8)
    for lx in (650, 1650):  # pendant lamps
        d.line([lx, 0, lx, 160], fill=(40, 36, 33), width=4)
        d.polygon([(lx - 70, 220), (lx + 70, 220), (lx + 30, 160), (lx - 30, 160)], fill=(50, 46, 42))
        if lit:
            g = Image.new("L", (W, H), 0)
            ImageDraw.Draw(g).ellipse([lx - 300, 160, lx + 300, 760], fill=50)
            img = Image.composite(Image.new("RGB", (W, H), (230, 210, 160)), img, g.filter(ImageFilter.GaussianBlur(90)))
            d = ImageDraw.Draw(img)
    d.rectangle([180, 760, 1300, 820], fill=(78, 60, 44))  # counter
    d.rectangle([200, 820, 1280, floor_y], fill=(92, 72, 52))
    d.rectangle([1500, 860, 2100, 900], fill=(84, 66, 48))  # table
    d.rectangle([1530, 900, 1560, floor_y], fill=(70, 54, 40)); d.rectangle([2040, 900, 2070, floor_y], fill=(70, 54, 40))
    clock(d, 1150, 330, 90, 3, {0: 5, 1: 20, 2: 25, 3: 40}[stage], col=(40, 36, 33), face=(200, 190, 168) if lit else (110, 106, 98))
    sil = (36, 32, 30)
    r = rng(seed)
    if stage == 0:
        for i, x in enumerate([350, 520, 700, 880, 1060]):
            person(d, x, 980, 300, sil, seated=True)
        for x in (1600, 1780, 1960):
            person(d, x, floor_y, 330, sil)
    elif stage == 1:
        for x in [350, 520, 700, 880]:
            person(d, x, 980, 300, sil, seated=True)
        person(d, 1640, floor_y, 340, sil)
        person(d, 2050, floor_y, 360, (22, 20, 20), armband=(200, 196, 186), case=True)
    elif stage == 2:
        xs = [200 + i * 125 for i in range(16)]
        for i, x in enumerate(xs):
            child = i in (13,)
            person(d, x, floor_y + r.randint(-6, 6), 320 + r.randint(-20, 20), sil, child=child)
        person(d, 2150, floor_y, 360, (22, 20, 20), armband=(200, 196, 186))
        for k in range(16):  # cups on the table
            cx = 1540 + k * 34
            d.rectangle([cx, 834, cx + 22, 860], fill=(220, 214, 200), outline=(90, 84, 76))
    else:
        for k in range(16):
            cx = 1540 + k * 34 + r.randint(-6, 6)
            d.rectangle([cx, 834, cx + 22, 860], fill=(150, 146, 136), outline=(70, 66, 60))
    caption_strip(img, "Stylised reconstruction", "Figures are anonymous silhouettes", dark_=not lit)
    return img


def cups_still(seed=19, second=False):
    img = dark((44, 40, 36), seed, glow=(CX, CY - 100, 600, (60, 50, 36)))
    d = ImageDraw.Draw(img)
    d.rectangle([0, CY + 160, W, H], fill=(70, 56, 42))
    for k in range(8):
        x = 500 + k * 170
        d.polygon([(x, CY + 20), (x + 110, CY + 20), (x + 92, CY + 170), (x + 18, CY + 170)], fill=(214, 206, 188), outline=(120, 110, 96))
        d.ellipse([x, CY + 5, x + 110, CY + 35], fill=(196, 188, 170), outline=(120, 110, 96))
    for bx, tag in ((CX + 650, "I"), (CX + 820, "II")):
        d.rounded_rectangle([bx - 50, CY - 120, bx + 50, CY + 170], radius=14, fill=(110, 120, 112), outline=(60, 66, 60), width=3)
        d.rectangle([bx - 22, CY - 170, bx + 22, CY - 120], fill=(60, 56, 50))
        d.rectangle([bx - 38, CY - 20, bx + 38, CY + 60], fill=(220, 212, 194))
        label(d, (bx, CY + 20), tag, 40, INK, "serifb")
    d.line([CX + 450, CY - 260, CX + 560, CY - 40], fill=(180, 186, 180), width=10)  # dropper
    d.ellipse([CX + 420, CY - 320, CX + 480, CY - 250], fill=(60, 56, 50))
    if second:
        label(d, (CX, 240), "Second dose: about one minute later", 48, (226, 214, 192), "serifi")
    return img


def steps_diagram(seed=20):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 200), "THE INSTRUCTIONS HE GAVE", 60, INK, "serifb")
    boxes = [("1", "First liquid", "swallow in one go,\nat the back of the tongue"), ("~1 min", "Wait", ""), ("2", "Second liquid", "described as a\n‘neutraliser’")]
    for i, (n, t, s) in enumerate(boxes):
        x = 560 + i * 590
        if i == 1:
            clock(d, x, CY, 120, 3, 21)
            label(d, (x, CY + 190), "about a minute", 40, INK, "serifi")
            continue
        d.rounded_rectangle([x - 230, CY - 200, x + 230, CY + 220], radius=20, outline=INK, width=5)
        label(d, (x, CY - 120), n, 110, RED, "display")
        label(d, (x, CY + 10), t, 50, INK, "serifb")
        label(d, (x, CY + 120), s, 34, INK_L, "serifi")
    for x in (850, 1440):
        d.line([x, CY, x + 150 if x == 850 else x + 120, CY], fill=INK, width=5)
    label(d, (CX, H - 230), "He drank first himself, to show how it was done.", 42, INK, "serifi")
    return img


def tally(dead=12, total=16, seed=21):
    """Respectful count: sixteen marks, twelve dimmed with a small flame of remembrance."""
    img = dark(NIGHT, seed, glow=(CX, CY, 700, (34, 30, 26)))
    d = ImageDraw.Draw(img)
    for i in range(total):
        x = 420 + i * 98; y = CY - 40
        survived = i >= dead
        col = (222, 210, 186) if survived else (110, 100, 88)
        d.rounded_rectangle([x - 30, y - 90, x + 30, y + 90], radius=30, fill=col)
    label(d, (CX - 200, CY + 170), "12 died", 60, (190, 176, 150), "serif")
    label(d, (CX + 200, CY + 170), "4 survived", 60, (226, 214, 192), "serif")
    label(d, (CX, CY - 220), "Sixteen people drank the liquid", 52, (200, 190, 170), "serifi")
    return img


def candles(n=12, seed=22, caption="In memory of the twelve who died"):
    img = dark(NIGHT, seed)
    d = ImageDraw.Draw(img)
    glow = Image.new("RGB", (W, H), (0, 0, 0)); g = ImageDraw.Draw(glow)
    for i in range(n):
        x = 470 + i * 124; y = CY + 120
        d.rectangle([x - 18, y, x + 18, y + 170], fill=(206, 196, 176))
        g.ellipse([x - 70, y - 120, x + 70, y + 20], fill=(120, 80, 30))
        d.ellipse([x - 9, y - 50, x + 9, y - 4], fill=(240, 210, 140))
    img = ImageChops.add(img, glow.filter(ImageFilter.GaussianBlur(40)))
    d = ImageDraw.Draw(img)
    label(d, (CX, CY - 200), caption, 58, (220, 208, 186), "serifi")
    return img


def crowd_outside(seed=23):
    img = street_dusk(seed, people=0)
    d = ImageDraw.Draw(img)
    r = rng(seed)
    for i in range(9):
        person(d, 260 + i * 220 + r.randint(-40, 40), 1240 + r.randint(-20, 20), 300 + r.randint(-30, 20), (28, 28, 30))
    caption_strip(img, "Shiinamachi, late afternoon", "Stylised illustration")
    return img


def silhouettes_four(seed=24):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 200), "FOUR SURVIVORS · FOUR ACCOUNTS", 56, INK, "serifb")
    for i in range(4):
        x = 520 + i * 420
        d.rectangle([x - 170, 330, x + 170, 950], outline=INK_L, width=3)
        person(d, x, 900, 520, (70, 64, 58))
        label(d, (x, 1010), f"Witness {i + 1}", 40, INK, "type")
    return img


def composite_sketch(seed=25, annotated=True):
    """A deliberately blank head outline with witness notes: no face is drawn."""
    img = paper((224, 216, 196), seed)
    d = ImageDraw.Draw(img)
    d.ellipse([CX - 230, 290, CX + 230, 850], outline=INK_L, width=4)
    d.arc([CX - 420, 820, CX + 420, 1420], 200, 340, fill=INK_L, width=4)
    label(d, (CX, 560), "?", 260, (170, 160, 140), "display")
    if annotated:
        notes = [("age: forties to fifties", (820, 380)), ("calm, polite,\nauthoritative", (820, 580)),
                 ("neatly dressed", (820, 780)), ("handled bottles\nwith practised ease", (1480, 440)),
                 ("details varied\nbetween witnesses", (1480, 720))]
        for s, (x, y) in notes:
            anchor = "rm" if x < CX else "lm"
            label(d, (x, y), s, 38, INK, "type", anchor)
            d.line([x + (20 if x < CX else -20), y, CX + (-240 if x < CX else 240), y + 40], fill=INK_L, width=2)
    label(d, (CX, H - 170), "COMPOSITE DESCRIPTION · no face is reproduced here", 32, INK_L, "mono")
    return img


def photo_wall(seed=26):
    img = dark((60, 56, 50), seed)
    d = ImageDraw.Draw(img)
    r = rng(seed)
    for row in range(3):
        for c in range(7):
            x, y = 230 + c * 270, 230 + row * 320
            d.rectangle([x, y, x + 220, y + 280], fill=(200, 192, 176))
            d.rectangle([x + 15, y + 15, x + 205, y + 225], fill=(120 + r.randint(-20, 20),) * 3)
            person(d, x + 110, y + 225, 210, (70, 70, 70))
            if r.random() < 0.6:
                d.line([x, y, x + 220, y + 280], fill=RED, width=4)
    return img


def three_banks_timeline(reveal=3, seed=27):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 200), "THREE VISITS", 64, INK, "serifb")
    d.line([300, CY, W - 300, CY], fill=INK, width=5)
    ev = [("OCT 1947", "Yasuda Bank", "a similar visitor;\nno one was harmed"),
          ("19 JAN 1948", "Mitsubishi Bank", "a similar visitor;\nno one was harmed"),
          ("26 JAN 1948", "Imperial Bank\nShiinamachi", "sixteen drank;\ntwelve died")]
    for i, (dt, nm, s) in enumerate(ev[:reveal]):
        x = 500 + i * 650
        col = RED if i == 2 else INK
        d.ellipse([x - 20, CY - 20, x + 20, CY + 20], fill=col)
        label(d, (x, CY - 80), dt, 46, col, "mono")
        label(d, (x, CY + 100), nm, 50, col, "serifb")
        label(d, (x, CY + 240), s, 36, INK_L, "serifi")
    return img


def easel_painting(seed=28):
    """An original tempera-style landscape: soft hills, a lone tree, muted light."""
    img = dark((52, 48, 44), seed, glow=(CX, CY, 700, (60, 50, 36)))
    d = ImageDraw.Draw(img)
    cw, ch = 1100, 760
    can = Image.new("RGB", (cw, ch))
    top, bot = np.array([190, 196, 196]), np.array([224, 206, 170])
    grad = np.linspace(0, 1, ch)[:, None, None]
    can = Image.fromarray((top * (1 - grad) + bot * grad).repeat(cw, 1).astype(np.uint8))
    cd = ImageDraw.Draw(can)
    r = rng(seed)
    for k, col in enumerate([(150, 160, 150), (120, 138, 120), (96, 114, 96)]):
        base = 380 + k * 110
        pts = [(0, ch)] + [(x, base + 50 * math.sin(x / (160 + k * 40) + k) + r.randint(-6, 6)) for x in range(0, cw + 20, 20)] + [(cw, ch)]
        cd.polygon(pts, fill=col)
    cd.rectangle([760, 380, 774, 560], fill=(70, 60, 50))
    cd.ellipse([680, 280, 860, 430], fill=(84, 100, 80))
    cd.ellipse([180, 120, 260, 200], fill=(236, 220, 186))
    can = can.filter(ImageFilter.GaussianBlur(1.2))
    a = np.array(can).astype(np.int16)
    a += np.random.default_rng(seed).integers(-10, 10, a.shape[:2])[..., None].astype(np.int16)
    can = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d.rectangle([CX - cw // 2 - 30, CY - ch // 2 - 120, CX + cw // 2 + 30, CY + ch // 2 - 60], fill=(90, 70, 50))
    img.paste(can, (CX - cw // 2, CY - ch // 2 - 90))
    d.line([CX - 300, CY + 300, CX - 420, H], fill=(80, 62, 46), width=24)
    d.line([CX + 300, CY + 300, CX + 420, H], fill=(80, 62, 46), width=24)
    label(d, (CX, H - 130), "Illustrative landscape in tempera style · not a work by Hirasawa", 30, (170, 160, 140), "serifi")
    return img


def name_card(name, dates, role, seed=29, silhouette=True, easel=False):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    if silhouette:
        d.rectangle([380, 260, 980, 1040], fill=(200, 190, 170))
        person(d, 650, 1000, 640, (60, 56, 52))
        if easel:
            d.line([880, 1000, 930, 560], fill=(90, 70, 50), width=14)
            d.rectangle([840, 560, 960, 700], fill=(220, 210, 190), outline=(90, 70, 50), width=6)
    x0 = 1150
    label(d, (x0, 480), name, 96, INK, "display", "lm")
    label(d, (x0, 600), dates, 56, RED, "mono", "lm")
    label(d, (x0, 700), role, 48, INK_L, "serifi", "lm")
    d.line([x0, 540, x0 + 900, 540], fill=INK_L, width=3)
    return img


def ferry(seed=30):
    img = Image.new("RGB", (W, H))
    top, bot = np.array([150, 156, 160]), np.array([200, 196, 184])
    grad = np.linspace(0, 1, H)[:, None, None]
    img = Image.fromarray((top * (1 - grad) + bot * grad).repeat(W, 1).astype(np.uint8))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 820, W, H], fill=(110, 122, 126))
    for y in range(840, H, 30):
        d.line([0, y, W, y + 10], fill=(124, 136, 140), width=3)
    d.polygon([(500, 760), (1800, 760), (1700, 900), (600, 900)], fill=(60, 60, 62))
    d.rectangle([800, 620, 1500, 760], fill=(80, 80, 82))
    d.rectangle([1100, 480, 1180, 620], fill=(60, 60, 62))
    person(d, 1000, 620, 140, (40, 40, 42)); person(d, 1120, 620, 140, (40, 40, 42))
    caption_strip(img, "1947 · a chance meeting on a ferry", "Stylised illustration [details to verify]")
    return img


def case_columns(seed=31):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 180), "THE CASE AGAINST HIM", 60, INK, "serifb")
    d.line([CX, 260, CX, 1080], fill=INK_L, width=3)
    label(d, (CX - 480, 290), "Pointed toward him", 46, RED, "serifb")
    label(d, (CX + 480, 290), "Pointed away", 46, SLATE, "serifb")
    left = ["Could not produce Matsui's card", "Money he could not explain", "Past record of fraud"]
    right = ["No firm identification", "No poison ever found", "No physical evidence at the bank"]
    for i, s in enumerate(left):
        label(d, (CX - 480, 450 + i * 170), s, 40, INK, "type")
    for i, s in enumerate(right):
        label(d, (CX + 480, 450 + i * 170), s, 40, INK, "type")
    return img


def interrogation_room(seed=32, day=None):
    img = dark((20, 20, 22), seed, glow=(CX, 520, 520, (90, 76, 50)))
    d = ImageDraw.Draw(img)
    d.line([CX, 0, CX, 300], fill=(60, 56, 50), width=4)
    d.polygon([(CX - 110, 380), (CX + 110, 380), (CX + 50, 300), (CX - 50, 300)], fill=(70, 66, 60))
    cone = Image.new("L", (W, H), 0)
    ImageDraw.Draw(cone).polygon([(CX - 90, 380), (CX + 90, 380), (CX + 600, 1000), (CX - 600, 1000)], fill=45)
    img = Image.composite(Image.new("RGB", (W, H), (220, 200, 150)), img, cone.filter(ImageFilter.GaussianBlur(30)))
    d = ImageDraw.Draw(img)
    d.rectangle([CX - 500, 900, CX + 500, 950], fill=(60, 48, 36))
    d.rectangle([CX - 470, 950, CX - 440, 1180], fill=(50, 40, 30)); d.rectangle([CX + 440, 950, CX + 470, 1180], fill=(50, 40, 30))
    person(d, CX - 650, 1180, 420, (14, 14, 16), seated=True)
    person(d, CX + 650, 1180, 420, (14, 14, 16), seated=True)
    if day:
        label(d, (W - 420, 240), f"DAY {day}", 70, (200, 186, 160), "mono")
    caption_strip(img, "Stylised reconstruction", None, dark_=True)
    return img


def calendar_days(n_shown=40, seed=33):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 170), "IN CUSTODY · AUGUST – SEPTEMBER 1948", 54, INK, "serifb")
    for i in range(42):
        r_, c = divmod(i, 7)
        x, y = 560 + c * 170, 300 + r_ * 140
        d.rectangle([x, y, x + 150, y + 120], outline=INK_L, width=2)
        label(d, (x + 22, y + 26), str(i + 1), 30, INK_L, "mono", "lm")
        if i < n_shown:
            d.line([x + 20, y + 20, x + 130, y + 100], fill=RED, width=5)
            d.line([x + 130, y + 20, x + 20, y + 100], fill=RED, width=5)
    label(d, (CX, H - 150), "Day counts illustrative", 30, INK_L, "serifi")
    return img


def confession_doc(retracted=False):
    img = document("STATEMENT", ["The accused describes the events of 26 January 1948.",
                                 "…", "(Illustrative document. Not the actual statement.)"],
                   seed=34, header="INTERROGATION RECORD · 1948", tilt=1.5)
    if retracted:
        stamp(img, "RETRACTED", (CX + 120, CY + 60), -16, size=130)
    return img


def memory_fragments(seed=35):
    img = dark(NIGHT, seed)
    d = ImageDraw.Draw(img)
    r = rng(seed)
    words = ["a bank", "January", "a card", "the cups", "a doctor", "the train", "a name", "money", "Otaru", "the ferry", "a wallet", "?"]
    for i in range(40):
        s = r.choice(words)
        x, y = r.randint(260, W - 260), r.randint(220, H - 220)
        v = r.randint(60, 190)
        label(d, (x, y), s, r.randint(30, 80), (v, v - 6, v - 14), r.choice(["type", "serifi", "mono"]))
    label(d, (CX, H - 170), "Supporters argued his memory could not be trusted, even by himself", 38, (200, 190, 170), "serifi")
    return img


def courtroom(seed=36):
    img = paper((120, 104, 84), seed, stain=False)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 300], fill=(92, 78, 62))
    d.rectangle([CX - 700, 300, CX + 700, 620], fill=(84, 64, 46))
    for x in (CX - 360, CX, CX + 360):
        person(d, x, 560, 260, (30, 26, 24), seated=True)
    d.rectangle([CX - 760, 610, CX + 760, 650], fill=(70, 52, 38))
    d.rectangle([200, 900, 800, 950], fill=(84, 64, 46)); d.rectangle([W - 800, 900, W - 200, 950], fill=(84, 64, 46))
    for x in (330, 520, 700):
        person(d, x, 1100, 330, (30, 26, 24), seated=True)
    for x in (W - 700, W - 500, W - 330):
        person(d, x, 1100, 330, (30, 26, 24), seated=True)
    person(d, CX, 1150, 360, (20, 18, 18))
    caption_strip(img, "Tokyo District Court · stylised", None)
    return img


def scales(left="Confession\nMissing card\nUnexplained money", right="No identification\nNo poison\nNo physical evidence", seed=37, tilt=0.0):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    d.rectangle([CX - 15, 360, CX + 15, 1060], fill=INK)
    d.rectangle([CX - 200, 1060, CX + 200, 1100], fill=INK)
    dy = int(tilt * 120)
    d.line([CX - 600, 380 + dy, CX + 600, 380 - dy], fill=INK, width=14)
    for sx, sy, s in ((CX - 600, 380 + dy, left), (CX + 600, 380 - dy, right)):
        d.line([sx, sy, sx - 160, sy + 300], fill=INK, width=3); d.line([sx, sy, sx + 160, sy + 300], fill=INK, width=3)
        d.chord([sx - 220, sy + 220, sx + 220, sy + 380], 0, 180, fill=INK_L)
        label(d, (sx, sy + 520), s, 38, INK, "type")
    return img


def two_stage_diagram(seed=38):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 180), "WHY SOME DETECTIVES SUSPECTED TRAINING", 56, INK, "serifb")
    items = ["Doses measured\nprecisely", "A two-stage\nmethod", "A short delay\nbefore effect", "He drank first,\napparently unharmed"]
    for i, s in enumerate(items):
        x = 470 + i * 455
        d.rounded_rectangle([x - 200, 420, x + 200, 820], radius=20, outline=INK, width=4)
        label(d, (x, 520), str(i + 1), 90, RED, "display")
        label(d, (x, 690), s, 40, INK, "serif")
    label(d, (CX, 1000), "An observation of method, not evidence of identity", 40, INK_L, "serifi")
    return img


def files_closed(seed=39):
    img = dark((44, 42, 40), seed)
    d = ImageDraw.Draw(img)
    for i in range(4):
        x, y = CX - 700 + i * 200, CY - 340 + i * 60
        d.rectangle([x, y, x + 900, y + 600], fill=(176 - i * 6, 156 - i * 6, 116 - i * 6), outline=(90, 80, 60), width=3)
        d.rectangle([x + 60, y - 40, x + 330, y], fill=(176 - i * 6, 156 - i * 6, 116 - i * 6))
        label(d, (x + 450, y + 120), ["MILITARY LINE OF INQUIRY", "NOBORITO", "UNIT 731 VETERANS", "INTERVIEW NOTES · 1948"][i], 40, INK, "type")
    stamp(img, "LINE DROPPED", (CX + 300, CY + 320), -12, size=110)
    label(ImageDraw.Draw(img), (CX, H - 120), "Illustrative folders", 30, (170, 160, 140), "serifi")
    return img


def theory_card(seed=40):
    img = dark(NIGHT, seed, glow=(CX, CY, 600, (40, 32, 26)))
    d = ImageDraw.Draw(img)
    d.rectangle([CX - 700, CY - 260, CX + 700, CY + 260], outline=(170, 70, 56), width=6)
    label(d, (CX, CY - 130), "A THEORY, NOT A PROVEN FACT", 70, (220, 120, 100), "monob")
    label(d, (CX, CY + 20), "No document has been found showing that GHQ", 46, (222, 210, 190), "serif")
    label(d, (CX, CY + 90), "ordered the military line of inquiry stopped.", 46, (222, 210, 190), "serif")
    return img


def exchange_diagram(seed=41):
    img = paper((210, 204, 188), seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 180), "THE ARRANGEMENT, 1947 – 48", 60, INK, "serifb")
    for x, t, s in ((560, "Unit 731 leaders", "not prosecuted"), (W - 560, "United States", "received research data")):
        d.rounded_rectangle([x - 330, 420, x + 330, 820], radius=24, outline=INK, width=5)
        label(d, (x, 560), t, 56, INK, "serifb")
        label(d, (x, 680), s, 42, INK_L, "serifi")
    d.line([900, 560, W - 900, 560], fill=RED, width=8); d.polygon([(W - 900, 530), (W - 860, 560), (W - 900, 590)], fill=RED)
    d.line([900, 700, W - 900, 700], fill=SLATE, width=8); d.polygon([(900, 670), (860, 700), (900, 730)], fill=SLATE)
    label(d, (CX, 510), "research data", 36, RED, "type"); label(d, (CX, 760), "immunity", 36, SLATE, "type")
    stamp(img, "LONG KEPT FROM THE PUBLIC", (CX, 1020), -4, col=INK_L, size=60)
    return img


def notebook(seed=42):
    img = dark((50, 46, 42), seed)
    pw, ph = 1700, 1000
    pg = paper((226, 220, 198), seed, (pw, ph))
    d = ImageDraw.Draw(pg)
    d.line([pw // 2, 0, pw // 2, ph], fill=(160, 150, 130), width=6)
    for k in range(18):
        y = 100 + k * 48
        d.line([60, y, pw // 2 - 40, y], fill=(190, 196, 206), width=2); d.line([pw // 2 + 40, y, pw - 60, y], fill=(190, 196, 206), width=2)
    r = rng(seed)
    for side in (0, 1):
        for k in range(15):
            x0 = 80 + side * (pw // 2); y = 120 + k * 48
            d.line([x0, y, x0 + r.randint(300, 680), y], fill=(70, 70, 90), width=6)
    label(d, (pw // 4, 60), "Investigator's notes, 1948", 34, INK, "serifi")
    img.paste(pg, (CX - pw // 2, CY - ph // 2))
    label(ImageDraw.Draw(img), (CX, H - 110), "Illustrative pages; text deliberately unreadable", 30, (170, 160, 140), "serifi")
    return img


def unsigned_orders(seed=43, years=None):
    img = dark((40, 38, 36), seed, glow=(CX, CY, 600, (50, 42, 30)))
    for i in range(6):
        pg = paper((220 - i * 4, 212 - i * 4, 192 - i * 4), seed + i, (1000, 700))
        d = ImageDraw.Draw(pg)
        label(d, (500, 90), "EXECUTION ORDER", 46, INK, "serifb")
        label(d, (500, 160), "(illustrative)", 30, INK_L, "serifi")
        d.line([520, 560, 900, 560], fill=INK, width=2)
        label(d, (710, 600), "Minister of Justice", 28, INK_L, "serifi")
        pg = pg.rotate(rng(i).uniform(-5, 5), expand=True, resample=Image.BICUBIC)
        img.paste(pg, (CX - pg.width // 2 + i * 14, CY - pg.height // 2 - i * 12))
    if years:
        label(ImageDraw.Draw(img), (CX, 170), years, 64, (226, 214, 192), "mono")
    return img


def corridor(seed=44):
    img = dark((18, 18, 20), seed)
    d = ImageDraw.Draw(img)
    for k in range(10):
        t = k / 10
        x0, x1 = CX - 900 * (1 - t), CX + 900 * (1 - t)
        y0, y1 = CY - 600 * (1 - t), CY + 600 * (1 - t)
        v = int(40 + 50 * t)
        d.rectangle([x0, y0, x1, y1], outline=(v, v, v + 4), width=4)
    d.rectangle([CX - 60, CY - 90, CX + 60, CY + 90], fill=(180, 170, 140))
    for x in range(CX - 50, CX + 60, 25):
        d.line([x, CY - 90, x, CY + 90], fill=(30, 30, 30), width=6)
    caption_strip(img, "Decades of waiting · stylised", None, dark_=True)
    return img


def book_covers(seed=45):
    img = dark((48, 44, 40), seed)
    d = ImageDraw.Draw(img)
    items = [("NOVEL", "Japanese crime fiction\nabout the case", (110, 60, 50)), ("NON-FICTION", "investigations\nand essays", (60, 76, 86)),
             ("FILM, 1964", "a feature film\nabout the incident", (70, 70, 60)), ("BOOK, 1985", "an English-language\ninvestigation", (90, 80, 60))]
    for i, (t, s, col) in enumerate(items):
        x = 400 + i * 500
        d.rectangle([x - 190, 330, x + 190, 920], fill=col, outline=(20, 20, 20), width=4)
        label(d, (x, 450), t, 40, (230, 220, 200), "monob")
        label(d, (x, 640), s, 34, (220, 210, 190), "serifi")
    label(d, (CX, 1060), "Generic stand-ins; not the actual covers or posters", 30, (170, 160, 140), "serifi")
    return img


def cell_paintings(seed=46):
    img = paper((150, 146, 136), seed, stain=False)
    d = ImageDraw.Draw(img)
    d.rectangle([CX - 160, 200, CX + 160, 460], fill=(200, 196, 180))
    for x in range(CX - 150, CX + 160, 50):
        d.line([x, 200, x, 460], fill=(60, 60, 60), width=10)
    r = rng(seed)
    for i in range(5):
        x = 360 + i * 380
        d.rectangle([x - 150, 600, x + 150, 820], fill=(110, 90, 70))
        hue = [(160, 170, 160), (190, 180, 150), (150, 160, 175), (180, 160, 150), (170, 175, 150)][i]
        d.rectangle([x - 135, 615, x + 135, 805], fill=hue)
        d.polygon([(x - 135, 760), (x - 40, 680 + r.randint(-20, 20)), (x + 50, 730), (x + 135, 690), (x + 135, 805), (x - 135, 805)], fill=tuple(c - 40 for c in hue))
    d.rectangle([0, 1040, W, H], fill=(110, 106, 98))
    caption_strip(img, "Painting in prison · stylised", "Not reproductions of actual works")
    return img


def life_timeline(stage=3, seed=47):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    x0, x1 = 300, W - 300
    def X(y): return x0 + (y - 1890) / (1990 - 1890) * (x1 - x0)
    d.line([x0, CY, x1, CY], fill=INK, width=5)
    for y in range(1890, 1991, 10):
        d.line([X(y), CY - 14, X(y), CY + 14], fill=INK, width=3)
        label(d, (X(y), CY + 50), str(y), 30, INK_L, "mono")
    ev = [(1892, "born", 0), (1948, "arrested", 1), (1955, "sentence final", 1), (1987, "dies in prison, aged 95", 2)]
    if stage >= 2:
        d.rectangle([X(1948), CY - 40, X(1987), CY - 16], fill=(170, 120, 100))
        label(d, ((X(1948) + X(1987)) / 2, CY - 260), "almost 39 years in custody", 44, RED, "serifb")
    for y, s, st in ev:
        if st <= stage:
            d.ellipse([X(y) - 16, CY - 16, X(y) + 16, CY + 16], fill=RED if y >= 1948 else INK)
            label(d, (X(y), CY - 120 - (60 if y == 1955 else 0)), f"{y}\n{s}", 36, INK, "serif")
    label(d, (CX, 200), "SADAMICHI HIRASAWA · 1892 – 1987", 58, INK, "serifb")
    return img


def armband_card(fade=0.0, seed=48):
    img = dark(NIGHT, seed, glow=(CX, CY, 600, (40, 34, 28)))
    d = ImageDraw.Draw(img)
    v = int(200 - fade * 120)
    d.rounded_rectangle([CX - 600, CY - 160, CX + 600, CY + 160], radius=30, fill=(v, v - 6, v - 16))
    d.rounded_rectangle([CX - 600, CY - 160, CX + 600, CY + 160], radius=30, outline=(v - 80, v - 86, v - 90), width=6)
    label(d, (CX, CY), "EPIDEMIC PREVENTION", 80, (v - 120, v - 124, v - 130), "monob")
    label(d, (CX, CY + 260), "an armband and a story · illustrative", 34, (170, 160, 140), "serifi")
    return img


def gh_notice(seed=49):
    return document("PUBLIC HEALTH NOTICE", [
        "By order of the occupation authorities, residents of this district will receive disinfection and preventive treatment.",
        "Cooperate fully with health officials.",
        "(Illustrative document with invented wording.)"], seed=seed, header="TOKYO · 1947", tilt=-1.5)


def dysentery_notice(seed=50):
    return document("OUTBREAK REPORTED", [
        "Dysentery reported in the neighbourhood.",
        "All persons on these premises to take preventive medicine before leaving.",
        "(The visitor's story, as told to the staff. Invented layout.)"], seed=seed, header="AS CLAIMED BY THE VISITOR", tilt=1)


def law_timeline(seed=51):
    img = paper(PAPER, seed)
    d = ImageDraw.Draw(img)
    label(d, (CX, 200), "LAW IN TRANSITION", 62, INK, "serifb")
    d.line([350, CY, W - 350, CY], fill=INK, width=5)
    pts = [(560, "MAY 1947", "New Constitution:\nforced confessions\ninadmissible"),
           (CX, "AUG 1948", "Hirasawa arrested;\nold procedure\nstill applies"),
           (W - 560, "JAN 1949", "New Code of\nCriminal Procedure\ntakes effect")]
    for i, (x, dt, s) in enumerate(pts):
        col = RED if i == 1 else INK
        d.ellipse([x - 20, CY - 20, x + 20, CY + 20], fill=col)
        label(d, (x, CY - 80), dt, 46, col, "mono")
        label(d, (x, CY + 170), s, 38, INK, "serif")
    return img


def end_credits():
    img = dark(NIGHT, 99)
    d = ImageDraw.Draw(img)
    label(d, (CX, 200), "THE TEIGIN INCIDENT", 70, (226, 214, 192), "display")
    lines = ["Narration script: original text based on the documented record",
             "Voice: Kokoro-82M text-to-speech (Apache 2.0)",
             "Visuals: original illustrations generated in code · no archival photographs used",
             "Music: original ambient score generated for this film",
             "Fonts: Old Standard TT, Playfair Display, Courier Prime (OFL) · Special Elite (Apache 2.0) · Noto Serif CJK (OFL)",
             "",
             "SOURCES FOR FURTHER READING",
             "Wikipedia: “Teigin Incident” · “帝銀事件” · “Sadamichi Hirasawa”",
             "William Triplett, Flowering of the Bamboo (1985)",
             "Sheldon H. Harris, Factories of Death",
             "Japanese newspaper archives, January 1948 and May 1987",
             "",
             "Some details remain disputed. Maps and reconstructions are schematic."]
    y = 330
    for s in lines:
        fn = "monob" if s.isupper() else ("jp" if any(ord(c) > 0x3000 for c in s) else "serif")
        label(d, (CX, y), s, 34, (200, 190, 170), fn)
        y += 58
    label(d, (CX, H - 140), "In memory of the twelve people who died on 26 January 1948", 38, (226, 214, 192), "serifi")
    return [img]
