// The Teigin Incident · Paper-cut Lightbox · film assembly: timeline → scenes (shots of paper stacks), chapter cards, main title, final card, subtitles, events
import { W, H, clamp, seg, lerp, eio, eo, canvas, compose, layerXf } from './engine.js';
import { SCENES } from './scenes.js';

const qs = new URLSearchParams(location.search);
if (qs.get('dbg')) window.DBG = +qs.get('dbg');
const cv = document.getElementById('c'), G = cv.getContext('2d');
const [OFF, O] = canvas(W, H);
let SEGS = [], SUBS = [], SHOTS = [], TEST = null, REC = null;
export let DUR = 1, EV = [];
export const INK = '#2b2017', PAPER = '#e9dec8', SEAL = '#9a2c22', RUST = '#7a3b22';
const SERIF = 'Corm', TYPE = 'Courier Prime';

export async function boot() {
  const TL = await (await fetch('timeline.json')).json(); SEGS = TL.segs; SUBS = TL.subs; DUR = TL.dur;
  await Promise.all(['500 40px Corm', '600 40px Corm', '700 40px Corm', '400 40px "Courier Prime"', '700 40px "Courier Prime"'].map(f => document.fonts.load(f, 'A')));
  let prev = null;
  for (const s of SEGS) {
    if (s.kind !== 'scene') { prev = null; continue; }
    const spec = SCENES[s.scene] || [];
    const starts = spec.map(x => { const [i, off] = Array.isArray(x.at) ? x.at : [x.at, 0]; return (i === 0 ? s.t0 : s.cues[i][0] - .1) + off; });
    spec.forEach((x, k) => {
      const t0 = starts[k], t1 = k + 1 < spec.length ? starts[k + 1] : s.t1;
      const sh = { scene: s.scene, k, t0, t1, d: t1 - t0, L: x, seg: s, prev: k ? SHOTS[SHOTS.length - 1] : (s.follows ? prev : null),
        q: s.cues.map(c => +(c[0] - t0).toFixed(3)), qe: s.cues.map(c => +(c[1] - t0).toFixed(3)) };
      SHOTS.push(sh);
    });
    prev = SHOTS[SHOTS.length - 1];
  }
  EV = [];
  for (const s of SEGS) EV.push(s.kind === 'scene' ? { t: s.t0, type: 'vo', scene: s.scene, file: s.audio, d: s.t1 - s.t0 } : { t: s.t0, type: s.kind, scene: s.scene, d: s.t1 - s.t0 });
  for (const sh of SHOTS) { EV.push({ t: sh.t0, type: 'cut', scene: sh.scene, k: sh.k, name: sh.L.name || '' }); if (sh.L.ev) for (const e of sh.L.ev(sh.d, sh.q)) EV.push({ ...e, t: sh.t0 + e.t, scene: sh.scene }); }
  EV.sort((a, b) => a.t - b.t);
  if (qs.get('test')) { const [n, k] = qs.get('test').split('.').map(Number); TEST = SHOTS.find(s => s.scene === n && s.k === (k || 0)); }
}
export const testRange = () => TEST ? [TEST.t0, TEST.t1] : null;
const segAt = t => SEGS.find(s => t >= s.t0 && t < s.t1) || SEGS[SEGS.length - 1];
const shotAt = t => SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS.filter(s => s.t0 <= t).pop();

// ───────── stacks are built on first use and kept for a few shots (each sheet is a large canvas) ─────────
const CACHE = new Map();
function stackOf(sh) {
  const key = sh.scene + '.' + sh.k;
  if (CACHE.has(key)) { const v = CACHE.get(key); CACHE.delete(key); CACHE.set(key, v); return v; }
  const st = sh.L.build(); CACHE.set(key, st);
  while (CACHE.size > 4) CACHE.delete(CACHE.keys().next().value);
  return st;
}

