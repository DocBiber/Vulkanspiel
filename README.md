# Vulkanspiel

Sammelspiel zur Wiederholung der physischen Geografie (LK Geografie, Gymnasium Baden-Württemberg,
Bildungsplan 2016). Browser-Game, läuft ohne Installation und ohne Internetverbindung.
Eine Runde dauert 45 Minuten.

Das Spiel orientiert sich am [LMZ GeoPortal](https://geo.lmz-bw.de/gu/vegetation/#/): Die
Weltkarte ist das Spielfeld, jede richtige Antwort deckt eine Region auf.

## Schnellstart

1. `index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Gruppe anmelden: Spielfigur wählen, Name eingeben, den Aufdruck vom Zettel eintragen.
   10 Startpunkte werden gutgeschrieben.
3. Die erste Station ist dadurch offen — anklicken und bearbeiten.
4. Fünf Aufgaben lösen: Multiple Choice, Begriffe auf eine Skizze ziehen,
   Richtig/Falsch, Lückentext, Freitext. Jede bringt Punkte.
5. Sind alle fünf gelöst, wird die Station farbig aufgedeckt und bringt das Symbol
   sowie den Aufdruck der nächsten Station.
6. Mit dem Aufdruck die nächste Station öffnen, bis alle fünf Symbole beisammen sind.
7. Das Schloss öffnen und am Ende: Punkte als CSV, das Tagebuch als Text und die
   Freitexte zur Bewertung als JSON herunterladen.

Die ausführlichen Regeln stehen in [REGELN.md](REGELN.md).

## Die Codekette

Die Gruppen arbeiten parallel. Jede bekommt einen Zettel mit einem Aufdruck und
dem Namen einer Station. Die Kette läuft von dort zyklisch weiter.

    SUB    Anfang: ASCHE    gelöst → FUNKEN
    HOT    Anfang: FUNKEN   gelöst → WELLE
    MAAR   Anfang: WELLE    gelöst → TROPFEN
    LIP    Anfang: TROPFEN  gelöst → DECKE
    RISIKO Anfang: DECKE    gelöst → ASCHE

Die Aufdrücke stehen in `assets/inhalte.js` (`startcodes` und `code_naechste`)
und lassen sich dort ändern. Die Lehrkraft sieht alle Aufdrücke über
„Lehrkraft: Codes anzeigen“ im Abschnitt Auswertung.

## Die fünf Stationen

| Nr. | Kürzel | Station | Symbol | Thema |
|---|---|---|---|---|
| 1 | SUB | Subduktionszonen des Pazifiks | 🌋 Vulkan | Schichtvulkan, explosiver Vulkanismus |
| 2 | HOT | Hawaii-Hot-Spot | 🌊 Welle | Schildvulkan, effusiver Vulkanismus |
| 3 | MAAR | Maar-Feld der Eifel | 💧 Tropfen | Phreatomagmatische Explosion |
| 4 | LIP | Deccan-Trapp, Indien | 🪨 Gestein | Vulkanische Decken, Klimawirkung |
| 5 | RISIKO | Nyiragongo und Goma | 🔥 Feuer | Risiko, Exposition, Vulnerabilität |

## Aufgaben

Jede Station trägt fünf Aufgaben von unterschiedlichem Typ. Die Gruppe arbeitet
sie der Reihe nach durch; eine halb richtige Lösung bringt Teilpunkte.

| Typ | Was die Gruppe tun muss | Punkte |
|---|---|---|
| `mc` | Vier Antworten, eine anklicken | 8 |
| `zuordnung` | Begriffe auf nummerierte Felder einer Skizze ziehen | 8 |
| `richtig_falsch` | Aussagen einzeln als richtig oder falsch bewerten | 6 |
| `lueckentext` | Wörter aus einem Kärtchenstapel in die Lücken setzen | 8 |
| `wortgitter` | Buchstaben in ein Raster, Hinweise zuordnen | 8 |
| `fehler` | Fehlstellen in einem Text anklicken | 6 |
| `freitext` | Eine Antwort schreiben, die bewertet wird | 10 |

## Punkte und Fortschritt

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

Pro Station sind 30 bis 40 Punkte möglich. Höchstpunktzahl ≈ 190. Der Fortschritt
zeigt Stationen, gelöste Aufgaben und Symbole an.

## Der Ablauf in einer Station

1. Die Gruppe klickt eine Station an. Ist sie verschlossen, erscheint ein
   Eingabefeld für den Aufdruck.
2. Die fünf Aufgaben erscheinen. Eine gelöste Aufgabe bleibt stehen.
3. Sind alle fünf gelöst, wird die Station farbig aufgedeckt und die Gruppe
   bekommt das Symbol und den Aufdruck der nächsten Station.
4. Die Freitext-Antwort zählt als gelöst, sobald sie abgeschickt ist — ihre
   Punkte folgen mit der Bewertung.

Das Tagebuch sammelt die Antworten aller Gruppen. Die Fragen sind bewusst offen,
keine davon hat eine einzige richtige Lösung:

- „Stell dir vor, du könntest an den Rand des Pazifischen Feuerrings reisen: Was würdest du unbedingt einpacken — und warum?"
- „Wie würdest du das Klima auf Hawaii mit nur drei Worten beschreiben?"
- „Was würdest du tun, um die Menschen in Goma besser vor dem Vulkan zu schützen?"

## Die Bewertung des Freitextes

Jede Freitext-Aufgabe trägt drei Kriterien, die den Schülern unter der Aufgabe
stehen. Zwei Wege führen zur Bewertung:

**Weg B — über eine Bewertungsdatei.** Der Knopf „Freitexte zur Bewertung" lädt
eine JSON-Datei mit allen offenen Antworten herunter (Gruppe, Station, Frage,
Kriterien, Maximum, Antwort). Diese Datei der Bewertung zuführen und das
Ergebnis mit „Bewertungen einlesen" zurück ins Spiel laden. Kein Schlüssel auf
dem Schülerrechner, kein Dienst im Netz.

**Weg A — über das Bewertungs-Backend.** Das Backend läuft auf deinem Rechner
(`cd backend && npm install && npm start`) und hält den API-Schlüssel in
`backend/.env` — eine Datei, die von Git ignoriert wird. Es liest die
Bewertungskriterien aus dem Spielinhalt, sodass ein Schüler die Rubrik nicht
ändern kann. Im Spiel unter „Auswertung" prüfst du die Verbindung und schickst
die offenen Freitexte ab. Schlüssel: Google AI Studio, kostenlos, ohne
Kreditkarte.

Wer Node nicht hat: `scripts/bewerten.py` macht dasselbe in Python.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche (Karte inline als SVG, Stationen, Aufgaben, Tagebuch, Export) |
| `assets/inhalte.js` | Inhalte: Stationen, Aufgaben, Spielfiguren, Symbole, Aufdrücke, Skizzen |
| `assets/aufgaben.js` | Die Aufgabentypen mit ihren Prüffunktionen |
| `assets/logik.js` | Logik: Gruppen, Aufgaben, Punkte, Fortschritt, Codekette, Schloss, Freitext, Export |
| `assets/oberflaeche.js` | Oberfläche: Anmeldung, Karte, Aufgabenrenderer, Schloss, Tagebuch, Auswertung |
| `assets/style.css` | Basis-Styles |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `scripts/pruefe_kette.js` | Testlauf für Codekette und Schloss (`node scripts/pruefe_kette.js`) |
| `scripts/pruefe_aufgaben.js` | Testlauf für die Aufgabentypen und die Freitext-Bewertung |
| `scripts/bewerten.py` | Kleiner Ersatz-Dienst in Python (Weg A ohne Node) |
| `backend/` | Bewertungs-Backend in Node.js — hält den API-Schlüssel und ruft Gemini auf |
| `backend/.env.example` | Vorlage für den API-Schlüssel. `backend/.env` wird von Git ignoriert |
| `local/konfiguration.example.json` | Vorlage für den Python-Dienst |
| `Dockerfile` | Container-Image des Backends für Cloud Run |
| `.github/workflows/backend-ci.yml` | Prüft das Backend bei jedem Push und jeder Anfrage |
| `log.md` | Änderungsjournal |

Die Inhalte liegen in `assets/inhalte.js`, die Weltkarte ist als SVG direkt in `index.html`
eingebettet. Beides wird ohne `fetch()` geladen, funktioniert also auch per Doppelklick
über `file://`.

## Inhaltsquellen

Die Fragen und Erklärungen beruhen auf dem Geografie-Wiki des Projekts
([GeoWiki](https://github.com/DocBiber/GeoWiki)): Vulkanarten, Vulkanprozesse,
Vulnerabilitäts-Begriffe und Raumbeispiele.

## Weltkarte

Die Karte ist keine Zeichnung, sondern echte Geodaten: **Natural Earth 110m**
([naturalearthdata.com](https://www.naturalearthdata.com/)), Public Domain.

    scripts/weltkarte_bauen.py   Land-Pfade aus dem GeoJSON projizieren
    scripts/karte_bauen.py       Karte bauen und in index.html einbinden
    scripts/ne_110m_land.geojson Rohdaten (138 KB)

Die Regionen liegen an geografisch korrekten Orten:

| Region | Ort | Koordinaten |
|---|---|---|
| SUB | Anden, Peru-Chile | 75° W, 15° S |
| HOT | Hawaii | 155° W, 20° N |
| MAAR | Eifel | 7° O, 50° N |
| LIP | Deccan-Trapp, Indien | 76° O, 19° N |
| RISIKO | Nyiragongo, DR Kongo | 29° O, 1,5° S |

## Mitmachen

Fehler oder Verbesserungen gern als Issue oder Pull Request. Die Fragen und Tagebuchfragen
lässt sich in `assets/inhalte.js` anpassen, ohne den Code zu ändern.
