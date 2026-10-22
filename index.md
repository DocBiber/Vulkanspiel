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

## Schnellstart

1. `index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Gruppe anmelden: Spielfigur wählen, Name eingeben, 10 Startpunkte werden gutgeschrieben.
3. Eine Region auf der Weltkarte anklicken.
4. Zwei Fragen beantworten — richtig beantwortet deckt die Region farbig auf.
5. Eine Antwort ins Tagebuch schreiben.
6. Am Ende: Punkte als CSV und das Tagebuch als Text herunterladen.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche (Karte inline als SVG, Regionen, Fragen, Tagebuch, Export) |
| `assets/inhalte.js` | **Inhalte**: Regionen, Multiple-Choice-Fragen, Tagebuch-Fragen, Spielfiguren |
| `assets/logik.js` | Logik: Gruppen, Figuren, Fragen, Punkte, Fortschritt, Tagebuch, Export |
| `assets/oberflaeche.js` | Oberfläche: Anmeldung, Karte, Regionsbereich, Tagebuch, Auswertung |
| `assets/style.css` | Basis-Styles |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `scripts/pruefe_logik.js` | Testlauf der Logik (`node scripts/pruefe_logik.js`) |
| `log.md` | Änderungsjournal |

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
- [x] 60 Logik-Tests bestanden (`node scripts/pruefe_logik.js`)
- [x] Ende-zu-Ende-Durchlauf im Browser: alle 5 Regionen, 110 von 135 Punkten
- [ ] Balancing mit einer echten Klasse prüfen

## Nächster Schritt

Die 10 Multiple-Choice-Fragen und 5 Tagebuch-Fragen gegen die 45 Minuten testen und bei
Bedarf anpassen. Danach die alten Dateien der ersten Version aufräumen.

