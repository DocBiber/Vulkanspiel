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
Eine Runde: 45 Minuten, 5 Gruppen, 5 Stationen.

## Schnellstart

1. `index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Gruppe anmelden: Name eingeben, 10 Startpunkte werden gutgeschrieben.
3. Aufgabenzettel an den Stationen in der Klasse auslegen.
4. Gruppe löst Aufgabe, Lehrkraft gibt Kurzcode bekannt.
5. Code in der Kartenansicht eingeben → Kartenstück erscheint.
6. Am Ende: Punkteübersicht als CSV exportieren.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche (Karte inline als SVG, Stationen, Punkte, Export) |
| `assets/stationen.js` | **Aufgaben**: Auftrag, Lösungshinweis, Prüfkriterien je Station |
| `assets/spiel.js` | Spiel-Logik: Gruppen, Punkte, Codes, CSV |
| `assets/ui.js` | Oberfläche: Anmeldung, Stationen, Karte, Export |
| `assets/style.css` | Basis-Styles |
| `data/stationen.json` | Lesbare Kopie der Aufgaben (der Test prüft die Gleichheit) |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `scripts/pruefe_spiel.js` | Testlauf der Logik (`node scripts/pruefe_spiel.js`) |
| `log.md` | Änderungsjournal |

Die Aufgaben liegen in `assets/stationen.js`. Sie werden per `<script src>` eingebunden
und nicht per `fetch()` geladen — dadurch funktioniert das Spiel auch per Doppelklick
über `file://`. Die Oberfläche zeigt den Auftrag jeder Station an; Lösungshinweis und
Prüfkriterien stehen in einem aufklappbaren Abschnitt für die Lehrkraft.

`data/stationen.json` ist eine lesbare Kopie derselben Aufgaben. Der Test
`scripts/pruefe_spiel.js` vergleicht beide Dateien und schlägt fehl, sobald sie
auseinanderlaufen.

Die Weltkarte ist als SVG direkt in `index.html` eingebettet, ebenfalls wegen `file://`.

## Stationen im Überblick

| Nr. | Kürzel | Thema | Station im Raum |
|---|---|---|---|
| 1 | SUB | Vulkanismus an Subduktionszonen | Tafelbereich Nord |
| 2 | HOT | Schildvulkane und Hot Spots | Fensterbereich West |
| 3 | MAAR | Maare und Vulkanfelder | Regalbereich |
| 4 | LIP | Vulkanische Decken (LIPs) | Türbereich Süd |
| 5 | RISIKO | Risiko und Vulnerabilität | Mitte |

## Status

- [x] Regeln festgelegt
- [x] 5 Stationen mit Aufgaben, Lösungshinweisen und Prüfkriterien
- [x] Codes: zufällig, einmalig pro Station, im Browser abgelegt
- [x] Karte als SVG mit fünf Kartenstücken
- [x] Spiel-Oberfläche (Anmeldung, Stationen, Karte, Auswertung)
- [x] CSV-Export (Semikolon, UTF-8 mit BOM)
- [x] 51 Logik-Tests bestanden (`node scripts/pruefe_spiel.js`)
- [x] Ende-zu-Ende-Durchlauf im Browser: 5 Stationen, 85 von 100 Punkten
- [ ] Balancing mit einer echten Klasse prüfen
- [ ] Aufgabenzettel als Ausdruck-Vorlage (PDF oder HTML)

## Nächster Schritt

Schritt 2: Ausdruck-Vorlage für die Aufgabenzettel bauen, damit die Stationen
im Klassenraum ausliegen können, und die Punktezahlen mit einer echten Klasse
gegen die 45 Minuten testen.
