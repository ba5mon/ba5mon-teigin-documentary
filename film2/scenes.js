// The Teigin Incident · the eleven scenes of the production script, as stacks of cut paper (see TREATMENT.md §4)
// A shot: { at: cue index | [cue, offset s] (0 = scene start), build() → stack, cam(l, d, q), fig(l, d, q, cam) → [{z, draw}], over(g, l, d, q, cam) paper text, lit(), post(), ev() }
import { W, H, MX, MY, clamp, seg, lerp, eio, eo, rnd, sheet, backPanel, focus, figure, figureLit } from './engine.js';
import { strip, stamp, typed, bigGlyph, proj, rec, SEAL, RUST, INK, PAPER } from './film.js';

// ───────── palettes: one temperature per stack ─────────
const GREY = { back: [[0, '#d9d3c7'], [.6, '#c2bbae'], [1, '#a59e92']], far: '#b7b0a4', mid: '#8b857b', near: '#5a554e', front: '#24211d', light: '#f6ead4', glow: '#ffc778' };
const SEPIA = { back: [[0, '#e9cfa3'], [.6, '#cfa874'], [1, '#a98058']], far: '#c4a074', mid: '#8f6a45', near: '#553a24', front: '#1f150d', light: '#ffd99e', glow: '#ffbe6a' };
const DUSK = { back: [[0, '#e3b98a'], [.45, '#c69670'], [1, '#7d6352']], far: '#b8957a', mid: '#82685a', near: '#4b3a31', front: '#1d1612', light: '#ffcf96', glow: '#ffb35c' };
const COLD = { back: [[0, '#c9c6bd'], [.6, '#a9a59c'], [1, '#85817a']], far: '#a19d94', mid: '#77736c', near: '#47443f', front: '#1b1a18', light: '#efe6d4', glow: '#ffd28e' };

// ───────── paper-cutting helpers (screen coordinates; the sheet margin is MX/MY) ─────────
const X0 = -MX, X1 = W + MX, YB = H + MY;
const wob = (r, a) => (r() - .5) * a;
function ground(g, y, r, amp = 8, step = 70) { g.beginPath(); g.moveTo(X0, YB); g.lineTo(X0, y); for (let x = X0; x <= X1 + step; x += step) g.lineTo(x, y + wob(r, amp)); g.lineTo(X1, YB); g.closePath(); g.fill(); }
const rect = (g, x, y, w, h) => { g.beginPath(); g.rect(x, y, w, h); g.fill(); };
function roof(g, x, y, w, h, over = 14) { g.beginPath(); g.moveTo(x - over, y); g.lineTo(x + w / 2, y - h); g.lineTo(x + w + over, y); g.closePath(); g.fill(); }
function jpHouse(g, x, base, w, h, rh, r) { rect(g, x, base - h, w, h); g.beginPath(); g.moveTo(x - 22, base - h + 4); g.quadraticCurveTo(x + w * .1, base - h - rh * .2, x + w * .2, base - h - rh); g.lineTo(x + w * .8, base - h - rh); g.quadraticCurveTo(x + w * .9, base - h - rh * .2, x + w + 22, base - h + 4); g.closePath(); g.fill(); }
function skyline(g, base, r, o) {
  let x = o.x0 ?? X0; while (x < (o.x1 ?? X1)) { const w = o.wmin + r() * (o.wmax - o.wmin), h = o.hmin + r() * (o.hmax - o.hmin);
    if (o.ruin) { g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - h); let xx = x; const n = 3 + (r() * 4 | 0); for (let i = 1; i <= n; i++) { xx = x + w * i / n; g.lineTo(xx - w / n * .5, base - h * (.55 + r() * .5)); g.lineTo(xx, base - h * (.3 + r() * .7)); } g.lineTo(x + w, base); g.closePath(); g.fill(); }
    else if (r() < (o.pitch ?? .5)) jpHouse(g, x, base, w, h * .7, h * .3, r); else rect(g, x, base - h, w, h);
    x += w + (o.gap ?? 0) * r(); }
}
function windows(g, x, y, cols, rows, w, h, gx, gy, r, p = 1) { for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (r() < p) rect(g, x + i * gx, y + j * gy, w, h); }
function pole(g, x, base, h, r) { rect(g, x - 5, base - h, 10, h); rect(g, x - 34, base - h + 18, 68, 6); rect(g, x - 26, base - h + 40, 52, 5); }
function wires(g, pts, sag, lw = 2) { g.save(); g.lineWidth = lw; g.strokeStyle = '#000'; for (let i = 0; i + 1 < pts.length; i++) { const [a, b] = [pts[i], pts[i + 1]]; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag, b[0], b[1]); g.stroke(); } g.restore(); }
function bareTree(g, x, base, h, r) {
  const br = (x0, y0, a, l, w, d) => { const x1 = x0 + Math.sin(a) * l, y1 = y0 - Math.cos(a) * l; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    if (d > 0) { br(x1, y1, a - .35 - r() * .3, l * (.62 + r() * .15), w * .62, d - 1); br(x1, y1, a + .3 + r() * .3, l * (.6 + r() * .15), w * .62, d - 1); } };
  g.save(); g.strokeStyle = '#000'; g.lineCap = 'round'; br(x, base, wob(r, .1), h * .38, h * .06, 6); g.restore();
}
function snowCaps(g, x, y, w, t = 12) { g.beginPath(); g.moveTo(x - 6, y + 4); g.quadraticCurveTo(x + w * .25, y - t, x + w * .5, y - t * .6); g.quadraticCurveTo(x + w * .8, y - t * 1.1, x + w + 6, y + 4); g.closePath(); g.fill(); }
const L0 = (x = W / 2, y = H * .28, r = 1150, col) => ({ x, y, r, col });

