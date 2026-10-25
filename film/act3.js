// Act III · months and years (chapters 12–16)
import { W, H, C, F, S, clamp, seg, eo, eio, lerp, txt, tw, hair, rect, fill, alpha, ring, cover, crop, tag, badge, flashRect, cut, panel, lowerThird, readout, strike, highlight, tick, dashBox, dot, paperCard, claim, row, axis, pin, para } from './core.js';
import { view, coast, route } from './geo.js';
const IM = k => S.IM[k];
const evs = (...a) => a.map(([t, type, o]) => ({ t, type, ...(o || {}) }));
const head = (s, X, Y, l, at = 0, c = C.dim) => txt(s, X, Y, { s: 22, w: 600, f: F.mono, c, ls: 4, a: cut(l, at), id: 'h:' + s });
const theory = (X, Y, l, at = 0) => { const k = cut(l, at); if (k <= 0) return; const w = tw('THEORY · NOT PROVEN', { s: 20, w: 600, f: F.mono, ls: 3 }); alpha(k, () => rect(X - 14, Y - 30, w + 28, 44, C.acc, 2, [6, 4])); txt('THEORY · NOT PROVEN', X, Y, { s: 20, w: 600, f: F.mono, c: C.acc, ls: 3, a: k, id: 'theory' }); };

// ═════════ 12 · Inside the Interrogation Room ═════════
const ART38 = ['No person shall be compelled to testify against himself.',
  'Confession made under compulsion, torture or threat, or after prolonged',
  'arrest or detention shall not be admitted in evidence.',
  'No person shall be convicted or punished in cases where the only proof',
  'against him is his own confession.'];
const ch12 = [
  { at: 0, draw(l) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('The law, in 1948', 120, 400, { s: 96, w: 700, a: cut(l, 0), id: 'law' }); readout('1947 · 1948 · 1949', 124, 480, { s: 40, c: C.dim, a: cut(l, .4) });
  } },
  { at: 1, draw(l, d, q) {   // the constitution: the lines highlighted as they are spoken
    if (paperCard(60, 60, 1300, 600, l, 0)) {
      txt('CONSTITUTION OF JAPAN · ARTICLE 38', 100, 130, { s: 24, w: 700, f: F.mono, c: '#55524a', ls: 2, id: 'a38h' });
      ART38.forEach((s, i) => { const Y = 240 + i * 74 + (i > 2 ? 20 : 0) + (i > 0 ? 20 : 0); txt(s, 100, Y, { s: 32, f: F.it, it: 1, c: C.ink, id: 'a38' + i });
        const hk = i === 1 || i === 2 ? seg(l, 3.0 + (i - 1) * 1.6, 4.6 + (i - 1) * 1.6) : i >= 3 ? seg(l, 7.6 + (i - 3) * 1.8, 9.4 + (i - 3) * 1.8) : 0;
        highlight(98, Y - 30, tw(s, { s: 32, f: F.it, it: 1 }) + 4, 40, hk); });
      txt('transcription · official English text', 1320, 630, { s: 16, f: F.mono, c: '#8a8678', al: 'right' });
    }
    if (panel(1400, 60, 460, 600, l, .6)) { head('IN FORCE', 1440, 130, l, .6); readout('3 MAY', 1440, 300, { s: 88, a: cut(l, .6) }); readout('1947', 1440, 400, { s: 88, a: cut(l, .6) }); }
  }, ev: () => evs([0, 'paper'], [3, 'pencil'], [7.6, 'pencil']) },
  { at: 2, draw(l, d) {   // the gap between the constitution and the new code
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('Which rules governed the case?', 120, 170, { s: 52, w: 700, a: cut(l, 0), id: 'rules' });
    const X = axis(180, 1740, 560, 0, 36, [[0, 'JAN 1947'], [12, 'JAN 1948'], [24, 'JAN 1949'], [36, 'JAN 1950']], seg(l, .1, .7));
    [[4, 'Constitution in force', 'MAY 1947', .8, C.text, 380], [19, 'Hirasawa arrested', 'AUG 1948', 2.5, C.acc, 300], [24, 'New Code of Criminal Procedure', 'JAN 1949', 4.0, C.text, 380]].forEach(([m, s, dte, at, c, up], i) => {
      const k = cut(l, at); if (k <= 0) return; const px = X(m); pin(px, 560, c); alpha(k, () => hair(px, 550, px, up + 26, C.dim, 1, [3, 4]));
      const al = i === 2 ? 'left' : i === 0 ? 'left' : 'right'; txt(s, px + (al === 'left' ? 14 : -14), up, { s: 30, w: 700, al, c: i === 1 ? C.acc : C.text, a: k, id: 'ax' + i }); txt(dte, px + (al === 'left' ? 14 : -14), up + 32, { s: 18, f: F.mono, c: C.dim, al, a: k }); });
    const kb = seg(l, 6.5, 7.3); if (kb > 0) { const a = X(17), b = X(24); hair(a, 640, lerp(a, b, eo(kb)), 640, C.acc, 3); hair(a, 630, a, 650, C.acc, 3); if (kb >= 1) hair(b, 630, b, 650, C.acc, 3);
      txt('handled under the older system', (a + b) / 2, 690, { s: 28, w: 700, al: 'center', a: cut(l, 7.3), id: 'old' }) }
    const kc = cut(l, 10.5); if (kc > 0) { panel(120, 770, 1680, 110, l, 10.5); txt('a confession: the strongest evidence of all', 160, 842, { s: 40, w: 700, a: kc, id: 'strong' }); }
  } },
  { at: 3, draw(l, d) {
    const mp = cover(IM('interrogation'), 60, 60, 1180, 840, { k: seg(l, 0, d), z: 1.05, fx: .35, flash: 1 - seg(l, 0, .1) }); tag('photo · Asahi Graph · Aug 1948', 84, 100);
    ['held for long periods in police cells', 'questioned for hours at a stretch', 'little access to a lawyer', 'no recording of what was said'].forEach((s, i) => { const at = .6 + i * 1.6; txt(s.toUpperCase(), 1290, 300 + i * 120, { s: 22, w: 600, f: F.mono, ls: 1, a: cut(l, at), id: 'ir' + i }); flashRect(l, at, 1280, 270 + i * 120, 580, 44, .08); });
  }, ev: () => evs([0, 'shutter']) },
];

