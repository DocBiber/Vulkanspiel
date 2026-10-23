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

## [2026-10-22] update | Echte Weltkarte aus Natural Earth gebaut
- Rueckmeldung des Benutzers: Fuenf Gebiete seien da, aber es sei keine Weltkarte.
- Zutreffend: Das SVG war eine Zeichnung — stilisierte Kontinenten-Umrisse mit
  Koordinatenlinien, keine erkennbare Weltkarte.
- Loesung: Echte Geodaten. Natural Earth 110m (Public Domain) als
  ne_110m_land.geojson geladen (138 KB, 127 Land-Objekte).
- Neues Skript scripts/weltkarte_bauen.py: Projiziert die Laender in eine
  Aequator-Entfernung auf 1000 x 500 Pixel, Ausgabe assets/weltkarte.txt
  (58.239 Zeichen Pfadtext).
- Neues Skript scripts/karte_bauen.py: Baut daraus die Karte (Ozean, Gradnetz mit
  Aequator und Wendekreisen, Landflaechen, fuenf Regions-Marker, Spielfigur,
  Legende) und bindet sie inline in index.html ein. Liest die Regionspositionen
  aus assets/inhalte.js, damit Karte und Logik nicht auseinanderlaufen.
- Regionspositionen auf geografisch korrekte Orte gesetzt:
  SUB Anden (291,7 / 291,7), HOT Hawaii (69,4 / 194,4), MAAR Eifel (519,4 / 110,6),
  LIP Deccan (711,1 / 197,2), RISIKO Nyiragongo (581,1 / 254,2).
- Fehler beim ersten Versuch: Der Ausdruck zum Einlesen der Regionsdaten griff in
  die Figurenliste und vergab der ersten Region data-region="vulkan". Durch
  Verankerung an "nr" behoben.
- Fehler beim ersten Versuch: Die SVG-Elemente bekamen die Regions-ID statt der
  svg_id, die Logik fand sie dann nicht. Behoben.
- Geprueft: Screenshot ausgewertet — Kontinente erkennbar, Gradnetz mit Aequator
  und Wendekreisen, fuenf Regionen an korrekten Stellen. Alle fuenf Regionen
  aufgedeckt: 110 Punkte, Fortschritt 5/5, Farben korrekt, Figur wandert zu jeder
  Region. Keine Konsolenfehler.
- 66 Logik-Tests bestanden, darunter neu: Landflaechen-Pfade vorhanden, Gradnetz
  vorhanden, Legende vorhanden, Regionspositionen stimmen mit den Daten ueberein,
  Regionen liegen innerhalb der Kartenflaeche, keine zwei Regionen an derselben Stelle.
- index.html ist jetzt 68 KB (davon 58 KB Landpfade). Bleibt eine einzige Datei,
  laeuft weiterhin ohne Server.

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

## [2026-10-22] update | Codekette und Schloss (v4)

Auslöser: Die Gruppe bekommte nach dem Lösen einer Station keinen Code mehr. Gefordert
wurde ein Startcode auf einem Zettel, ein Code am Ende jeder Station für die nächste
Station, ein Symbol pro Station und ein Schloss, das sich mit allen fünf Symbolen öffnet.

Umgesetzt:

- **Startcode:** Die Anmeldung verlangt jetzt den Aufdruck vom Zettel. `ASCHE` (configuriert
  in `assets/inhalte.js` als `startcode`) öffnet die erste Station. Funktioniert in Groß- und
  Kleinschreibung, mit führenden Leerzeichen, bei allen Gruppen gleich.
- **Codekette:** Jede Station trägt `code_naechste`. Nach dem Lösen bekommt die Gruppe den
  Aufdruck der nächsten Station: `ASCHE → FUNKEN → WELLE → TROPFEN → DECKE`. Der Aufdruck
  wird auf einem Stationszettel angezeigt, zusammen mit dem Symbol der Station.
- **Verschlossene Stationen:** Eine Station ohne richtigen Aufdruck zeigt nur ein
  Eingabefeld. Fragen darin bringen keine Punkte.
- **Symbole:** Jede Station hat ein Symbol (`🌋 🌊 💧 🪨 🔥`). Das Symbol erscheint beim
  Aufdecken der Station und bleibt in der Punktetabelle sichtbar.
- **Schloss:** Neu der Abschnitt „4 · Das Schloss" mit fünf Feldern. Sind alle fünf
  Symbole gesammelt, kann die Gruppe das Schloss öffnen: 10 Bonuspunkte und der
  Abschluss-Code. Das Schloss ist pro Gruppe einmalig.