// standard sheet ladder; a stack = { layers }
const P = (pal, z, draw, o = {}) => sheet({ z, color: pal[o.tone || (z > .75 ? 'far' : z > .5 ? 'mid' : z > .2 ? 'near' : 'front')], trans: o.trans ?? (z > .75 ? .7 : z > .5 ? .5 : z > .2 ? .28 : .12), light: o.light || L0(o.lx, o.ly, o.lr, pal.light), glowCol: pal.glow, rimCol: '#ffe2b8', draw, ...o });
const BACK = (pal, o = {}) => backPanel({ stops: pal.back, light: o.light || L0(o.lx ?? W / 2, o.ly ?? H * .3, o.lr ?? 900, pal.light) });
const stack = (layers, fz = .4, k = 8) => focus({ layers }, fz, k);

// ───────── figures, snow, small props drawn per frame at a depth ─────────
const F = (z, f, o = {}) => ({ z, draw: g => { g.save(); if (o.a !== undefined) g.globalAlpha *= clamp(o.a); figureLit(g, { color: o.col || '#17110c', ...f }, o); g.restore(); } });
const D = (z, fn) => ({ z, draw: g => { g.save(); fn(g); g.restore(); } });
function snow(t, seed, n, z, o = {}) {
  return D(z, g => { const r = rnd(seed); g.fillStyle = o.col || 'rgba(250,246,238,.85)';
    for (let i = 0; i < n; i++) { const x0 = r() * (W + 2 * MX) - MX, sp = (o.sp || 60) * (.7 + r() * .6), ph = r() * 3000, sz = (o.sz || 3) * (.6 + r() * .8);
      const y = ((ph + t * sp) % (H + 2 * MY)) - MY, x = x0 + Math.sin(t * .6 + i) * 18;
      g.beginPath(); g.arc(x, y, sz, 0, 7); g.fill(); } });
}
// a walk: from x0 to x1 between l0 and l1, stride period in px; returns {x, phase, walking}
function walk(l, l0, l1, x0, x1, stride = 120) { const k = seg(l, l0, l1), x = lerp(x0, x1, k); return { x, phase: Math.abs(x - x0) / stride, walking: k > 0 && k < 1 }; }
const steps = (l0, l1, x0, x1, stride, type = 'step') => { const out = [], n = Math.floor(Math.abs(x1 - x0) / stride * 2); for (let i = 0; i < n; i++) out.push({ t: l0 + (l1 - l0) * (i + .5) / n, type }); return out; };
const knocks = (t0, type = 'knock') => [0, .42, .84].map(d => ({ t: t0 + d, type }));
const knockArm = (l, t0) => { const k = seg(l, t0 - .5, t0) * (1 - seg(l, t0 + 1.4, t0 + 2)); const tap = l > t0 && l < t0 + 1.2 ? Math.max(0, Math.sin((l - t0) / .42 * Math.PI * 2)) * .14 : 0; return -k * (1.75 + tap); };

