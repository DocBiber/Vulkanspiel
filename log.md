# Log — Vulkanspiel

> Chronologisches Änderungsjournal. Nur-Ergänzung. Nicht löschen.
> Format: `## [JJJJ-MM-TT] aktion | betreff`
> Aktionen: create, update, lint, query, export

## Vorgeschichte und Festlegungen

Der Ablauf dieser Session, damit nachvollziehbar bleibt, warum das Spiel so gebaut wurde.

### 1. Festlegungen per Abfrage (Antworten des Benutzers)

| Frage | Entscheidung |
|---|---|
| Form | Browser-Game (HTML/JS, läuft ohne Installation) |
| Inhalt | Physische Geographie: Gebirge, Flüsse, Klima, Vulkane |
| Zielgruppe | Sekundarstufe II / Oberstufe |
| Spieler | Ganze Klasse / mehrere Gruppen |
| Spielform | Sammelspiel: Stationen abschließen, Kartenstücke freischalten |
| Dauer | Eine Session (ca. 45 Minuten) |
| Schritt 1 | Festlegung (Dateien, Datenbank, Regeln) |
| Projektort | Eigener Pfad: `Gamification/Vulkanspiel` |
| Inhalte | Ja, Wiki-Inhalte erlaubt — aber nicht nur aus dem Wiki |
| Betrieb | Reines Browser-Game, kein Server, Highscore auf der Seite |
| Auswertung | Export der Punkte als CSV |

### 2. Geplanter Aufbau (mit dem Benutzer abgestimmt)

Der erste Entwurf sah 4 Stationen vor. Nach der Entscheidung für „Sammelspiel" und
„ganze Klasse" wurden es 5 Stationen, damit jede der 5 Gruppen jede Station einmal
bearbeiten kann:

- 5 Stationen à 6 Minuten, 25 Minuten Stationszeit, 10 Startpunkte.
- 5 Gruppen, jede Station von jeder Gruppe einmal.
- Jede Station: Aufgabe plus 2 bis 3 Sätze Begründung, Freigabe durch die Lehrkraft.
- Jede Station öffnet ein Kartenstück der Weltkarte.
- Codes nur durch die Lehrkraft freigeben; keine Ratbarkeit durch die Gruppen.

### 3. Abweichungen vom ersten Plan und warum

1. **Keine eigene Datenbank.** Geplant war `data/stationen.json` plus ein Codes-Bestand.
   Umgesetzt ist: Die Aufgaben liegen in `data/stationen.json`, die Codes erzeugt die
   App selbst beim ersten Start und legt sie im Browser ab. Grund: Ein Codebestand als
   Datei müsste mitgeliefert werden; die Gruppen würden ihn sonst im Projekt finden.
   Ein zufälliger Code pro Station (331.776 Kombinationen) ist nicht ratbar und muss
   nicht versteckt werden.
2. **Ein Code pro Station statt 8.400.** Der erste Entwurf sah 8.400 Codes pro Station
   vor. Das war überflüssig, weil jede Station nur einmalig freigeschaltet wird.
3. **Keine stationenliste.html.** Die Gruppe braucht keinen Ausdruck ihrer Stationsliste;
   der Fortschritt steht in der App und in der Punktetabelle.
4. **Karte inline statt als Datei.** Ursprünglich war `assets/karte.svg` geplant.
   Unter `file://` (Doppelklick, kein Server) scheitert `fetch()`. Siehe Eintrag unten.
5. **Kein Eintrag im Wiki-Log.** Das Spiel ist ein eigenes Projekt mit eigenem Log.
   Das Wiki dient als Inhaltsquelle; daran hat sich nichts geändert.
6. **Kein Wiki-Eintrag zu Flüssen und Klima.** Das Wiki deckt Vulkangebiete und
   Glazialräume sauber ab, Flüsse, Klima und Gebirgsbildner nur angedeutet. Diese Lücken
   sind hier offen benannt statt mit unsicheren Fakten gefüllt.

### 4. Inhaltsquellen

- Wiki `C:/Users/raine/wiki-geographie-lk`: Vulkanarten, Vulkanprozesse,
  Vulnerabilitäts-Begriffe, Raumbeispiele.
- Eigene Aufgaben zu Station 2 (Hot Spots), Station 4 (Vulkanische Decken) und
  Station 5 (Risiko/Vulnerabilität), weil das Wiki Flüsse und Klima nur andeutet
  und für diese drei Stationen keine fertigen Aufgaben vorliegen.
- Keine Fakten ohne Quellenangabe übernommen; die Prüfkriterien stehen je Station
  in `data/stationen.json`.

## [2026-10-21] create | Projekt angelegt
- Pfad: C:/Users/raine/Gamification/Vulkanspiel
- Art: Browser-Sammelspiel (HTML/CSS/JS), reines Offline-Game
- Zielgruppe: LK Geografie Gymnasium BW, Klassen 11/12, Bildungsplan 2016
- 45 Minuten, 5 Gruppen, 5 Stationen, Kartenstücke als Sammelanreiz
- REGELN.md und data/stationen.json angelegt
- Inhalte: Wiki (wiki-geographie-lk) + eigene Aufgaben zu Stationen 2, 4, 5
- Nächste Schritte: codes.json generieren, SVG-Karte, index.html

