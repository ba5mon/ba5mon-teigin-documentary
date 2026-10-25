# The Teigin Incident — documentary project

- `script.md` — approved narration script (your draft kept word for word + new chapters); `script_body.md` is the source it is built from.
- `audio/chXX.mp3` — Kokoro narration (voice am_michael), `audio/timings.json` — per-sentence timings; `audio/samples/` — voice samples.
- `scripts/` — narration generator (`gen_narration.py`), first-pass visuals (`visuals.py`, `storyboard.py`, `render.py`).
- `previews/` — first-pass preview frames (pre-woodcut style; to be replaced).

## Next steps (new session)
1. `git clone https://github.com/lemomo-ai/lemo-opuscar.git ~/lemo-opuscar-repo` — style library; chosen style: **Woodcut Print** (`styles/woodcut`).
2. Run `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps` in the library.
3. Narration with ElevenLabs: key in env `ELEVENLABS_API_KEY`, host `api.elevenlabs.io` allowed. Re-generate `audio/` + `timings.json`.
4. Kokoro model (if regenerating locally): `models/kokoro-v1.0.onnx`, `models/voices-v1.0.bin` from https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
