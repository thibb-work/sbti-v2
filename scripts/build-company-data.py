#!/usr/bin/env python3
"""Regenerate assets/data/sbti-companies.json from the official SBTi download.

The hero "Find your company's target" search runs entirely client-side over a
compact positional-array JSON. This script downloads the by-company workbook
from the SBTi Target Dashboard (refreshed every Thursday) and rebuilds that
JSON. Run it on a schedule (see .github/workflows/) and commit the result —
a changed file triggers a Vercel deploy.

    python3 scripts/build-company-data.py

Requires: openpyxl  (pip install openpyxl)
"""
import datetime
import io
import json
import os
import sys
import urllib.request

import openpyxl

SRC_URL = "https://files.sciencebasedtargets.org/production/files/companies-excel.xlsx"
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "data", "sbti-companies.json")

# Source workbook columns we keep, in output order. Keep in sync with the `C`
# map and `cols` array in assets/target-lookup.js.
SRC_IDX = [1, 5, 6, 7, 4, 8, 9, 10, 11, 12, 13, 14, 15, 17, 16, 21]
COLS = [
    "name", "location", "region", "sector", "org_type",
    "nt_status", "nt_class", "nt_year",
    "lt_status", "lt_class", "lt_year",
    "nz_status", "nz_year", "ba15_status",
    "target_language", "date_updated",
]


def cell(v):
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    if isinstance(v, datetime.datetime):
        return v.strftime("%Y-%m-%d")
    return str(v).strip()


def main():
    print(f"Downloading {SRC_URL} …", file=sys.stderr)
    raw = urllib.request.urlopen(SRC_URL, timeout=120).read()
    wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True)
    ws = wb["Data"]

    rows_iter = ws.iter_rows(values_only=True)
    next(rows_iter)  # header

    out = []
    for r in rows_iter:
        if not r or r[1] in (None, ""):
            continue
        out.append([cell(r[i]) for i in SRC_IDX])

    out.sort(key=lambda x: x[0].lower())

    doc = {
        "source": "https://sciencebasedtargets.org/target-dashboard",
        "file": "companies-excel.xlsx",
        "generated": datetime.date.today().isoformat(),
        "count": len(out),
        "cols": COLS,
        "rows": out,
    }

    out_path = os.path.normpath(OUT_PATH)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))

    size_mb = os.path.getsize(out_path) / 1e6
    print(f"Wrote {len(out)} companies to {out_path} ({size_mb:.2f} MB)", file=sys.stderr)


if __name__ == "__main__":
    main()
