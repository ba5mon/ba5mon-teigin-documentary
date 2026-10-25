// Subtitle check: every cue on one line (≤ 1500 px, measured in the burned-in font) and on screen ≥ 1.8 s.
//   node tools/subcheck.mjs
import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), LIB = process.env.LIB || path.resolve(FILM, '../../..');
const { openDemo, closeServer } = await import(path.join(LIB, 'core/render/page.mjs'));
const { browser, page } = await openDemo(FILM, { w: 1920, h: 1080 });
const rows = await page.evaluate(() => window.SUBCHECK()); await browser.close(); closeServer();
const T = JSON.parse(fs.readFileSync(path.join(FILM, 'timeline.json'), 'utf8')); let bad = 0;
for (const r of rows) if (!r.ok) { bad++; console.log(`BAD width ${r.w}px: ${r.text}`); }
T.subs.forEach((s, i) => { if (s.t1 - s.t0 < 1.8 - 1e-6) { bad++; console.log(`BAD #${i + 1} ${(s.t1 - s.t0).toFixed(2)} s: ${s.text}`); } });
console.log(bad ? `subcheck: ${bad} problems` : `subcheck: OK (${rows.length} cues, one line each, max ${Math.max(...rows.map(r => r.w))} px)`);
process.exit(bad ? 1 : 0);
