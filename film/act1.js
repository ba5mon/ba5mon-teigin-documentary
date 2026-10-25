// Act I · minutes (chapters 1–6). Layout: draw(l, d, q) — l local time, d duration, q[i] = start of sentence i (local)
import { W, H, C, F, S, clamp, seg, eo, eio, lerp, txt, tw, hair, rect, fill, alpha, hatch, ring, cover, crop, tag, badge, flashRect, cut, panel, lowerThird, readout, strike, highlight, tick, dashBox, dot, paperCard, claim, row, para } from './core.js';
const IM = k => S.IM[k];

// ───────── shared pieces ─────────
// AMS sheet coordinates (assets/ams_toshima.jpg is a 1:1 crop of the sheet at 172, 1300)
export const SHIINA = [659, 630], IKEBUKURO = [1286, 429];
export const SHEET_SHIINA = [370, 964], SHEET_IKE = [721, 851], SHEET_BOMBED = [2420, 1430];
// schematic plan of the branch (not measured)
export function branchPlan(X, Y, w, h, l, at = 0, o = {}) {
  const k = seg(l, at, at + .05); if (k <= 0) return;
  alpha(k, () => { fill(X, Y, w, h, C.panel); rect(X, Y, w, h); });
  const bx = X + w * .14, by = Y + h * .2, bw = w * .62, bh = h * .58, pk = eo(seg(l, at, at + .9));
  const x = S.x; x.save(); x.strokeStyle = C.text; x.lineWidth = 3; x.setLineDash([bw * 2 * pk + bh * 2 * pk, 4000]);
  x.strokeRect(bx, by, bw, bh); x.restore();
  hair(bx + 24, by + bh * .55, bx + bw - 24, by + bh * .55, C.dim, 6);                      // the counter
  txt('counter', bx + 28, by + bh * .55 - 16, { s: 18, f: F.mono, c: C.dim, a: seg(l, at + .5, at + .6) });
  fill(bx + bw * .4, by + bh - 3, 90, 8, C.bg); txt('front door', bx + bw * .4 + 45, by + bh + 34, { s: 18, f: F.mono, c: C.dim, al: 'center', a: seg(l, at + .6, at + .7) });
  // the side entrance
  const sx = bx + bw - 3, sy = by + bh * .74; fill(sx - 3, sy - 34, 12, 68, C.bg);
  if (o.side !== false) { ring(sx, sy, 48, seg(l, at + (o.sideAt ?? .9), at + (o.sideAt ?? .9) + .5), 'side entrance', 1, null, 'pl:side'); }
  txt('schematic · not measured', X + w - 20, Y + h - 20, { s: 15, f: F.mono, c: C.faint, al: 'right', a: k });
  return { bx, by, bw, bh };
}
function dotGrid(X, Y, n, cols, gap, R, diedAt) { for (let i = 0; i < n; i++) { const at = diedAt ? diedAt(i) : null; dot(X + (i % cols) * gap, Y + Math.floor(i / cols) * gap, R, at != null, at != null ? at : 0); } }
const evs = (...a) => a.map(([t, type, o]) => ({ t, type, ...(o || {}) }));

