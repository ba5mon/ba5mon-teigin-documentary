"""Fetch Commons originals straight from upload.wikimedia.org (md5 path), with polite backoff.
usage: python3 commons_fetch.py out_dir "File name.jpg=name" ..."""
import hashlib, sys, time, urllib.parse, urllib.request
from pathlib import Path
UA = "TeiginDocumentary/1.0 (https://github.com/ba5mon/ba5mon-teigin-documentary) python-urllib"
out = Path(sys.argv[1]); out.mkdir(exist_ok=True)
for spec in sys.argv[2:]:
    fname, name = spec.rsplit("=", 1)
    u = fname.replace(" ", "_"); h = hashlib.md5(u.encode()).hexdigest()
    ext = Path(u).suffix.lower().replace(".jpeg", ".jpg")
    dest = out / f"{name}{ext}"
    if dest.exists(): print("have", dest); continue
    q = urllib.parse.quote(u)
    for k, size in enumerate([1920, 1280, 960, 500, 1280, 960]):     # standard thumbnail widths (originals are rate-limited)
        url = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{h[0]}/{h[:2]}/{q}/{size}px-{q}"
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120).read()
            dest.write_bytes(data); print("ok", dest, size, len(data), flush=True); break
        except Exception as e:
            print("retry", name, size, e, flush=True); time.sleep(5 if "404" in str(e) or "400" in str(e) else 20)
    time.sleep(15)
