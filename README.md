# The Teigin Incident — documentary project

A 19:45 narrated documentary on the Teigin Incident (Tokyo, 26 January 1948), in the **Visual Investigation** style of the
[Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) library: public-domain evidence (1948 photographs, the 1945–46 US Army map of Tokyo,
the 1947 Constitution) laid out on one clock, uncertainty drawn on screen, the twelve dead shown as red rings.

- `film/` — the film project (linked into the library as `films/teigin`)
  - `final/teigin_documentary.mp4`, `final/teigin_documentary.srt`, `final/youtube_chapters.txt`, `poster.jpg`
  - `TREATMENT.md` (structure, shot list, cue map), `FACTS.md` (every [VERIFY] note + everything on screen), `credits.md`, `SOURCES.md`
  - `script.md` (locked narration), `voice/gen.py` (Kokoro narration), `audio/` (chapter narration + timings)
  - `index.html`, `film.js`, `core.js`, `act1–4.js`, `geo.js` (the page), `mix.py` (score, foley, mix), `tools/` (timeline, checks, render)
  - `build.sh` — one command: `LIB=~/lemo-opuscar sh film/build.sh`
- `scripts/`, `previews/` — an earlier first pass, kept for reference only.

The MP4 is large and kept out of git (`film/final/*.mp4` is ignored); build it with `build.sh` or take it from the session.
