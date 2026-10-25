// Act II · dates (chapters 7–11)
import { W, H, C, F, S, clamp, seg, eo, eio, lerp, txt, tw, hair, rect, fill, alpha, ring, cover, crop, tag, badge, flashRect, cut, panel, lowerThird, readout, strike, highlight, tick, dashBox, dot, paperCard, claim, row, axis, pin } from './core.js';
import { view, coast, route, HONSHU, HOKKAIDO, KYUSHU, SHIKOKU, SAKHALIN, MAINLAND } from './geo.js';
const IM = k => S.IM[k];
const evs = (...a) => a.map(([t, type, o]) => ({ t, type, ...(o || {}) }));
const head = (s, X, Y, l, at = 0, id) => txt(s, X, Y, { s: 22, w: 600, f: F.mono, c: C.dim, ls: 4, a: cut(l, at), id: id || 'h:' + s });

// a schematic portrait icon (head and shoulders) for the photo array
function face(X, Y, s, c = C.faint) { const x = S.x; x.save(); x.strokeStyle = c; x.lineWidth = 2; x.beginPath(); x.arc(X, Y - s * .25, s * .22, 0, 7); x.stroke(); x.beginPath(); x.moveTo(X - s * .4, Y + s * .4); x.quadraticCurveTo(X, Y - s * .05, X + s * .4, Y + s * .4); x.stroke(); x.restore(); }

