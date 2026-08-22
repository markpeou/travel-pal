#!/usr/bin/env python3
"""
fetch_osm.py — pull ONE OpenStreetMap extract for Ho Chi Minh City.

Why one bulk query instead of 412 lookups:
  - Nominatim's usage policy forbids systematic/bulk geocoding. Overpass is the
    correct tool for "give me all POIs in this box with their tags".
  - 1 request instead of 412 = no rate-limit risk, no per-place API budget.
  - The extract is a file. Matching then runs offline, deterministically, and is
    re-runnable without touching the network again.

Run locally (Claude's sandbox has no network access):

    python3 fetch_osm.py                 # writes osm_hcmc.json
    python3 fetch_osm.py --out foo.json

Then upload the output back into the Travel Pal chat.
"""

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# Saigon bounding box — matches the bounds already used for coordinate
# validation in build_places.py (lat 10.6–10.9, lng 106.5–106.9).
BBOX = (10.60, 106.50, 10.92, 106.92)  # south, west, north, east

ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

# Only the POI classes Travel Pal actually has categories for:
# eat / drink / cafe / shop / exp
SELECTORS = [
    'node["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|nightclub|biergarten|marketplace)$"]',
    'way["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|food_court|nightclub|biergarten|marketplace)$"]',
    'node["shop"]',
    'way["shop"]',
    'node["tourism"~"^(museum|gallery|attraction|artwork|viewpoint|theme_park|zoo|aquarium)$"]',
    'way["tourism"~"^(museum|gallery|attraction|artwork|viewpoint|theme_park|zoo|aquarium)$"]',
    'node["leisure"~"^(park|garden|fitness_centre|spa|water_park)$"]',
    'way["leisure"~"^(park|garden|fitness_centre|spa|water_park)$"]',
    'node["historic"]',
    'way["historic"]',
    'node["amenity"~"^(place_of_worship|cinema|theatre|arts_centre|library)$"]',
    'way["amenity"~"^(place_of_worship|cinema|theatre|arts_centre|library)$"]',
]


def build_query(bbox, timeout=180):
    s, w, n, e = bbox
    box = f"({s},{w},{n},{e})"
    body = "\n  ".join(f"{sel}{box};" for sel in SELECTORS)
    return f"[out:json][timeout:{timeout}];\n(\n  {body}\n);\nout center tags;"


def fetch(query, endpoints=ENDPOINTS, attempts=3):
    data = urllib.parse.urlencode({"data": query}).encode()
    last = None
    for endpoint in endpoints:
        for attempt in range(1, attempts + 1):
            try:
                print(f"  → {endpoint} (attempt {attempt})", file=sys.stderr)
                req = urllib.request.Request(
                    endpoint,
                    data=data,
                    headers={"User-Agent": "travel-pal-prototype/0.1 (github.com/markpeou/travel-pal)"},
                )
                with urllib.request.urlopen(req, timeout=600) as resp:
                    return json.loads(resp.read().decode("utf-8"))
            except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as err:
                last = err
                print(f"    failed: {err}", file=sys.stderr)
                # Overpass returns 429/504 under load. Back off, don't hammer.
                time.sleep(10 * attempt)
    raise SystemExit(f"All Overpass endpoints failed. Last error: {last}")


def normalise(raw):
    """Flatten Overpass elements to {id, type, lat, lng, tags}."""
    out = []
    for el in raw.get("elements", []):
        if el.get("type") == "node":
            lat, lng = el.get("lat"), el.get("lon")
        else:
            centre = el.get("center") or {}
            lat, lng = centre.get("lat"), centre.get("lon")
        if lat is None or lng is None:
            continue
        tags = el.get("tags") or {}
        if not tags:
            continue
        out.append(
            {
                "id": f"{el['type']}/{el['id']}",
                "type": el["type"],
                "lat": lat,
                "lng": lng,
                "tags": tags,
            }
        )
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="osm_hcmc.json")
    ap.add_argument("--raw", help="also write the unmodified Overpass response here")
    args = ap.parse_args()

    query = build_query(BBOX)
    print("Querying Overpass for HCMC POIs (this takes 30–120s)...", file=sys.stderr)
    raw = fetch(query)

    if args.raw:
        with open(args.raw, "w", encoding="utf-8") as fh:
            json.dump(raw, fh)
        print(f"Wrote raw response → {args.raw}", file=sys.stderr)

    elements = normalise(raw)

    named = sum(1 for e in elements if e["tags"].get("name"))
    payload = {
        "source": "OpenStreetMap via Overpass API",
        "licence": "ODbL 1.0 — attribution required in any UI that displays this data",
        "bbox": {"south": BBOX[0], "west": BBOX[1], "north": BBOX[2], "east": BBOX[3]},
        "fetched_at": time.strftime("%Y-%m-%d"),
        "count": len(elements),
        "named_count": named,
        "elements": elements,
    }

    with open(args.out, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False)

    print(f"\nWrote {args.out}", file=sys.stderr)
    print(f"  {len(elements):,} POIs ({named:,} with a name tag)", file=sys.stderr)
    print("\nUpload this file back into the Travel Pal chat.", file=sys.stderr)


if __name__ == "__main__":
    main()
