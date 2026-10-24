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
   bekommt einen Gruppennamen, sucht die Station aus, an der sie anfangen will, und
   trägt den Aufdruck dieser Station ein.
2. Der Aufdruck muss zu der gewählten Station passen, sonst beginnt das Spiel nicht.
   Jede Station hat einen eigenen Aufdruck.
3. Die Gruppe startet mit 10 Punkten. Der Aufdruck öffnet genau die Station, an der
   die Gruppe anfängt.
4. Die Figur wandert auf der Karte zu jeder Station, die die Gruppe anklickt.

## 2. Die Codekette

Die Gruppen arbeiten parallel. Jede beginnt an ihrer eigenen Station, und die Kette
läuft von dort zyklisch weiter — wer am Hot-Spot anfängt, kommt am Ende zur
Subduktionszone.

    Station 1  SUB     Aufdruck zum Anfangen: ASCHE
    Station 2  HOT     Aufdruck zum Anfangen: FUNKEN
    Station 3  MAAR    Aufdruck zum Anfangen: WELLE
    Station 4  LIP     Aufdruck zum Anfangen: TROPFEN
    Station 5  RISIKO  Aufdruck zum Anfangen: DECKE

    ASCHE   öffnet SUB     SUB gelöst     → FUNKEN → öffnet HOT
    FUNKEN  öffnet HOT     HOT gelöst     → WELLE  → öffnet MAAR
    WELLE   öffnet MAAR    MAAR gelöst    → TROPFEN → öffnet LIP
    TROPFEN öffnet LIP     LIP gelöst     → DECKE  → öffnet RISIKO
    DECKE   öffnet RISIKO  RISIKO gelöst  → ASCHE  → öffnet SUB (falls noch offen)

Die Aufdrücke stehen in `assets/inhalte.js` (`startcodes` und `code_naechste`) und
lassen sich dort ändern. Die Lehrkraft sieht alle Aufdrücke über
„Lehrkraft: Codes anzeigen“ im Abschnitt Auswertung — dort steht auch, welcher
Aufdruck zu welcher Station gehört.

## 3. Aufgaben in einer Station

Jede Station trägt fünf Aufgaben von unterschiedlichem Typ. Erst wenn alle fünf
gelöst sind, wird die Station aufgedeckt und der Zettel mit dem Symbol und dem
Aufdruck der nächsten Station erscheint.

| Typ | Was die Gruppe tun muss | Punkte |
|---|---|---|
| Multiple Choice | Vier Antworten, eine anklicken | 8 |
| Begriffe zuordnen | Begriffe auf nummerierte Felder einer Skizze ziehen | 8 |
| Richtig/Falsch | Drei bis vier Aussagen einzeln bewerten | 6 |
| Lückentext | Wörter aus einem Kärtchenstapel in die Lücken setzen | 8 |
| Wortgitter | Buchstaben in ein Raster, Hinweise zuordnen | 8 |
| Fehler entdecken | Fehlstellen in einem Text anklicken | 6 |
| Freitext | Eine Antwort schreiben, die bewertet wird | 10 |

Nicht jede Station nutzt alle Typen. Pro Station sind etwa 30 bis 40 Punkte
möglich. Eine halb richtige Lösung bringt die entsprechenden Teilpunkte —
eine Gruppe, die etwas falsch macht, muss die Aufgabe nicht komplett neu beginnen.

## 4. Der Ablauf in einer Station

1. Die Gruppe klickt eine Station an. Ist sie verschlossen, erscheint ein
   Eingabefeld für den Aufdruck.
2. Mit dem richtigen Aufdruck öffnet sich die Station.
3. Die Gruppe arbeitet die fünf Aufgaben der Reihe nach durch. Eine Aufgabe,
   die schon gelöst ist, bleibt stehen und zeigt ihre Erklärung.
4. Sind alle fünf gelöst, wird die Station farbig aufgedeckt. Jetzt bekommt
   die Gruppe das Symbol der Station und den Aufdruck der nächsten Station.
5. Die Freitext-Antwort gehört ebenfalls zur Station. Sie zählt als gelöst,
   sobald sie abgeschickt ist — ihre Punkte folgen mit der Bewertung.

## 5. Die Bewertung des Freitextes

Jede Freitext-Aufgabe trägt drei Kriterien. Sie stehen im Spiel unter der
Aufgabe und den Schülern vor Augen.

Es gibt zwei Wege, die Antworten zu bewerten:

**Weg B — über eine Bewertungsdatei.** Im Abschnitt „Auswertung" liegt ein
Knopf „Freitexte zur Bewertung". Er lädt eine JSON-Datei herunter, die alle
noch offenen Antworten enthält: Gruppe, Station, Frage, die Kriterien, das
Maximum und die Antwort selbst. Diese Datei der Bewertung zuführen und das
Ergebnis als JSON-Datei zurück ins Spiel laden — der Knopf „Bewertungen
einlesen" nimmt sie entgegen. So fällt kein Schlüssel auf dem Schülerrechner
und es läuft kein Dienst.

