// Act IV · decades (chapters 17–22)
import { W, H, C, F, S, clamp, seg, eo, eio, lerp, txt, tw, hair, rect, fill, alpha, ring, cover, crop, tag, badge, flashRect, cut, panel, lowerThird, readout, strike, highlight, tick, dashBox, dot, paperCard, claim, row, axis, pin } from './core.js';
const IM = k => S.IM[k];
const evs = (...a) => a.map(([t, type, o]) => ({ t, type, ...(o || {}) }));
const head = (s, X, Y, l, at = 0, c = C.dim) => txt(s, X, Y, { s: 22, w: 600, f: F.mono, c, ls: 4, a: cut(l, at), id: 'h:' + s });

// the execution order form (schematic): the signature box stays empty
function orderForm(X, Y, w, h, l, at, o = {}) {
  if (!paperCard(X, Y, w, h, l, at)) return;
  txt('EXECUTION ORDER', X + 40, Y + 70, { s: 30, w: 700, f: F.mono, c: '#55524a', ls: 3, id: 'eo' });
  txt('schematic', X + w - 30, Y + 70, { s: 15, f: F.mono, c: '#8a8678', al: 'right' });
  for (let r = 0; r < 4; r++) fill(X + 40, Y + 130 + r * 44, w - 80 - (r === 3 ? 260 : 0), 12, '#c9c4b6');
  txt('Minister of Justice', X + 40, Y + h - 70, { s: 26, w: 700, c: C.ink, id: 'mj' });
  const bx = X + w - 420; rect(bx, Y + h - 120, 380, 90, C.acc, 3, [10, 7]);
  if (o.label !== false) txt('NOT SIGNED', bx + 190, Y + h - 62, { s: 28, w: 700, f: F.mono, c: C.acc, al: 'center', a: cut(l, at + (o.labelAt ?? 1)), id: 'ns' });
}

// ═════════ 17 · The Verdict ═════════
const ch17 = [
  { at: 0, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    readout('1950', 120, 380, { s: 180, a: cut(l, .2) }); txt('sentenced to death', 128, 460, { s: 44, w: 700, a: cut(l, .8), id: 's50' }); txt('TOKYO DISTRICT COURT', 128, 510, { s: 20, f: F.mono, c: C.dim, ls: 3, a: cut(l, .8) });
    const k = cut(l, q[1] + .3); if (k > 0) { readout('1955', 1000, 380, { s: 180, a: k }); txt('sentence upheld', 1008, 460, { s: 44, w: 700, a: k, id: 's55' }); txt('SUPREME COURT OF JAPAN', 1008, 510, { s: 20, f: F.mono, c: C.dim, ls: 3, a: k }); }
  } },
  { at: 2, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Never carried out', 120, 180, { s: 64, w: 700, a: cut(l, 0), id: 'nco' });
    orderForm(560, 280, 1100, 560, l, q[3] - .2, { labelAt: 4.5 });
    txt('In Japan, an execution', 120, 360, { s: 30, w: 600, c: C.dim, a: cut(l, q[3]), id: 'ij' }); txt('needs the justice', 120, 402, { s: 30, w: 600, c: C.dim, a: cut(l, q[3]), id: 'ij2' }); txt('minister’s signature', 120, 444, { s: 30, w: 600, c: C.dim, a: cut(l, q[3]), id: 'ij3' });
  }, ev: (d, q) => evs([q[3] - .2, 'paper']) },
  { at: 4, draw(l, d, q) {   // retrial requests
    flashRect(l, 0, 0, 0, W, H, .06);
    head('REQUESTS FOR A RETRIAL', 120, 150, l);
    for (let i = 0; i < 6; i++) { const at = .3 + i * .55, Y = 230 + i * 110; if (!panel(120, Y, 1680, 90, l, at)) continue; txt('REQUEST FOR RETRIAL', 160, Y + 58, { s: 30, w: 600, f: F.mono, c: C.dim }); if (l > q[5] + .1 + i * .08) { txt('REJECTED', 1740, Y + 58, { s: 30, w: 700, f: F.mono, c: C.acc, al: 'right', id: 'rj' + i }); } }
    txt('filed again and again · count not shown', 1800, 900, { s: 16, f: F.mono, c: C.faint, al: 'right' });
  }, ev: (d, q) => [...Array.from({ length: 6 }, (_, i) => ({ t: .3 + i * .55, type: 'paper' })), ...Array.from({ length: 6 }, (_, i) => ({ t: q[5] + .1 + i * .08, type: 'stamp', soft: 1 }))] },
];