// ═════════ 13 · The Confession ═════════
const ch13 = [
  { at: 0, draw(l, d, q) {   // days in custody
    flashRect(l, 0, 0, 0, W, H, .06);
    head('IN CUSTODY', 120, 260, l);
    const n = Math.min(35, 1 + Math.floor(seg(l, .3, q[2]) * 34));
    readout(l < q[2] ? `DAY ${n}` : '> 1 MONTH', 116, 470, { s: 180, id: l < q[2] ? false : 'month' });
    if (l > q[1]) txt('denied everything', 124, 580, { s: 44, w: 700, c: l > q[2] ? C.dim : C.text, id: 'den' });
    if (l > q[2]) txt('confessed', 124, 660, { s: 72, w: 700, c: C.acc, id: 'conf' });
  }, ev: (d, q) => Array.from({ length: 34 }, (_, i) => ({ t: .3 + i * (q[2] - .3) / 34, type: 'tick' })) },
  { at: [2, 2.6], draw(l, d, q) {   // one moment, five sources: the extra edition and the people who read it
    const kh = cut(l, 0); txt('SEP 1948 · “HIRASAWA CONFESSES” · EXTRA EDITION', 60, 100, { s: 22, w: 600, f: F.mono, c: C.acc, ls: 2, a: kh, id: 'ex' });
    cover(IM('kanda_extra'), 60, 130, 900, 770, { flash: 1 - seg(l, 0, .1) }); tag('photo · Kanda, Tokyo · Asahi Graph', 84, 170, { s: 14 });
    const R = [['takagi', 'prosecutor', .8, .3], ['horisaki', 'police chief', 1.4, .35], ['ikii', 'inspector', 2.0, .3], ['yamada', 'defence lawyer', 2.6, .4]];
    R.forEach(([k, who, at, fy], i) => { if (l < at) return; const X = 1000 + (i % 2) * 440, Y = 130 + Math.floor(i / 2) * 390; cover(IM(k), X, Y, 420, 360, { fy, flash: 1 - seg(l, at, at + .1) }); tag(who, X + 18, Y + 36, { s: 14, id: 'rd' + i }); });
    const ks = seg(l, 3.1, 3.6); if (ks > 0) { const sx = lerp(40, 1880, eo(ks)); hair(sx, 120, sx, 910, C.acc, 2.5); }
    if (l > 3.6) hair(40, 120, 1880, 120, C.acc, 1, [2, 6]);
    // recanted
    const kr = cut(l, q[3] + .3); if (kr > 0) { alpha(.86 * kr, () => fill(60, 380, 1800, 260, C.bg)); rect(60, 380, 1800, 260, C.acc, 1.5);
      txt('CONFESSED', 120, 530, { s: 96, w: 700, f: F.mono, a: kr, id: 'cf' }); strike(120, 498, tw('CONFESSED', { s: 96, w: 700, f: F.mono }), seg(l, q[3] + .6, q[3] + 1.0), C.acc, 6);
      txt('RECANTED', 820, 530, { s: 96, w: 700, f: F.mono, c: C.acc, a: cut(l, q[3] + 1.1), id: 'rc' }); txt('“forced out of him under intense pressure”', 820, 600, { s: 28, f: F.it, it: 1, a: cut(l, q[3] + 2.5), id: 'rc2' }); }
  }, ev: (d, q) => evs([0, 'shutter'], [.8, 'shutter'], [1.4, 'shutter'], [2.0, 'shutter'], [2.6, 'shutter'], [3.1, 'sweep'], [q[3] + .6, 'scratch']) },
  { at: 4, draw(l, d, q) {
    claim(60, 60, 1800, 420, ['an earlier rabies vaccination had reportedly left him', 'with a neurological condition: confusion, false memories'], 'his supporters', l, 0, { head: 'SUPPORTERS’ CLAIM', s: 44, lh: 62 });
    if (panel(60, 520, 1800, 380, l, q[6] + .2)) { txt('such a condition', 120, 650, { s: 40, w: 700, c: C.dim, a: cut(l, q[6] + .2), id: 'sc1' }); txt('+ relentless questioning', 120, 720, { s: 40, w: 700, a: cut(l, q[6] + 1.6), id: 'sc2' });
      txt('→ a confession to almost anything', 120, 800, { s: 48, w: 700, c: C.acc, a: cut(l, q[6] + 3.2), id: 'sc3' }); }
  } },
];

