// The Teigin Incident · Paper-cut Lightbox, rebuilt in Canvas 2D (no GPU needed)
// A stack = parallel cut-paper sheets in a shallow box, lit from behind. Each sheet is cut, lit and finished once per stack
// (backlight falloff from the lamp, pulp mottle, fibre grain, a warm rim on its top edge, a dark band on its bottom edge,
// a soft shadow cast on the sheets behind, depth-of-field blur by distance from the focus). Per frame the sheets are
// composed with depth parallax (camera pan / dolly) and jointed figures are drawn at their depth.
export const W = 1920, H = 1080, MX = 260, MY = 170;           // sheet canvases carry a margin for pans
export const SW = W + 2 * MX, SH = H + 2 * MY;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, eo = k => 1 - Math.pow(1 - k, 3);
export function rnd(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function canvas(w = SW, h = SH) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
const hex = s => { const n = parseInt(s.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const rgba = (c, a) => { const [r, g, b] = hex(c); return `rgba(${r},${g},${b},${a})`; };

// ───────── shared textures (built once per page) ─────────
let FIBRE = null, MOTTLE = null;
function textures() {
  if (FIBRE) return;
  const r = rnd(7);
  { const [c, g] = canvas(512, 512); const d = g.createImageData(512, 512);   // fibre grain: fine noise + long thin fibres
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (r() - .5) * 40; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); g.lineWidth = 1;
    for (let k = 0; k < 900; k++) { const x = r() * 512, y = r() * 512, a = r() * Math.PI, l = 8 + r() * 40; g.strokeStyle = r() < .5 ? 'rgba(255,255,255,.10)' : 'rgba(0,0,0,.10)'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + (r() - .5) * 6, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    FIBRE = c; }
  { const [c, g] = canvas(256, 256); const d = g.createImageData(256, 256);  // pulp mottle: cloudy value noise
    const N = 16, grid = Array.from({ length: (N + 1) * (N + 1) }, () => r());
    const at = (i, j) => grid[(j % N) * (N + 1) + (i % N)];
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { let v = 0, a = 1, f = 1, s = 0;
      for (let o = 0; o < 3; o++) { const u = x / 256 * N / 4 * f, w = y / 256 * N / 4 * f, i = Math.floor(u), j = Math.floor(w), fu = u - i, fw = w - j, sm = q => q * q * (3 - 2 * q);
        v += a * lerp(lerp(at(i, j), at(i + 1, j), sm(fu)), lerp(at(i, j + 1), at(i + 1, j + 1), sm(fu)), sm(fw)); s += a; a *= .5; f *= 2; }
      const k = (y * 256 + x) * 4, q = v / s * 255; d.data[k] = d.data[k + 1] = d.data[k + 2] = q; d.data[k + 3] = 255; }
    g.putImageData(d, 0, 0); MOTTLE = c; }
}

// ───────── a paper sheet ─────────
// o: { z (0 front … 1 back), color, trans (backlight transmission 0..1), draw(g) shapes in screen coords (0..W, 0..H, margin allowed),
//      cut(g) holes (filled shapes are removed), glow(g) emissive windows (white = light), glowCol, light: {x, y, r, col}, rim, shadow }
export function sheet(o) {
  textures();
  const [M, m] = canvas(); m.translate(MX, MY); m.fillStyle = '#000'; o.draw(m);                       // the cut sheet (alpha = paper)
  if (o.cut) { m.globalCompositeOperation = 'destination-out'; m.fillStyle = '#000'; o.cut(m); m.globalCompositeOperation = 'source-over'; }
  const [P, p] = canvas();
  p.drawImage(M, 0, 0); p.globalCompositeOperation = 'source-in'; p.fillStyle = o.color; p.fillRect(0, 0, SW, SH);
  // backlight: warm light through the paper, strongest near the lamp, mottled by the pulp
  const L = o.light || { x: W / 2, y: H * .3, r: 1100, col: '#ffd9a0' }, tr = o.trans ?? .3;
  if (tr > 0) {
    p.globalCompositeOperation = 'source-atop';
    const gr = p.createRadialGradient(L.x + MX, L.y + MY, 0, L.x + MX, L.y + MY, L.r);
    gr.addColorStop(0, rgba(L.col, .85 * tr)); gr.addColorStop(.55, rgba(L.col, .38 * tr)); gr.addColorStop(1, rgba(L.col, .1 * tr));
    p.fillStyle = gr; p.fillRect(0, 0, SW, SH);
    p.globalAlpha = .22 * tr + .05; p.globalCompositeOperation = 'soft-light';
    for (let y = 0; y < SH; y += 512) for (let x = 0; x < SW; x += 512) p.drawImage(MOTTLE, x, y, 512, 512);
    p.globalAlpha = 1;
  }
  // fibre grain
  p.globalCompositeOperation = 'soft-light'; p.globalAlpha = .55;
  for (let y = 0; y < SH; y += 512) for (let x = 0; x < SW; x += 512) p.drawImage(FIBRE, x, y);
  p.globalAlpha = 1;
  // rim light on top edges, dark band on bottom edges
  if (o.rim !== false) {
    const band = (dy, col, a) => { const [B, b] = canvas(); b.drawImage(M, 0, 0); b.globalCompositeOperation = 'destination-out'; b.drawImage(M, 0, dy); b.globalCompositeOperation = 'source-in'; b.fillStyle = col; b.fillRect(0, 0, SW, SH);
      p.globalCompositeOperation = 'source-atop'; p.globalAlpha = a; p.drawImage(B, 0, 0); p.globalAlpha = 1; };
    band(3, o.rimCol || '#ffe6bf', o.rimA ?? .45); band(-3, '#000000', .35);
  }
  p.globalCompositeOperation = 'source-over';
  // soft shadow cast onto the sheets behind (light from above-front)
  let S = null;
  if (o.shadow !== false) { const [Sc, s] = canvas(); s.filter = `blur(${o.shadowBlur ?? 12}px)`; s.globalAlpha = o.shadowA ?? .5; s.drawImage(M, 0, 0); s.filter = 'none'; s.globalCompositeOperation = 'source-in'; s.fillStyle = '#0a0705'; s.fillRect(0, 0, SW, SH); S = Sc; }
  // emissive windows
  let G = null;
  if (o.glow) { const [Gc, gg] = canvas(); gg.translate(MX, MY); gg.fillStyle = '#fff'; o.glow(gg); gg.setTransform(1, 0, 0, 1, 0, 0); gg.globalCompositeOperation = 'source-in'; gg.fillStyle = o.glowCol || '#ffc070'; gg.fillRect(0, 0, SW, SH);
    const [Bc, bb] = canvas(); bb.filter = 'blur(18px)'; bb.drawImage(Gc, 0, 0); bb.filter = 'blur(5px)'; bb.drawImage(Gc, 0, 0); bb.filter = 'none'; bb.drawImage(Gc, 0, 0); G = Bc; }
  return { z: o.z ?? .5, P, S, G, shadowDy: o.shadowDy ?? 14, blurred: null, name: o.name, ox: o.ox || 0, oy: o.oy || 0 };
}
// the far wall of the box: a lit gradient panel (not cut)
export function backPanel(o) {
  textures();
  const [P, p] = canvas(); const gr = p.createLinearGradient(0, 0, 0, SH); (o.stops || [[0, o.top], [1, o.bottom]]).forEach(([k, c]) => gr.addColorStop(k, c)); p.fillStyle = gr; p.fillRect(0, 0, SW, SH);
  const L = o.light; if (L) { const g2 = p.createRadialGradient(L.x + MX, L.y + MY, 0, L.x + MX, L.y + MY, L.r); g2.addColorStop(0, rgba(L.col, .7)); g2.addColorStop(1, rgba(L.col, 0)); p.fillStyle = g2; p.fillRect(0, 0, SW, SH); }
  p.globalCompositeOperation = 'soft-light'; p.globalAlpha = .35; for (let y = 0; y < SH; y += 512) for (let x = 0; x < SW; x += 512) p.drawImage(MOTTLE, x, y, 512, 512);
  p.globalAlpha = .4; for (let y = 0; y < SH; y += 512) for (let x = 0; x < SW; x += 512) p.drawImage(FIBRE, x, y);
  return { z: 1, P, S: null, G: null, back: true };
}
// depth of field: pre-blur each sheet by its distance from the focus depth (static per stack)
export function focus(stack, fz, k = 9) { for (const L of stack.layers) { const r = Math.abs(L.z - fz) * k; if (r < .6) { L.blurred = null; continue; } const [B, b] = canvas(); b.filter = `blur(${r.toFixed(1)}px)`; b.drawImage(L.P, 0, 0); L.blurred = B; } return stack; }

// ───────── composing a frame ─────────
// cam: { x, y (pan in px at the front plane), zoom (dolly) }. A sheet at depth z moves (1 − .72 z) as much as the front and scales 1 + (zoom − 1)(1 − .6 z)
export function layerXf(cam, z) { const k = 1 - .72 * z, s = 1 + ((cam.zoom ?? 1) - 1) * (1 - .6 * z); return { s, tx: W / 2 - (cam.x ?? 0) * k, ty: H / 2 - (cam.y ?? 0) * k }; }
export function compose(g, stack, cam, t, o = {}) {
  const figs = (stack.figures ? stack.figures(t) : []).sort((a, b) => b.z - a.z);
  const lit = o.lit ?? 1, flick = 1 + .025 * Math.sin(t * 7.3) * Math.sin(t * 3.1);
  g.save(); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const layers = stack.layers.slice().sort((a, b) => b.z - a.z); let fi = 0;
  const drawFigs = zmin => { while (fi < figs.length && figs[fi].z >= zmin) { const f = figs[fi++], X = layerXf(cam, f.z); g.save(); g.translate(X.tx, X.ty); g.scale(X.s, X.s); g.translate(-W / 2, -H / 2); f.draw(g, X); g.restore(); } };
  for (const L of layers.slice(0, window.DBG ?? 99)) {
    drawFigs(L.z + 1e-6);
    const X = layerXf(cam, L.z); g.save(); g.translate(X.tx, X.ty); g.scale(X.s, X.s); g.translate(-W / 2 - MX + L.ox, -H / 2 - MY + L.oy);
    if (L.S) { g.drawImage(L.S, 6, L.shadowDy); }
    g.drawImage(L.blurred || L.P, 0, 0);
    if (L.G) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = (L.glowA ?? 1) * flick; g.drawImage(L.G, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    g.restore();
  }
  drawFigs(-9);
  // lamp: brightness and flicker; vignette toward warm brown
  const dark = 1 - lit * flick; if (dark > 0) { g.fillStyle = `rgba(0,0,0,${clamp(dark)})`; g.fillRect(0, 0, W, H); }
  const v = g.createRadialGradient(W / 2, H * .46, H * .35, W / 2, H * .5, H * 1.02); v.addColorStop(0, 'rgba(30,18,8,0)'); v.addColorStop(1, `rgba(20,12,6,${o.vig ?? .62})`); g.fillStyle = v; g.fillRect(0, 0, W, H);
  g.restore();
}

// ───────── jointed silhouette figures (paper on a stick: parts rotate about joints) ─────────
// f: { x, y (feet), h (height px), dir (1 right, −1 left), coat, hat, cap (military), bundle, band (armband), phase (walk 0..1), walking,
//      pose: {armL, armR} (rad, 0 = hanging, −π/2 = pointing forward), seated, stoop (rad, upper body leans forward), cane, back (seen from behind), color }
export function figure(g, f) {
  const h = f.h, k = h / 100, dir = f.dir ?? 1, col = f.color || '#1a120c';
  const ph = (f.phase ?? 0) * Math.PI * 2, walk = f.walking ? 1 : 0;
  const bob = walk * Math.abs(Math.sin(ph)) * 1.6 * k;
  g.save(); g.translate(f.x, f.y - bob); g.scale(dir, 1);
  const part = fn => { g.beginPath(); fn(); g.fill(); };
  g.fillStyle = col; g.strokeStyle = col;
  const hipY = f.seated ? -25 * k : -47 * k, shY = hipY - 35 * k;
  const limb = (x0, y0, a, len, w0, w1) => { g.save(); g.translate(x0, y0); g.rotate(a); part(() => { g.moveTo(-w0 * k, 0); g.lineTo(w0 * k, 0); g.lineTo(w1 * k, len * k); g.lineTo(-w1 * k, len * k); g.closePath(); }); g.restore(); };
  if (f.back) {                                       // seen from behind: legs lift in turn, arms at the sides
    for (const s of [-1, 1]) { const lift = walk * Math.max(0, Math.sin(ph) * s) * 6 * k; part(() => g.rect(s * 6.5 * k - 4.5 * k, hipY, 9 * k, -hipY - lift)); }
    part(() => { g.moveTo(-13 * k, shY + 2 * k); g.lineTo(13 * k, shY + 2 * k); g.lineTo(14 * k, (f.coat ? -20 : -45) * k); g.lineTo(-14 * k, (f.coat ? -20 : -45) * k); g.closePath(); });
    for (const s of [-1, 1]) limb(s * 14 * k, shY + 4 * k, -s * (.06 + walk * Math.sin(ph) * s * .05), 34, 3.6, 2.8);
    const hy = shY - 9 * k; part(() => g.ellipse(0, hy, 6.8 * k, 7.6 * k, 0, 0, Math.PI * 2)); part(() => g.rect(-3 * k, hy + 5 * k, 6 * k, 6 * k));
    if (f.hat) { part(() => g.ellipse(0, hy - 4 * k, 11 * k, 2.4 * k, 0, 0, Math.PI * 2)); part(() => g.rect(-6 * k, hy - 12 * k, 12 * k, 8.5 * k)); }
    g.restore(); return;
  }
  if (f.seated) {                                     // thigh forward, shin down to the floor
    for (const b of [1, 0]) { limb((b ? -1 : 2) * k, hipY, -Math.PI / 2 + .04, 24, 5.4, 4.6); limb(22 * k + (b ? -1 : 2) * k, hipY, 0, 25, 4.4, 3.6); part(() => g.ellipse(24.6 * k, -1 * k, 6.6 * k, 2.6 * k, 0, 0, Math.PI * 2)); }
  } else {
    const legA = walk * Math.sin(ph) * .42;
    for (const [sw, dx] of [[-legA, -2], [legA, 2]]) { g.save(); g.translate(dx * k, hipY); g.rotate(sw); part(() => { g.moveTo(-5 * k, 0); g.lineTo(5 * k, 0); g.lineTo(3.6 * k, 44 * k); g.lineTo(-3.4 * k, 44 * k); g.closePath(); });
      part(() => g.ellipse(2.6 * k, 45.5 * k, 6.6 * k, 2.6 * k, 0, 0, Math.PI * 2)); g.restore(); }
  }
  g.save(); g.translate(0, hipY); g.rotate(f.stoop || 0); g.translate(0, -hipY);   // upper body (leans about the hip)
  const coatB = f.seated ? hipY + 4 * k : (f.coat ? -20 * k : hipY + 2 * k), coatW = f.coat && !f.seated ? 13 : 9.5;
  part(() => { g.moveTo(-10 * k, shY + 2 * k); g.lineTo(10 * k, shY + 2 * k); g.lineTo(coatW * k, coatB); g.lineTo(-coatW * k, coatB); g.closePath(); });
  const hy = shY - 9 * k; part(() => g.ellipse(1 * k, hy, 6.4 * k, 7.6 * k, 0, 0, Math.PI * 2)); part(() => g.rect(-3 * k, hy + 5 * k, 6 * k, 6 * k));
  if (f.hat) { part(() => g.ellipse(1 * k, hy - 4 * k, 11 * k, 2.4 * k, 0, 0, Math.PI * 2)); part(() => g.rect(-5.5 * k, hy - 12 * k, 12 * k, 8.5 * k)); }
  if (f.cap) { part(() => { g.moveTo(-7 * k, hy - 3 * k); g.lineTo(-6 * k, hy - 9 * k); g.lineTo(8 * k, hy - 9 * k); g.lineTo(9 * k, hy - 4 * k); g.lineTo(15 * k, hy - 1.5 * k); g.lineTo(7 * k, hy - 1 * k); g.lineTo(-7 * k, hy); g.closePath(); }); }
  if (f.hair) part(() => g.ellipse(-2 * k, hy - 1 * k, 7 * k, 7 * k, 0, Math.PI * .9, Math.PI * 2.1));
  const arm = (a, back) => { g.save(); g.translate((back ? -1 : 1) * k, shY + 4 * k); g.rotate(a); part(() => { g.moveTo(-3.6 * k, 0); g.lineTo(3.6 * k, 0); g.lineTo(2.8 * k, 34 * k); g.lineTo(-2.6 * k, 34 * k); g.closePath(); }); part(() => g.ellipse(0, 35 * k, 3.4 * k, 4 * k, 0, 0, Math.PI * 2));
    if (!back && f.band) { g.fillStyle = f.bandCol || '#e9dcc4'; g.fillRect(-4 * k, 7 * k, 8 * k, 5 * k); g.fillStyle = col; }
    if (!back && f.bundle) part(() => g.rect(-7 * k, 30 * k, 14 * k, 12 * k));
    if (!back && f.cane) { g.save(); g.rotate(-a); g.lineWidth = 2.2 * k; g.beginPath(); const hx = -Math.sin(a) * 35 * k, hy2 = Math.cos(a) * 35 * k; g.moveTo(hx, hy2); g.lineTo(hx + 4 * k, -shY - 4 * k - hipY + hipY + 0); g.stroke(); g.restore(); }
    g.restore(); };
  const sw = walk * Math.sin(ph) * (f.cane ? .15 : .38);
  arm((f.pose?.armL ?? 0) + sw, true); arm((f.pose?.armR ?? 0) - sw, false);
  g.restore(); g.restore();
}
// draw a figure with its rim light and soft shadow (the figure is a dark front sheet)
export function figureLit(g, f, o = {}) {
  g.save(); g.filter = `blur(${o.blur ?? 7}px)`; g.globalAlpha *= .45; g.translate(5, 10); figure(g, { ...f, color: '#000' }); g.restore();
  g.save(); g.translate(0, -2.5); figure(g, { ...f, color: o.rim || 'rgba(255,214,160,.5)' }); g.restore();
  figure(g, f);
}