// ═════════ 18 · The Ministers Who Would Not Sign ═════════
const ch18 = [
  { at: 0, draw(l, d, q) {   // a year playhead from 1955 to 1987; the signature box stays empty
    flashRect(l, 0, 0, 0, W, H, .06);
    const X = axis(160, 1760, 720, 1955, 1987, [[1955, '1955'], [1960, '1960'], [1965, '1965'], [1970, '1970'], [1975, '1975'], [1980, '1980'], [1985, '1985']], seg(l, 0, .6));
    const yr = lerp(1955, 1987, eio(seg(l, .5, Math.min(d, q[4]) - .5))), px = X(yr);
    hair(px, 420, px, 730, C.acc, 2); readout(String(Math.floor(yr)), px, 400, { s: 40, c: C.acc, al: 'center', id: false });
    rect(160, 520, 1600, 90, C.acc, 2, [10, 7]); txt('MINISTER OF JUSTICE · SIGNATURE', 190, 575, { s: 24, w: 600, f: F.mono, c: C.dim, ls: 2, a: cut(l, .4), id: 'sig' });
    if (l > q[1]) txt('none of them signed', 1730, 575, { s: 28, w: 700, c: C.acc, al: 'right', id: 'none' });
    txt('cabinet after cabinet · each new minister handed the file', 160, 200, { s: 34, w: 700, a: cut(l, .4), id: 'cab' });
    [['a retracted confession', q[3] + .4], ['doubts about the poison', q[3] + 3.0], ['doubts about the identification', q[3] + 5.6]].forEach(([s, at], i) => { txt(s, 160 + i * 560, 300, { s: 30, w: 700, f: F.sans, c: C.text, a: cut(l, at), id: 'dbt' + i }); flashRect(l, at, 150 + i * 560, 266, 520, 46, .08); });
  }, ev: (d, q) => Array.from({ length: 32 }, (_, i) => ({ t: .5 + i * (Math.min(d, q[4]) - 1) / 32, type: 'tick' })) },
  { at: 4, draw(l, d, q) {   // limbo
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('A strange limbo', 120, 200, { s: 72, w: 700, a: cut(l, 0), id: 'lim' });
    [['FREED', 120], ['EXECUTED', 760]].forEach(([s, X], i) => { const at = q[5] + .3 + i * .8; if (!panel(X, 300, 560, 220, l, at, { dash: [8, 6], border: C.acc, bw: 2 })) return; txt(s, X + 280, 440, { s: 56, w: 700, f: F.mono, al: 'center', a: cut(l, at), id: 'lb' + i }); strike(X + 280 - tw(s, { s: 56, w: 700, f: F.mono }) / 2, 422, tw(s, { s: 56, w: 700, f: F.mono }), seg(l, at + .3, at + .7), C.acc, 5); });
    const k = cut(l, q[6] + .3); if (k > 0) { txt('little or no warning of an execution', 120, 660, { s: 40, w: 700, a: k, id: 'lw' }); txt('not for months, but for decades', 120, 740, { s: 40, w: 700, c: C.acc, a: cut(l, q[6] + 5), id: 'dec' }); }
  }, ev: (d, q) => evs([q[5] + .6, 'scratch'], [q[5] + 1.4, 'scratch']) },
];

