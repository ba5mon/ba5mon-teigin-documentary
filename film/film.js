// The Teigin Incident — Visual Investigation · film assembly: timeline → slates, chapter layouts, main title, credits, subtitles, events
import { W, H, C, F, S, clamp, seg, eo, lerp, rnd, txt, tw, hair, fill, alpha, flashRect, cover, crop, tag, readout, dot, plate } from './core.js';
import { CH } from './chapters.js';

const qs = new URLSearchParams(location.search);
const cv = document.getElementById('c'); S.x = cv.getContext('2d');
let TL = null, SEGS = [], SUBS = [], SHOTS = [];
export let DUR = 1, EV = [];

const IMGS = ['hirasawa_1951', 'hirasawa_c1920', 'hirasawa_trial_1948', 'horisaki', 'ikii', 'interrogation', 'kanda_extra', 'matsui', 'reenact', 'takagi', 'yamada',
  'awm_daiichi_a', 'awm_daiichi_b', 'awm_ddt_a', 'awm_ddt_b', 'awm_ddt_c', 'ams_sheet', 'ams_toshima', 'ams_legend', 'ams_bombed'];
const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => { console.warn('optional file missing: ' + src); r(null); }; i.src = src; });

// the act clock carried by each chapter slate
const SLATE = { 1: 'MON 26 JAN 1948 · 15:00', 2: 'TOKYO · 1945 → 1948', 3: '26 JAN 1948 · ≈15:20', 4: '26 JAN 1948 · ≈15:20 → 15:50', 5: '26 → 27 JAN 1948', 6: '26 → 27 JAN 1948',
  7: 'JAN → AUG 1948', 8: 'OCT 1947 → 26 JAN 1948', 9: 'SPRING → SUMMER 1948', 10: '1892 → 1947', 11: 'AUGUST 1948', 12: '1947 · 1948 · 1949', 13: 'AUG → SEP 1948',
  14: 'DEC 1948 → 1950', 15: '1945 → 1948', 16: '1945 → 1980s', 17: '1950 · 1955', 18: '1955 → 1987', 19: '1960s → 1985', 20: '1948 → 10 MAY 1987', 21: '1948 → TODAY', 22: 'UNRESOLVED' };
const SLATE_IMG = { 1: 'ams_toshima', 2: 'awm_daiichi_b', 3: 'ams_toshima', 4: 'reenact', 5: 'horisaki', 7: 'kanda_extra', 8: 'matsui', 10: 'hirasawa_c1920', 11: 'interrogation', 12: 'interrogation',
  13: 'kanda_extra', 14: 'hirasawa_trial_1948', 17: 'hirasawa_trial_1948', 19: 'hirasawa_c1920', 20: 'hirasawa_1951', 22: 'hirasawa_1951' };

