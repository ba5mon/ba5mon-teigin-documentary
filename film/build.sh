#!/bin/sh
# The Teigin Incident — one-command build.
#   LIB=<path to the lemo-opuscar library> sh build.sh            (default LIB: ~/lemo-opuscar)
# Needs: the library set up with `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps voice` and
#        `sh tools/fetch.sh instruments vsco2ce` + `vcsl`; Node 20+, ffmpeg, Python 3.11+.
# VOICE=1 also regenerates the narration (Kokoro) and re-runs the speech check.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the lemo-opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
mkdir -p "$LIB/films"; [ -e "$LIB/films/teigin" ] || ln -s "$HERE" "$LIB/films/teigin"
cd "$HERE"
if [ "$VOICE" = 1 ]; then
  mkdir -p voice/lines && "$PY" voice/gen.py
  "$PY" "$LIB/core/tts/asr_check.py" voice/lines.json voice/lines --lang en || echo "speech check: see output (names are expected to differ)"
  cp voice/lines/words.json voice/words.json
fi
python3 tools/timeline.py                                         # timeline.json: segments, sentence cues, subtitles
[ -f assets/ams_bombed.jpg ] || "$PY" tools/prep.py               # sources_img/ + raw/maps/ → assets/
(cd "$LIB" && node core/render/events.mjs films/teigin)           # events.json for the mix
(cd "$LIB" && node core/render/readcheck.mjs films/teigin --step 0.1)
node tools/subcheck.mjs
"$PY" mix.py                                                      # out/mix.wav
python3 - <<'PY'
import json; T = json.load(open('timeline.json')); c = {s['ch']: s['t0'] for s in T['segs'] if s['kind'] == 'card'}
b = [round(x * 30) / 30 for x in [0, c[7], c[12], c[17], T['dur']]]
open('out/ranges.txt', 'w').write(' '.join(f"{a:.4f},{z:.4f}" for a, z in zip(b, b[1:])))
PY
sh tools/render_parts.sh                                          # out/video.mp4 (30 fps)
mkdir -p final
sh "$LIB/core/render/mux.sh" out/video.mp4 out/mix.wav final/teigin_documentary.mp4 30 0
python3 -c "import json; T=json.load(open('timeline.json')); json.dump([{'t0':s['t0'],'t1':s['t1'],'text':s['text']} for s in T['subs']], open('out/cues.json','w'), ensure_ascii=False)"
"$PY" "$LIB/core/render/srt.py" out/cues.json final/teigin_documentary.srt
ffmpeg -y -loglevel error -ss 1144 -i final/teigin_documentary.mp4 -frames:v 1 -q:v 2 poster.jpg
echo "done: final/teigin_documentary.mp4"