// ═════════ 1 · Cold Open ═════════
const ch1 = [
  { at: 0, draw(l) {   // the clock: 15:00:00 on 26 January 1948, one tick per second
    flashRect(l, 0, 0, 0, W, H, .1);
    readout('MON 26 JAN 1948', 120, 300, { s: 48, c: C.dim, a: cut(l, .05) });
    const s = Math.floor(l), mm = String(Math.floor(s / 60)).padStart(2, '0'), ss = String(s % 60).padStart(2, '0');
    txt(`15:${mm}:${ss}`, 110, 520, { s: 200, f: F.mono, w: 600, a: cut(l, .1) });
    lowerThird('Tokyo', 'JAPAN · UNDER ALLIED OCCUPATION', 120, 700, l, .4);
  }, ev: d => Array.from({ length: Math.floor(d) }, (_, i) => ({ t: i, type: 'tick', loud: 1 })) },
  { at: 1, draw(l, d, q) {   // map → place: the 1946 survey, push in to Shiinamachi Station
    const mp = crop(IM('ams_toshima'), [0, 140, 1600], 60, 60, 1800, 840, { map: 1, k: eio(seg(l, .3, d)), z: 1.7, focus: [SHIINA[0] + 60, SHIINA[1] + 60], flash: 1 - seg(l, 0, .1) });
    tag('map · U.S. Army Map Service 1:12,500 · 1945–46', 84, 100, { id: 'tg:ams' });
    const [cx, cy] = mp(...SHIINA); ring(cx, cy, 44, seg(l, 1.2, 1.7), 'Shiinamachi Station', 1, 'MUSASHINO RAILROAD', 'r:st');
    const k = seg(l, 4.0, 4.5); if (k > 0) { const x = S.x; x.save(); x.strokeStyle = C.acc; x.lineWidth = 2; x.setLineDash([6, 6]); x.globalAlpha = k; x.beginPath(); x.arc(cx - 6, cy + 30, 120, 0, 7); x.stroke(); x.restore();
      txt('Imperial Bank, Shiinamachi branch', cx - 140, cy + 190, { s: 26, w: 700, al: 'right', a: k, id: 'r:bank' }); txt('≈ near the station · position inferred', cx - 140, cy + 222, { s: 16, f: F.mono, c: C.dim, al: 'right', a: k }); }
  }, ev: () => evs([0, 'paper'], [1.2, 'pencil'], [4.0, 'pencil']) },
  { at: 2, draw(l) {   // sixteen inside
    flashRect(l, 0, 0, 0, W, H, .08);
    txt('Inside the branch after closing', 120, 200, { s: 30, w: 700, c: C.dim, a: cut(l, 0), id: 'd16h' });
    dotGrid(150, 330, 16, 8, 88, 26);
    txt('16', 1150, 560, { s: 260, w: 700, a: cut(l, .2), id: 'd16' });
    txt('PEOPLE', 1160, 620, { s: 22, f: F.mono, w: 600, c: C.dim, ls: 4, a: cut(l, .2) });
  } },
  { at: 3, draw(l, d) {   // within half an hour, twelve of them
    txt('Inside the branch after closing', 120, 200, { s: 30, w: 700, c: C.dim, id: 'd16h' });
    dotGrid(150, 330, 16, 8, 88, 26, i => i < 12 ? seg(l, 1.2 + i * .12, 1.45 + i * .12) : null);
    const k = cut(l, 2.9); txt(k > 0 ? '12' : '16', 1150, 560, { s: 260, w: 700, c: C.text, id: 'd12' });
    txt(k > 0 ? 'DIED' : 'PEOPLE', 1160, 620, { s: 22, f: F.mono, w: 600, c: k > 0 ? C.acc : C.dim, ls: 4 });
    readout('≈ 30 MIN', 1160, 720, { s: 40, c: C.dim, a: cut(l, .4) });
    txt('● survived   ○ died', 150, 560, { s: 18, f: F.mono, c: C.dim, a: cut(l, 3.2), id: 'leg1' });
  } },
  { at: 4, draw(l) {   // the case file
    flashRect(l, 0, 0, 0, W, H, .08);
    txt('The Teigin Incident', 120, 250, { s: 96, w: 700, a: cut(l, 0), id: 'case1' });
    txt('帝銀事件', 124, 340, { s: 56, f: F.jp, w: 700, c: C.dim, a: cut(l, .1), id: 'case2' });
    const th = [['ams_toshima', 'map · 1946', { map: 1 }], ['matsui', 'photo · Jan 1948'], ['interrogation', 'photo · Aug 1948'], ['reenact', 'police film · Sep 1948'], ['kanda_extra', 'photo · Sep 1948'], ['hirasawa_trial_1948', 'photo · Dec 1948']];
    th.forEach(([k, lab, o], i) => { const at = .6 + i * .35; if (l < at) return; const X = 120 + i * 285; cover(IM(k), X, 470, 265, 330, { ...(o || {}), flash: 1 - seg(l, at, at + .12) }); tag(lab, X, 840, { s: 14 }); });
  }, ev: () => Array.from({ length: 6 }, (_, i) => ({ t: .6 + i * .35, type: 'shutter' })) },
];