export async function boot() {
  TL = await (await fetch('timeline.json')).json(); SEGS = TL.segs; SUBS = TL.subs; DUR = TL.dur;
  const L = IMGS.map(k => load(`assets/${k}.jpg`).then(i => S.IM[k] = i));
  for (const f of ['700 40px Sans', '600 40px Sans', '400 20px Sans', '400 20px Mono', '600 20px Mono', 'italic 24px SerifI', '700 40px JP']) L.push(document.fonts.load(f, f.includes('JP') ? '帝銀' : 'A'));
  await Promise.all(L);
  S.GRAIN = []; for (let g = 0; g < 6; g++) { const c = document.createElement('canvas'); c.width = c.height = 256; const gx = c.getContext('2d'); const d = gx.createImageData(256, 256); const r = rnd(g * 99 + 7);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } gx.putImageData(d, 0, 0); S.GRAIN.push(c); }
  // chapter layouts cut on sentence starts
  for (const s of SEGS) {
    if (s.kind !== 'ch') continue;
    const spec = CH[s.ch] || [];
    const starts = spec.map(x => { const [i, off] = Array.isArray(x.at) ? x.at : [x.at, 0]; return (i === 0 ? s.t0 : s.cues[i][0] - .1) + off; });
    spec.forEach((x, k) => { const t0 = starts[k], t1 = k + 1 < spec.length ? starts[k + 1] : s.t1; SHOTS.push({ ch: s.ch, k, t0, t1, L: x, q: s.cues.map(c => +(c[0] - t0).toFixed(3)), qe: s.cues.map(c => +(c[1] - t0).toFixed(3)) }); });
  }
  EV = [];
  for (const s of SEGS) { if (s.kind === 'ch') EV.push({ t: s.t0, type: 'vo', ch: s.ch, file: s.audio, d: s.t1 - s.t0 }); else EV.push({ t: s.t0, type: s.kind, ch: s.ch, d: s.t1 - s.t0 }); }
  for (const sh of SHOTS) { EV.push({ t: sh.t0, type: 'cut', ch: sh.ch, kind: sh.L.kind || '' }); if (sh.L.ev) for (const e of sh.L.ev(sh.t1 - sh.t0, sh.q)) EV.push({ ...e, t: sh.t0 + e.t, ch: sh.ch }); }
  EV.sort((a, b) => a.t - b.t);
  if (qs.get('test')) { const [ch, k] = qs.get('test').split('.').map(Number); const sh = SHOTS.find(s => s.ch === ch && s.k === (k || 0)); TEST = sh; DUR = sh.t1 - sh.t0; }
}
let TEST = null;
const segAt = t => SEGS.find(s => t >= s.t0 && t < s.t1) || SEGS[SEGS.length - 1];
const shotAt = t => SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS.filter(s => s.t0 <= t).pop();

