# The Teigin Incident — documentary project

Woodcut Print style (library: https://github.com/lemomo-ai/lemo-opuscar, style `styles/woodcut`).

- `film/` — the film project (linked into the library as `films/teigin`):
  - `script.md` — locked narration script (22 chapters); `FACTS.md` — every [VERIFY] note + locked facts; `TREATMENT.md` — structure, shot list, cue map, sound design.
  - `voice/gen.py` — Kokoro narration (voice `am_michael`, numbers spelled out, phoneme overrides for Japanese names); `audio/chXX.mp3` + `audio/timings.json` (per-sentence timings).
- `scripts/`, `previews/` — the earlier first pass (pre-woodcut), kept for reference only.

Setup: `git clone https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar && cd ~/lemo-opuscar && sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice && ln -s <this repo>/film films/teigin`.
