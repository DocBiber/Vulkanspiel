---
title: Vulkanspiel — Spielregeln und Konventionen
created: 2026-10-21
updated: 2026-10-22
type: query
tags: [vulkanismus, uebung, glazialmorphologie, vulnerabilitaet]
sources: [C:/Users/raine/wiki-geographie-lk/concepts/vulkanprozesse.md, C:/Users/raine/wiki-geographie-lk/entities/vulkanarten.md]
---

# Vulkanspiel — Spielregeln und Konventionen

Sammelspiel zur Wiederholung der physischen Geografie (LK Gymnasium, Bildungsplan 2016 BW).
Browser-Game, läuft ohne Installation und ohne Internetverbindung. Eine Runde dauert 45 Minuten.

Das Spiel orientiert sich am LMZ GeoPortal (https://geo.lmz-bw.de/gu/vegetation/#/):
Die Weltkarte ist das Spielfeld, jede richtige Antwort deckt ein Stück davon auf.

## Ziel der Schülerinnen und Schüler

Ihr seid ein Forschungsteam, das die Vulkangebiete der Erde kartiert. Wählt euch eine
Spielfigur und klickt nacheinander die fünf Regionen auf der Weltkarte an. Pro Region
beantwortet ihr zwei Fragen und schreibt eine Antwort ins Tagebuch. Jede richtige Antwort
deckt die Region auf und bringt Punkte. Am Ende gewinnt die Gruppe mit den meisten Punkten.

## 1. Anmeldung

1. Jede Gruppe (5 Gruppen à 3 bis 5 Schülerinnen und Schüler) bekommt einen Gruppennamen,
   wählt eine Spielfigur und startet mit 10 Punkten.
2. Die Figur wandert auf der Karte zu jeder Region, die die Gruppe anklickt.

## 2. Ablauf in einer Region

1. Die Gruppe klickt eine Region auf der Weltkarte an.
2. Es erscheinen zwei Multiple-Choice-Fragen. Jede hat vier Antwortmöglichkeiten,
   genau eine ist richtig.
3. Eine richtige Antwort bringt 10 Punkte und wird mit einer Erklärung bestätigt.
   Eine falsche Antwort bringt keine Punkte; die Gruppe kann es erneut versuchen.
4. Sind beide Fragen richtig, wird die Region farbig aufgedeckt und zählt zum Fortschritt.
5. Danach gibt es eine offene Tagebuch-Frage. Die Gruppe schreibt ihre Antwort als Freitext
   ins Tagebuch. Eine Abgabe bringt 5 Punkte; die Antwort lässt sich danach ändern.

## 3. Punkte und Fortschritt

| Leistung | Punkte |
|---|---|
| Multiple-Choice-Frage richtig beantwortet | 10 |
| Tagebuch-Frage abgegeben | 5 |

Pro Region sind also 25 Punkte möglich. Höchstpunktzahl: 10 Startpunkte + 5 × 25 = 135.

Der Fortschritt (Spielstand) zeigt zusätzlich an, wieviele der fünf Regionen aufgedeckt sind.
Er steht in der Punktetabelle und ist in der CSV enthalten.

## 4. Das Tagebuch

Das Tagebuch sammelt die Freitext-Antworten aller Gruppen. Die Fragen sind bewusst offen,
keine davon hat eine einzige richtige Lösung:

- „Stell dir vor, du könntest an den Rand des Pazifischen Feuerrings reisen: Was würdest du unbedingt einpacken — und warum?"
- „Wie würdest du das Klima auf Hawaii mit nur drei Worten beschreiben?"
- „Welche Geräusche oder Gerüche stellst du dir an einem Maar-See vor?"
- „Was würdest du einer Freundin erzählen, wenn sie noch nie vom Deccan-Trapp gehört hat?"
- „Was würdest du tun, um die Menschen in Goma besser vor dem Vulkan zu schützen?"

Das Tagebuch lässt sich am Ende als Text herunterladen und kann so in die Stunde
einbezogen werden — etwa als Grundlage für eine Diskussion.

## 5. Die fünf Regionen

| Nr. | Kürzel | Region | Thema |
|---|---|---|---|
| 1 | SUB | Subduktionszonen des Pazifiks | Schichtvulkan, explosiver Vulkanismus |
| 2 | HOT | Hawaii-Hot-Spot | Schildvulkan, effusiver Vulkanismus |
| 3 | MAAR | Maar-Feld der Eifel | Phreatomagmatische Explosion |
| 4 | LIP | Deccan-Trapp, Indien | Vulkanische Decken, Klimawirkung |
| 5 | RISIKO | Nyiragongo und Goma | Risiko, Exposition, Vulnerabilität |

## 6. Zeitplan (45 Minuten)

| Phase | Dauer |
|---|---|
| Einstieg: Spielregeln, Karte erklären | 5 min |
| Regionen durcharbeiten (je 2 Fragen + 1 Tagebuch-Frage) | 25 min |
| Auswertung der Punkte und des Fortschritts | 10 min |
| Auswertung des Tagebuchs, Diskussion, Gewinner | 5 min |

## 7. Technik

- Eine einzige HTML-Datei genügt, die das Spiel komplett enthält: `index.html`.
- Keine Installation, kein Server, kein Internet.
- Die Weltkarte ist als SVG direkt in `index.html` eingebettet, funktioniert also
  auch per Doppelklick ohne Server.
- Die Inhalte (Regionen, Fragen, Spielfiguren) liegen in `assets/inhalte.js` und werden
  per `<script src>` geladen, ebenfalls ohne `fetch`.
- Punkte und Tagebuch werden im Browser gespeichert (localStorage).
- Am Ende der Stunde lassen sich Punkte als CSV (Semikolon, UTF-8 mit BOM für Excel)
  und das Tagebuch als Textdatei exportieren.

## 8. Kompetenzbezug (Bildungsplan 2016)

- **Orientierungskompetenz:** Einordnen von Vulkanräumen und Gefahrenmustern.
- **Analysekompetenz:** Zusammenhänge zwischen Magmazusammensetzung, Eruptionsstil
  und Gefahren erklären.
- **Urteilskompetenz:** Bewerten, welche Risikomaßnahmen in einem Raum sinnvoll sind.
- **Methodenkompetenz:** Karten lesen, Prozesse modellieren.