// ═════════ 7 · The Survivors and the Sketch ═════════
const ch7 = [
  { at: 0, draw(l) {
    flashRect(l, 0, 0, 0, W, H, .06);
    for (let i = 0; i < 16; i++) { const X = 150 + (i % 8) * 100, Y = 260 + Math.floor(i / 8) * 100; if (i < 12) alpha(.35, () => dot(X, Y, 30, true, 1)); else { dot(X, Y, 30, false, 0); if (l > .6) { const x = S.x; x.save(); x.strokeStyle = C.acc; x.lineWidth = 2.5; x.beginPath(); x.arc(X, Y, 44, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * eo(seg(l, .6 + (i - 12) * .2, 1.0 + (i - 12) * .2))); x.stroke(); x.restore(); } } }
    txt('4', 1180, 520, { s: 260, w: 700, a: cut(l, .2), id: 'w4' }); txt('WITNESSES', 1190, 580, { s: 22, f: F.mono, w: 600, c: C.dim, ls: 4, a: cut(l, .2) });
    ['at close range', 'in daylight', 'for several minutes'].forEach((s, i) => txt(s, 150, 600 + i * 56, { s: 36, w: 700, c: i ? C.dim : C.text, a: cut(l, 1.5 + i * .8), id: 'cr' + i }));
  } },
  { at: 1, draw(l) {
    if (!panel(60, 60, 1800, 840, l, 0)) return;
    head('THE MAN THEY DESCRIBED', 110, 150, l); tag('survivor accounts · approximate', 1500, 150, { s: 15 });
    [['≈ in his forties or fifties', .5], ['composed, authoritative', 2.5], ['spoke politely', 5.0], ['handled his bottles with ease', 7.0]].forEach(([s, at], i) => row(110, 290 + i * 150, 1700, s, true, l, at, { i, s: 44 }));
  }, ev: () => evs([.5, 'mallet'], [2.5, 'mallet'], [5, 'mallet'], [7, 'mallet']) },
  { at: 2, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('A composite image', 120, 260, { s: 88, w: 700, a: cut(l, 0), id: 'comp' }); txt('drawn by the police from the survivors’ accounts', 124, 320, { s: 28, w: 600, c: C.dim, a: cut(l, .4), id: 'comp2' });
    [['PRINTED IN NEWSPAPERS', q[3] + .3], ['POSTED ACROSS THE COUNTRY', q[3] + 2.2], ['ONE OF THE MOST RECOGNISABLE FACES OF POST-WAR JAPAN', q[3] + 5.0]].forEach(([s, at], i) => { txt(s, 124, 470 + i * 70, { s: 30, w: 600, f: F.mono, a: cut(l, at), id: 'pr' + i }); flashRect(l, at, 120, 440 + i * 70, 1200, 44, .08); });
    const k = cut(l, q[4]); if (k > 0) { txt('Thousands', 124, 820, { s: 96, w: 700, a: k, id: 'th' }); txt('of tips', 124 + tw('Thousands', { s: 96, w: 700 }) + 30, 820, { s: 56, w: 700, c: C.dim, a: k }); }
  } },
  { at: 5, draw(l, d, q) {   // memory under shock: four columns that do not agree
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Memory under shock', 120, 160, { s: 56, w: 700, a: cut(l, 0), id: 'mem' });
    const marks = [['≈', '?', '≈', '≈'], ['?', '≈', '?', '≈'], ['≈', '≈', '?', '?'], ['?', '≈', '≈', '?']];
    for (let c = 0; c < 4; c++) { const X = 120 + c * 440, at = q[6] + .4 + c * .6; if (!panel(X, 230, 400, 520, l, at)) continue; txt(`SURVIVOR ${c + 1}`, X + 24, 280, { s: 18, f: F.mono, w: 600, c: C.dim, ls: 3 });
      marks[c].forEach((m, r) => txt(m, X + 200, 390 + r * 100, { s: 64, w: 700, f: F.mono, c: m === '?' ? C.acc : C.text, al: 'center', a: cut(l, at + .1 + r * .1) })); }
    txt('their recollections did not always agree · schematic', 120, 820, { s: 24, w: 600, c: C.dim, a: cut(l, q[6] + 3.5), id: 'mem2' });
  } },
  { at: 7, draw(l) {   // photograph after photograph
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Photograph after photograph', 120, 160, { s: 56, w: 700, a: cut(l, 0), id: 'ph' });
    for (let i = 0; i < 30; i++) { const at = .3 + i * .22; if (l < at) break; const X = 140 + (i % 10) * 168, Y = 260 + Math.floor(i / 10) * 200; panel(X, Y, 140, 170, l, at); face(X + 70, Y + 90, 110); txt('?', X + 120, Y + 36, { s: 26, w: 700, c: C.acc, al: 'center', a: cut(l, at + .1) }); }
    txt('schematic', 1840, 880, { s: 15, f: F.mono, c: C.faint, al: 'right' });
  }, ev: () => Array.from({ length: 30 }, (_, i) => ({ t: .3 + i * .22, type: 'flip' })) },
];