// ═════════ 14 · In Court ═════════
const ch14 = [
  { at: 0, draw(l, d) {
    const mp = cover(IM('hirasawa_trial_1948'), 60, 60, 1300, 840, { k: seg(l, 0, d), z: 1.05, fx: .5, flash: 1 - seg(l, 0, .1) }); tag('photo · Asahi Graph · 20 Dec 1948', 84, 100);
    const [cx, cy] = mp(1180, 400); ring(cx, cy, 90, seg(l, .8, 1.3), 'Hirasawa', 1, 'FIRST HEARING', 'r:tr');
    lowerThird('Tokyo District Court', 'DENIED THE CRIME COMPLETELY', 1400, 380, l, .5);
  }, ev: () => evs([0, 'shutter'], [.8, 'pencil']) },
  { at: 1, draw(l, d, q) {   // two columns; the poison in neither
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('DEFENCE', 120, 140, { s: 30, w: 700, a: cut(l, 0), id: 'def' }); hair(120, 160, 900, 160, C.text, 1.5);
    [['the confession was coerced, unreliable', 1.0], ['the identification evidence was weak', 5.0], ['no explanation of the poison', 10.0]].forEach(([s, at], i) => row(120, 240 + i * 110, 780, s, true, l, at, { i, s: 28 }));
    const kp = cut(l, q[2]); txt('PROSECUTION', 1020, 140, { s: 30, w: 700, a: kp, id: 'pro' }); if (kp > 0) hair(1020, 160, 1800, 160, C.text, 1.5);
    [['the confession', q[2] + 1.2], ['the missing card', q[2] + 2.6], ['the unexplained money', q[2] + 4.0], ['his past', q[2] + 5.4]].forEach(([s, at], i) => row(1020, 240 + i * 110, 780, s, true, l, at, { i, s: 28 }));
    const kg = cut(l, q[3] + .3); if (kg > 0) { rect(420, 700, 1080, 170, C.acc, 2.5, [8, 6]); txt('THE POISON', 960, 780, { s: 54, w: 700, al: 'center', c: C.acc, a: kg, id: 'poi' }); txt('the gap at the centre of the case', 960, 830, { s: 24, w: 600, al: 'center', c: C.dim, a: cut(l, q[3] + 1.2), id: 'poi2' }); }
  } },
];