// ───────── shared builds ─────────
// the bank: a two-storey Western-style branch with a clock (scene 1, and empty at dusk in scene 11)
function bankStack(pal, o = {}) {
  const r = rnd(o.seed || 11), bx = W / 2 - 330, bw = 660, base = 820;
  const L = [BACK(pal, { ly: H * .22 })];
  L.push(P(pal, .9, g => { skyline(g, 760, r, { wmin: 120, wmax: 260, hmin: 120, hmax: 260, pitch: .7 }); }, { trans: .75 }));
  L.push(P(pal, .7, g => { skyline(g, 800, r, { wmin: 160, wmax: 300, hmin: 160, hmax: 300, pitch: .8, x0: X0, x1: bx - 120 }); skyline(g, 800, r, { wmin: 160, wmax: 300, hmin: 160, hmax: 300, pitch: .8, x0: bx + bw + 120, x1: X1 }); },
    { glow: o.lit === false ? null : g => { for (const x of [60, 330, 1560, 1790]) windows(g, x, 640, 2, 1, 30, 40, 70, 0, r, .6); } }));
  L.push(P(pal, .45, g => {                       // the bank
    rect(g, bx, base - 360, bw, 360); rect(g, bx - 18, base - 372, bw + 36, 18); rect(g, bx - 10, base - 182, bw + 20, 10);
    rect(g, bx + bw / 2 - 90, base - 420, 180, 52); g.beginPath(); g.moveTo(bx + bw / 2 - 110, base - 418); g.lineTo(bx + bw / 2, base - 470); g.lineTo(bx + bw / 2 + 110, base - 418); g.fill();
    rect(g, bx - 230, base - 230, 230, 230); jpHouse(g, bx + bw + 10, base, 260, 200, 80, r); rect(g, X0, base - 10, X1 - X0, 40);
  }, { cut: g => { for (let i = 0; i < 5; i++) rect(g, bx + 40 + i * 128, base - 330, 70, 110); for (let i = 0; i < 5; i++) if (i !== 2) rect(g, bx + 40 + i * 128, base - 150, 70, 120); rect(g, bx + bw / 2 - 52, base - 160, 104, 160); },
    glow: o.lit === false ? null : g => { for (let i = 0; i < 5; i++) if (i !== 2) rect(g, bx + 40 + i * 128, base - 150, 70, 120); for (const i of [0, 3]) rect(g, bx + 40 + i * 128, base - 330, 70, 110); rect(g, bx + 40, base - 210, 160, 0); },
    rimA: .5 }));
  L.push(P(pal, .25, g => { ground(g, 852, r, 6); pole(g, 300, 870, 560, r); pole(g, 1640, 870, 600, r); wires(g, [[-300, 330], [300, 330], [1640, 290], [2300, 330]], 60, 3);
    for (let x = bx - 420; x < bx - 250; x += 26) rect(g, x, 790, 8, 70); for (let x = bx + bw + 300; x < bx + bw + 520; x += 26) rect(g, x, 790, 8, 70); rect(g, bx - 420, 805, 170, 6); rect(g, bx + bw + 300, 805, 220, 6); }));
  if (o.snow !== false) L.push(sheet({ z: .2, color: '#f2eee6', trans: .2, light: L0(W / 2, H * .3, 1100, pal.light), draw: g => { ground(g, 870, r, 18, 90); snowCaps(g, bx - 18, base - 372, bw + 36, 10); snowCaps(g, bx - 230, base - 230, 230, 14); }, rimA: .2, shadowA: .3 }));
  L.push(P(pal, .06, g => { bareTree(g, -60, YB - 60, 1050, r); ground(g, 1010, r, 30, 120); }, { tone: 'front' }));
  return stack(L, .45, 9);
}
const clock = (z, x, y, r, a = 1) => D(z, g => { g.globalAlpha *= a; g.fillStyle = '#efe4cc'; g.shadowColor = 'rgba(255,220,160,.6)'; g.shadowBlur = 18; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.shadowBlur = 0;
  g.strokeStyle = '#2a1d12'; g.lineWidth = r * .09; g.stroke(); g.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a2 = i / 12 * Math.PI * 2; g.lineWidth = r * .05; g.beginPath(); g.moveTo(x + Math.sin(a2) * r * .78, y - Math.cos(a2) * r * .78); g.lineTo(x + Math.sin(a2) * r * .9, y - Math.cos(a2) * r * .9); g.stroke(); }
  g.lineWidth = r * .09; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r * .5, y); g.stroke();       // hour hand at 3
  g.lineWidth = r * .06; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - r * .74); g.stroke(); g.fillStyle = '#2a1d12'; g.beginPath(); g.arc(x, y, r * .08, 0, 7); g.fill(); });