## [2026-10-21] create | Karte, Oberfläche und Code-Logik gebaut
- assets/karte.svg: Weltkarte mit fünf Kartenstücken (subduktion, hotspot, maar, lip, risiko)
- assets/spiel.js: Gruppen, Punkte, Codes (zufällig, einmalig, localStorage), CSV-Export
- assets/ui.js: Anmeldung, Stationsliste, Kartenansicht, Auswertung
- index.html: Oberfläche mit Karte, Stationen, Punkte, CSV-Export
- Codefreigabe nur über die Lehrkraft („Station freigeben"); Code-Eingabe bis zum Öffnen gesperrt
- Nächste Schritte: Aufgabenzettel als Ausdruck-Vorlage, Balancing mit echter Klasse

## [2026-10-21] lint | 51 Logik-Tests bestanden
- scripts/pruefe_spiel.js: 51 von 51 Prüfungen bestanden
- Geprüft: Anmeldung, Doppelanmeldung, Codes, Punkte, Code-Einlösung, Kartenstücke,
  Persistenz, CSV-Export, Datendateien, Reset
- Ende-zu-Ende-Durchlauf im Browser: 5 Stationen nacheinander, 85 von 100 Punkten,
  alle fünf Kartenstücke sichtbar, CSV korrekt (Semikolon, UTF-8-BOM)

## [2026-10-21] update | Fehler behoben und tote Dateien entfernt
- Behoben: Kartenstück-IDs im SVG passten nicht zu spiel.js (stueck-* vs. piece-*),
  dadurch blieben Kartenstücke unsichtbar
- Behoben: Code-Eingabefeld verschwand nach der Freigabe, bevor die Gruppe den Code
  eingeben konnte; das Feld bleibt jetzt bis zum Öffnen bestehen
- Behoben: reset() deckte die Kartenstücke nicht wieder zu
- Behoben: codesFuellen() wurde nie aufgerufen, weil ein leeres Objekt truthy ist
- Entfernt: data/codes.json und die Skripte generiere_codes.py, codes_erzeugen.py,
  test_spiel.js, testspiel.js — die Code-Erzeugung läuft jetzt in der App
- REGELN.md und index.md auf den tatsächlichen Ablauf aktualisiert

## [2026-10-21] update | Karte inline eingebettet für file://-Betrieb
- Problem: Unter file:// (Doppelklick auf index.html, kein Server) scheiterte
  fetch() am Laden der SVG-Datei. Die Karte fiel auf ein <img> zurueck, die
  Kartenstuecke blieben dadurch unsichtbar — nur die Punkte funktionierten.
- Loesung: Das SVG liegt jetzt direkt in index.html. assets/karte.svg entfernt,
  das fetch() in assets/ui.js entfernt.
- Geprueft: Doppelklick ohne Server, alle fuenf Stationen, alle fuenf Kartenstuecke
  sichtbar, 60 Punkte (10 + 5 x 10), CSV korrekt.
- 52 Logik-Tests bestanden (`node scripts/pruefe_spiel.js`).

## [2026-10-21] lint | Abschlussstand und Protokoll ergänzt
- Protokoll um die Vorgeschichte ergänzt: Abfragen und Entscheidungen des Benutzers,
  geplanter Aufbau, sechs Abweichungen vom Entwurf mit Begründung, Inhaltsquellen.
- Logik-Tests: 52 von 52 bestanden.
- Ende-zu-Ende im Browser, einmal mit Server und einmal über `file://`:
  alle fünf Kartenstücke sichtbar, Punkte stimmen, CSV korrekt (Semikolon, UTF-8-BOM).
- Fehler, die dabei gefunden und behoben wurden:
  1. Kartenstück-IDs im SVG passten nicht zu `spiel.js` (`stueck-*` vs. `piece-*`),
     dadurch blieben die Stücke unsichtbar.
  2. Code-Eingabefeld verschwand nach der Freigabe, bevor die Gruppe den Code eingeben
     konnte.
  3. `reset()` deckte die Kartenstücke nicht wieder zu.
  4. `codesFuellen()` wurde nie aufgerufen, weil ein leeres Objekt in JavaScript truthy ist.
  5. Unter `file://` scheiterte `fetch()` am SVG; Karte blieb unsichtbar.

### Offen

- Aufgabenzettel als Ausdruck-Vorlage (die Stationen liegen bisher nur als Daten vor).
- Balancing gegen die 45 Minuten mit einer echten Klasse.
- Kein Eintrag im Wiki-Log vorgenommen: Das Spiel ist ein eigenes Projekt, das Wiki
  bleibt Inhaltsquelle.