// ───────── on-screen text: paper strips that grow from their edge; the typewriter line; stamps ─────────
export function rec(id, text, x0, y0, x1, y1) { if (REC) REC.push({ id, text, x0, y0, x1, y1 }); }
// strip(g, text, x, y, {s, a: growth 0..1, al: 'left'|'right'|'center', ink, paper, w (font weight), id, rot})
export function strip(g, text, x, y, o = {}) {
  const a = clamp(o.a ?? 1); if (a <= 0) return;
  const s = o.s || 34; g.save(); g.font = `${o.w || 600} ${s}px ${SERIF}`;
  const tw = g.measureText(text).width, pw = tw + s * 1.3, ph = s * 1.55;
  const x0 = o.al === 'right' ? x - pw : o.al === 'center' ? x - pw / 2 : x, y0 = y - ph / 2;
  g.translate(x0, y0); if (o.rot) { g.translate(pw / 2, ph / 2); g.rotate(o.rot); g.translate(-pw / 2, -ph / 2); }
  const k = eo(a), fromRight = o.al === 'right';
  g.beginPath(); fromRight ? g.rect(pw * (1 - k) - 2, -20, pw * k + 30, ph + 50) : g.rect(-12, -20, pw * k + 12, ph + 50); g.clip();
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 16; g.shadowOffsetX = 6; g.shadowOffsetY = 10; g.fillStyle = o.paper || PAPER;
  g.beginPath(); g.moveTo(0, 1); g.lineTo(pw, 0); g.lineTo(pw - 1, ph); g.lineTo(1, ph - 1); g.closePath(); g.fill(); g.restore();
  const gr = g.createLinearGradient(0, 0, 0, ph); gr.addColorStop(0, 'rgba(255,240,210,.35)'); gr.addColorStop(.12, 'rgba(255,240,210,0)'); gr.addColorStop(.85, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(60,30,10,.25)');
  g.fillStyle = gr; g.fillRect(0, 0, pw, ph);
  g.fillStyle = o.ink || INK; g.textBaseline = 'middle'; g.fillText(text, s * .65, ph / 2 + s * .04);
  g.restore();
  if (a > .9 && (g.globalAlpha > .5)) rec(o.id || text, text, x0, y0, x0 + pw, y0 + ph);
  return pw;
}
export function stamp(g, text, x, y, o = {}) {
  const a = clamp(o.a ?? 1); if (a <= 0) return;
  const s = o.s || 64, sc = 1 + 1.4 * (1 - eo(clamp(a * 1.6)));
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.06); g.scale(sc, sc); g.globalAlpha *= clamp(a * 2.2);
  g.font = `700 ${s}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; const tw = g.measureText(text).width, pw = tw + s * .9, ph = s * 1.35;
  g.strokeStyle = o.ink || INK; g.fillStyle = o.ink || INK; g.lineWidth = s * .07; g.strokeRect(-pw / 2, -ph / 2, pw, ph);
  g.lineWidth = s * .025; g.strokeRect(-pw / 2 + s * .12, -ph / 2 + s * .12, pw - s * .24, ph - s * .24);
  g.letterSpacing = (s * .08) + 'px'; g.fillText(text, s * .04, s * .05);
  if (o.strike) { const k = eo(clamp(o.strike)); g.lineWidth = s * .09; g.beginPath(); g.moveTo(-pw / 2 - 10, s * .05); g.lineTo(-pw / 2 - 10 + (pw + 20) * k, -s * .05); g.stroke(); }
  g.restore();
  if (a > .9 && !o.norec) rec(o.id || text, text, x - pw / 2, y - ph / 2, x + pw / 2, y + ph / 2);
}
export function typed(g, text, x, y, l, o = {}) {        // the typewriter line: characters appear at cps, the full line is reported
  if (l <= 0) return; const n = Math.min(text.length, Math.floor(l * (o.cps || 14)));
  g.save(); g.font = `400 ${o.s || 40}px "${TYPE}"`; g.fillStyle = o.col || '#efe5d2'; g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 12;
  g.fillText(text.slice(0, n), x, y); const tw = g.measureText(text).width;
  if (n < text.length && Math.floor(l * 3) % 2 === 0) g.fillRect(x + g.measureText(text.slice(0, n)).width + 3, y - (o.s || 40) * .7, (o.s || 40) * .5, (o.s || 40) * .8);
  g.restore(); if (g.globalAlpha > .5) rec(o.id || text, text, x, y - (o.s || 40), x + tw, y + 10);
}
export function bigGlyph(g, text, x, y, o = {}) {      // a large cut-paper glyph (the "?")
  const a = clamp(o.a ?? 1); if (a <= 0) return;
  g.save(); g.font = `700 ${o.s || 420}px ${SERIF}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.translate(x, y + (1 - eo(a)) * 60); g.globalAlpha *= a;
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 30; g.shadowOffsetY = 18; g.fillStyle = o.col || PAPER; g.fillText(text, 0, 0);
  g.restore(); if (a > .9) rec(o.id || text, text, x - 150, y - (o.s || 420) * .75, x + 150, y + 20);
}
export const proj = (cam, z, x, y) => { const X = layerXf(cam, z); return [X.tx + (x - W / 2) * X.s, X.ty + (y - H / 2) * X.s]; };