// the bank interior (scene 4, scene 5): counter, desks, tall windows; lamp hanging
function interiorStack(pal, o = {}) {
  const r = rnd(o.seed || 41);
  const L = [BACK(pal, { ly: H * .2, lr: 1000 })];
  L.push(P(pal, .85, g => { rect(g, X0, -MY, X1 - X0, 260 + MY); rect(g, X0, 780, X1 - X0, 300); for (let i = 0; i < 7; i++) rect(g, -200 + i * 340, 0, 60, 800); },
    { cut: g => { for (let i = 0; i < 6; i++) { const x = -110 + i * 340; rect(g, x, 300, 200, 300); } }, trans: .8 }));
  L.push(P(pal, .62, g => { rect(g, X0, 640, X1 - X0, 40); rect(g, X0, 680, X1 - X0, 300); for (let x = X0; x < X1; x += 46) rect(g, x, 470, 6, 170); rect(g, X0, 460, X1 - X0, 14);
    rect(g, 1500, 180, 90, 90); }, { cut: g => { for (let x = X0 + 60; x < X1; x += 300) rect(g, x, 720, 200, 120); }, trans: .45 }));
  L.push(P(pal, .32, g => { for (const x of [-120, 420, 1380, 1880]) { rect(g, x, 700, 300, 26); rect(g, x + 14, 726, 16, 150); rect(g, x + 270, 726, 16, 150); rect(g, x + 180, 726, 90, 90); } ground(g, 880, r, 2); }));
  L.push(P(pal, .08, g => { rect(g, X0, YB - 260, 340, 260); rect(g, 1700, -MY, 60, 360 + MY); rect(g, 1660, 200, 140, 26); }, { tone: 'front' }));
  return stack(L, .4, 8);
}
// the table with the cups (scene 4)
function tableStack(pal) {
  const r = rnd(44);
  const L = [BACK(pal, { ly: H * .1, lr: 1100 })];
  L.push(P(pal, .8, g => { rect(g, X0, -MY, X1 - X0, 200 + MY); for (let i = 0; i < 5; i++) rect(g, -60 + i * 470, 0, 80, 560); }, { cut: g => { for (let i = 0; i < 4; i++) rect(g, 100 + i * 470, 220, 250, 280); }, trans: .8 }));
  L.push(P(pal, .45, g => { rect(g, X0, 690, X1 - X0, 40); g.beginPath(); g.moveTo(X0, 730); g.lineTo(X1, 730); g.lineTo(X1, YB); g.lineTo(X0, YB); g.fill(); }, { trans: .2 }));
  L.push(P(pal, .06, g => { rect(g, X0, YB - 120, X1 - X0, 120); rect(g, -MX, -MY, 260, H + 2 * MY); }, { tone: 'front' }));
  return stack(L, .45, 10);
}
const cup = (g, x, y, s, col = '#1a120b') => { g.fillStyle = col; g.beginPath(); g.moveTo(x - 22 * s, y - 36 * s); g.lineTo(x + 22 * s, y - 36 * s); g.lineTo(x + 16 * s, y); g.lineTo(x - 16 * s, y); g.closePath(); g.fill(); g.fillRect(x - 12 * s, y, 24 * s, 4 * s);
  g.fillStyle = 'rgba(255,222,170,.45)'; g.fillRect(x - 22 * s, y - 37 * s, 44 * s, 2.5 * s); };