// ───────── slates (chapter title cards), left-aligned, not a centred slide ─────────
function slate(s, l) {
  flashRect(l, 0, 0, 0, W, H, .1);
  const k = seg(l, .05, .1), X0 = 120, im = S.IM[SLATE_IMG[s.ch]];
  if (im) alpha(.32 * k, () => cover(im, 1180, 140, 620, 700, { k: seg(l, 0, 4), z: 1.04, noborder: false }));
  txt(`CHAPTER ${String(s.ch).padStart(2, '0')} / 22`, X0, 360, { s: 22, w: 600, f: F.mono, c: C.acc, ls: 5, a: k, id: 'sl' + s.ch });
  const maxW = im ? 940 : 1640, big = Math.min(96, Math.floor(96 * maxW / tw(s.title, { s: 96, w: 700 })));   // never runs into the photo
  txt(s.title, X0, 470, { s: big, w: 700, a: k, id: 'slt' + s.ch });
  readout(SLATE[s.ch], X0 + 2, 560, { s: 38, c: C.dim, a: seg(l, .15, .2), id: 'slr' + s.ch });
  hair(X0, 610, lerp(X0, 1000, eo(seg(l, .1, .8))), 610, C.acc, 2);
}
// main title (after the cold open): the map left, the title right
function mainTitle(l) {
  flashRect(l, 0, 0, 0, W, H, .1);
  const im = S.IM.ams_toshima, mp = crop(im, [100, 200, 1100], 60, 60, 1040, 780, { map: 1, k: seg(l, 0, 4.6), z: 1.06, focus: [659, 630] });
  const [cx, cy] = mp(659, 630); const x = S.x; x.save(); x.strokeStyle = C.acc; x.lineWidth = 2.5; x.beginPath(); x.arc(cx, cy, 34, 0, 7); x.stroke(); x.restore();
  const X0 = 1170, k = seg(l, .05, .1);
  txt('AN INVESTIGATION', X0, 250, { s: 22, w: 700, c: C.acc, ls: 6, a: k, id: 'kick' });
  txt('The Teigin', X0, 372, { s: 104, w: 700, a: k, id: 'title1' }); txt('Incident', X0, 474, { s: 104, w: 700, a: k, id: 'title2' });
  txt('帝銀事件', X0, 566, { s: 64, w: 700, f: F.jp, a: seg(l, .1, .15), id: 'title3' });
  hair(X0, 610, lerp(X0, 1860, eo(seg(l, .4, 1.0))), 610, C.line);
  readout('26.01.1948 — 10.05.1987', X0 + 2, 664, { s: 26, c: C.dim, a: seg(l, .2, .25), id: 'title4' });
}
// credits: sources, then the dedication with twelve red rings
const CREDIT = [
  ['Sources', 'Wikipedia, “Teigin Incident”', 'Wikipedia (Japanese), “帝銀事件”', 'Wikipedia, “Sadamichi Hirasawa”', 'William Triplett, Flowering of the Bamboo (1985)', 'Sheldon H. Harris, Factories of Death', 'Japanese newspaper archives (January 1948, May 1987)'],
  ['Material', 'Photographs: Asahi Graph 1948–49 and others (public domain, via Wikimedia Commons)', 'Occupation photographs: Australian War Memorial (public domain)', 'Map: U.S. Army Map Service, Tokyo City Plans 1:12,500, 1945–46 (UT Austin PCL)', 'Constitution of Japan, Art. 38 (transcription)', 'Plans, maps of Japan and East Asia, forms and dots: schematic, drawn for this film'],
];
const CR_SPLIT = 17.5;
function credits(l, d) {
  if (l < CR_SPLIT) {
    flashRect(l, 0, 0, 0, W, H, .1); const k = seg(l, .05, .1);
    txt('The Teigin Incident', 120, 170, { s: 64, w: 700, a: k, id: 'cr0' }); hair(124, 206, lerp(124, 1000, eo(seg(l, .05, .5))), 206, C.dim);
    CREDIT.forEach((col, ci) => { const X = 124 + ci * 880; txt(col[0].toUpperCase(), X, 290, { s: 20, w: 600, f: F.mono, c: C.acc, ls: 4, a: k, id: 'crh' + ci });
      col.slice(1).forEach((s, i) => txt(s, X, 350 + i * 64, { s: ci ? 22 : 28, w: ci ? 400 : 600, c: ci ? '#B9B6AE' : C.text, a: seg(l, .1 + ci * .3, .15 + ci * .3), id: `cr${ci}.${i}`, f: s.includes('帝') ? F.sans : F.sans })); });
    txt('Narration: synthetic voice (Kokoro). Score: original. Documents, forms and plans marked “schematic” or “transcription” are reconstructions.', 124, 860, { s: 18, c: C.dim, a: seg(l, 1, 1.05), id: 'crn' });
    return;
  }
  const m = l - CR_SPLIT; flashRect(m, 0, 0, 0, W, H, .1);
  for (let i = 0; i < 12; i++) dot(W / 2 - 330 + i * 60, 420, 16, true, seg(m, .3 + i * .22, .55 + i * .22));
  txt('In memory of the twelve people who died on 26 January 1948', W / 2, 560, { s: 46, w: 600, al: 'center', a: seg(m, .1, .15), id: 'ded' });
}

// ───────── subtitles: one line, bottom of frame ─────────
const SUBY = 1006;
function subs(t) { for (const s of SUBS) if (t >= s.t0 && t < s.t1) { const x = S.x; x.save(); x.shadowColor = 'rgba(0,0,0,.95)'; x.shadowBlur = 10; txt(s.text, W / 2, SUBY, { s: 34, w: 600, al: 'center' }); x.restore(); } }

export function render(t) {
  const x = S.x; S.FR = Math.floor(t * 30); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; fill(0, 0, W, H, C.bg);
  if (TEST) { const sh = TEST; sh.L.draw(t, sh.t1 - sh.t0, sh.q, sh); subs(t + sh.t0); return; }
  const s = segAt(t);
  if (s.kind === 'card') slate(s, t - s.t0);
  else if (s.kind === 'main') mainTitle(t - s.t0);
  else if (s.kind === 'credits') credits(t - s.t0, s.t1 - s.t0);
  else { const sh = shotAt(t); if (sh) sh.L.draw(t - sh.t0, sh.t1 - sh.t0, sh.q, sh); }
  if (s.kind === 'ch') subs(t);
}
export function texts(t) { S.REC = []; render(t); const r = S.REC; S.REC = null; return r; }
export function subcheck() { return SUBS.map((s, i) => { const w = Math.round(tw(s.text, { s: 34, w: 600 })); return { i, text: s.text, w, ok: w <= 1500 }; }); }