// ═════════ 8 · The Earlier Attempts ═════════
const ch8 = [
  { at: 0, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Not the first attempt', 120, 170, { s: 64, w: 700, a: cut(l, 0), id: 'nf' });
    const v = m => m;   // months since Oct 1947
    const X = axis(180, 1740, 640, 0, 4.5, [[0, 'OCT 1947'], [1, 'NOV'], [2, 'DEC'], [3, 'JAN 1948'], [4, 'FEB']], seg(l, .2, .9));
    const P = [[0.45, 'YASUDA BANK', 'OCTOBER 1947', q[1] + 1.2, C.text], [3.6, 'MITSUBISHI BANK', '19 JAN 1948', q[1] + 9.5, C.text], [3.83, 'TEIKOKU BANK', '26 JAN 1948', .9, C.acc]];
    P.forEach(([m, name, date, at, c], i) => { const k = cut(l, at); if (k <= 0) return; const px = X(m); pin(px, 640, c); const up = i === 1 ? 470 : 330, al = i === 0 ? 'left' : i === 1 ? 'right' : 'left', ox = i === 1 ? -14 : 14;
      alpha(k, () => hair(px, 630, px, up + 20, c === C.acc ? C.acc : C.dim, 1, [3, 4])); txt(name, px + ox, up, { s: 36, w: 700, al, a: k, c: i === 2 ? C.acc : C.text, id: 'bk' + i }); txt(date, px + ox, up + 36, { s: 20, f: F.mono, c: C.dim, al, a: k, id: 'bd' + i }); flashRect(l, at, px - 6, up - 40, 12, 80, .08); });
    if (cut(l, q[1] + 1.4) > 0) txt('the same story', X(.45) + 14, 820, { s: 26, w: 600, c: C.dim, id: 'same' });
    const kh = cut(l, q[2] + .3); if (kh > 0) { txt('harmless liquid · nobody hurt', X(0.45) + 14, 760, { s: 30, w: 700, a: kh, id: 'harm1' }); txt('nobody hurt', X(3.6) - 14, 760, { s: 30, w: 700, al: 'right', a: kh, id: 'harm2' }); }
  }, ev: (d, q) => evs([.9, 'pin'], [q[1] + 1.2, 'pin'], [q[1] + 9.5, 'pin']) },
  { at: 3, draw(l, d, q) {
    const mp = cover(IM('matsui'), 60, 60, 760, 840, { k: seg(l, 0, d), z: 1.05, fy: .2, flash: 1 - seg(l, 0, .1) });
    tag('photo · Asahi Graph · 29 Jan 1948', 84, 100);
    const [cx, cy] = mp(285, 150); ring(cx, cy, 70, seg(l, q[4] + .3, q[4] + .8), 'Dr. Shigeru Matsui', 1, 'A REAL DOCTOR', 'r:mat');
    if (panel(860, 60, 1000, 380, l, .4)) { head('CARDS LEFT AT THE EARLIER BANKS', 900, 130, l, .4); txt('one bore a real name', 900, 260, { s: 52, w: 700, a: cut(l, q[4]), id: 'real' }); badge(1810, 245, l, q[4] + .3); }
    if (panel(860, 480, 1000, 420, l, q[5])) { txt('Nothing to do with the crime', 900, 580, { s: 36, w: 700, c: C.dim, a: cut(l, q[5] + .2), id: 'mat1' }); txt('He kept a record of', 900, 680, { s: 44, w: 700, a: cut(l, q[5] + 3), id: 'mat2' }); txt('every card he exchanged', 900, 740, { s: 44, w: 700, a: cut(l, q[5] + 3), id: 'mat3' }); }
  }, ev: (d, q) => evs([0, 'shutter'], [q[4] + .3, 'pencil']) },
  { at: 6, draw(l) { ledger(l, 0); } },
];
// the card record: names withheld (schematic)
function ledger(l, at, o = {}) {
  if (!paperCard(260, 70, 1400, 820, l, at)) return;
  txt('RECORD OF CARDS EXCHANGED', 300, 130, { s: 24, w: 700, f: F.mono, c: '#55524a', ls: 3, id: 'ledh' }); txt('schematic · names not shown', 1620, 130, { s: 15, f: F.mono, c: '#8a8678', al: 'right' });
  hair(300, 150, 1620, 150, '#bdb8aa');
  for (let r = 0; r < 14; r++) { const Y = 200 + r * 48; txt(String(r + 1).padStart(3, '0'), 300, Y, { s: 22, f: F.mono, c: '#55524a' }); fill(380, Y - 14, 520 + ((r * 97) % 260), 12, '#bab5a7'); fill(1000, Y - 14, 200 + ((r * 53) % 120), 12, '#c9c4b6');
    const st = o.status ? o.status(r) : null;
    if (st === 'shown') { const x = S.x; x.save(); x.strokeStyle = C.acc; x.lineWidth = 3; x.beginPath(); x.moveTo(1500, Y - 8); x.lineTo(1508, Y + 1); x.lineTo(1522, Y - 18); x.stroke(); x.restore(); txt('card shown', 1535, Y, { s: 18, f: F.mono, c: C.ink }); }
    else if (st === 'other') txt('cleared otherwise', 1500, Y, { s: 18, f: F.mono, c: '#6d695e' });
    else if (st === 'open') rect(1500, Y - 18, 22, 22, C.acc, 2, [4, 3]); }
}