// ───────── the scenes ─────────
export const SCENES = {
  // 1 · Cold open: winter street, the bank, the clock at 3:00; typed place and date
  1: [{ name: 'street', at: 0, build: () => bankStack(GREY),
    cam: (l, d) => { const k = eio(seg(l, 0, d)); return { x: lerp(-200, 0, eio(seg(l, 0, 16))), y: lerp(0, -150, k), zoom: lerp(1, 1.42, k) }; },
    fig: (l, d) => [clock(.45, W / 2, 820 - 444, 22), snow(l, 3, 160, .12, { sp: 70, sz: 3.2 }), snow(l, 4, 220, .6, { sp: 40, sz: 1.8, col: 'rgba(245,240,230,.7)' })],
    over: (g, l) => { const a = clamp(1 - seg(l, 13.5, 14.3)); if (a <= 0) return; g.globalAlpha *= a; typed(g, 'Tokyo, Japan', 120, H - 210, l - 1.6, { id: 'ty1' }); typed(g, 'January 26, 1948', 120, H - 156, l - 3.4, { id: 'ty2' }); },
    ev: () => [{ t: 1.6, type: 'typewriter', n: 12 }, { t: 3.4, type: 'typewriter', n: 16 }] }],

  // 3 · The visitor: the side door at dusk; the walk and the knock; the card and the armband; the door opens
  3: [{ name: 'walk', at: 0, build: () => doorStack(DUSK),
    cam: (l, d) => ({ x: lerp(-60, 140, eio(seg(l, 0, d))), zoom: lerp(1, 1.12, eio(seg(l, 0, d))) }),
    fig: l => { const w = walk(l, .4, 5.2, 120, 1090, 150); return [F(.38, { ...w, y: 846, h: 300, coat: true, hat: true, band: true, pose: { armR: knockArm(l, 5.7) } }), snow(l, 9, 60, .15, { sp: 30, sz: 2.4, col: 'rgba(255,240,220,.55)' })]; },
    over: (g, l) => strip(g, '3:20 pm', W - 120, 130, { a: seg(l, 5.6, 6.3), al: 'right', s: 40, id: 'time' }),
    ev: () => [...steps(.4, 5.2, 120, 1090, 150), ...knocks(5.7)] },
  { name: 'card', at: [1, 1.2], build: () => cardStack(DUSK),
    cam: (l, d) => ({ x: lerp(30, -30, seg(l, 0, d)), zoom: lerp(1.02, 1.08, seg(l, 0, d)) }),
    fig: l => { const k = eo(seg(l, .2, 2.2)), c = eo(seg(l, 2.6, 4.4));
      return [D(.2, g => { g.translate(lerp(-700, 0, k), 0); sleeve(g); }), D(.15, g => { g.translate(lerp(-900, 0, c), lerp(80, 0, c)); g.rotate(lerp(-.25, -.05, c)); bizCard(g, 1180, 620, 1); })]; },
    ev: () => [{ t: .3, type: 'slide' }, { t: 2.7, type: 'paper' }] },
  { name: 'door', at: [3, 0], build: () => doorStack(DUSK, { open: true }),
    cam: (l, d) => ({ x: 140, zoom: lerp(1.12, 1.3, eio(seg(l, 0, d))) }),
    fig: (l, d) => { const op = eo(seg(l, .4, 2.6)), w = walk(l, d - 6, d - 2.5, 1090, 1225, 150);
      return [D(.47, g => { g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(1190, 0, 1310, 0); gr.addColorStop(0, 'rgba(255,190,110,.0)'); gr.addColorStop(.5, `rgba(255,200,120,${.9 * op})`); gr.addColorStop(1, 'rgba(255,190,110,.0)'); g.fillStyle = gr; g.fillRect(1200, 586, 110 * op, 260); }),
        F(.38, { ...w, y: 846, h: 300, coat: true, hat: true, band: true }, { a: 1 - seg(l, d - 3.2, d - 2.4) })]; },
    ev: (d) => [{ t: .4, type: 'door' }, ...steps(d - 6, d - 2.5, 1090, 1225, 150)] }],

  // 4 · The medicine: the room; sixteen people; the cups; dose 1 and dose 2; the light goes; 12 dead · 4 survived
  4: [{ name: 'room', at: 0, build: () => interiorStack(SEPIA),
    cam: (l, d) => ({ x: lerp(-120, 80, eio(seg(l, 0, d))), zoom: 1.04 }),
    fig: () => staff(),
    over: (g, l, d, q) => strip(g, '16 people', 120, 130, { a: seg(l, q[1], q[1] + .8), s: 44, id: 'p16' }) },
  { name: 'cups', at: [2, 0], build: () => tableStack(SEPIA),
    cam: (l, d) => ({ x: lerp(60, -60, seg(l, 0, d)), zoom: lerp(1.0, 1.1, eio(seg(l, 0, d))) }),
    fig: (l) => { const out = [];
      for (let i = 0; i < 16; i++) { const row = i < 8 ? 0 : 1, c = i % 8, x = 420 + c * 150 + row * 60, y = 740 + row * 90, k = eo(seg(l, .3 + i * .22, .7 + i * .22));
        out.push(D(row ? .3 : .38, g => { g.globalAlpha *= k; cup(g, x, y + (1 - k) * 30, row ? 1.25 : 1.1); })); }
      out.push(D(.36, g => bottle(g, 1640, 760, l)));
      return out; },
    over: (g, l, d, q) => { strip(g, 'Dose 1', 120, 130, { a: seg(l, 5.2, 5.9), s: 44, id: 'd1' }); strip(g, 'Dose 2 – one minute later', 120, 210, { a: seg(l, 7.6, 8.3), s: 44, id: 'd2' }); },
    ev: () => [...Array.from({ length: 16 }, (_, i) => ({ t: .3 + i * .22, type: 'cup' })), { t: 4.4, type: 'drip' }, { t: 7.0, type: 'drip' }] },
  { name: 'dark', at: [5, 0], build: () => interiorStack(SEPIA),
    cam: (l, d) => ({ x: 80, zoom: lerp(1.04, 1.12, eio(seg(l, 0, d))) }),
    lit: (l, d, q) => 1 - .85 * eio(seg(l, q[6], q[8] - .4)) - .15 * seg(l, q[8] - .4, q[8]),
    fig: (l, d, q) => staff(i => 1 - seg(l, q[6] + i * .35, q[6] + 1.6 + i * .35)),
    post: (g, l, d, q) => { const a = seg(l, q[8] - .4, q[8]); if (a > 0) { g.fillStyle = `rgba(0,0,0,${a})`; g.fillRect(0, 0, W, H); } },
    over: (g, l, d, q) => { const a = seg(l, q[8] + .3, q[8] + 1.2); if (a <= 0) return; g.globalAlpha = a; deadCount(g, a); },
    ev: (d, q) => [{ t: q[8] + .3, type: 'gong' }] }],
};