// ═════════ 2 · Japan in 1948 ═════════
const ch2 = [
  { at: 0, draw(l, d) {
    cover(IM('ams_sheet'), 60, 60, 1800, 840, { map: 1, k: eio(seg(l, 0, d)), z: 1.12, fy: .45, flash: 1 - seg(l, 0, .1) });
    tag('map · U.S. Army Map Service · Tokyo City Plans, sheet 8 “Koishikawa”', 84, 100, { id: 'tg:sheet' });
    lowerThird('Tokyo, 1948', 'LESS THAN THREE YEARS AFTER THE WAR', 100, 760, l, .5);
  } },
  { at: 2, draw(l, d) {   // the bombed area, on the survey itself
    const mp = crop(IM('ams_bombed'), [1420, 1000, 1180], 60, 60, 1180, 840, { raw: 1, k: eio(seg(l, 0, d)), z: 1.1, focus: SHEET_BOMBED, flash: 1 - seg(l, 0, .1) });
    tag('map · AMS 1945–46 · Ueno / Asakusa · built-up areas darkened', 84, 100);
    const [cx, cy] = mp(...SHEET_BOMBED); ring(cx, cy, 110, seg(l, 1.4, 1.9), 'Bombed area', -1, 'AS MAPPED 1945–46', 'r:bomb');
    if (panel(1280, 60, 580, 400, l, .6)) {
      tag('map legend', 1304, 104); crop(IM('ams_legend'), [0, 0, 800, 150], 1304, 150, 532, 100, { map: 1, noborder: true });
      highlight(1304 + 404, 150, 128, 100, seg(l, 1.0, 1.4), false); ring(1304 + 470, 200, 64, seg(l, 1.0, 1.5));
      txt('yellow: built-up', 1304, 320, { s: 22, w: 600, c: C.dim, a: cut(l, 1.2), id: 'lg1' }); txt('hatched: bombed', 1304, 360, { s: 22, w: 700, a: cut(l, 1.2), id: 'lg2' });
    }
  }, ev: () => evs([.6, 'paper'], [1.4, 'pencil']) },
  { at: 3, draw(l, d) {
    cover(IM('awm_ddt_c'), 60, 60, 1180, 840, { k: seg(l, 0, d), z: 1.06, flash: 1 - seg(l, 0, .1) });
    tag('photo · Australian War Memorial · Otake, 1946', 84, 100);
    const k = cut(l, .5); txt('Disinfection', 1290, 300, { s: 56, w: 700, a: k, id: 'dis1' }); txt('under the occupation', 1290, 366, { s: 40, w: 700, c: C.dim, a: k, id: 'dis2' });
    hair(1290, 410, lerp(1290, 1860, eo(seg(l, .6, 1.2))), 410, C.line);
    txt('repatriation centre, 1946 · protective', 1290, 460, { s: 18, f: F.mono, c: C.dim, a: cut(l, 1.0) }); txt('clothing, face mask, DDT', 1290, 486, { s: 18, f: F.mono, c: C.dim, a: cut(l, 1.0) });
  }, ev: () => evs([0, 'shutter']) },
  { at: 5, draw(l, d) {
    cover(IM('awm_daiichi_b'), 60, 60, 1800, 840, { k: seg(l, 0, d), z: 1.06, fy: .4, flash: 1 - seg(l, 0, .1) });
    tag('photo · Australian War Memorial · Tokyo, c. 1945', 84, 100);
    lowerThird('GHQ · Dai-Ichi Seimei Building', 'GENERAL HEADQUARTERS · SUPREME COMMANDER FOR THE ALLIED POWERS', 100, 740, l, .6);
  }, ev: () => evs([0, 'shutter']) },
  { at: 7, draw(l, d) {
    cover(IM('awm_ddt_a'), 60, 60, 880, 600, { k: seg(l, 0, d), z: 1.05, flash: 1 - seg(l, 0, .1) }); tag('photo · AWM · Otake 1946', 84, 100);
    if (l > .3) { cover(IM('awm_ddt_b'), 980, 60, 880, 600, { k: seg(l, 0, d), z: 1.05, flash: 1 - seg(l, .3, .4) }); tag('photo · AWM · Otake 1946', 1004, 100); }
    const words = [['CROWDED HOUSING', .9], ['DAMAGED WATER', 2.1], ['POOR NUTRITION', 3.2], ['SPRAYING', 9.0], ['INOCULATIONS', 10.8], ['INSTRUCTIONS', 12.3]];
    words.forEach(([s, at], i) => { const X = 60 + (i % 3) * 610, Y = i < 3 ? 760 : 850; txt(s, X, Y, { s: 34, w: 700, f: F.mono, c: i < 3 ? C.text : C.dim, a: cut(l, at), id: 'w:' + s }); flashRect(l, at, X, Y - 36, 560, 46, .08); });
  }, ev: () => evs([0, 'shutter'], [.3, 'shutter']) },
  { at: 8, draw(l, d, q) {   // the armband and the habit of trust
    claim(60, 60, 1100, 420, ['“GHQ requires it.”'], 'what such an official could say', l, 0, { head: 'A HEALTH OFFICIAL, 1948', s: 72 });
    if (panel(1200, 60, 660, 420, l, .5)) { txt('ARMBAND', 1240, 200, { s: 54, w: 700, f: F.mono, a: cut(l, .5), id: 'arm' }); rect(1228, 140, tw('ARMBAND', { s: 54, w: 700, f: F.mono }) + 24, 80, C.acc, 2.5); txt('= authority', 1240, 300, { s: 32, w: 700, c: C.dim, a: cut(l, .9), id: 'auth' }); }
    const k = cut(l, q[9] + .3); if (k > 0) { panel(60, 540, 1800, 340, l, q[9] + .3); txt('Trust', 100, 760, { s: 150, w: 700, a: k, id: 'trust' }); hair(100, 800, lerp(100, 520, eo(seg(l, q[9] + .6, q[9] + 1.2))), 800, C.acc, 4); txt('the key to everything that happened next', 600, 740, { s: 30, w: 700, c: C.dim, a: cut(l, q[9] + 1.0), id: 'trust2' }); }
  } },
];

