#!/usr/bin/env python3
"""Baut die Weltkarte des Vulkanspiels und bindet sie in index.html ein.

Der Umweg ueber ein Skript ist noetig, weil die Karte inline stehen muss: Ein
externes SVG kann unter file:// nicht per fetch() geladen werden.

Eingaben:
  assets/weltkarte.txt   Land-Pfade aus scripts/weltkarte_bauen.py
  assets/inhalte.js      Regions-Daten (Positionen, Farben, Kuerzel)

Ausgabe:
  index.html             mit der fertigen Karte im Abschnitt <div id="karte">

Die Regionspositionen stehen in assets/inhalte.js und werden hier ausgelesen,
damit Karte und Logik nicht auseinanderlaufen. Das Skript aendert deshalb nur
die Karte, nicht die Inhalte.

Aufruf: python scripts/karte_bauen.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KARTE_PFADE = ROOT / "assets" / "weltkarte.txt"
INHALTE = ROOT / "assets" / "inhalte.js"
INDEX = ROOT / "index.html"

BREITE = 1000.0
HOEHE = 500.0
REGION_RADIUS = 17.0


def lese_inhalte() -> dict:
    """Liest die Regionsdaten aus assets/inhalte.js.

    Die Datei ist JavaScript (window.VULKAN_STATIONEN = {...}), kein JSON.
    Die Regionen werden mit einem Ausdruck pro Region gelesen.
    """
    quelltext = INHALTE.read_text(encoding="utf-8")
    muster = re.compile(
        r'"id":\s*"(?P<id>[a-z]+)",\s*"nr":\s*\d+,\s*'
        r'"kuerzel":\s*"(?P<kuerzel>[A-Z]+)",\s*'
        r'"name":\s*"(?P<name>[^"]+)",\s*'
        r'"svg_id":\s*"(?P<svg_id>piece-[a-z]+)",\s*'
        r'"farbe":\s*"(?P<farbe>#[0-9a-fA-F]{6})",\s*'
        r'"figur":\s*\{\s*"x":\s*(?P<x>[\d.]+),\s*"y":\s*(?P<y>[\d.]+)\s*\}',
        re.DOTALL,
    )
    regionen = []
    for treffer in muster.finditer(quelltext):
        regionen.append({
            "id": treffer.group("id"),
            "kuerzel": treffer.group("kuerzel"),
            "name": treffer.group("name"),
            "svg_id": treffer.group("svg_id"),
            "farbe": treffer.group("farbe"),
            "x": float(treffer.group("x")),
            "y": float(treffer.group("y")),
        })
    return {"regionen": regionen}


def baue_svg(regionen: list, land_pfade: str) -> str:
    """Baut das vollstaendige Karten-SVG."""
    teile = []
    teile.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {int(BREITE)} {int(HOEHE)}" '
        f'role="img" aria-label="Weltkarte der Vulkangebiete" '
        f'style="width:100%;height:auto;background:#0d1b2a;border-radius:12px">'
    )
    teile.append(
        '<defs>'
        '<linearGradient id="ozean" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0%" stop-color="#16324f"/>'
        '<stop offset="100%" stop-color="#0d1b2a"/>'
        '</linearGradient>'
        '</defs>'
    )
    teile.append(f'<rect width="{int(BREITE)}" height="{int(HOEHE)}" fill="url(#ozean)"/>')

    # Gradnetz: Aequator, Wendekreise, Nullmeridian
    y_aequator = HOEHE / 2
    y_wende = HOEHE / 2 - (23.44 / 90.0) * (HOEHE / 2)
    teile.append('<g class="gradnetz">')
    teile.append(f'<line x1="0" y1="{y_wende:.1f}" x2="{int(BREITE)}" y2="{y_wende:.1f}" class="wendekreis"/>')
    teile.append(f'<line x1="0" y1="{HOEHE - y_wende:.1f}" x2="{int(BREITE)}" y2="{HOEHE - y_wende:.1f}" class="wendekreis"/>')
    teile.append(f'<line x1="0" y1="{y_aequator:.1f}" x2="{int(BREITE)}" y2="{y_aequator:.1f}" class="aequator"/>')
    teile.append(f'<line x1="{BREITE / 2:.1f}" y1="0" x2="{BREITE / 2:.1f}" y2="{int(HOEHE)}" class="nullmeridian"/>')
    teile.append('</g>')
    teile.append(f'<text x="10" y="{y_aequator - 6:.1f}" class="gradtext">Äquator</text>')
    teile.append(f'<text x="{BREITE / 2 + 6:.1f}" y="14" class="gradtext">0°</text>')
    teile.append(f'<text x="10" y="{y_wende - 6:.1f}" class="gradtext">23,5° N</text>')
    teile.append(f'<text x="10" y="{HOEHE - y_wende - 6:.1f}" class="gradtext">23,5° S</text>')

    # Landflaechen
    teile.append(f'<g class="laender"><path d="{land_pfade}"/></g>')

    # Regionen
    teile.append('<g class="regionen">')
    for r in regionen:
        teile.append(
            f'<g id="{r["svg_id"]}" class="region" data-region="{r["id"]}" data-farbe="{r["farbe"]}">'
        )
        teile.append(
            f'<circle cx="{r["x"]:.1f}" cy="{r["y"]:.1f}" r="{REGION_RADIUS}"/>'
        )
        teile.append(
            f'<text x="{r["x"]:.1f}" y="{r["y"] + REGION_RADIUS + 16:.1f}" '
            f'class="regionslabel">{r["kuerzel"]}</text>'
        )
        teile.append('</g>')
    teile.append('</g>')

    # Spielfigur
    teile.append('<g id="spielfigur" transform="translate(500,470)">')
    teile.append('<circle r="17" fill="#ffd28a" stroke="#0d1b2a" stroke-width="3"/>')
    teile.append('<text id="spielfigur-symbol" y="8" text-anchor="middle" font-size="22">🌋</text>')
    teile.append('</g>')

    # Legende
    teile.append('<g class="legende">')
    x = 16.0
    for r in regionen:
        teile.append(f'<circle cx="{x + 7:.1f}" cy="470" r="6" fill="{r["farbe"]}"/>')
        teile.append(
            f'<text x="{x + 18:.1f}" y="474" class="legendetext">{r["name"]}</text>'
        )
        x += 18.0 + len(r["name"]) * 6.1 + 24.0
    teile.append('</g>')

    teile.append('</svg>')
    return "".join(teile)


def ersetze_karte(index_text: str, svg: str) -> str:
    """Ersetzt den Inhalt von <div id="karte">...</div> durch das neue SVG."""
    muster = re.compile(r'(<div id="karte">).*?(</div>)', re.DOTALL)
    if not muster.search(index_text):
        raise SystemExit("Kein <div id=\"karte\"> in index.html gefunden.")
    return muster.sub(lambda m: m.group(1) + svg + m.group(2), index_text, count=1)


def main() -> int:
    if not KARTE_PFADE.exists():
        print("Fehlt: assets/weltkarte.txt — zuerst scripts/weltkarte_bauen.py ausfuehren.")
        return 2
    if not INHALTE.exists():
        print("Fehlt: assets/inhalte.js")
        return 2

    daten = lese_inhalte()
    regionen = daten["regionen"]
    if not regionen:
        raise SystemExit("Keine Regionen in assets/inhalte.js gefunden.")
    if len(regionen) != 5:
        print(f"Hinweis: {len(regionen)} Regionen gefunden (erwartet 5).")

    land_pfade = KARTE_PFADE.read_text(encoding="utf-8").strip()
    svg = baue_svg(regionen, land_pfade)

    index_text = INDEX.read_text(encoding="utf-8")
    neuer_text = ersetze_karte(index_text, svg)
    INDEX.write_text(neuer_text, encoding="utf-8")

    print(f"Regionen:     {len(regionen)}")
    for r in regionen:
        print(f"  {r['kuerzel']:7s} x={r['x']:7.1f} y={r['y']:6.1f}  {r['name']}")
    print(f"Land-Pfade:   {len(land_pfade)} Zeichen")
    print(f"SVG:          {len(svg)} Zeichen")
    print(f"index.html:   {INDEX.stat().st_size} Bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