// ═════════ 9 · The Card Trail ═════════
const NOTSHOWN = 11;   // the row that will stay open (illustrative position)
const ch9 = [
  { at: 0, draw(l, d, q) {   // the logic of the search
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Business cards carried real social weight', 120, 170, { s: 44, w: 700, a: cut(l, 0), id: 'bc' });
    const B = [['A GENUINE MATSUI CARD', q[2] + .2], ['RECEIVED FROM MATSUI HIMSELF', q[2] + 1.8], ['A NAME ON HIS RECORD', q[2] + 3.4]];
    B.forEach(([s, at], i) => { const X = 120 + i * 600; if (!panel(X, 380, 540, 200, l, at)) return; txt(s, X + 30, 492, { s: 28, w: 700, f: F.mono, a: cut(l, at), id: 'lg' + i }); if (i) { const k = eo(seg(l, at - .3, at)); hair(X - 50, 480, X - 50 + 40 * k, 480, C.acc, 3); } });
    const k = cut(l, q[1] + .2); if (k > 0) { txt('an impossible search → a finite one', 120, 740, { s: 40, w: 700, a: k, id: 'fin' }); }
  } },
  { at: 3, draw(l, d, q) {   // can you show us the card?
    ledger(l, 0, { status: r => l > q[4] + .2 + r * .12 && r !== NOTSHOWN && r % 5 !== 3 ? 'shown' : l > q[5] + .4 && r % 5 === 3 && r !== NOTSHOWN ? 'other' : l > q[5] + 1.5 && r === NOTSHOWN ? 'open' : null });
    if (l < q[4]) claim(300, 760, 1320, 120, [], null, l, 0, { head: '' }), txt('“Can you show us the card you were given?”', 330, 840, { s: 40, f: F.it, it: 1, id: 'q?' });
  }, ev: (d, q) => Array.from({ length: 14 }, (_, r) => ({ t: q[4] + .2 + r * .12, type: 'mallet' })).filter((_, r) => r !== NOTSHOWN && r % 5 !== 3) },
  { at: 6, draw(l, d, q) {   // the trail north (schematic map)
    flashRect(l, 0, 0, 0, W, H, .06);
    const R = [700, 60, 1160, 840]; fill(...R, C.panel); rect(...R);
    const P = view(31.0, 45.6, 139.0, R[0], R[1], R[0] + R[2], R[1] + R[3]);
    coast(P, R, seg(l, 0, .8), [HONSHU, HOKKAIDO, KYUSHU, SHIKOKU, SAKHALIN, MAINLAND]);
    const T = [[139.7, 35.7], [140.0, 36.6], [140.9, 38.3], [141.15, 39.7], [140.75, 40.82], [140.72, 41.77], [141.35, 43.06], [141.0, 43.19]];
    const tip = route(P, T, seg(l, 1.0, q[8] + 1.5));
    const [tx, ty] = P([139.7, 35.7]); pin(tx, ty, C.text); txt('Tokyo', tx + 18, ty + 8, { s: 24, w: 700, id: 'tk' });
    if (l > q[8] + 1.5) { const [ox, oy] = P([141.0, 43.19]); ring(ox, oy, 26, seg(l, q[8] + 1.5, q[8] + 2), 'Otaru', -1, 'HOKKAIDO', 'r:ot'); }
    else if (tip) { const x = S.x; x.fillStyle = C.acc; x.beginPath(); x.arc(tip[0], tip[1], 7, 0, 7); x.fill(); }
    tag('map · schematic', 724, 100);
    readout('SPRING → SUMMER 1948', 120, 230, { s: 34, c: C.dim, a: cut(l, .2) });
    txt('Slow, crowded trains', 120, 330, { s: 48, w: 700, a: cut(l, 1.0), id: 'tr' }); txt('names crossed off one at a time', 120, 390, { s: 30, w: 600, c: C.dim, a: cut(l, 3.0), id: 'tr2' });
    const k = cut(l, q[7] + .2); if (k > 0) { txt('patient police work', 120, 560, { s: 40, w: 700, a: k, id: 'pp' }); txt('not theories about', 120, 620, { s: 30, w: 600, c: C.dim, a: k, id: 'pp2' }); txt('secret wartime programmes', 120, 664, { s: 30, w: 600, c: C.dim, a: k, id: 'pp3' }); }
  } },
];