// ═════════ 3 · The Visitor ═════════
const ch3 = [
  { at: 0, draw(l) {
    flashRect(l, 0, 0, 0, W, H, .08);
    readout('≈15:20', 100, 240, { s: 150, a: cut(l, 0) }); txt('26 JAN 1948', 108, 300, { s: 24, f: F.mono, c: C.dim, a: cut(l, 0) });
    branchPlan(860, 60, 1000, 840, l, .3, { sideAt: 1.2 });
    txt('A knock at the side entrance', 100, 560, { s: 40, w: 700, a: cut(l, 1.6), id: 'knock' });
    txt('after closing time', 100, 610, { s: 28, w: 700, c: C.dim, a: cut(l, 1.6), id: 'knock2' });
  }, ev: () => evs([.3, 'pencil'], [2.2, 'knock'], [2.6, 'knock'], [3.0, 'knock']) },
  { at: 1, draw(l, d, q) {
    if (!panel(60, 60, 1800, 840, l, 0)) return;
    txt('WHAT HE PRESENTED', 110, 150, { s: 22, w: 600, f: F.mono, c: C.dim, ls: 4, a: cut(l, 0), id: 'pres' });
    tag('survivor accounts', 1580, 150, { s: 15 });
    const items = [['An armband: public health official', .6], ['A business card', 2.6], ['Identifying him as a doctor', 4.0]];
    items.forEach(([s, at], i) => { row(110, 300 + i * 150, 1700, s, true, l, at, { i, s: 44 }); badge(1760, 300 + i * 150, l, at + .3); });
  }, ev: () => evs([.6, 'mallet'], [2.6, 'mallet'], [4.0, 'mallet']) },
  { at: 2, draw(l, d, q) {
    claim(60, 60, 1800, 360, ['“There has been an outbreak of dysentery nearby.”'], 'his account, as recalled by survivors', l, 0, { head: 'WHAT HE SAID', s: 52 });
    claim(60, 460, 1800, 440, ['“The occupation authorities have ordered that everyone', 'here take a preventive medicine before leaving.”'], 'the order he claimed came from GHQ', l, q[3] + .2, { head: 'THE ORDER HE CLAIMED', s: 48, lh: 66 });
  } },
  { at: 4, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .08);
    ['CALM', 'POLITE', 'CONFIDENT'].forEach((s, i) => { const at = .1 + i * .6; txt(s, 120, 330 + i * 170, { s: 130, w: 700, f: F.mono, a: cut(l, at), id: 'cpc' + i }); });
  }, ev: () => evs([.1, 'mallet'], [.7, 'mallet'], [1.3, 'mallet']) },
];

