#!/usr/bin/env python3
"""One-step setup for Kote Homestay. Run from this folder:

  python3 configure.py --domain https://www.kotehomestay.com --whatsapp 9194802 01679 \
      --phone "+91 94802 01679" --instagram kotehomestay \
      --map "Kote Homestay, Halegadaka estate Durgadahalli village, post, Sunkasale, Mudigere, Karnataka 577121" --place-id ChIJxxxx --maps-key AIza...

Only --domain is needed to make the SEO files correct; every other option is optional.
Re-running is safe: it replaces the placeholders, or the values set by an earlier run."""
import argparse, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
ap = argparse.ArgumentParser()
ap.add_argument("--domain", help="site address, e.g. https://www.kotehomestay.com")
ap.add_argument("--whatsapp", help="country code + number, digits only, e.g. 919480201679")
ap.add_argument("--phone", help='phone as shown to visitors, e.g. "+91 94802 01679"')
ap.add_argument("--instagram", help="Instagram handle without @kotehomestay")
ap.add_argument("--map", help='place name or "lat,lng" for the map')
ap.add_argument("--place-id", help="Google Place ID (for live reviews)")
ap.add_argument("--maps-key", help="Google Maps browser API key (for live reviews)")
a = ap.parse_args()

def sub(path, pairs):
    p = ROOT / path
    s = p.read_text(encoding="utf-8")
    for pat, rep in pairs:
        s = re.sub(pat, lambda m: rep(m) if callable(rep) else rep, s)
    p.write_text(s, encoding="utf-8")

if a.domain:
    d = a.domain.rstrip("/")
    if not d.startswith("https://"):
        sys.exit("The domain must start with https://")
    mark = ROOT / ".domain"
    prev = mark.read_text().strip() if mark.exists() else ""
    pattern = re.escape("https://YOUR-DOMAIN") + (("|" + re.escape(prev)) if prev else "")
    for f in ("index.html", "robots.txt", "sitemap.xml"):
        sub(f, [(pattern, d)])
    (ROOT / ".domain").write_text(d)

cfg = []
def setv(key, val):
    cfg.append((rf'(\b{key}:\s*)"[^"]*"', lambda m, v=val: m.group(1) + '"' + v.replace("\\", "\\\\").replace('"', '\\"') + '"'))
if a.whatsapp: setv("whatsapp", re.sub(r"\D", "", a.whatsapp))
if a.phone: setv("phoneDisplay", a.phone)
if a.instagram: setv("instagram", a.instagram.lstrip("@"))
if a.map: setv("mapQuery", a.map)
if a.place_id: setv("googlePlaceId", a.place_id)
if a.maps_key: setv("googleMapsApiKey", a.maps_key)
if cfg: sub("js/app.js", cfg)

if a.instagram:
    h = a.instagram.lstrip("@")
    sub("index.html", [(r"https://www\.instagram\.com/[^\"\s]+/", f"https://www.instagram.com/{h}/")])
print("Done. Open index.html through your web host to check.")
