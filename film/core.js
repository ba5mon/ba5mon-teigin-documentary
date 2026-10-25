// The Teigin Incident · Visual Investigation — drawing primitives shared by every layout
export const W = 1920, H = 1080;
export const C = { bg: '#0B0C0E', panel: '#141619', line: '#2E3238', text: '#ECEAE4', dim: '#8B9097', faint: '#4A4F57', acc: '#FF4A2E', paper: '#E4E0D4', ink: '#1D1D1B' };
export const F = { sans: 'Sans, JP', mono: 'Mono, Sans', it: 'SerifI, Sans', jp: 'JP, Sans' };
export const S = { x: null, FR: 0, REC: null, IM: {}, GRAIN: [] };

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eo = k => 1 - Math.pow(1 - k, 3), eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const lerp = (a, b, k) => a + (b - a) * k;
export function rnd(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function txt(s, X, Y, o = {}) {
  const x = S.x; x.save(); x.font = `${o.it ? 'italic ' : ''}${o.w || 400} ${o.s || 24}px ${o.f || F.sans}`; x.fillStyle = o.c || C.text; x.globalAlpha *= (o.a ?? 1);
  x.textAlign = o.al || 'left'; x.textBaseline = 'alphabetic'; x.letterSpacing = (o.ls || 0) + 'px';
  if (x.globalAlpha > 0.001) x.fillText(s, X, Y);
  const w = x.measureText(s).width, ga = x.globalAlpha; x.restore();
  if (S.REC && o.id && ga > 0.5) { const sz = o.s || 24, x0 = o.al === 'right' ? X - w : o.al === 'center' ? X - w / 2 : X; S.REC.push({ id: o.id, text: s, x0, y0: Y - sz * .9, x1: x0 + w, y1: Y + sz * .25 }); }
  return w;
}
export function tw(s, o = {}) { const x = S.x; x.save(); x.font = `${o.it ? 'italic ' : ''}${o.w || 400} ${o.s || 24}px ${o.f || F.sans}`; x.letterSpacing = (o.ls || 0) + 'px'; const w = x.measureText(s).width; x.restore(); return w; }
export function wrapLines(s, maxW, o) { const toks = s.split(/(?<= )/); const out = []; let line = ''; for (const tk of toks) { if (tw(line + tk, o) > maxW && line) { out.push(line.trimEnd()); line = tk.trimStart(); } else line += tk; } if (line) out.push(line); return out; }
// paragraph: wrapped lines, registered as one text
export function para(s, X, Y, maxW, o = {}) { const L = wrapLines(s, maxW, o), lh = o.lh || (o.s || 24) * 1.32; L.forEach((l, i) => txt(l, X, Y + i * lh, { ...o, id: o.id ? o.id + ':' + i : null })); return L.length * lh; }
export function hair(x0, y0, x1, y1, c = C.line, w = 1, dash) { const x = S.x; x.save(); x.strokeStyle = c; x.lineWidth = w; if (dash) x.setLineDash(dash); x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); x.restore(); }
export function rect(X, Y, w, h, c = C.line, lw = 1, dash) { const x = S.x; x.save(); x.strokeStyle = c; x.lineWidth = lw; if (dash) x.setLineDash(dash); x.strokeRect(X + .5, Y + .5, w - 1, h - 1); x.restore(); }
export function fill(X, Y, w, h, c) { S.x.fillStyle = c; S.x.fillRect(X, Y, w, h); }
export function alpha(a, fn) { const x = S.x; x.save(); x.globalAlpha *= a; fn(); x.restore(); }
export function hatch(X, Y, w, h, c = '#1b1e22', step = 22) { const x = S.x; x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip(); for (let q = X - h; q < X + w; q += step) hair(q, Y + h, q + h, Y, c); x.restore(); }
// ring callout drawn clockwise; at 60 % a leader and a label come out
export function ring(cx, cy, r, k, label, side = 1, sub, id) {
  if (k <= 0) return; const x = S.x; x.save(); x.strokeStyle = C.acc; x.lineWidth = 2.5;
  x.beginPath(); x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * eo(k)); x.stroke(); x.restore();
  if (label && k > .6) {
    const a = seg(k, .6, .75); const lx = cx + side * (r * .72), ly = cy - r * .72, ex = lx + side * 40, ey = ly - 30;
    alpha(a, () => { hair(lx, ly, ex, ey, C.acc, 1.5); hair(ex, ey, ex + side * 14, ey, C.acc, 1.5); });
    txt(label, ex + side * 20, ey + 8, { s: 24, w: 700, al: side > 0 ? 'left' : 'right', a, id });
    if (sub) txt(sub, ex + side * 20, ey + 34, { s: 16, f: F.mono, c: C.dim, al: side > 0 ? 'left' : 'right', a });
  }
}
// evidence plate: one grade + one grain + hairline frame; o.doc (paper), o.map (map: greyscale, darker)
export function plate(img, sx, sy, sw, sh, X, Y, w, h, o = {}) {
  const x = S.x; x.save(); x.globalAlpha *= (o.a ?? 1); fill(X, Y, w, h, '#000');
  if (img) { x.filter = o.doc ? 'grayscale(1) contrast(1.05) brightness(0.86)' : o.raw ? 'grayscale(1) contrast(1.1) brightness(0.92)' : o.map ? (o.inv !== false ? 'grayscale(1) invert(1) brightness(0.78) contrast(1.2)' : 'grayscale(1) brightness(0.78) contrast(1.15)') : 'grayscale(1) contrast(1.22) brightness(0.94)';
    x.drawImage(img, sx, sy, sw, sh, X, Y, w, h); x.filter = 'none'; }
  if (S.GRAIN.length && !o.map) { x.beginPath(); x.rect(X, Y, w, h); x.clip(); x.globalCompositeOperation = 'overlay'; x.globalAlpha *= o.doc ? .10 : .22;
    const g = S.GRAIN[S.FR % 6]; for (let gy = Y; gy < Y + h; gy += 256) for (let gx = X; gx < X + w; gx += 256) x.drawImage(g, gx, gy); }
  x.restore();
  if (o.flash > 0) alpha(o.flash * (o.a ?? 1), () => fill(X, Y, w, h, '#fff'));
  if (!o.noborder) rect(X, Y, w, h, o.border || C.line, o.bw || 1);
}
// fill a cell without stretching, with an optional slow push z (1 → z over k); returns source px → screen
export function cover(img, X, Y, w, h, o = {}) {
  if (!img) { plate(null, 0, 0, 1, 1, X, Y, w, h, o); return () => [X, Y]; }
  const iw = img.width, ih = img.height, fx = o.fx ?? .5, fy = o.fy ?? .5, z = lerp(1, o.z || 1, o.k ?? 0);
  let sw = iw, sh = iw * h / w; if (sh > ih) { sh = ih; sw = ih * w / h; } sw /= z; sh /= z;
  const sx = clamp((iw - sw) * fx, 0, iw - sw), sy = clamp((ih - sh) * fy, 0, ih - sh); plate(img, sx, sy, sw, sh, X, Y, w, h, o); const k = w / sw;
  return (px, py) => [X + (px - sx) * k, Y + (py - sy) * k];
}
// a sub-rectangle of the source [sx, sy, sw, (sh)] shown in the cell, keeping the cell's aspect; o.z pushes in by o.k toward o.focus (source px)
export function crop(img, r, X, Y, w, h, o = {}) {
  const iw = img ? img.width : 1, ih = img ? img.height : 1, [sx0, sy0, sw0] = r, sh0 = sw0 * h / w, z = lerp(1, o.z || 1, o.k ?? 0);
  const rc = [sx0 + sw0 / 2, sy0 + (r[3] ?? sh0) / 2], f = o.focus || rc, u = (o.z || 1) > 1 ? (1 - 1 / z) / (1 - 1 / o.z) : 0;
  const sw = sw0 / z, sh = sh0 / z, cx = lerp(rc[0], f[0], u), cy = lerp(rc[1], f[1], u);
  const sx = clamp(cx - sw / 2, 0, Math.max(0, iw - sw)), sy = clamp(cy - sh / 2, 0, Math.max(0, ih - sh));
  plate(img, sx, sy, sw, sh, X, Y, w, h, o); const k = w / sw;
  return (px, py) => [X + (px - sx) * k, Y + (py - sy) * k];
}
export function tag(s, X, Y, o = {}) {
  const w = txt(s, X + 14, Y, { s: o.s || 17, f: F.mono, c: o.c || C.text, w: 600, ls: 1, a: o.a ?? 1, id: o.id });
  alpha(o.a ?? 1, () => fill(X, Y - 12, 6, 13, o.chip || C.acc)); return w;
}
export function badge(X, Y, l, at) {   // ✓ in a red box (no words)
  const k = seg(l, at, at + .06); if (k <= 0) return; const x = S.x; x.save(); x.globalAlpha *= k; const s = 1 + .3 * (1 - seg(l, at, at + .18)); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = 'rgba(11,12,14,0.85)'; x.fillRect(-15, -15, 30, 30); x.strokeStyle = C.acc; x.lineWidth = 2; x.strokeRect(-15, -15, 30, 30);
  x.beginPath(); x.moveTo(-8, 0); x.lineTo(-2, 7); x.lineTo(9, -7); x.lineWidth = 3; x.stroke(); x.restore();
}
export function flashRect(l, at, X, Y, w, h, d = .12) { const k = 1 - seg(l, at, at + d); if (l < at || k <= 0) return; alpha(k, () => fill(X, Y, w, h, '#fff')); }
// a piece cuts in at `at` (≤ 0.1 s) with a white flash over its box
export const cut = (l, at) => seg(l, at, at + .05);
export function panel(X, Y, w, h, l, at = 0, o = {}) { const k = cut(l, at); if (k <= 0) return false; alpha(k, () => { fill(X, Y, w, h, o.c || C.panel); rect(X, Y, w, h, o.border || C.line, o.bw || 1, o.dash); }); flashRect(l, at, X, Y, w, h); return true; }
export function lowerThird(place, code, X, Y, l, at = 0) {
  const k = seg(l, at, at + .1); if (k <= 0) return; const lx = lerp(X - 30, X, eo(seg(l, at, at + .4)));
  alpha(k, () => fill(lx, Y, 6, code ? 74 : 50, C.acc));
  txt(place, lx + 24, Y + 36, { s: 36, w: 700, a: k, id: 'lt:' + place }); if (code) txt(code, lx + 26, Y + 66, { s: 18, f: F.mono, c: C.dim, ls: 2, a: k, id: 'ltc:' + code });
}
// big readout (dates, clocks, counters)
export function readout(s, X, Y, o = {}) { return txt(s, X, Y, { s: o.s || 64, f: F.mono, w: 600, c: o.c || C.text, al: o.al, a: o.a, ls: o.ls ?? 0, id: o.id === false ? null : (o.id || 'ro:' + s) }); }
// strike-through wiped left → right
export function strike(X, Y, w, k, c = C.acc, lw = 3) { if (k > 0) hair(X, Y, X + w * eo(clamp(k)), Y, c, lw); }
// highlight wiped left → right (multiply on paper, plain red-tint on dark)
export function highlight(X, Y, w, h, k, onPaper = true) { if (k <= 0) return; const x = S.x; x.save(); if (onPaper) x.globalCompositeOperation = 'multiply'; x.fillStyle = onPaper ? 'rgba(255,74,46,0.6)' : 'rgba(255,74,46,0.22)'; x.fillRect(X, Y, w * eo(clamp(k)), h); x.restore(); }
// a check mark or a dashed box (known / unresolved)
export function tick(X, Y, c = C.text) { const x = S.x; x.save(); x.strokeStyle = c; x.lineWidth = 2.5; x.beginPath(); x.moveTo(X, Y); x.lineTo(X + 8, Y + 9); x.lineTo(X + 22, Y - 10); x.stroke(); x.restore(); }
export function dashBox(X, Y, s = 24, c = C.acc) { rect(X, Y - s / 2, s, s, c, 2, [4, 3]); }
// one person figure per person (head + shoulders, about 2.6 R tall, centred on X, Y); died: a red outline figure after k
function personPath(x, X, Y, R) {
  const hy = Y - .62 * R, hr = .36 * R, top = Y - .12 * R, bot = Y + 1.0 * R, w = .78 * R;
  x.beginPath(); x.arc(X, hy, hr, 0, Math.PI * 2); x.closePath();
  x.moveTo(X - w, bot); x.lineTo(X - w, top + .38 * R); x.quadraticCurveTo(X - w, top, X - w + .38 * R, top);
  x.lineTo(X + w - .38 * R, top); x.quadraticCurveTo(X + w, top, X + w, top + .38 * R); x.lineTo(X + w, bot); x.closePath();
}
export function dot(X, Y, R, died, k) {
  R *= 1.3;
  const x = S.x; x.save();
  if (!died || k <= 0) { x.fillStyle = C.text; personPath(x, X, Y, R); x.fill(); }
  else { x.fillStyle = `rgba(236,234,228,${1 - k})`; personPath(x, X, Y, R); x.fill(); x.strokeStyle = C.acc; x.lineWidth = Math.max(1.8, R * .08); x.lineJoin = 'round'; x.globalAlpha *= k; personPath(x, X, Y, R); x.stroke(); }
  x.restore();
}
export const person = dot;
// paper card (typeset transcription / schematic form)
export function paperCard(X, Y, w, h, l, at = 0) { const k = cut(l, at); if (k <= 0) return false; alpha(k, () => { fill(X, Y, w, h, C.paper); }); const x = S.x;
  if (S.GRAIN.length) { x.save(); x.globalAlpha = .1 * k; x.globalCompositeOperation = 'multiply'; x.drawImage(S.GRAIN[S.FR % 6], X, Y, w, h); x.restore(); }
  rect(X, Y, w, h, '#bdb8aa'); flashRect(l, at, X, Y, w, h); return true; }