// ═════════ 19 · The Retrial Campaigns ═════════
const ch19 = [
  { at: 0, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Outside the prison', 120, 170, { s: 56, w: 700, a: cut(l, 0), id: 'op' });
    const X = axis(160, 1760, 560, 1955, 1990, [[1955, '1955'], [1960, '1960'], [1965, '1965'], [1970, '1970'], [1975, '1975'], [1980, '1980'], [1985, '1985'], [1990, '1990']], seg(l, .2, .8));
    const P = [[1962, 'An association to win his release', 'early 1960s · Tetsurō Morikawa', q[1] + 1.0, 300, 'left'], [1960.5, 'Seichō Matsumoto', 'crime novelist · wrote about a cover-up', q[2] + .5, 760, 'left'], [1964, 'A feature film', '1964 · director Kei Kumai', q[2] + 6.5, 430, 'left'], [1985, 'Flowering of the Bamboo', '1985 · William Triplett', q[3] + .5, 300, 'right']];
    P.forEach(([v, s, sub, at, up, al0], i) => { const k = cut(l, at); if (k <= 0) return; const px = X(v), below = up > 560; pin(px, 560, i === 3 ? C.acc : C.text); alpha(k, () => hair(px, 560 + (below ? 10 : -10), px, up + (below ? -40 : 24), C.dim, 1, [3, 4]));
      const al = al0, ox = al === 'left' ? 12 : -12; txt(s, px + ox, up, { s: 30, w: 700, al, a: k, f: i === 3 ? F.it : F.sans, it: i === 3, id: 'cp' + i }); txt(sub, px + ox, up + 34, { s: 18, f: F.mono, c: C.dim, al, a: k, id: 'cps' + i }); });
  } },
  { at: 4, draw(l, d, q) {
    cover(IM('hirasawa_c1920'), 60, 60, 560, 840, { k: seg(l, 0, d), z: 1.05, flash: 1 - seg(l, 0, .1) }); tag('photo · Ishii Hakutei · c. 1920', 84, 100, { s: 14 });
    txt('He kept painting in his cell', 700, 300, { s: 48, w: 700, a: cut(l, .5), id: 'kp' }); txt('his supporters exhibited the work outside', 700, 360, { s: 30, w: 600, c: C.dim, a: cut(l, 2.5), id: 'kp2' });
    ['PRESENT', 'WORKING', 'WAITING'].forEach((s, i) => { const at = q[5] + 2.0 + i * .9; txt(s, 700, 540 + i * 110, { s: 80, w: 700, f: F.mono, a: cut(l, at), id: 'pw' + i }); });
  }, ev: () => evs([0, 'shutter']) },
];

// ═════════ 20 · Thirty-Nine Years ═════════
const ch20 = [
  { at: 0, draw(l, d) {
    flashRect(l, 0, 0, 0, W, H, .06);
    const u = eio(seg(l, .4, Math.min(d, 7.5)));
    readout(String(Math.round(39 * u)), 120, 500, { s: 260, id: false }); txt('YEARS IN PRISON', 130, 570, { s: 24, f: F.mono, w: 600, c: C.dim, ls: 4, id: 'yip' });
    readout(String(Math.round(32 * u)), 1000, 500, { s: 260, c: C.acc, id: false }); txt('ON DEATH ROW', 1010, 570, { s: 24, f: F.mono, w: 600, c: C.dim, ls: 4, id: 'odr' });
    if (u >= 1) { txt('almost 39', 130, 640, { s: 30, w: 700, id: 'a39' }); txt('more than 32', 1010, 640, { s: 30, w: 700, id: 'm32' }); }
  }, ev: (d) => Array.from({ length: 39 }, (_, i) => ({ t: .4 + i * (Math.min(d, 7.5) - .4) / 39, type: 'tick' })) },
  { at: 2, draw(l, d) {   // near-silence
    cover(IM('hirasawa_1951'), 60, 60, 600, 840, { k: seg(l, 0, d), z: 1.04, flash: 1 - seg(l, 0, .1) }); tag('photo · 1951', 84, 100);
    readout('10 MAY 1987', 740, 360, { s: 96, a: cut(l, .6) });
    txt('died of pneumonia in a prison hospital', 744, 450, { s: 34, w: 700, a: cut(l, 2.4), id: 'dp' });
    txt('aged 95', 744, 510, { s: 34, w: 700, c: C.dim, a: cut(l, 4.0), id: 'a95' });
    txt('still insisting he was innocent', 744, 620, { s: 40, f: F.it, it: 1, a: cut(l, 5.6), id: 'inn' });
  } },
];

