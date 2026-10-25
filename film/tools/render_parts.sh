#!/bin/sh
# render the picture in act-sized parts (re-render one part after a fix), then join losslessly
LIB=${LIB:-/home/user/lemo-opuscar}; HERE=$(cd "$(dirname "$0")/.." && pwd); i=0
for r in $(cat "$HERE/out/ranges.txt"); do i=$((i+1))
  if [ -z "$ONLY" ] || [ "$ONLY" = "$i" ]; then (cd "$LIB" && node core/render/video.mjs films/teigin --fps 30 --workers 4 --q "range=$r" --out "$HERE/out/part$i.mp4") || exit 1; fi
done
cd "$HERE/out" && ls part*.mp4 | sort | sed "s/^/file '/; s/$/'/" > parts.txt && ffmpeg -y -loglevel error -f concat -safe 0 -i parts.txt -c copy video.mp4 && echo joined