- **Lehrkraft-Übersicht:** Neuer Knopf in der Auswertung zeigt Startcode, alle Aufdrücke,
  die Symbole und den Schloss-Code als Text.
- **CSV:** Zwei neue Spalten („Symbole", „Schloss geoeffnet"), jetzt 7 Spalten.
- **Punkte:** Höchstpunktzahl jetzt 145 (10 Start + 5 × 25 + 10 Schloss).

Dateien:

- `assets/inhalte.js`: `startcode`, `code_naechste` je Region, `symbol` und `symbol_name`,
  neuer Block `schloss` mit `code`, `bonuspunkte` und `text`. Versionsstand 4.
- `assets/logik.js`: `gruppeAnmelden` nimmt jetzt den Startcode, neu `codeEinloesen`,
  `symbole`, `schlossBereit`, `schlossOeffnen`, `lehrkraftUebersicht`. Regionen speichern
  `freigeschaltet`, Gruppen speichern `symbole` und `schlossAuf`.
- `assets/oberflaeche.js`: Eingabefeld für den Startcode, Schloss-Bereich, Stationszettel
  mit Symbol und Folgencode, verschlossene Regionen zeigen ein Code-Eingabefeld.
- `index.html`: Abschnitt „4 · Das Schloss" neu, Abschnitte 4/5 verschoben auf 5/6,
  Styles für Zettel, Schloss und Code-Eingabe, Versionsanzeige „Version 4 · Codekette".
- `scripts/pruefe_kette.js`: neuer Testlauf (80 Prüfungen) für die Logik inkl. Codekette
  und Schloss. Der ältere `scripts/pruefe_logik.js` bleibt als Test der Version 3 erhalten.
- `REGELN.md`, `README.md`, `index.md`: Regeln, Ablauf, Codekette, Symbole und Schloss
  beschrieben.

Geprüft:

- `node scripts/pruefe_kette.js` → 80 bestanden, 0 fehlgeschlagen.
- Ende-zu-Ende-Durchlauf im Browser über `file://`: Anmeldung ohne Code abgelehnt, mit
  `ASCHE` angenommen, Kette `FUNKEN → WELLE → TROPFEN → DECKE` durchgespielt, fünf Symbole
  gesammelt, Schloss geöffnet (120 Punkte), Lehrkraft-Übersicht zeigt alle Aufdrücke.
  Keine Konsolenfehler.
- Beim Sichtprüfen im Browser: Startcode-Feld vorhanden, Stationszettel zeigt Symbol und
  Folgencode, Schloss zeigt „Gefunden: 1 von 5" bzw. „2 von 5".

Offen:

- Die Aufdrücke sind in `assets/inhalte.js` im Klartext. Für eine echte Klasse müssen die
  Zettel mit den Aufdrucken ausgedruckt werden — die Datei darf dann nicht auf dem
  Schülerrechner liegen.
- Balancing mit einer echten Klasse steht noch aus.

## [2026-10-22] update | Aufgabentypen und Freitext-Bewertung (v5)

Auslöser: Es gab pro Station nur zwei Aufgaben, alle vom selben Typ. Gefordert
wurde mehr Vielfalt (Begriffe einer Skizze zuordnen, Richtig/Falsch, Fehler
entdecken, Kreuzworträtsel), mehr als zwei Aufgaben pro Station und Freitexte,
die von einer KI bewertet werden.

Entschieden: alles im Browser, fünf Aufgaben pro Station, Bewertung bevorzugt
über eine Bewertungsdatei (Weg B) statt über einen laufenden Dienst. Kreuzworträtsel
wurde zugunsten von Lückentext und Wortgitter aufgelöst, weil beide denselben
Effekt mit deutlich weniger Aufwand haben.

Umgesetzt:

- **Aufgabentypen-System:** Jede Aufgabe trägt `typ` und `daten`. Die Typen liegen
  in `assets/aufgaben.js` (window.AUFGABEN_TYPEN) mit Name und Prüffunktion.
  Einheitliches Ergebnis: richtig, punkte, max, hinweis, details, moeglich.
  Sieben Typen: `mc`, `zuordnung`, `richtig_falsch`, `lueckentext`, `wortgitter`,
  `fehler`, `freitext`.