// ═════════ 15 · The Unit 731 Theory ═════════
const EA = R => view(29.5, 49.5, 132.0, R[0], R[1], R[0] + R[2], R[1] + R[3]);
const NOB = [139.56, 35.62], HAR = [126.63, 45.75], TOK = [139.70, 35.72];
function eaMap(l, R, k0 = 0) { fill(...R, C.panel); rect(...R); const P = EA(R); coast(P, R, seg(l, k0, k0 + .8)); tag('map · schematic', R[0] + 24, R[1] + 40); return P; }
const ch15 = [
  { at: 0, draw(l, d, q) {
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('“The wrong man”', 120, 220, { s: 72, f: F.it, it: 1, a: cut(l, 0), id: 'wm' }); txt('what many people believed from the start', 124, 280, { s: 26, w: 600, c: C.dim, a: cut(l, .5), id: 'wm2' });
    if (panel(120, 380, 1680, 480, l, q[1])) { head('THE KILLER’S SKILL', 160, 450, l, q[1]);
      [['MEASURED DOSES', q[2] + .2], ['TWO STAGES', q[2] + 2.0], ['A SHORT DELAY', q[2] + 4.6]].forEach(([s, at], i) => { txt(s, 160 + i * 560, 620, { s: 44, w: 700, f: F.mono, a: cut(l, at), id: 'sk' + i }); badge(160 + i * 560 + 20, 700, l, at + .2); }); }
  }, ev: (d, q) => evs([q[2] + .4, 'mallet'], [q[2] + 2.2, 'mallet'], [q[2] + 4.8, 'mallet']) },
  { at: 3, draw(l, d, q) {   // who was questioned (THEORY)
    const R = [700, 60, 1160, 840], P = eaMap(l, R);
    txt('Early in the investigation', 120, 200, { s: 40, w: 700, a: cut(l, 0), id: 'ei' }); txt('detectives suspected military', 120, 260, { s: 32, w: 600, c: C.dim, a: cut(l, .8), id: 'ei2' }); txt('training in poisons', 120, 300, { s: 32, w: 600, c: C.dim, a: cut(l, .8), id: 'ei3' });
    const [nx, ny] = P(NOB), [hx, hy] = P(HAR);
    ring(nx, ny, 24, seg(l, q[4] + 2.0, q[4] + 2.5), 'Noborito Research Institute', -1, 'IMPERIAL ARMY · KAWASAKI', 'r:nob');
    ring(hx, hy, 24, seg(l, q[4] + 5.5, q[4] + 6.0), 'Unit 731', 1, 'NEAR HARBIN', 'r:731');
    txt('former members questioned', 120, 470, { s: 34, w: 700, a: cut(l, q[4] + 1.0), id: 'fm' });
    const ks = cut(l, q[5]); if (ks > 0) { txt('LINE OF INQUIRY', 120, 600, { s: 44, w: 700, f: F.mono, a: ks, id: 'loi' }); strike(120, 586, tw('LINE OF INQUIRY', { s: 44, w: 700, f: F.mono }), seg(l, q[5] + .6, q[5] + 1.1), C.acc, 5); txt('dropped', 120, 650, { s: 32, w: 700, c: C.acc, a: cut(l, q[5] + 1.1), id: 'drp' }); }
    const kd = seg(l, q[7] + .4, q[7] + 1.4); if (kd > 0) { const [tx, ty] = P(TOK); const x = S.x; x.save(); x.strokeStyle = C.acc; x.lineWidth = 3; x.setLineDash([3, 10]); x.lineCap = 'round'; x.beginPath(); x.moveTo(hx, hy); x.quadraticCurveTo(lerp(hx, tx, .5) + 260, lerp(hy, ty, .5) - 60, lerp(hx, tx, kd), lerp(hy, ty, kd)); x.stroke(); x.restore();
      if (kd >= 1) txt('?', lerp(hx, tx, .5) + 160, lerp(hy, ty, .5) - 20, { s: 72, w: 700, c: C.acc, id: 'q731' }); }
    if (l > q[6]) { panel(120, 720, 540, 180, l, q[6]); txt('US immunity for', 150, 790, { s: 28, w: 700, a: cut(l, q[6]) , id: 'imm1'}); txt('Unit 731’s leaders', 150, 830, { s: 28, w: 700, a: cut(l, q[6]), id: 'imm2' }); txt('in exchange for data · documented', 150, 870, { s: 18, f: F.mono, c: C.dim, a: cut(l, q[6]) }); }
    theory(724, 870, l, q[3]);
  }, ev: (d, q) => evs([q[4] + 2, 'pencil'], [q[4] + 5.5, 'pencil'], [q[5] + .6, 'scratch'], [q[7] + .4, 'theory']) },
];