// ═════════ 4 · The Medicine ═════════
// the police re-enactment strip (Asahi Graph, 20 Oct 1948): four stills; source coords in assets/reenact.jpg (1280 × 1670)
const RE = { pour: [650, 0, 630, 820], drink: [0, 0, 650, 820], cups: [1000, 760] };
const ch4 = [
  { at: 0, draw(l, d, q) {   // sixteen around a table (schematic)
    flashRect(l, 0, 0, 0, W, H, .08);
    const cx = 700, cy = 480; const k = cut(l, 0);
    alpha(k, () => { fill(cx - 260, cy - 120, 520, 240, C.panel); rect(cx - 260, cy - 120, 520, 240, C.dim, 1.5); });
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + i / 16 * Math.PI * 2, at = .2 + i * .09; alpha(cut(l, at), () => dot(cx + Math.cos(a) * 420, cy + Math.sin(a) * 270, 22, false, 0)); }
    txt('staff, and the caretaker’s family, including children', 260, 870, { s: 24, w: 600, c: C.dim, a: cut(l, 1.6), id: 'fam' });
    txt('schematic', 1840, 880, { s: 15, f: F.mono, c: C.faint, al: 'right' });
    const k2 = cut(l, q[1]); txt('16', 1360, 520, { s: 240, w: 700, a: k2, id: 'g16' }); txt('IN ALL', 1370, 580, { s: 22, f: F.mono, w: 600, c: C.dim, ls: 4, a: k2 });
  }, ev: () => Array.from({ length: 16 }, (_, i) => ({ t: .2 + i * .09, type: 'dot' })) },
  { at: 2, draw(l, d, q) {   // the method, as re-enacted under arrest: freeze, circle, magnify
    const mp = crop(IM('reenact'), [0, 0, 1280, 1670], 60, 60, 644, 840, { flash: 1 - seg(l, 0, .1) });
    tag('police film stills · Asahi Graph, 20 Oct 1948', 84, 100, { s: 14 });
    const [cx, cy] = mp(...RE.cups); ring(cx, cy, 70, seg(l, .8, 1.3), 'the cups', -1, 'RE-ENACTED, SEP 1948', 'r:cups');
    if (panel(744, 60, 1116, 400, l, .4)) {
      txt('THE METHOD', 784, 120, { s: 22, w: 600, f: F.mono, c: C.dim, ls: 4, a: cut(l, .4) });
      const st = [[784, 'DOSE 1'], [1130, '≈ 1 min'], [1420, 'DOSE 2']];
      st.forEach(([X, s], i) => { const at = 2.0 + i * .8; txt(s, X, 300, { s: i === 1 ? 36 : 56, w: 700, f: F.mono, c: i === 1 ? C.dim : C.text, a: cut(l, at), id: 'm' + i }); if (i) hair(X - 70, 285, X - 20, 285, C.acc, 3); });
      txt('swallow the first dose in one go', 784, 400, { s: 24, w: 600, c: C.dim, a: cut(l, q[5] + 4), id: 'm4' });
    }
    // he drank first: the drinking still, magnified ×2 from the same source pixels
    const kd = cut(l, q[3] + .1); if (kd > 0) { crop(IM('reenact'), [40, 60, 520, 560], 744, 500, 540, 400, { flash: 1 - seg(l, q[3] + .1, q[3] + .2) }); tag('×2 · same still', 768, 540, { s: 14 }); txt('He drank first', 1320, 640, { s: 44, w: 700, a: kd, id: 'drank' }); txt('to show it was safe', 1320, 690, { s: 28, w: 700, c: C.dim, a: kd, id: 'drank2' }); }
    const kp = cut(l, q[5] + .2); if (kp > 0) { crop(IM('reenact'), [760, 300, 520, 420], 1320, 500, 540, 400, { flash: 1 - seg(l, q[5] + .2, q[5] + .3) }); tag('×2 · pouring', 1344, 540, { s: 14 }); }
  }, ev: (d, q) => evs([0, 'shutter'], [.8, 'pencil'], [2.0, 'keys'], [2.8, 'keys'], [3.6, 'keys'], [q[3] + .1, 'shutter'], [q[5] + .2, 'shutter']) },
  { at: 6, draw(l, d, q) {   // the count: near-silence; no sound on the rings
    dotGrid(150, 250, 16, 8, 100, 30, i => i < 10 ? seg(l, q[10] + .3 + i * .1, q[10] + .55 + i * .1) : i < 12 ? seg(l, q[11] + .3 + (i - 10) * .15, q[11] + .55 + (i - 10) * .15) : null);
    const big = l < q[10] + .3 ? '16' : l < q[11] + .3 ? '10' : '12';
    txt(big, 1160, 520, { s: 260, w: 700, id: 'cnt' });
    txt(l < q[10] + .3 ? 'DRANK' : l < q[11] + .3 ? 'DIED AT THE BANK' : 'DEAD', 1170, 580, { s: 22, f: F.mono, w: 600, c: l < q[10] + .3 ? C.dim : C.acc, ls: 4 });
    if (l > q[11] + .3) txt('10 at the bank · 2 later in hospital', 1170, 640, { s: 24, w: 600, c: C.dim, id: 'cnt2' });
    if (l > q[12] + .5) { txt('4 survived', 1170, 700, { s: 40, w: 700, id: 'cnt3' }); for (let i = 12; i < 16; i++) { const x = S.x; x.save(); x.strokeStyle = C.text; x.lineWidth = 1.5; x.beginPath(); x.arc(150 + (i % 8) * 100, 250 + 100, 40, 0, 7); x.stroke(); x.restore(); } }
    if (l > q[9]) { tag('laboratory · cyanide compound', 150, 560, { id: 'cyan' }); }
    txt('● survived   ○ died', 150, 500, { s: 18, f: F.mono, c: C.dim, a: cut(l, q[10] + .3), id: 'leg2' });
  }, ev: (d, q) => evs([q[6], 'thump']) },
];