// claim card: a statement attributed to a source, marked as a claim
export function claim(X, Y, w, h, lines, who, l, at = 0, o = {}) {
  if (!panel(X, Y, w, h, l, at, { border: o.border })) return; const k = cut(l, at);
  txt(o.head || 'CLAIM', X + 28, Y + 46, { s: 20, w: 700, c: o.headC || C.dim, ls: 4, f: F.mono, a: k });
  lines.forEach((s, i) => txt(s, X + 28, Y + 84 + (o.s || 40) * .9 + i * (o.lh || 56), { s: o.s || 40, f: o.serif === false ? F.sans : F.it, it: o.serif !== false, w: o.serif === false ? 700 : 400, a: k, id: `cl:${s}` }));
  if (who) txt(who, X + w - 28, Y + h - 24, { s: 16, f: F.mono, c: C.dim, al: 'right', a: k });
}
// known / unresolved row
export function row(X, Y, w, s, known, l, at, o = {}) {
  const ka = cut(l, at); if (ka <= 0) return;
  alpha(ka, () => fill(X, Y - 40, w, 84, o.i % 2 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.045)'));
  alpha(ka, () => known ? tick(X + 20, Y) : dashBox(X + 18, Y));
  txt(s, X + 64, Y + 12, { s: o.s || 32, w: 700, a: ka, c: o.c, id: 'row:' + s }); flashRect(l, at, X, Y - 40, w, 84, .1);
}
// a date axis: [ [label, value, pinLabel?] ... ], v0..v1 → X0..X1
export function axis(X0, X1, Y, v0, v1, ticks, k = 1) {
  const X = v => X0 + (v - v0) / (v1 - v0) * (X1 - X0); hair(X0, Y, lerp(X0, X1, eo(k)), Y, C.line, 2);
  for (const [v, lab] of ticks) { if (X(v) > lerp(X0, X1, eo(k)) + 1) continue; hair(X(v), Y, X(v), Y + 10, C.dim, 1.5); txt(lab, X(v), Y + 38, { s: 18, f: F.mono, c: C.dim, al: 'center' }); }
  return X;
}
export function pin(px, Y, c = C.acc, s = 9) { const x = S.x; x.fillStyle = c; x.beginPath(); x.moveTo(px, Y - s); x.lineTo(px + s * .75, Y); x.lineTo(px, Y + s); x.lineTo(px - s * .75, Y); x.fill(); }
