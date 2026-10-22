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

## [2026-10-22] update | Aufgaben werden in der Oberfläche angezeigt
- Fehler: Die Aufgaben lagen in data/stationen.json, aber die Oberfläche nutzte eine
  hartkodierte Liste ohne Aufgabentext. fetch() scheitert zudem unter file://.
  Im Spiel waren also nur Stationsueberschriften zu sehen, keine Aufgaben.
- Loesung: Neue Datei assets/stationen.js mit den Aufgaben. Sie wird per
  <script src> eingebunden und nicht per fetch() geladen, laeuft also auch unter file://.
- Die Oberfläche zeigt jetzt je Station den Auftrag, Ort, Zeit und Thema.
  Loesungshinweis, Pruefkriterien und typische Fehler stehen in einem aufklappbaren
  Abschnitt nur fuer die Lehrkraft.
- data/stationen.json bleibt als lesbare Kopie erhalten. Der Test vergleicht beide
  Dateien und schlaegt fehl, sobald sie auseinanderlaufen.
- 60 Logik-Tests bestanden (`node scripts/pruefe_spiel.js`).
- Geprueft im Browser: alle fuenf Aufgaben sichtbar, Loesungshinweis und Pruefkriterien
  aufklappbar, Spielablauf unveraendert.

## [2026-10-22] update | Spielidee umgebaut: Karte als Spielfeld (v3)
- Ausgangspunkt: Rueckmeldung des Benutzers, dass die Aufgaben im Spiel nicht sichtbar
  waren (nur Stationsueberschriften), und der Verweis auf das LMZ GeoPortal.
- Referenz untersucht: https://geo.lmz-bw.de/gu/vegetation/#/ (Quasar/Vue, MapLibre GL).
  Weltkarte als Spielfeld, Spielfelder anklicken, Spielfigur, Spielstand, Tagebuch mit
  12 offenen reflektierenden Fragen, Bildergalerie, Sound. Keine Punkte, keine
  Lehrkraft-Freigabe, kein Wettbewerb.
- Entscheidungen des Benutzers nach Rueckfrage:
  1. Karte als Spielfeld (LMZ), Region anklicken, Aufgabe erscheint im Spiel
  2. Punkte und Wettbewerb bleiben, Fortschritt zusaetzlich angezeigt
  3. Freitext-Tagebuch wie bei LMZ, Antworten werden gesammelt und exportiert
  4. Spielfigur wie bei LMZ, waehlbar und auf der Karte bewegbar
- Neu gebaut:
  - assets/inhalte.js: 5 Regionen, je 2 Multiple-Choice-Fragen (4 Optionen, 1 richtig,
    mit Erklaerung) und 1 offene Tagebuch-Frage; 5 Spielfiguren
  - assets/logik.js: Gruppen, Figuren, Fragen, Punkte (10 pro richtiger Frage,
    5 pro Tagebuch-Abgabe, 135 moeglich), Fortschritt, Tagebuch, Export
  - assets/oberflaeche.js: Anmeldung mit Figurenwahl, klickbare Karte mit wandernder
    Figur, Regionsbereich mit Fragen und Tagebuch, Auswertung
  - index.html: Regionen als klickbare SVG-Gruppen, Figur-Marker, Panels, Styles
- Entfallen gegenueber v2: Kurzcodes, Lehrkraft-Freigabe, Stationen im Klassenraum,
  Zeitbonus, Abfrage der Begruendung
- Fehler behoben: Der Fehlerhinweis nach einer falschen Antwort wurde sofort von der
  Neuzeichnung geloescht und blieb daher unsichtbar.
- Commit 13985dc.

