#!/usr/bin/env python3
"""Erzeugt aus Natural Earth (Public Domain) die Weltkarte des Vulkanspiels.

Quelle: https://www.naturalearthdata.com/ — Public Domain, keine Namensnennung noetig.
Heruntergeladen als ne_110m_land.geojson (110m-Aufloesung, 138 KB).

Das Skript projiziert die Laender in eine Aequator-Entfernung (equirectangular)
auf 1000 x 500 Pixel und schreibt die Umriss-Pfade als SVG.

Ausgabe: assets/weltkarte.txt (reiner SVG-Pfadtext, wird inline in index.html
eingebunden, damit das Spiel auch per Doppelklick (file://) laeuft).

Aufruf: python scripts/weltkarte_bauen.py <ne_110m_land.geojson> <ausgabe.txt>
"""
import json
import sys
from pathlib import Path

BREITE = 1000.0
HOEHE = 500.0


def projiziere(lon: float, lat: float) -> tuple:
    """Aequator-Entfernung: x = (lon + 180) / 360 * BREITE, y = (90 - lat) / 180 * HOEHE."""
    x = (lon + 180.0) / 360.0 * BREITE
    y = (90.0 - lat) / 180.0 * HOEHE
    return x, y


def runde(zahl: float) -> str:
    """Rundet auf eine Nachkommastelle und entfernt ueberfluessige Nullen."""
    s = f"{zahl:.1f}"
    return s[:-2] if s.endswith(".0") else s


def ringe_zu_pfad(ringe: list) -> str:
    """Wandelt eine Liste von [lon, lat] in einen SVG-Pfad."""
    teile = []
    for i, pkt in enumerate(ringe):
        x, y = projiziere(pkt[0], pkt[1])
        befehl = "M" if i == 0 else "L"
        teile.append(f"{befehl}{runde(x)},{runde(y)}")
    teile.append("Z")
    return "".join(teile)


def geometrie_zu_pfad(geometrie: dict) -> str:
    """Polygon oder MultiPolygon."""
    if geometrie["type"] == "Polygon":
        return " ".join(ringe_zu_pfad(r) for r in geometrie["coordinates"])
    if geometrie["type"] == "MultiPolygon":
        return " ".join(
            ringe_zu_pfad(r) for poly in geometrie["coordinates"] for r in poly
        )
    raise ValueError("Unbekannter Geometrietyp: " + geometrie["type"])


def main() -> int:
    if len(sys.argv) != 3:
        print("Aufruf: weltkarte_bauen.py <ne_110m_land.geojson> <ausgabe.txt>")
        return 2

    quelle = Path(sys.argv[1])
    ziel = Path(sys.argv[2])
    daten = json.loads(quelle.read_text(encoding="utf-8"))

    pfade = []
    for feature in daten["features"]:
        if feature.get("properties", {}).get("featurecla") != "Land":
            continue
        pfade.append(geometrie_zu_pfad(feature["geometry"]))

    inhalt = " ".join(pfade)
    ziel.write_text(inhalt, encoding="utf-8")

    print(f"Quelle:      {quelle} ({quelle.stat().st_size} Bytes)")
    print(f"Land-Objekte: {len(pfade)}")
    print(f"Ausgabe:     {ziel} ({ziel.stat().st_size} Bytes)")
    print(f"viewBox:     0 0 {int(BREITE)} {int(HOEHE)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
