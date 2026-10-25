// Schematic coastlines (lon, lat), simplified by hand; drawn as thin line work and always marked “schematic”
import { S, C, F, clamp, lerp, eo, hair, txt, alpha } from './core.js';
export const HONSHU = [[141.4, 41.4], [141.5, 40.6], [142.0, 39.6], [141.9, 39.0], [141.5, 38.4], [141.0, 38.3], [141.0, 37.6], [141.0, 36.9], [140.6, 36.3], [140.8, 35.7], [140.4, 35.2], [139.85, 34.9], [139.8, 35.4], [140.0, 35.6], [139.8, 35.65], [139.65, 35.45], [139.65, 35.2], [139.7, 35.1], [139.35, 35.3], [139.1, 35.1], [138.85, 34.6], [138.75, 35.0], [138.4, 34.75], [137.9, 34.65], [137.2, 34.7], [136.9, 34.9], [136.85, 34.5], [136.9, 34.25], [136.3, 33.9], [135.8, 33.45], [135.4, 33.75], [135.1, 34.25], [135.4, 34.65], [135.0, 34.65], [134.2, 34.6], [133.5, 34.45], [132.5, 34.25], [131.9, 33.95], [130.9, 33.95], [131.0, 34.4], [131.6, 34.65], [132.4, 35.3], [133.3, 35.55], [134.4, 35.55], [135.2, 35.75], [135.9, 35.65], [136.1, 36.0], [136.7, 36.95], [137.2, 36.75], [137.6, 37.0], [138.3, 37.2], [138.8, 37.8], [139.4, 38.2], [139.8, 39.0], [140.0, 39.7], [139.9, 40.6], [140.3, 41.2], [140.7, 41.1], [141.2, 41.2]];
export const HOKKAIDO = [[140.0, 41.5], [140.7, 41.8], [141.2, 41.75], [141.6, 42.4], [143.3, 42.0], [143.9, 42.9], [145.6, 43.3], [145.3, 44.3], [144.3, 44.1], [143.5, 44.3], [142.0, 45.45], [141.6, 45.3], [141.7, 44.4], [141.4, 43.8], [141.0, 43.25], [140.4, 43.3], [140.3, 42.7], [139.9, 42.4], [140.0, 41.9]];
export const KYUSHU = [[130.9, 33.9], [131.5, 33.6], [131.7, 33.0], [131.4, 32.0], [131.0, 31.35], [130.7, 31.0], [130.2, 31.3], [130.4, 32.1], [130.2, 32.8], [129.8, 32.75], [129.6, 33.2], [130.0, 33.5], [130.4, 33.6]];
export const SHIKOKU = [[132.5, 33.35], [133.0, 32.75], [133.6, 33.5], [134.2, 33.25], [134.75, 33.8], [134.6, 34.2], [133.5, 34.35], [132.9, 34.1], [132.7, 33.9]];
export const SAKHALIN = [[141.8, 46.0], [142.1, 46.6], [143.5, 46.1], [142.9, 47.2], [142.6, 48.0], [143.1, 49.2], [144.2, 49.0], [143.2, 50.5], [141.9, 50.5], [142.0, 48.0], [141.8, 47.0]];
export const MAINLAND = [[110, 52], [140.5, 52], [140.5, 50.0], [140.4, 48.9], [139.0, 47.3], [137.5, 45.3], [135.4, 43.9], [133.0, 42.8], [131.8, 43.0], [130.7, 42.3], [129.9, 41.4], [129.7, 40.8], [128.6, 40.1], [127.5, 39.5], [128.3, 38.7], [128.8, 38.0], [129.4, 37.1], [129.5, 36.0], [129.3, 35.3], [128.6, 34.9], [127.4, 34.7], [126.5, 34.4], [126.3, 35.2], [126.4, 36.5], [126.2, 37.5], [124.8, 38.0], [125.3, 38.9], [124.9, 39.6], [124.3, 40.0], [123.0, 39.7], [121.6, 38.9], [121.2, 39.5], [122.1, 40.4], [121.0, 40.9], [119.6, 39.9], [118.0, 39.1], [117.7, 38.6], [118.8, 37.6], [119.2, 37.2], [120.7, 37.8], [122.5, 37.4], [121.0, 36.5], [120.2, 35.9], [119.3, 35.0], [120.5, 33.5], [121.0, 32.5], [121.9, 31.0], [121.5, 30.6], [122.0, 30.0], [121.5, 28.0], [110, 28]];

// a view: lat range + screen rect; the lon span follows from the aspect so nothing is stretched
export function view(lat0, lat1, lonC, x0, y0, x1, y1) {
  const k = Math.cos((lat0 + lat1) / 2 * Math.PI / 180), latS = lat1 - lat0, lonS = latS * (x1 - x0) / (y1 - y0) / k, lon0 = lonC - lonS / 2;
  return ([lon, lat]) => [x0 + (lon - lon0) / lonS * (x1 - x0), y1 - (lat - lat0) / latS * (y1 - y0)];
}
export const LANDS = [HONSHU, HOKKAIDO, KYUSHU, SHIKOKU, SAKHALIN, MAINLAND];
// coastlines drawn progressively (k 0..1), clipped to the panel
export function coast(P, rectXYWH, k = 1, lands = LANDS) {
  const x = S.x, [X, Y, w, h] = rectXYWH; x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
  x.strokeStyle = '#6B7078'; x.lineWidth = 1.6; x.lineJoin = 'round';
  for (const L of lands) { const n = Math.max(2, Math.floor(L.length * clamp(k))); x.beginPath(); L.slice(0, n).forEach((p, i) => { const [a, b] = P(p); i ? x.lineTo(a, b) : x.moveTo(a, b); }); if (n === L.length) x.closePath(); x.stroke(); }
  x.restore();
}
// a dotted / dashed route along points, drawn to k
export function route(P, pts, k, o = {}) {
  const x = S.x, Q = pts.map(P); let L = 0; const seg = []; for (let i = 1; i < Q.length; i++) { const d = Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(k), tip = Q[0]; x.save(); x.strokeStyle = o.c || C.acc; x.lineWidth = o.w || 3; x.setLineDash(o.dash || [2, 9]); x.lineCap = 'round'; x.beginPath(); x.moveTo(...Q[0]);
  for (let i = 1; i < Q.length && rem > 0; i++) { const f = Math.min(1, rem / seg[i - 1]); tip = [lerp(Q[i - 1][0], Q[i][0], f), lerp(Q[i - 1][1], Q[i][1], f)]; x.lineTo(...tip); rem -= seg[i - 1]; }
  x.stroke(); x.restore(); return tip;
}