**Weg A — über das Bewertungs-Backend.** Das Backend läuft auf deinem Rechner
und hält den API-Schlüssel. Es wird gestartet mit:

    cd backend
    npm install
    npm start

Damit das Backend etwas bewerten kann, braucht es den Schlüssel. Der liegt in
`backend/.env` — diese Datei wird von Git ignoriert und kommt nie ins
Repository. Als Vorlage dient `backend/.env.example`.

Das Backend liest die Bewertungskriterien aus `assets/inhalte.js`, derselben
Quelle wie das Spiel. Ein Schüler kann die Rubrik also nicht ändern.

Der Schlüssel kommt aus Google AI Studio (aistudio.google.com), kostenlos und
ohne Kreditkarte. Gib ihn niemals in einen Chat und committe ihn nicht.

Im Spiel steht unter „Auswertung" der Abschnitt „Bewertungsdienst (Weg A)".
Dort prüfst du die Verbindung und schickst dann alle offenen Freitexte ab. Das
Spiel schickt dem Backend nur die Antworten, niemals den Schlüssel.

Das Backend braucht eine Internetverbindung, nur auf deinem Rechner. Die
Schülerrechner brauchen es nicht zu erreichen.

`../scripts/bewerten.py` ist ein kleiner Ersatz in Python für den Fall, dass
Node nicht zur Hand ist. Beide Wege erledigen dasselbe.

Ohne Bewertung gilt eine Freitext-Antwort als abgegeben. Die Station kann also
auch ohne Bewertung aufgedeckt werden; es fehlen dann nur die Punkte.

## 6. Das Schloss

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

## 7. Punkte und Fortschritt

| Leistung | Punkte |
|---|---|
| Multiple-Choice-Frage richtig beantwortet | 8 |
| Begriffe zuordnen | 8 |
| Richtig/Falsch | 6 |
| Lückentext | 8 |
| Wortgitter | 8 |
| Fehler entdecken | 6 |
| Freitext-Aufgabe bewertet | 10 |
| Schloss geöffnet | 10 |

Pro Station sind 30 bis 40 Punkte möglich, der Freitext kommt mit der Bewertung
dazu. Höchstpunktzahl: 10 Startpunkte + 5 × ca. 34 + 10 Schloss ≈ 190.

Der Fortschritt (Spielstand) zeigt an, wieviele der fünf Stationen aufgedeckt
sind, wieviele Aufgaben gelöst sind und wieviele Symbole gefunden sind. Alles
steht in der Punktetabelle und in der CSV.

## 8. Das Tagebuch

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

## 9. Zeitplan (45 Minuten)

| Phase | Dauer |
|---|---|
| Einstieg: Zettel lesen, Regeln, Karte erklären | 5 min |
| Stationen durcharbeiten (je 2 Fragen + 1 Tagebuch-Frage) | 25 min |
| Schloss öffnen, Auswertung der Punkte und des Fortschritts | 10 min |
| Auswertung des Tagebuchs, Diskussion, Gewinner | 5 min |

## 10. Technik

- Eine einzige HTML-Datei genügt, die das Spiel komplett enthält: `index.html`.
- Keine Installation, kein Server, kein Internet.
- Die Weltkarte ist als SVG direkt in `index.html` eingebettet, funktioniert also
  auch per Doppelklick ohne Server.
- Die Inhalte (Stationen, Aufgaben, Symbole, Aufdrücke, Skizzen) liegen in
  `assets/inhalte.js` und werden per `<script src>` geladen, ebenfalls ohne `fetch`.
- Die Aufgabentypen liegen in `assets/aufgaben.js`. Ein neuer Typ braucht dort
  einen Eintrag mit Name und Prüffunktion; Logik und Oberfläche fragen das
  Verzeichnis ab.
- Punkte, Symbole und Freitexte werden im Browser gespeichert (localStorage).
- Am Ende der Stunde lassen sich Punkte als CSV (Semikolon, UTF-8 mit BOM für
  Excel), das Tagebuch als Text und die Freitexte zur Bewertung als JSON
  exportieren.

## 11. Kompetenzbezug (Bildungsplan 2016)

- **Orientierungskompetenz:** Einordnen von Vulkanräumen und Gefahrenmustern.
- **Analysekompetenz:** Zusammenhänge zwischen Magmazusammensetzung, Eruptionsstil
  und Gefahren erklären.
- **Urteilskompetenz:** Bewerten, welche Risikomaßnahmen in einem Raum sinnvoll sind.
- **Methodenkompetenz:** Karten lesen, Prozesse modellieren.