// ═════════ 16 · The Immunity Deal ═════════
const ch16 = [
  { at: 0, draw(l, d, q) {
    const R = [60, 60, 1100, 840], P = view(38.0, 50.5, 128.5, R[0], R[1], R[0] + R[2], R[1] + R[3]); fill(...R, C.panel); rect(...R); coast(P, R, seg(l, 0, .8)); tag('map · schematic', 84, 100);
    const [hx, hy] = P(HAR); ring(hx, hy, 26, seg(l, .8, 1.3), 'Harbin', 1, 'OCCUPIED NORTH-EAST CHINA', 'r:hb');
    lowerThird('Unit 731', 'COMMANDER: SHIRŌ ISHII', 1220, 300, l, q[0] + 4.5);
    if (panel(1220, 480, 640, 300, l, q[1])) { txt('prisoners, most of them Chinese', 1250, 580, { s: 30, w: 700, a: cut(l, q[1]), id: 'pr1' }); txt('used in experiments', 1250, 630, { s: 30, w: 700, a: cut(l, q[1]), id: 'pr2' }); txt('among the gravest crimes of the war', 1250, 690, { s: 24, w: 600, c: C.dim, a: cut(l, q[1] + 3), id: 'pr3' }); }
  } },
  { at: 2, draw(l, d, q) {   // known / unresolved
    flashRect(l, 0, 0, 0, W, H, .06);
    txt('KNOWN', 120, 140, { s: 34, w: 700, a: cut(l, 0), id: 'kn' }); hair(120, 160, 980, 160, C.text, 1.5);
    txt('UNRESOLVED', 1040, 140, { s: 34, w: 700, c: C.acc, a: cut(l, q[7] - .3), id: 'un' }); if (l > q[7] - .3) hair(1040, 160, 1860, 160, C.acc, 1.5);
    [['US officials questioned Ishii and colleagues', 0.4], ['the unit’s leaders never put on trial', q[3] + .3], ['their research passed to the United States', q[3] + 3.5], ['public only in the 1970s–80s', q[5] + .4], ['1948 interviews in a detective’s notes', q[6] + .4]].forEach(([s, at], i) => row(120, 240 + i * 120, 860, s, true, l, at, { i, s: 27 }));
    row(1040, 240, 820, 'a document: GHQ stopped the inquiry', false, l, q[7] + .4, { i: 0, s: 27 });
    row(1040, 360, 820, 'the link to Teigin', false, l, q[8] + .2, { i: 1, s: 27, c: C.acc });
    txt('none found', 1104, 310, { s: 18, f: F.mono, c: C.dim, a: cut(l, q[7] + 1.4) });
    theory(1060, 880, l, q[8] + .4);
  } },
];

export const ACT3 = { 12: ch12, 13: ch13, 14: ch14, 15: ch15, 16: ch16 };