// ───────── a shot: compose its stack, then its paper text ─────────
function drawShot(g, sh, l, lit) {
  const st = stackOf(sh), L = sh.L, cam = L.cam ? L.cam(l, sh.d, sh.q) : { x: 0, y: 0, zoom: 1 };
  st.figures = tt => L.fig ? L.fig(l, sh.d, sh.q, cam) : [];
  compose(g, st, cam, sh.t0 + l, { lit: lit * (L.lit ? L.lit(l, sh.d, sh.q) : 1), vig: L.vig });
  if (L.post) L.post(g, l, sh.d, sh.q, cam);
  if (L.over) { g.save(); g.globalAlpha = clamp(lit * 1.15); L.over(g, l, sh.d, sh.q, cam); g.restore(); }
}

// ───────── cards: the lamp goes off; one strip of white light carries the title ─────────
function card(g, lines, l, d, sizes, id) {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const a = clamp(seg(l, .15, .6) * (1 - seg(l, d - .45, d - .05)));
  const ys = sizes.length === 1 ? [H / 2 + sizes[0] * .32] : [H / 2 - 18, H / 2 + sizes[1] * 1.6];
  lines.forEach((s, i) => {
    g.save(); g.font = `${i === 0 ? 600 : 500} ${sizes[i]}px ${SERIF}`; g.textAlign = 'center'; g.letterSpacing = i === 0 && sizes[0] > 80 ? '10px' : '1px';
    g.globalAlpha = a * (i ? .86 : 1); g.shadowColor = 'rgba(255,225,180,.55)'; g.shadowBlur = 26 * (1 + .03 * Math.sin(l * 9)); g.fillStyle = '#fbf6ec'; g.fillText(s, W / 2, ys[i]);
    g.shadowBlur = 0; g.fillText(s, W / 2, ys[i]); const tw = g.measureText(s).width; g.restore();
    if (a > .9) rec(id + i, s, W / 2 - tw / 2, ys[i] - sizes[i], W / 2 + tw / 2, ys[i] + sizes[i] * .3);
  });
}

// ───────── subtitles: one quiet serif line, ~74 px from the bottom ─────────
function subs(g, t) {
  for (const s of SUBS) if (t >= s.t0 && t < s.t1) {
    g.save(); g.font = `500 38px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = '#f2eadb'; g.shadowColor = 'rgba(0,0,0,.95)'; g.shadowBlur = 10;
    g.globalAlpha = clamp(seg(t, s.t0, s.t0 + .15) * (1 - seg(t, s.t1 - .15, s.t1))); g.fillText(s.text, W / 2, H - 74); g.restore();
  }
}

export function render(t) {
  const g = G; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  if (TEST) t = Math.min(TEST.t0 + t, TEST.t1 - .001);
  const s = segAt(t), l = t - s.t0, d = s.t1 - s.t0;
  if (s.kind === 'card') card(g, [s.title], l, d, [68], 'card' + s.scene);
  else if (s.kind === 'main') card(g, s.text, l, d, [104, 44], 'main');
  else if (s.kind === 'final') card(g, s.text, l, d, [54, 54], 'final');
  else {
    const i = SEGS.indexOf(s), next = SEGS[i + 1], prevSeg = SEGS[i - 1];
    let lit = s.follows ? 1 : eio(seg(l, 0, s.scene === 1 ? 1.6 : 1.1));
    if (!next || next.kind !== 'scene') lit *= 1 - eio(seg(l, d - .75, d - .05));
    const sh = shotAt(t), sl = t - sh.t0, D = .9;
    if (sh.prev && sl < D) {
      drawShot(g, sh.prev, t - sh.prev.t0, sh.prev.scene === sh.scene ? lit : 1);
      O.setTransform(1, 0, 0, 1, 0, 0); O.globalAlpha = 1; drawShot(O, sh, sl, lit);
      g.save(); g.globalAlpha = eio(sl / D); g.drawImage(OFF, 0, 0); g.restore();
    } else drawShot(g, sh, sl, lit);
    subs(g, t);
  }
}
export function texts(t) { REC = []; render(t); const r = REC; REC = null; return r; }
