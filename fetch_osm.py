#!/usr/bin/env python3
"""
fetch_osm.py — regenerate public/districts.geojson from OpenStreetMap.

Queries the public Overpass API for the boundary of each Ho Chi Minh City
district used by the Explore district map, and writes a FeatureCollection
in the same shape the app already expects: one Feature per district with
properties {id, name} and a Polygon/MultiPolygon geometry.

The district id -> OSM boundary name pairs below must stay in sync with
DIST_OSM_NAMES in src/App.tsx — that's what the app uses to match this
file's features back to D1/D2/.../PN. District 2 was absorbed into Thu
Duc City in 2021, so its OSM boundary is Thu Duc City's actual (much
larger) shape, not old District 2 — the app already carries a caveat
about this in DIST_MAP_CAVEATS.

Requires: requests, osm2geojson
    pip install -r requirements.txt

Run from the repo root:
    python3 fetch_osm.py
"""

import json
import sys
import time

import requests

try:
    import osm2geojson
except ImportError:
    sys.exit(
        "Missing dependency 'osm2geojson'. Install with:\n"
        "    pip install -r requirements.txt"
    )

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OUTPUT_PATH = "public/districts.geojson"
REQUEST_TIMEOUT = 90
POLITE_DELAY_SECONDS = 1  # Overpass's public instance asks for spacing between queries

# (our district id, OSM administrative boundary name) — keep in sync with
# DIST_OSM_NAMES in src/App.tsx.
DISTRICTS = [
    ("D1", "Quận 1"),
    ("D2", "Thành phố Thủ Đức"),  # absorbed old District 2 + District 9 in 2021
    ("D3", "Quận 3"),
    ("D4", "Quận 4"),
    ("D5", "Quận 5"),
    ("D7", "Quận 7"),
    ("BT", "Quận Bình Thạnh"),
    ("PN", "Quận Phú Nhuận"),
]


def fetch_boundary(osm_name):
    """Ask Overpass for the named administrative boundary inside Ho Chi Minh City."""
    query = f"""
    [out:json][timeout:{REQUEST_TIMEOUT}];
    area["name"="Thành phố Hồ Chí Minh"]["boundary"="administrative"]->.hcmc;
    relation["boundary"="administrative"]["name"="{osm_name}"](area.hcmc);
    out body;
    >;
    out skel qt;
    """
    resp = requests.post(OVERPASS_URL, data={"data": query}, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def largest_polygon(geojson_features):
    """An administrative relation can convert into several feature fragments;
    the boundary itself is the one with the most geometry data."""
    polys = [f for f in geojson_features if f["geometry"]["type"] in ("Polygon", "MultiPolygon")]
    if not polys:
        return None
    return max(polys, key=lambda f: len(json.dumps(f["geometry"])))


def main():
    features = []
    for our_id, osm_name in DISTRICTS:
        print(f"Fetching {our_id} ({osm_name})...", file=sys.stderr)
        try:
            raw = fetch_boundary(osm_name)
        except requests.RequestException as e:
            print(f"  ERROR: request failed for {our_id} ({osm_name}): {e}", file=sys.stderr)
            continue

        converted = osm2geojson.json2geojson(raw)
        best = largest_polygon(converted["features"])
        if best is None:
            print(f"  WARNING: no polygon found for {our_id} ({osm_name}) — skipping", file=sys.stderr)
            continue

        geometry = best["geometry"]
        if geometry["type"] == "Polygon":
            geometry = {"type": "MultiPolygon", "coordinates": [geometry["coordinates"]]}

        features.append({
            "type": "Feature",
            "properties": {"id": our_id, "name": osm_name},
            "geometry": geometry,
        })
        time.sleep(POLITE_DELAY_SECONDS)

    found_ids = {f["properties"]["id"] for f in features}
    missing = [d for d, _ in DISTRICTS if d not in found_ids]
    if missing:
        print(f"WARNING: missing boundaries for {missing} — districts.geojson will be incomplete "
              "for these; the app's district map simply won't show a shape for them.", file=sys.stderr)

    if not features:
        sys.exit("No boundaries fetched — not overwriting an existing districts.geojson with nothing.")

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": features}, f, ensure_ascii=False)

    print(f"Wrote {OUTPUT_PATH} ({len(features)}/{len(DISTRICTS)} districts)", file=sys.stderr)


if __name__ == "__main__":
    main()