// ═════════ 5 · After the Alarm ═════════
const ch5 = [
  { at: 0, draw(l, d, q) {
    claim(60, 60, 1800, 520, ['Gas?', 'Food poisoning?'], 'early reports, 26 January 1948', l, q[1], { head: 'FIRST REPORTS', s: 88, lh: 120 });
    if (l < q[1]) { flashRect(l, 0, 0, 0, W, H, .08); txt('Neighbours and passers-by reach the building', 120, 300, { s: 48, w: 700, a: cut(l, 0), id: 'nb1' }); txt('they did not understand what they were seeing', 120, 360, { s: 32, w: 700, c: C.dim, a: cut(l, .3), id: 'nb2' }); }
    if (panel(60, 620, 1800, 280, l, q[2] + .2)) { txt('People went inside to help', 110, 730, { s: 40, w: 700, a: cut(l, q[2] + .2), id: 'nb3' }); txt('≈ the scene was disturbed before detectives arrived', 110, 800, { s: 28, w: 600, c: C.dim, a: cut(l, q[2] + 2.5), id: 'nb4' }); }
  } },
  { at: 3, draw(l, d) {
    cover(IM('horisaki'), 60, 60, 1180, 840, { k: seg(l, 0, d), z: 1.05, fx: .3, flash: 1 - seg(l, 0, .1) });
    tag('photo · Asahi Graph · Sep 1948', 84, 100);
    lowerThird('Metropolitan Police', 'ONE OF ITS LARGEST INVESTIGATIONS', 1290, 300, l, .5);
    txt('Horisaki Shigeki', 1290, 520, { s: 34, w: 700, a: cut(l, 1.2), id: 'hor1' }); txt('head of the First Investigation Division', 1290, 560, { s: 22, w: 600, c: C.dim, a: cut(l, 1.2), id: 'hor2' });
    txt('(here reading the September extra)', 1290, 594, { s: 18, f: F.mono, c: C.faint, a: cut(l, 1.2) });
  }, ev: () => evs([0, 'shutter']) },
  { at: 4, draw(l) {   // then vs record
    claim(60, 60, 880, 520, ['Gas?', 'Food poisoning?'], 'early reports', l, 0, { head: 'FIRST REPORTS', s: 70, lh: 96 });
    strike(88, 155, tw('Gas?', { s: 70, f: F.it, it: 1 }), seg(l, .9, 1.2)); strike(88, 251, tw('Food poisoning?', { s: 70, f: F.it, it: 1 }), seg(l, 1.0, 1.3));
    const kf = cut(l, .4); if (kf > 0) { alpha(kf, () => { fill(980, 60, 880, 520, 'rgba(255,74,46,0.08)'); rect(980, 60, 880, 520, C.acc, 1.5); }); flashRect(l, .4, 980, 60, 880, 520);
      txt('LABORATORY', 1020, 112, { s: 22, w: 700, f: F.mono, c: C.acc, ls: 4, a: kf, id: 'labh' }); txt('Cyanide', 1020, 300, { s: 120, w: 700, a: kf, id: 'lab1' }); txt('compound', 1020, 380, { s: 52, w: 700, c: C.dim, a: kf, id: 'lab2' }); }
  }, ev: () => evs([.4, 'paper'], [.9, 'scratch']) },
  { at: 5, draw(l, d, q) {   // the name
    flashRect(l, 0, 0, 0, W, H, .08);
    readout('27 JAN 1948', 120, 200, { s: 56, c: C.dim, a: cut(l, 0) }); txt('the next morning', 124, 250, { s: 22, f: F.mono, c: C.faint, a: cut(l, 0) });
    const ch = ['帝', '國', '銀', '行', '事', '件'], hi = [0, 2], X0 = 120;
    ch.forEach((c, i) => { const X = X0 + i * 190 + (i > 3 ? 60 : 0); txt(c, X, 560, { s: 170, f: F.jp, w: 700, c: hi.includes(i) && l > 2.2 ? C.acc : C.text, a: cut(l, .5 + i * .12), id: 'nm' + i }); });
    const k = cut(l, 1.4); txt('Teikoku Ginkō · Imperial Bank', X0, 650, { s: 30, w: 700, a: k, id: 'nm6' }); txt('Jiken · incident', X0 + 820, 650, { s: 30, w: 700, a: k, id: 'nm7' });
    const k2 = cut(l, 2.4); txt('帝 + 銀  →  “Teigin”', X0, 790, { s: 56, w: 700, a: k2, id: 'nm8' }); txt('the name that followed the case for decades', X0, 850, { s: 24, w: 600, c: C.dim, a: cut(l, 2.8), id: 'nm9' });
  } },
  { at: 6, draw(l, d, q) {
    branchPlan(860, 60, 1000, 840, l, 0, { sideAt: .2 });
    const k = cut(l, q[7]); if (k > 0) { txt('Who was', 100, 420, { s: 110, w: 700, a: k, id: 'who1' }); txt('the doctor?', 100, 540, { s: 110, w: 700, a: k, id: 'who2' }); }
    else { txt('simple to state', 100, 420, { s: 52, w: 700, c: C.dim, a: cut(l, .3), id: 'ss1' }); txt('almost impossible to answer', 100, 490, { s: 52, w: 700, a: cut(l, 1.6), id: 'ss2' }); }
  } },
];

