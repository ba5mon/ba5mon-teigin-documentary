#!/bin/sh
# mix → picture → master → checks (run from the film folder)
set -e
LIB=${LIB:-/home/user/lemo-opuscar}; cd "$(dirname "$0")/.."
"$LIB/.venv/bin/python" mix.py
rm -f out/part*.mp4 out/video.mp4
sh tools/render_parts.sh
sh "$LIB/core/render/mux.sh" out/video.mp4 out/mix.wav final/teigin_documentary.mp4 30 0
echo "--- black frames"; ffmpeg -hide_banner -i final/teigin_documentary.mp4 -vf blackdetect=d=0.1:pix_th=0.02 -an -f null - 2>&1 | grep -c blackdetect || true
echo "--- loudness"; ffmpeg -hide_banner -i final/teigin_documentary.mp4 -af ebur128=peak=true -vn -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)"
ffprobe -v error -show_entries format=duration -of csv=p=0 final/teigin_documentary.mp4
echo FINISHED