- **Punkteskalierung:** Jede Aufgabe trägt `punkte`, das wird als `max` an die
  Prüffunktion übergeben. Mehrteilige Typen verteilen die Punkte anteilig auf
  ihre Teile — eine halb richtige Lösung bringt die Hälfte der Punkte.
- **Vergleich verzeihend:** Groß-/Kleinschreibung, Umlaute, Satzzeichen am Rand
  und Bindestriche zählen bei Wörtern nicht als Fehler.
- **Station 1 als Prototyp:** fünf Aufgaben, vier verschiedene Typen — Multiple
  Choice, Begriffe einer Skizze zuordnen, Richtig/Falsch, Lückentext, Freitext.
- **Skizzen:** `skizzen` in `assets/inhalte.js` mit viewBox und SVG-Markup. Die
  Felder der Zuordnungsaufgabe liegen als SVG-Gruppen in der Skizze, damit sie
  mit der Skizze skalieren.
- **Freitext-Bewertung (Weg B):** Eine Freitext-Antwort zählt als gelöst, gibt
  aber erst mit der Bewertung Punkte. `freitextSpeichern`, `freitextBewerten`,
  `freitextImport`, `freitextOffen`, `freitextAufgabeExport`. Der Export liefert
  JSON mit Gruppe, Station, Aufgabe, Frage, Kriterien, Maximum und Antwort; der
  Import nimmt JSON mit Gruppe, Aufgabe, Punkten und Hinweis entgegen.
  Eine erneute Bewertung ersetzt die Punkte, statt sie zu addieren.
- **Kriterien stehen im Spiel:** Jede Freitext-Aufgabe zeigt die drei Kriterien
  unter der Aufgabe, bevor die Gruppe schreibt.
- **CSV:** neun Spalten — dazu „Aufgaben geloest", „Tagebuch-Eintraege" und
  „Freitext bewertet".
- **Rückwärtskompatibilität:** Stationen ohne `aufgaben` liefern ihre alten
  `fragen` und `tagebuch` umgesetzt, damit die noch nicht umgebauten Stationen
  weiterlaufen.

Dateien:

- `assets/aufgaben.js` neu: die sieben Typen mit Prüffunktionen, dazu
  Schüttelwörter-Generator und Wortvergleich.
- `assets/inhalte.js`: `version` 5.0.0, neuer Block `skizzen`, Station 1 mit
  fünf Aufgaben statt zwei Fragen und einer Tagebuch-Frage.
- `assets/logik.js`: Speicherstand v5, `aufgabenVon`, `aufgabePruefen` statt
  `frageBeantworten` (letzteres bleibt als Hülle), `geloesteInRegion` statt
  `richtigeInRegion`, Freitext-Funktionen, erweiterte Exporte.
- `assets/oberflaeche.js`: Renderer für alle sieben Typen, Eingabensammler mit
  Ziehen und Tippen, Freitext-Felder mit Kriterien, Tagebuch- und
  Auswertungstabelle um die neuen Spalten erweitert, Import von Bewertungen.
- `index.html`: `aufgaben.js` eingebunden, Styles für Aufgaben, Skizzen,
  Kärtchen, Lückentext, Wortgitter, Fehler und Freitext.
- `scripts/pruefe_aufgaben.js` neu: 87 Prüfungen für die Typen und die
  Freitext-Bewertung.
- `scripts/pruefe_kette.js`: an das v5-Modell angepasst, generisch eine Station
  lösend.

Geprüft:

- `node scripts/pruefe_aufgaben.js` → 87 bestanden, 0 fehlgeschlagen.
- `node scripts/pruefe_kette.js` → 94 bestanden, 0 fehlgeschlagen.
- Ende-zu-Ende im Browser über `file://`: Anmeldung mit Startcode, Station 1
  öffnen, alle fünf Aufgaben der Reihe nach lösen (Multiple Choice per Klick,
  Skizze per Klick auf Kärtchen und Feld, Richtig/Falsch, Lückentext, Freitext),
  Station aufgedeckt, 40 Punkte, Symbol frei, Stationszettel mit FUNKEN.
  Bewertungsdatei eingelesen: 40 → 47 Punkte, kein offener Freitext mehr.
  Keine Konsolenfehler.
- Sichtprüfung im Browser: Die Skizze zeigt einen Schichtvulkan im Querschnitt
  mit vier Markern. Nach einer Korrektur der Markerpositionen sitzen A am
  Krater, B auf dem Steigeschacht, C an der Flanke und D in der Magma-Kammer —
  die Zuordnung ist eindeutig.