// ───────── scene-specific builds and props ─────────
function doorStack(pal, o = {}) {
  const r = rnd(31);
  const L = [BACK(pal, { ly: H * .35, lr: 1000 })];
  L.push(P(pal, .88, g => skyline(g, 700, r, { wmin: 140, wmax: 300, hmin: 140, hmax: 300, pitch: .8 }), { trans: .8 }));
  L.push(P(pal, .48, g => { rect(g, 520, 380, X1 - 520, 470); rect(g, 500, 360, X1 - 500, 26); rect(g, X0, 600, 520, 250); },
    { cut: g => { if (o.open) rect(g, 1196, 586, 118, 262); rect(g, 1500, 470, 120, 140); rect(g, 1680, 470, 120, 140); rect(g, 820, 470, 120, 140); },
      glow: g => { rect(g, 1500, 470, 120, 140); rect(g, 820, 470, 120, 140); g.beginPath(); g.arc(1256, 545, 16, 0, 7); g.fill(); }, rimA: .55 }));
  if (!o.open) L.push(P(pal, .47, g => { rect(g, 1196, 586, 118, 262); }, { tone: 'near', shadow: false, cut: g => { rect(g, 1212, 604, 86, 100); rect(g, 1212, 724, 86, 100); }, trans: .1 }));
  L.push(P(pal, .3, g => { ground(g, 846, r, 4); rect(g, 1150, 838, 210, 14); for (let x = -150; x < 330; x += 30) rect(g, x, 760, 9, 90); rect(g, -150, 776, 480, 7); pole(g, 420, 860, 640, r); wires(g, [[-300, 300], [420, 250], [2300, 330]], 70, 3); }));
  L.push(P(pal, .06, g => { rect(g, 1850, -MY, 70, H + 2 * MY); rect(g, 1780, 140, 210, 22); ground(g, 1020, r, 20, 120); }, { tone: 'front' }));
  return stack(L, .4, 9);
}
function cardStack(pal) {
  const r = rnd(33);
  const L = [BACK(pal, { ly: H * .3, lr: 1100 })];
  L.push(P(pal, .7, g => { rect(g, 700, 120, 520, 900); }, { cut: g => { rect(g, 760, 180, 400, 330); rect(g, 760, 560, 400, 330); }, trans: .6 }));
  L.push(P(pal, .4, g => { ground(g, 960, r, 4); }));
  return stack(L, .2, 14);
}
function sleeve(g) {   // a coat sleeve from the left edge, the armband on it, the hand
  g.fillStyle = '#1a120c'; g.beginPath(); g.moveTo(-300, 380); g.lineTo(820, 470); g.lineTo(860, 640); g.lineTo(-300, 700); g.closePath(); g.fill();
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 12; g.shadowOffsetY = 8; g.fillStyle = '#e6dac2';
  g.beginPath(); g.moveTo(330, 420); g.lineTo(470, 432); g.lineTo(486, 668); g.lineTo(346, 680); g.closePath(); g.fill(); g.restore();
  g.fillStyle = 'rgba(70,45,25,.75)'; g.fillRect(343, 470, 130, 12); g.fillRect(345, 616, 130, 12);
  g.fillStyle = '#1a120c'; g.beginPath(); g.ellipse(900, 560, 70, 56, -.2, 0, 7); g.fill();
}
function bizCard(g, x, y, s) {  // a business card: blank lines only, no readable name
  g.save(); g.translate(x, y); g.scale(s, s); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 18; g.shadowOffsetY = 12; g.fillStyle = '#eee4cf'; g.fillRect(-170, -100, 340, 200); g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.fillStyle = 'rgba(60,40,22,.55)'; g.fillRect(-120, -50, 240, 14); g.fillRect(-80, -12, 160, 8); g.fillRect(-140, 40, 280, 6); g.fillRect(-140, 60, 200, 6); g.restore();
}
function bottle(g, x, y, l) {
  g.fillStyle = '#1a120b'; g.beginPath(); g.moveTo(x - 40, y); g.lineTo(x - 40, y - 120); g.quadraticCurveTo(x - 40, y - 150, x - 14, y - 160); g.lineTo(x - 14, y - 200); g.lineTo(x + 14, y - 200); g.lineTo(x + 14, y - 160); g.quadraticCurveTo(x + 40, y - 150, x + 40, y - 120); g.lineTo(x + 40, y); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,215,150,.35)'; g.fillRect(x - 30, y - 110, 8, 90);
  const k = eo(seg(l, 3.4, 4.2)) * (1 - eo(seg(l, 8.6, 9.4)));  // the dropper lifts out and back
  g.fillStyle = '#1a120b'; g.save(); g.translate(x - 160 * k, y - 210 - 120 * k); g.rotate(-.5 * k); g.fillRect(-5, 0, 10, 110); g.beginPath(); g.ellipse(0, -10, 14, 22, 0, 0, 7); g.fill(); g.restore();
}
function staff(alpha = () => 1) {  // the sixteen: staff and the caretaker's family, still; the visitor at the head of the table
  const r = rnd(5), out = [];
  const ppl = [[300, 0, 1], [390, 0, 0], [470, 1, 0], [560, 0, 1], [650, 0, 0], [745, 2, 0], [820, 0, 1], [905, 1, 0], [1000, 0, 0], [1085, 0, 1], [1175, 2, 0], [1250, 1, 0], [1340, 0, 0], [1430, 0, 1], [1515, 1, 0], [1600, 0, 0]];
  ppl.forEach(([x, kind, hair], i) => { const h = kind === 2 ? 190 : 285 + r() * 25, z = i % 2 ? .27 : .3;
    out.push(F(z, { x, y: 900 + (i % 2) * 14, h, dir: x < 960 ? 1 : -1, hair: !!hair || kind === 1, coat: false }, { a: alpha(i), col: '#1b130c' })); });
  out.push(F(.34, { x: 960, y: 880, h: 300, dir: 1, coat: true, band: true }, { col: '#120c08' }));
  return out;
}
function deadCount(g, a) {
  g.save(); g.font = '600 92px Corm'; g.textAlign = 'center'; g.textBaseline = 'middle'; const t1 = '12 dead', t2 = '·', t3 = '4 survived';
  const w1 = g.measureText(t1).width, w2 = g.measureText(' · ').width, w3 = g.measureText(t3).width, x = W / 2 - (w1 + w2 + w3) / 2, y = H / 2 - 30;
  g.shadowColor = 'rgba(180,40,30,.5)'; g.shadowBlur = 30; g.fillStyle = '#b8382b'; g.textAlign = 'left'; g.fillText(t1, x, y);
  g.shadowColor = 'rgba(255,230,190,.35)'; g.fillStyle = '#efe6d6'; g.fillText(' · ', x + w1, y); g.fillText(t3, x + w1 + w2, y); g.restore();
  if (a > .9) rec('dead', '12 dead · 4 survived', x, y - 70, x + w1 + w2 + w3, y + 40);
}
