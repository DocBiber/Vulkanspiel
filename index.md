---
title: Vulkanspiel — Übersicht und Start
created: 2026-10-21
updated: 2026-10-21
type: summary
tags: [vulkanismus, uebung, glazialmorphologie, vulnerabilitaet]
sources: []
---

# Vulkanspiel

Browser-Sammelspiel zur Wiederholung der physischen Geografie (LK Geografie, Gymnasium BW).
Eine Runde: 45 Minuten, 5 Gruppen, 5 Regionen auf einer Weltkarte.

Das Spiel orientiert sich am LMZ GeoPortal: Die Weltkarte ist das Spielfeld, jede richtige
Antwort deckt eine Region auf. Dazu gibt es Punkte, einen Wettbewerb, einen Fortschritt
(Spielstand) und ein Tagebuch mit Freitext-Antworten.

Die Gruppe bekommt am Anfang einen Zettel mit einem Aufdruck. Das Lösen einer Station
liefert das Symbol der Station und den Aufdruck der nächsten Station. Mit allen fünf
Symbolen lässt sich am Ende ein Schloss öffnen.

## Schnellstart

1. `index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Gruppe anmelden: Spielfigur wählen, Name eingeben, Aufdruck vom Zettel eintragen.
   10 Startpunkte werden gutgeschrieben.
3. Die erste Region ist dadurch offen — anklicken und bearbeiten.
4. Zwei Fragen beantworten — richtig beantwortet deckt die Station farbig auf und bringt
   das Symbol sowie den Aufdruck der nächsten Station.
5. Eine Antwort ins Tagebuch schreiben.
6. Mit dem Aufdruck die nächste Station öffnen, bis alle fünf Symbole beisammen sind.
7. Das Schloss öffnen und am Ende: Punkte als CSV und das Tagebuch als Text herunterladen.

## Die Codekette

    Zettel → ASCHE → Station 1 → FUNKEN → Station 2 → WELLE → Station 3
          → TROPFEN → Station 4 → DECKE → Station 5 → fünftes Symbol → Schloss

Die Aufdrucke stehen in `assets/inhalte.js` (`startcode`, `code_naechste`, `schloss.code`)
und lassen sich dort ändern. Die Lehrkraft sieht alle Aufdrücke über
„Lehrkraft: Codes anzeigen“ im Abschnitt Auswertung.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche (Weltkarte inline als SVG, Regionen, Fragen, Tagebuch, Export) |
| `assets/inhalte.js` | **Inhalte**: Regionen, Multiple-Choice-Fragen, Tagebuch-Fragen, Spielfiguren |
| `assets/weltkarte.txt` | Land-Pfade der Weltkarte (aus Natural Earth erzeugt) |
| `assets/logik.js` | Logik: Gruppen, Figuren, Fragen, Punkte, Fortschritt, Tagebuch, Export |
| `assets/oberflaeche.js` | Oberfläche: Anmeldung, Karte, Regionsbereich, Tagebuch, Auswertung |
| `assets/style.css` | Basis-Styles |
| `scripts/weltkarte_bauen.py` | Erzeugt die Land-Pfade aus Natural Earth (Public Domain) |
| `scripts/karte_bauen.py` | Baut die Karte und bindet sie in `index.html` ein |
| `scripts/ne_110m_land.geojson` | Rohdaten der Weltkarte (Natural Earth 110m, Public Domain) |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `scripts/pruefe_kette.js` | Testlauf der Logik inkl. Codekette und Schloss (`node scripts/pruefe_kette.js`) |
| `scripts/pruefe_logik.js` | Älterer Testlauf der Logik (Version 3, ohne Codekette) |
| `log.md` | Änderungsjournal |

Die Weltkarte ist keine Zeichnung, sondern echte Geodaten: Natural Earth 110m
(Public Domain). `scripts/weltkarte_bauen.py` wandelt die Land-Pfade in eine
Äquator-Entfernung um, `scripts/karte_bauen.py` setzt daraus die Karte zusammen
(Gradnetz, Regionen, Figur, Legende) und bindet sie in `index.html` ein. Die
Karte muss inline stehen, weil ein externes SVG unter `file://` nicht per
`fetch()` geladen werden kann.

Die Regionen liegen an geografisch korrekten Stellen:

| Region | Ort | Koordinaten |
|---|---|---|
| SUB | Anden, Peru-Chile | 75° W, 15° S |
| HOT | Hawaii | 155° W, 20° N |
| MAAR | Eifel | 7° O, 50° N |
| LIP | Deccan-Trapp, Indien | 76° O, 19° N |
| RISIKO | Nyiragongo, DR Kongo | 29° O, 1,5° S |

Die Inhalte liegen in `assets/inhalte.js`, die Weltkarte ist als SVG direkt in `index.html`
eingebettet. Beides wird per `<script src>` beziehungsweise inline eingebunden und nicht
per `fetch()` geladen — dadurch funktioniert das Spiel auch per Doppelklick über `file://`.

## Regionen im Überblick

| Nr. | Kürzel | Region | Thema |
|---|---|---|---|
| 1 | SUB | Subduktionszonen des Pazifiks | Schichtvulkan, explosiver Vulkanismus |
| 2 | HOT | Hawaii-Hot-Spot | Schildvulkan, effusiver Vulkanismus |
| 3 | MAAR | Maar-Feld der Eifel | Phreatomagmatische Explosion |
| 4 | LIP | Deccan-Trapp, Indien | Vulkanische Decken, Klimawirkung |
| 5 | RISIKO | Nyiragongo und Goma | Risiko, Exposition, Vulnerabilität |

## Status

- [x] Regeln festgelegt
- [x] Karte als Spielfeld mit fünf klickbaren Regionen
- [x] 10 Multiple-Choice-Fragen mit Erklärungen (2 pro Region)
- [x] 5 offene Tagebuch-Fragen mit Freitext-Antworten
- [x] Spielfiguren wählbar, Figur wandert auf der Karte
- [x] Punkte (je 10 pro richtiger Frage, 5 pro Tagebuch-Abgabe) und Fortschritt
- [x] Tagebuch aller Gruppen mit Text-Export
- [x] Punkte-Export als CSV (Semikolon, UTF-8 mit BOM)
- [x] Codekette: Startcode auf dem Zettel, jeder gelöste Station liefert den Folgencode
- [x] Symbole pro Station und Schloss mit Bonuspunkten und Abschluss-Code
- [x] Lehrkraft-Übersicht zeigt alle Aufdrücke
- [x] 80 Logik-Tests bestanden (`node scripts/pruefe_kette.js`)
- [x] Ende-zu-Ende-Durchlauf im Browser: Startcode, Kette, 5 Symbole, Schloss, Auswertung
- [ ] Balancing mit einer echten Klasse prüfen

## Nächster Schritt

Den Ablauf mit einer echten Klasse testen: 45 Minuten reichen für fünf Stationen
à 2 Fragen und eine Tagebuch-Frage nur, wenn die Gruppen wirklich in dieser Reihenfolge
arbeiten. Danach die alten Dateien der ersten Version aufräumen.