// ═════════ 10 · The Painter ═════════
const ch10 = [
  { at: 0, draw(l, d, q) {
    cover(IM('hirasawa_c1920'), 60, 60, 560, 840, { k: seg(l, 0, d), z: 1.05, flash: 1 - seg(l, 0, .1) }); tag('photo · Ishii Hakutei · c. 1920', 84, 100, { s: 14 });
    lowerThird('Sadamichi Hirasawa', 'BORN 1892 · GREW UP PARTLY IN OTARU', 700, 300, l, .5);
    const k = cut(l, q[1]); if (k > 0) { panel(700, 470, 1160, 430, l, q[1]); head('A RESPECTED PAINTER', 740, 540, l, q[1]); txt('Tempera', 740, 650, { s: 64, w: 700, a: k, id: 'tem' }); txt('pigment bound with egg', 740, 710, { s: 30, w: 600, c: C.dim, a: cut(l, q[1] + 4.5), id: 'tem2' });
      txt('landscapes · flower studies · official exhibitions', 740, 800, { s: 26, w: 600, a: cut(l, q[2]), id: 'exh' }); txt('1940s: his name regularly in catalogues and newspapers', 740, 850, { s: 22, f: F.mono, c: C.dim, a: cut(l, q[2] + 5), id: 'exh2' }); }
  } },
  { at: 3, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('His private life', 120, 170, { s: 56, w: 700, a: cut(l, 0), id: 'pl' });
    readout('1925', 120, 380, { s: 120, a: cut(l, q[4]) });
    claim(560, 250, 1300, 260, ['a course of rabies vaccinations;', 'afterwards, his personality changed'], 'his family, later', l, q[4] + .3, { head: 'FAMILY ACCOUNT', s: 40, lh: 56 });
    row(120, 640, 1740, 'money problems', true, l, q[5] + .2, { i: 0, s: 40 }); row(120, 760, 1740, 'a record of minor fraud', true, l, q[5] + 1.6, { i: 1, s: 40 });
  } },
  { at: 6, draw(l, d, q) {   // the card exchange, and the card that was not produced
    flashRect(l, 0, 0, 0, W, H, .06);
    readout('1947', 120, 200, { s: 100, a: cut(l, 0) }); txt('on a ferry · according to the record', 124, 250, { s: 22, f: F.mono, c: C.dim, a: cut(l, .4) });
    const u = eo(seg(l, .8, 2.4)), Y = 480;
    if (paperCard(lerp(100, 520, u), Y, 420, 240, l, .5)) { txt('MATSUI', lerp(100, 520, u) + 30, Y + 70, { s: 24, f: F.mono, w: 600, c: '#55524a' }); txt('Dr. Shigeru Matsui', lerp(100, 520, u) + 30, Y + 150, { s: 34, w: 700, c: C.ink }); }
    if (paperCard(lerp(1400, 980, u), Y, 420, 240, l, .5)) { txt('HIRASAWA', lerp(1400, 980, u) + 30, Y + 70, { s: 24, f: F.mono, w: 600, c: '#55524a' }); txt('Sadamichi Hirasawa', lerp(1400, 980, u) + 30, Y + 150, { s: 34, w: 700, c: C.ink }); }
    if (u >= 1) { hair(560, 760, 1360, 760, C.dim, 1.5); txt('cards exchanged', 960, 800, { s: 22, f: F.mono, c: C.dim, al: 'center' }); }
    const k = cut(l, q[7]); if (k > 0) { fill(510, Y - 10, 440, 260, C.bg); rect(520, Y, 420, 240, C.acc, 2.5, [8, 6]); txt('Matsui’s card', 550, Y + 110, { s: 34, w: 700, c: C.acc, a: k, id: 'nc' }); txt('COULD NOT SHOW IT', 550, Y + 160, { s: 22, w: 600, f: F.mono, c: C.acc, ls: 3, a: k, id: 'nc2' }); }
    const k2 = cut(l, q[8] - .2); if (k2 > 0) { txt('his answer: wallet stolen', 120, 860, { s: 32, w: 600, a: k2, id: 'wal' }); }
  }, ev: (d, q) => evs([.8, 'paper'], [q[7], 'pencil']) },
];

