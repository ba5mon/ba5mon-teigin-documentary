#!/bin/sh
# review stills of single layouts: sh tools/stills.sh out.jpg ch.k:t ...   (t = local seconds)
LIB=${LIB:-/home/user/lemo-opuscar}; OUT=$1; shift; TMP=$(mktemp -d); i=0; LIST=""
for spec in "$@"; do i=$((i+1)); n=$(printf "%02d" $i); s=${spec%%:*}; t=${spec#*:}
  (cd "$LIB" && node core/render/still.mjs films/teigin "$t" --q "test=$s" --out "$TMP" --prefix "${n}_${s}_" >/dev/null 2>"$TMP/e$n") || { echo "FAIL $spec"; grep -v "GPU stall" "$TMP/e$n" | tail -4; }
  LIST="$LIST $(ls $TMP/${n}_*.jpg 2>/dev/null)"; done
"$LIB/.venv/bin/python" "$LIB/core/render/sheet.py" "$OUT" $LIST --cols 3 --w 640 >/dev/null && rm -rf "$TMP" && echo "$OUT"