// ═════════ 21 · Legacy ═════════
const ch21 = [
  { at: 0, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('A long shadow', 120, 200, { s: 64, w: 700, a: cut(l, 0), id: 'ls' });
    txt('one of the deadliest robberies in Japanese history', 124, 270, { s: 30, w: 600, c: C.dim, a: cut(l, q[1] + 1.5), id: 'dr' });
    const kw = cut(l, q[1] + 5.0); if (kw > 0) { txt('WEAPONS', 120, 470, { s: 80, w: 700, f: F.mono, c: C.dim, a: kw, id: 'wp' }); strike(120, 444, tw('WEAPONS', { s: 80, w: 700, f: F.mono }), seg(l, q[1] + 5.6, q[1] + 6.0), C.acc, 5); }
    ['AN ARMBAND', 'A STORY', 'TRUST'].forEach((s, i) => { const at = q[1] + 6.8 + i * 1.0; txt(s, 120 + i * 560, 660, { s: 64, w: 700, f: F.mono, c: i === 2 ? C.acc : C.text, a: cut(l, at), id: 'ast' + i }); });
  }, ev: (d, q) => evs([q[1] + 5.6, 'scratch'], [q[1] + 6.8, 'mallet'], [q[1] + 7.8, 'mallet'], [q[1] + 8.8, 'mallet']) },
  { at: 2, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('A case about justice itself', 120, 190, { s: 56, w: 700, a: cut(l, 0), id: 'cj' });
    if (panel(120, 270, 1680, 260, l, q[3] + .2)) { readout('1980s', 160, 400, { s: 80, a: cut(l, q[3] + .2) }); txt('death-row prisoners exonerated at retrial', 520, 380, { s: 34, w: 700, a: cut(l, q[3] + 1.0), id: 'ex1' }); txt('after decades behind bars · confessions that could not be trusted', 520, 440, { s: 24, w: 600, c: C.dim, a: cut(l, q[3] + 6.0), id: 'ex2' }); }
    row(120, 640, 1680, 'long interrogations', true, l, q[4] + 5.5, { i: 0, s: 36 }); row(120, 760, 1680, 'the weight given to confessions', true, l, q[4] + 7.5, { i: 1, s: 36 });
    txt('the debate continues', 1780, 880, { s: 22, f: F.mono, c: C.dim, al: 'right', a: cut(l, q[4] + 9.0), id: 'deb' });
  } },
  { at: 5, draw(l, d) {   // the twelve
    flashRect(l, 0, 0, 0, W, H, .06);
    for (let i = 0; i < 16; i++) { const X = 230 + (i % 8) * 130, Y = 300 + Math.floor(i / 8) * 130; dot(X, Y, 36, i < 12, seg(l, .6 + i * .18, .85 + i * .18)); }
    txt('12', 1400, 440, { s: 220, w: 700, a: cut(l, 2.8), id: 'tw' });
    txt('clerks and a caretaker’s family', 230, 640, { s: 40, w: 700, a: cut(l, 4.0), id: 'ccf' }); txt('Shiinamachi · 26 January 1948', 230, 700, { s: 26, f: F.mono, c: C.dim, a: cut(l, 4.0), id: 'sh48' });
  } },
];

// ═════════ 22 · The Questions Remain ═════════
const ch22 = [
  { at: 0, draw(l, d) {
    cover(IM('hirasawa_1951'), 60, 60, 600, 840, { k: seg(l, 0, d), z: 1.04, flash: 1 - seg(l, 0, .1) }); tag('photo · 1951', 84, 100);
    txt('His adopted son continued', 740, 380, { s: 48, w: 700, a: cut(l, .5), id: 'son' }); txt('the fight to clear his name', 740, 440, { s: 48, w: 700, a: cut(l, .5), id: 'son2' });
    txt('supporters still press for a retrial', 744, 540, { s: 32, w: 600, c: C.dim, a: cut(l, 4.0), id: 'son3' });
  }, ev: () => evs([0, 'shutter']) },
  { at: 1, draw(l, d, q) {   // the board, left on screen
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('KNOWN', 120, 140, { s: 34, w: 700, a: cut(l, 0), id: 'kn2' }); hair(120, 160, 900, 160, C.text, 1.5);
    txt('UNRESOLVED', 980, 140, { s: 34, w: 700, c: C.acc, a: cut(l, .3), id: 'un2' }); hair(980, 160, 1860, 160, C.acc, 1.5);
    [['16 drank · 12 died · 4 survived', .2], ['≈ ¥164,000 and a cheque taken', .5], ['Hirasawa: convicted, never executed', .8], ['died 10 May 1987, aged 95', 1.1], ['officially, the case is closed', 1.6]].forEach(([s, at], i) => row(120, 240 + i * 120, 780, s, true, l, at, { i, s: 26 }));
    [['Who was the man at the bank door?', q[3] + .4], ['Where did he learn to handle the poison?', q[3] + 4.4], ['Why did the investigation turn away?', q[3] + 7.6]].forEach(([s, at], i) => row(980, 240 + i * 160, 880, s, false, l, at, { i, s: 28 }));
  }, ev: (d, q) => evs([q[3] + .4, 'chord'], [q[3] + 4.4, 'chord'], [q[3] + 7.6, 'chord']) },
];

export const ACT4 = { 17: ch17, 18: ch18, 19: ch19, 20: ch20, 21: ch21, 22: ch22 };
