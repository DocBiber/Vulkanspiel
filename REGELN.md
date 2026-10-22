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

Dazu gibt es eine Codekette: Die Gruppe bekommt am Anfang einen Zettel mit einem Aufdruck.
Das Lösen einer Station liefert das Symbol der Station und den Aufdruck der nächsten Station.
Mit allen fünf Symbolen lässt sich am Ende ein Schloss öffnen.

## Ziel der Schülerinnen und Schüler

Ihr seid ein Forschungsteam, das die Vulkangebiete der Erde kartiert. Ihr findet einen
seltsamen Zettel mit einem Aufdruck. Der Aufdruck öffnet euer erstes Gebiet auf der
Weltkarte. Dort beantwortet ihr zwei Fragen und schreibt eine Antwort ins Tagebuch.
Jede gelöste Station gibt euch ein Symbol und den Aufdruck der nächsten Station.
Mit allen fünf Symbolen öffnet sich das Schloss.

## 1. Anmeldung

1. Jede Gruppe (5 Gruppen à 3 bis 5 Schülerinnen und Schüler) wählt eine Spielfigur,
   bekommt einen Gruppennamen und trägt den Aufdruck vom Zettel ein. Der Startcode ist
   für alle Gruppen gleich.
2. Die Gruppe startet mit 10 Punkten. Der Startcode öffnet die erste Region der Kette.
3. Die Figur wandert auf der Karte zu jeder Region, die die Gruppe anklickt.

## 2. Die Codekette

    Zettel am Anfang  →  Aufdruck ASCHE  →  öffnet Station 1 (SUB)
    Station 1 gelöst →  Aufdruck FUNKEN →  öffnet Station 2 (HOT)
    Station 2 gelöst →  Aufdruck WELLE  →  öffnet Station 3 (MAAR)
    Station 3 gelöst →  Aufdruck TROPFEN → öffnet Station 4 (LIP)
    Station 4 gelöst →  Aufdruck DECKE  →  öffnet Station 5 (RISIKO)
    Station 5 gelöst →  das fünfte Symbol

Die Aufdrucke stehen in `assets/inhalte.js` und lassen sich dort ändern. Die Lehrkraft
sieht alle Aufdrücke über „Lehrkraft: Codes anzeigen“ im Abschnitt Auswertung.

## 3. Ablauf in einer Station

1. Die Gruppe klickt eine Region an. Ist sie verschlossen, erscheint ein Eingabefeld
   für den Aufdruck.
2. Mit dem richtigen Aufdruck öffnet sich die Station.
3. Es erscheinen zwei Multiple-Choice-Fragen. Jede hat vier Antwortmöglichkeiten,
   genau eine ist richtig.
4. Eine richtige Antwort bringt 10 Punkte und wird mit einer Erklärung bestätigt.
   Eine falsche Antwort bringt keine Punkte; die Gruppe kann es erneut versuchen.
5. Sind beide Fragen richtig, wird die Region farbig aufgedeckt. Jetzt bekommt die
   Gruppe das Symbol der Station und den Aufdruck der nächsten Station.
6. Danach gibt es eine offene Tagebuch-Frage. Die Gruppe schreibt ihre Antwort als Freitext
   ins Tagebuch. Eine Abgabe bringt 5 Punkte; die Antwort lässt sich danach ändern.

## 4. Das Schloss

Jede Station trägt ein Symbol:

| Station | Symbol | Name |
|---|---|---|
| SUB | 🌋 | Vulkan |
| HOT | 🌊 | Welle |
| MAAR | 💧 | Tropfen |
| LIP | 🪨 | Gestein |
| RISIKO | 🔥 | Feuer |

Sind alle fünf Symbole gesammelt, kann die Gruppe das Schloss öffnen. Das bringt
10 Bonuspunkte und den Abschluss-Code.

## 5. Punkte und Fortschritt

| Leistung | Punkte |
|---|---|
| Multiple-Choice-Frage richtig beantwortet | 10 |
| Tagebuch-Frage abgegeben | 5 |
| Schloss geöffnet | 10 |

Pro Station sind 25 Punkte möglich. Höchstpunktzahl: 10 Startpunkte + 5 × 25 + 10 Schloss
= 145.

Der Fortschritt (Spielstand) zeigt an, wieviele der fünf Regionen aufgedeckt sind und
wieviele Symbole gefunden sind. Beides steht in der Punktetabelle und in der CSV.

## 6. Das Tagebuch

Das Tagebuch sammelt die Freitext-Antworten aller Gruppen. Die Fragen sind bewusst offen,
keine davon hat eine einzige richtige Lösung:

- „Stell dir vor, du könntest an den Rand des Pazifischen Feuerrings reisen: Was würdest du unbedingt einpacken — und warum?"
- „Wie würdest du das Klima auf Hawaii mit nur drei Worten beschreiben?"
- „Welche Geräusche oder Gerüche stellst du dir an einem Maar-See vor?"
- „Was würdest du einer Freundin erzählen, wenn sie noch nie vom Deccan-Trapp gehört hat?"
- „Was würdest du tun, um die Menschen in Goma besser vor dem Vulkan zu schützen?"

Das Tagebuch lässt sich am Ende als Text herunterladen und kann so in die Stunde
einbezogen werden — etwa als Grundlage für eine Diskussion.

## 7. Die fünf Stationen

| Nr. | Kürzel | Station | Thema |
|---|---|---|---|
| 1 | SUB | Subduktionszonen des Pazifiks | Schichtvulkan, explosiver Vulkanismus |
| 2 | HOT | Hawaii-Hot-Spot | Schildvulkan, effusiver Vulkanismus |
| 3 | MAAR | Maar-Feld der Eifel | Phreatomagmatische Explosion |
| 4 | LIP | Deccan-Trapp, Indien | Vulkanische Decken, Klimawirkung |
| 5 | RISIKO | Nyiragongo und Goma | Risiko, Exposition, Vulnerabilität |

## 8. Zeitplan (45 Minuten)

| Phase | Dauer |
|---|---|
| Einstieg: Zettel lesen, Regeln, Karte erklären | 5 min |
| Stationen durcharbeiten (je 2 Fragen + 1 Tagebuch-Frage) | 25 min |
| Schloss öffnen, Auswertung der Punkte und des Fortschritts | 10 min |
| Auswertung des Tagebuchs, Diskussion, Gewinner | 5 min |

## 9. Technik

- Eine einzige HTML-Datei genügt, die das Spiel komplett enthält: `index.html`.
- Keine Installation, kein Server, kein Internet.
- Die Weltkarte ist als SVG direkt in `index.html` eingebettet, funktioniert also
  auch per Doppelklick ohne Server.
- Die Inhalte (Regionen, Fragen, Symbole, Aufdrücke) liegen in `assets/inhalte.js` und
  werden per `<script src>` geladen, ebenfalls ohne `fetch`.
- Punkte, Symbole und Tagebuch werden im Browser gespeichert (localStorage).
- Am Ende der Stunde lassen sich Punkte als CSV (Semikolon, UTF-8 mit BOM für Excel)
  und das Tagebuch als Textdatei exportieren.

## 10. Kompetenzbezug (Bildungsplan 2016)

- **Orientierungskompetenz:** Einordnen von Vulkanräumen und Gefahrenmustern.
- **Analysekompetenz:** Zusammenhänge zwischen Magmazusammensetzung, Eruptionsstil
  und Gefahren erklären.
- **Urteilskompetenz:** Bewerten, welche Risikomaßnahmen in einem Raum sinnvoll sind.
- **Methodenkompetenz:** Karten lesen, Prozesse modellieren.