// ═════════ 11 · The Suspect ═════════
const ch11 = [
  { at: 0, draw(l, d) {
    cover(IM('hirasawa_1951'), 60, 60, 600, 840, { k: seg(l, 0, d), z: 1.05, flash: 1 - seg(l, 0, .1) }); tag('photo · 1951', 84, 100);
    lowerThird('Sadamichi Hirasawa', 'PAINTER · 56 YEARS OLD IN 1948', 740, 360, l, .5);
    txt('one name on the list', 740, 580, { s: 48, w: 700, a: cut(l, 1.2), id: 'one' }); txt('well known in the art world', 740, 640, { s: 30, w: 600, c: C.dim, a: cut(l, 3.5), id: 'one2' });
  }, ev: () => evs([0, 'shutter']) },
  { at: 1, draw(l, d) {
    const mp = cover(IM('interrogation'), 60, 60, 1180, 840, { k: seg(l, 0, d), z: 1.05, fx: .35, flash: 1 - seg(l, 0, .1) }); tag('photo · Asahi Graph · Aug 1948', 84, 100);
    const [cx, cy] = mp(560, 520); ring(cx, cy, 120, seg(l, .8, 1.3), 'Hirasawa', 1, 'UNDER QUESTIONING · LEFT', 'r:int');
    lowerThird('Arrested · Otaru, Hokkaido', 'AUGUST 1948 · AT HIS HOME', 1290, 380, l, .5);
  }, ev: () => evs([0, 'shutter'], [.8, 'pencil']) },
  { at: 2, draw(l, d, q) {   // strong on paper
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Strong on paper', 120, 170, { s: 56, w: 700, a: cut(l, 0), id: 'sop' });
    txt('AGAINST HIM', 120, 290, { s: 30, w: 700, a: cut(l, .3), id: 'ag' }); hair(120, 310, 960, 310, C.text, 1.5);
    txt('MISSING', 1020, 290, { s: 30, w: 700, c: C.acc, a: cut(l, q[6] - .2), id: 'ms' }); if (l > q[6] - .2) hair(1020, 310, 1860, 310, C.acc, 1.5);
    row(120, 390, 840, 'could not show Matsui’s card', true, l, q[3] + .2, { i: 0, s: 30 }); row(120, 500, 840, 'money he could not explain', true, l, q[4] + .2, { i: 1, s: 30 }); row(120, 610, 840, 'a record of fraud', true, l, q[5] + .2, { i: 0, s: 30 });
    row(1020, 390, 840, 'firm identification by survivors', false, l, q[6] + .6, { i: 0, s: 30 }); row(1020, 500, 840, 'physical evidence: the poison', false, l, q[6] + 3.8, { i: 1, s: 30 });
  } },
];

export const ACT2 = { 7: ch7, 8: ch8, 9: ch9, 10: ch10, 11: ch11 };