// ═════════ 6 · The Money Left Behind ═════════
const ch6 = [
  { at: 0, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('WHAT HE TOOK', 120, 150, { s: 22, w: 600, f: F.mono, c: C.dim, ls: 4, a: cut(l, 0), id: 'took' });
    if (paperCard(120, 210, 820, 420, l, .4)) { txt('CASH', 160, 280, { s: 26, w: 700, f: F.mono, c: '#55524a' }); txt('≈ ¥164,000', 160, 460, { s: 104, w: 700, f: F.mono, c: C.ink, id: 'cash' }); }
    if (paperCard(980, 210, 820, 420, l, 4.0)) { txt('CHEQUE', 1020, 280, { s: 26, w: 700, f: F.mono, c: '#55524a' }); txt('≈ ¥17,000', 1020, 460, { s: 104, w: 700, f: F.mono, c: C.ink, id: 'chq' }); }
    const k = cut(l, q[2] + .3); if (k > 0) { const x = S.x; x.save(); x.globalAlpha = k; x.translate(1390, 570); x.rotate(-.06); x.strokeStyle = C.acc; x.lineWidth = 4; x.strokeRect(-330, -44, 660, 88); x.restore();
      txt('CASHED · 27 JAN 1948', 1390, 584, { s: 36, w: 700, f: F.mono, c: C.acc, al: 'center', a: k, id: 'cashed' }); txt('at another bank, the following day', 980, 700, { s: 28, w: 600, c: C.dim, a: cut(l, q[2] + .8), id: 'cashed2' }); }
  }, ev: (d, q) => evs([.4, 'paper'], [4.0, 'paper'], [q[2] + .3, 'stamp']) },
  { at: 3, draw(l, d, q) {   // what he did not take
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('TAKEN', 120, 260, { s: 26, w: 700, f: F.mono, a: cut(l, 0), id: 'tk' }); alpha(cut(l, .2), () => fill(120, 290, 360, 90, C.text)); txt('≈ ¥164,000 cash + a cheque ≈ ¥17,000', 120, 420, { s: 22, f: F.mono, c: C.dim, a: cut(l, .4) });
    const kq = seg(l, q[4], q[4] + 1.2); txt('LEFT IN THE BANK', 120, 560, { s: 26, w: 700, f: F.mono, a: cut(l, q[4]), id: 'lft' });
    if (kq > 0) { rect(120, 590, 360 + 1300 * eo(kq), 90, C.text, 2, [10, 8]); txt('far more · amount not stated here', 140, 720, { s: 22, f: F.mono, c: C.dim, a: cut(l, q[4] + 1.2), id: 'lft2' }); }
    const kw = cut(l, q[5] + .2); if (kw > 0) { rect(1220, 140, 560, 240, C.acc, 2, [6, 5]); txt('Why?', 1260, 300, { s: 120, w: 700, a: kw, id: 'why' }); txt('UNRESOLVED', 1240, 180, { s: 18, w: 600, f: F.mono, c: C.acc, ls: 4, a: kw }); }
  } },
];

export const ACT1 = { 1: ch1, 2: ch2, 3: ch3, 4: ch4, 5: ch5, 6: ch6 };