Behoben unterwegs:

- Die Marker der Skizze lagen zuerst beide auf der Flanke, sodass „Schlot" und
  „Schichtkoerper" nicht unterscheidbar waren. B liegt jetzt auf der Mittellinie,
  C an der Flanke.
- Die Typprüfer gaben immer einen Punkt pro richtiger Teilantwort zurück und
  ignorierten die konfigurierten Punkte der Aufgabe. Jetzt wird `max` übergeben
  und anteilig verteilt.
- Die Freitext-Kriterien wurden aus `a.kriterien` gelesen, liegen aber unter
  `a.daten.kriterien`.

Offen:

- Weg A (lokaler Bewertungsdienst) ist geplant, aber noch nicht gebaut. Er
  braucht einen API-Schlüssel, der nicht ins Repository darf.
- Station 2 bis 5 tragen noch die alten zwei Fragen und eine Tagebuch-Frage.
  Sie laufen weiter, sind aber nicht mehr im neuen Umfang.
- Balancing mit einer echten Klasse steht noch aus.

## [2026-10-22] update | Parallele Startweise (v5.1)

Auslöser: Die Gruppen arbeiten in der Klasse parallel, nicht in einer festen
Reihenfolge. Die bisherige Kette zwang alle Gruppen durch dieselbe Stationenfolge.

Entschieden: Jede Gruppe wählt eine Startstation und bekommt den Aufdruck dieser
Station. Die Kette läuft von dort zyklisch weiter. Der Zeitdruck, der bei einer
festen Reihenfolge bestanden hätte, entfällt dadurch.

Umgesetzt:

- **Startcodes je Station:** Neuer Block `startcodes` in `assets/inhalte.js` —
  SUB `ASCHE`, HOT `FUNKEN`, MAAR `WELLE`, LIP `TROPFEN`, RISIKO `DECKE`. Jeder
  Aufdruck ist der, den die vorherige Station der Kette weitergibt.
- **Zyklische Kette:** `codeFuerRegion` schlägt jetzt zyklisch zurück. Die letzte
  Station gibt `ASCHE` weiter und öffnet damit die erste, wenn sie noch offen ist.
  Neu `naechsteRegionVon(regionId)`.
- **Anmeldung mit Stationswahl:** `gruppeAnmelden` nimmt eine vierte Angabe, die
  Startstation. Der Aufdruck muss zu ihr passen; sonst kommt eine klare Meldung.
  Ohne Wahl wird die erste Station genommen, damit ältere Aufrufer laufen.
- **Stationswahl im Spiel:** Neuer Abschnitt in der Anmeldung mit den fünf
  Stationen, Symbol und Kürzel. Die Gruppe klickt ihre Station an.
- **Stationszettel:** Zeigt den Aufdruck nur dann als „öffnet die nächste Station",
  wenn diese Station noch nicht erledigt ist. Bei der letzten Station steht der
  Hinweis aufs Schloss.
- **Lehrkraft-Übersicht:** Zeigt je Station den Aufdruck zum Anfangen und den nach
  dem Lösen, dazu den Hinweis, dass die Kette zyklisch läuft.

Geprüft:

- `node scripts/pruefe_kette.js` → 110 bestanden, 0 fehlgeschlagen (neu dazu:
  Startcodes je Station, Ablehnung des falschen Aufdrucks, zyklische Kette,
  Aufdruck jeder Station öffnet genau die nächste).
- `node scripts/pruefe_aufgaben.js` → 87 bestanden, 0 fehlgeschlagen.
- Ende-zu-Ende im Browser über `file://`: Stationswahl mit fünf Stationen,
  `ASCHE` bei Hot-Spot abgelehnt, `FUNKEN` angenommen, nur Hot-Spot offen,
  Station gelöst, Aufdruck `WELLE` öffnet das Maar, Subduktion bleibt verschlossen.
  Keine Konsolenfehler.

Behoben unterwegs:

- Die Tests ließen Gruppen aus dem neuen Abschnitt stehen, die den aktiven
  Zustand veränderten. Beide Abschnitte schalten jetzt explizit zurück.
- Der Stationszettel nannte nach der letzten Station die erste Station der Kette
  als „nächste" — das war bei einer zyklischen Kette falsch.

Offen:

- Weg A (lokaler Bewertungsdienst) ist geplant, aber noch nicht gebaut.
- Station 2 bis 5 tragen noch die alten zwei Fragen und eine Tagebuch-Frage.

