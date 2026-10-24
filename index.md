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
3. Die erste Station ist dadurch offen — anklicken und bearbeiten.
4. Fünf Aufgaben lösen (Multiple Choice, Skizze zuordnen, Richtig/Falsch,
   Lückentext, Freitext). Jede bringt Punkte.
5. Mit dem Aufdruck die nächste Station öffnen, bis alle fünf Symbole beisammen sind.
6. Das Schloss öffnen und am Ende: Punkte als CSV, das Tagebuch als Text und die
   Freitexte zur Bewertung als JSON herunterladen.

## Die Aufgaben

Jede Station trägt fünf Aufgaben von unterschiedlichem Typ. Die Typen liegen in
`assets/aufgaben.js`; ein neuer Typ braucht dort einen Eintrag mit Name und
Prüffunktion, Logik und Oberfläche fragen das Verzeichnis ab.

| Typ | Was die Gruppe tun muss | Punkte |
|---|---|---|
| `mc` | Vier Antworten, eine anklicken | 8 |
| `zuordnung` | Begriffe auf nummerierte Felder einer Skizze ziehen | 8 |
| `richtig_falsch` | Aussagen einzeln bewerten | 6 |
| `lueckentext` | Wörter in die Lücken setzen | 8 |
| `wortgitter` | Buchstaben in ein Raster | 8 |
| `fehler` | Fehlstellen anklicken | 6 |
| `freitext` | Antwort schreiben, die bewertet wird | 10 |

Eine halb richtige Lösung bringt Teilpunkte. Eine gelöste Aufgabe bleibt stehen
und zeigt ihre Erklärung.

## Die Freitext-Bewertung

Eine Freitext-Antwort zählt als gelöst, sobald sie abgeschickt ist. Ihre Punkte
folgen mit der Bewertung. Zwei Wege:

- **Weg B (empfohlen):** „Freitexte zur Bewertung" lädt eine JSON-Datei mit Gruppe,
  Station, Frage, Kriterien, Maximum und Antwort herunter. Diese bewerten und das
  Ergebnis mit „Bewertungen einlesen" zurück ins Spiel laden.
- **Weg A:** ein lokaler Bewertungsdienst auf einem Rechner, den alle Gruppen
  erreichen.

## Die Codekette

Die Gruppen arbeiten parallel. Jede bekommt einen Zettel mit einem Aufdruck und
dem Namen einer Station; die Kette läuft von dort zyklisch weiter.

    SUB    Anfang: ASCHE    gelöst → FUNKEN
    HOT    Anfang: FUNKEN   gelöst → WELLE
    MAAR   Anfang: WELLE    gelöst → TROPFEN
    LIP    Anfang: TROPFEN  gelöst → DECKE
    RISIKO Anfang: DECKE    gelöst → ASCHE

Die Aufdrücke stehen in `assets/inhalte.js` (`startcodes`, `code_naechste`,
`schloss.code`) und lassen sich dort ändern. Die Lehrkraft sieht alle Aufdrücke
über „Lehrkraft: Codes anzeigen“ im Abschnitt Auswertung.

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
- [x] Parallele Startweise: jede Gruppe wählt eine Startstation, der Aufdruck muss
      dazu passen, die Kette läuft zyklisch von dort weiter
- [x] Fünf Aufgaben pro Station, unterschiedlich je Station
- [x] Aufgabentypen-System: sieben Typen mit eigenen Prüffunktionen
- [x] Skizzen als SVG (erste: Schichtvulkan im Querschnitt)
- [x] Freitext-Bewertung über eine Bewertungsdatei (Weg B) — Import und Export
- [x] CSV: neun Spalten inkl. gelöster Aufgaben und bewerteter Freitexte
- [x] 197 Prüfungen bestanden (110 Kette + 87 Aufgaben)
- [x] Ende-zu-Ende im Browser: paralleler Start am Hot-Spot, falscher Aufdruck
      abgelehnt, Station gelöst, Aufdruck zum nächsten, keine Konsolenfehler
- [x] Weg A gebaut: lokaler Bewertungsdienst, Schlüssel in `local/` (ignoriert)
- [ ] Die übrigen vier Stationen mit den neuen Aufgabentypen füllen
- [ ] Balancing mit einer echten Klasse prüfen

## Nächster Schritt

Station 2 bis 5 mit den neuen Aufgabentypen füllen. Dazu braucht es vier weitere
Skizzen: Hot-Spot mit Inselkette, Maar, Decken-Schichten, Risikomodelle. Die
Gruppen arbeiten parallel, deshalb entfällt der Zeitdruck, der bei einer festen
Reihenfolge bestanden hätte — jede Gruppe läuft ihre eigene Kette durch.

Für eine echte Stunde: `local/konfiguration.json` anlegen (Vorlage liegt daneben),
dann `python scripts/bewerten.py` starten. Ohne Schlüssel bleibt Weg B.

