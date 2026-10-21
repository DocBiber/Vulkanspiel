---
title: Vulkanspiel — Spielregeln und Konventionen
created: 2026-10-21
updated: 2026-10-21
type: query
tags: [vulkanismus, uebung, glazialmorphologie, vulnerabilitaet]
sources: [C:/Users/raine/wiki-geographie-lk/concepts/vulkanprozesse.md, C:/Users/raine/wiki-geographie-lk/entities/vulkanarten.md]
---

# Vulkanspiel — Spielregeln und Konventionen

Sammelspiel zur Wiederholung der physischen Geografie (LK Gymnasium, Bildungsplan 2016 BW).
Browser-Game, läuft ohne Installation und ohne Internetverbindung. Eine Runde dauert 45 Minuten.

## Ziel der Schülerinnen und Schüler

Stellt euch vor, ihr seid ein Forschungsteam, das die Vulkangebiete der Erde kartiert.
An jeder Station der Klasse erwartet euch eine Aufgabe. Wer sie löst, erhält von der
Lehrkraft einen Kurzcode. Der Code schaltet ein Kartenstück der Weltkarte frei.
Wer am Ende die vollständige Karte zusammensetzt und am meisten Punkte hat, gewinnt.

## 1. Material und Anmeldung

1. Jede Gruppe (5 Gruppen à 3 bis 5 Schülerinnen und Schüler) bekommt einen Gruppennamen
   und ein Startkapital von 10 Punkten.
2. An jeder Station hängt ein Aufgabenzettel (siehe `data/stationen.json`).
3. Die Weltkarte liegt am Anfang nur als Umriss auf dem Bildschirm.

## 2. Aufbau einer Station

An jeder Station hängt ein Aufgabenzettel. Jede Station hat:

- eine Stationsnummer (1 bis 5),
- einen Aufgabentext (2 bis 4 Sätze),
- eine erwartete Begründung in 2 bis 3 Sätzen.

Die Aufgabe ist bewusst offen: Richtig ist, was fachlich stimmt und nachvollziehbar
begründet ist. Es gibt nicht nur eine richtige Lösung, aber es gibt falsche.

## 3. Ablauf eines Stationsbesuchs

1. Die Gruppe liest die Aufgabe und bespricht die Lösung.
2. Ein Vertreter legt die Lösung bei der Lehrkraft vor.
3. Die Lehrkraft prüft mündlich: Ist die Begründung fachlich stimmig? Reicht sie?
4. Bei Erfolg klickt die Lehrkraft „Station freigeben“ und liest der Gruppe den
   angezeigten Kurzcode vor.
5. Die Gruppe trägt den Code im Eingabefeld der Station ein.
6. Das Kartenstück erscheint auf der Karte. Die Gruppe bekommt Punkte.

Der Code wird erst nach dem Klick auf „Code anzeigen“ sichtbar und ist ausschließlich
für die Lehrkraft bestimmt. Das Eingabefeld bleibt gesperrt, bis die Station freigegeben
ist, und wird nach dem Öffnen des Kartenstücks wieder gesperrt.

## 4. Kurzcodes

Jede Station hat genau einen Kurzcode aus vier Zeichen.
Es werden nur die Buchstaben A bis Z verwendet, ohne I und O — damit
keine Verwechslung mit 1 und 0 entsteht.

Die Codes werden beim ersten Start des Spiels zufällig erzeugt und im Browser
(localStorage) abgelegt. Es gibt 24 mögliche Zeichen pro Stelle, also
24 hoch 4 = 331.776 mögliche Codes. Die Codes sind nicht ableitbar und nicht ratbar.

Jeder Code öffnet genau das Kartenstück seiner Station. Codes anderer Stationen werden
nicht akzeptiert.

## 5. Punkte

| Leistung | Punkte |
|---|---|
| Station gelöst und Code eingegeben | 10 |
| Begründung vollständig (2 bis 3 Sätze, Fachbegriffe korrekt) | +5 |
| Station als Erste gelöst | +3 |
| Code falsch eingegeben | 0 für diesen Versuch, −5 für die Gruppe |
| Code einer anderen Station verwendet | −5 |

Höchstpunktzahl pro Gruppe: 5 Stationen × 18 Punkte + 10 Startpunkte = 100.

## 6. Sicherungen gegen Schummeln

- Kartenstücke werden nur vergeben, wenn eine Gruppe tatsächlich eine Begründung
  vorgelegt hat. Die Freigabe erfolgt ausschließlich durch die Lehrkraft.
- Codes sind an die Station gebunden: Der Code der Station 3 öffnet nur
  das Kartenstück der Station 3.
- Die Weltkarte zeigt bei einem falschen Code einen Hinweis, vergibt aber keine
  Stücke. So erfährt niemand, welches Stück hinter welchem Code steckt.
- Die Punkteübersicht listet nur Punkte, nicht aber die Codes. Codes werden
  nicht an andere Gruppen weitergegeben.
- Wer eine Station bereits besucht hat, bekommt keinen zweiten Code für
  dieselbe Station.
- Ein falscher Code kostet Punkte, schließt die Gruppe aber nicht aus —
  das Spiel läuft weiter.

## 7. Zeitplan (45 Minuten)

| Phase | Dauer |
|---|---|
| Einstieg: Spielregeln, Karte erklären | 5 min |
| Stationenarbeit (5 Stationen) | 25 min |
| Karten zusammensetzen, Auswertung | 10 min |
| Auswertung der Punkte, Gewinner, Reflexion | 5 min |

## 8. Technik

- Eine einzige HTML-Datei genügt, die das Spiel komplett enthält: `index.html`.
- Keine Installation, kein Server, kein Internet.
- Die Weltkarte ist als SVG direkt in `index.html` eingebettet, funktioniert also
  auch per Doppelklick ohne Server.
- Die Punkte werden im Browser gespeichert (localStorage).
- Am Ende der Stunde wird die Punkteübersicht als CSV-Datei exportiert
  (Semikolon-getrennt, UTF-8 mit BOM für Excel).

## 9. Kompetenzbezug (Bildungsplan 2016)

- **Orientierungskompetenz:** Einordnen von Vulkanräumen und Gefahrenmustern.
- **Analysekompetenz:** Zusammenhänge zwischen Magmazusammensetzung, Eruptionsstil
  und Gefahren erklären.
- **Urteilskompetenz:** Bewerten, welche Risikomaßnahmen in einem Raum sinnvoll sind.
- **Methodenkompetenz:** Karten lesen, Prozesse modellieren.