## [2026-10-22] lint | Ausfuehrliche Pruefung von Version 3
- Pruefumfang: Logik-Tests in Node, Ende-zu-Ende im Browser (file:// und http://),
  Randfaelle, Konsolenfehler, Persistenz, Export.

### Logik-Tests (Node)
- 60 von 60 Pruefungen bestanden (`node scripts/pruefe_logik.js`).
- Geprueft: Anmeldung mit Figur, Figuren und Inhalte, falsche und richtige Antworten,
  Punkte, Regionsaufdeckung, Fortschritt, Tagebuch (Abgabe und Aenderung), zwei Gruppen
  mit getrenntem Stand, CSV- und Tagebuch-Export, Dateiverdrahtung, Reset.

### Ende-zu-Ende im Browser
- Zwei Gruppen angemeldet (Vulkanforscherin, Feldteam), 5 Figuren auswaehlbar.
- Figur wandert auf der Karte mit: translate(120,180) / translate(500,150) / translate(660,300).
- Alle fuenf Regionen durchgearbeitet, jede mit einem absichtlichen Fehlversuch:
  Hinweis erscheint ("Nicht richtigt. Lies die Erklaerung und versuche es erneut."),
  keine Punkte, Klick bleibt moeglich.
- Gruppe A nach allen fuenf Regionen: 135 von 135 Punkten, Fortschritt 5/5,
  fuenf Tagebuch-Eintraege, alle fuenf Regionen farbig gefuellt
  (rgb(192,57,43), rgb(230,126,34), rgb(142,68,173), rgb(22,160,133), rgb(44,62,80)).
- Gruppe B teilweise (nur Maar): 30 Punkte, Fortschritt 1/5, Stand von A unberuehrt.
- CSV: "Gruppe A;Vulkanforscherin;135;5;5" und "Gruppe B;Feldteam;30;1;0".
- Tagebuch-Text: Gruppenkopf, Regionsname, Frage, Antwort je Eintrag.

### Randfaelle
- Anmeldung ohne Figur: "Bitte eine Spielfigur waehlen."
- Doppelter Gruppenname: "Dieser Gruppenname ist bereits vergeben."
- Bereits richtige Frage erneut angeklickt: keine Doppelpunkte.
- Tagebuch-Antwort zu kurz: Eintrag wird nicht gespeichert, Hinweis erscheint.
- Aenderung einer gespeicherten Antwort: keine weiteren Punkte.
- Wechsel zwischen Gruppen: Punkte und Fortschritt bleiben getrennt.

### Fehler gefunden und behoben
- Ein window.alert bei zu kurzer Tagebuch-Antwort blockierte den Browser. Ersetzt durch
  eine einzeilige Meldung im Spiel. Commit a7902af.

### Persistenz und Betrieb
- localStorage funktioniert unter file:// und http://; nach localStorage.clear() und
  Neuladen ist der Zustand leer.
- Keine Konsolenfehler und keine Warnungen im gesamten Durchlauf.
- Geladen werden nur noch die drei Skripte inhalte.js, logik.js, oberflaeche.js.
- Karte bleibt inline im SVG, kein fetch(), kein Server noetig.

### Offen
- Alte Dateien der Version 2 (assets/spiel.js, assets/ui.js, assets/stationen.js,
  data/stationen.json, scripts/pruefe_spiel.js) sind noch vorhanden, aber nicht mehr
  eingebunden. Loeschen noch offen.
- Balancing der 45 Minuten mit einer echten Klasse ist nicht geprueft.

## [2026-10-22] update | Zwei Fehler auf der Karte behoben, Versionsanzeige ergaenzt
- Rueckmeldung des Benutzers: Nur vier Regionen sichtbar, keine Weltkarte,
  Codes werden nicht ausgegeben.
- Ursache 1 (echter Fehler): Die Regionsfelder LIP (x 635-735) und RISIKO
  (x 616-675) lagen auf der Karte uebereinander. Sie wurden als ein Feld wahrgenommen.
  RISIKO wurde nach links verschoben (x 544-593). Nach der Aenderung ueberlappen
  keine der fuenf Regionen mehr, alle liegen klar getrennt.
- Ursache 2 (echter Fehler): Der Hinweistext unter der Karte war noch aus Version 2
  und sagte "Kartenstuecke erscheinen, sobald eine Gruppe den passenden Kurzcode
  eingibt". In Version 3 gibt es keine Kurzcodes mehr — der Text war irrefuehrend.
  Er beschreibt jetzt den Kartenablauf.
- Ursache 3 (kein Fehler, aber wirksam): Der Browser hatte eine aeltere Version
  im Cache. Um das erkennbar zu machen, erscheint oben rechts eine Versionsanzeige
  ("Version 3.0.0 · ohne Kurzcodes"). Fehlt sie oder zeigt sie eine andere Nummer,
  liegt eine alte Datei im Cache.
- Geprueft: Regions-Boxen per getBBox() vermessen, Ueberlappungstest ueber alle
  Paare (keine Ueberlappung mehr), Screenshot der Karte ausgewertet (fuenf getrennte
  Felder), 60 Logik-Tests weiterhin bestanden.
- Commit 0889a96.

## [2026-10-21] export | Auf GitHub übertragen
- Repository: https://github.com/DocBiber/Vulkanspiel (öffentlich, Standardbranch `main`)
- Angelegt mit `gh repo create --public --source=. --remote=origin --push`
- Erster Commit `25fcfd4`: 11 Dateien (index.html, assets/, data/, scripts/, README.md,
  REGELN.md, index.md, log.md, .gitignore)
- Ergänzt für GitHub: `README.md` (Schnellstart, Stationen, Punkte, Dateiübersicht)
  und `.gitignore` (Betriebssystem- und Editor-Reste)
- Arbeitsverzeichnis sauber, Branch folgt `origin/main`
- Geprüft: README und index.html auf GitHub inhaltlich vollständig (10218 bzw. 8768 Bytes)
- Nächste Schritte: optional GitHub Pages aktivieren, damit die Klasse das Spiel über
  eine URL öffnen kann statt über eine lokale Datei

