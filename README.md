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
3. Die erste Region ist dadurch offen — anklicken und bearbeiten.
4. Zwei Fragen beantworten — richtig beantwortet deckt die Station farbig auf und bringt
   das Symbol sowie den Aufdruck der nächsten Station.
5. Eine Antwort ins Tagebuch schreiben.
6. Mit dem Aufdruck die nächste Station öffnen, bis alle fünf Symbole beisammen sind.
7. Das Schloss öffnen und am Ende: Punkte als CSV und das Tagebuch als Text herunterladen.

Die ausführlichen Regeln stehen in [REGELN.md](REGELN.md).

## Die Codekette

Die Gruppe bekommt am Anfang einen Zettel mit einem Aufdruck. Jede gelöste Station
liefert das Symbol der Station und den Aufdruck der nächsten Station. Mit allen fünf
Symbolen lässt sich das Schloss öffnen.

    Zettel → ASCHE → Station 1 → FUNKEN → Station 2 → WELLE → Station 3
          → TROPFEN → Station 4 → DECKE → Station 5 → fünftes Symbol → Schloss

Die Aufdrucke stehen in `assets/inhalte.js` (`startcode`, `code_naechste`, `schloss.code`)
und lassen sich dort ändern. Die Lehrkraft sieht alle Aufdrücke über
„Lehrkraft: Codes anzeigen“ im Abschnitt Auswertung.

## Die fünf Regionen

| Nr. | Kürzel | Region | Symbol | Thema |
|---|---|---|---|---|
| 1 | SUB | Subduktionszonen des Pazifiks | 🌋 Vulkan | Schichtvulkan, explosiver Vulkanismus |
| 2 | HOT | Hawaii-Hot-Spot | 🌊 Welle | Schildvulkan, effusiver Vulkanismus |
| 3 | MAAR | Maar-Feld der Eifel | 💧 Tropfen | Phreatomagmatische Explosion |
| 4 | LIP | Deccan-Trapp, Indien | 🪨 Gestein | Vulkanische Decken, Klimawirkung |
| 5 | RISIKO | Nyiragongo und Goma | 🔥 Feuer | Risiko, Exposition, Vulnerabilität |

## Punkte und Fortschritt

| Leistung | Punkte |
|---|---|
| Multiple-Choice-Frage richtig beantwortet | 10 |
| Tagebuch-Frage abgegeben | 5 |
| Schloss geöffnet | 10 |

Pro Region sind 25 Punkte möglich. Höchstpunktzahl: 145 (10 Startpunkte + 5 × 25 + 10 Schloss).
Der Fortschritt zeigt zusätzlich an, wieviele der fünf Regionen aufgedeckt sind und
wieviele Symbole gefunden sind.

## Ablauf in einer Region

1. Die Gruppe klickt eine Region auf der Weltkarte an. Ist sie verschlossen, erscheint
   ein Eingabefeld für den Aufdruck.
2. Zwei Multiple-Choice-Fragen, jede mit vier Antwortmöglichkeiten — genau eine ist richtig.
3. Eine richtige Antwort bringt 10 Punkte und wird mit einer Erklärung bestätigt.
4. Sind beide Fragen richtig, wird die Region farbig aufgedeckt. Jetzt bekommt die Gruppe
   das Symbol der Station und den Aufdruck der nächsten Station.
5. Danach gibt es eine offene Tagebuch-Frage mit Freitext-Antwort (5 Punkte).

Das Tagebuch sammelt die Antworten aller Gruppen. Die Fragen sind bewusst offen, keine
davon hat eine einzige richtige Lösung:

- „Stell dir vor, du könntest an den Rand des Pazifischen Feuerrings reisen: Was würdest du unbedingt einpacken — und warum?"
- „Wie würdest du das Klima auf Hawaii mit nur drei Worten beschreiben?"
- „Was würdest du tun, um die Menschen in Goma besser vor dem Vulkan zu schützen?"

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche (Karte inline als SVG, Regionen, Fragen, Tagebuch, Export) |
| `assets/inhalte.js` | Inhalte: Regionen, Multiple-Choice-Fragen, Tagebuch-Fragen, Spielfiguren, Symbole, Aufdrücke |
| `assets/logik.js` | Logik: Gruppen, Figuren, Fragen, Punkte, Fortschritt, Codekette, Schloss, Tagebuch, Export |
| `assets/oberflaeche.js` | Oberfläche: Anmeldung, Karte, Regionsbereich, Schloss, Tagebuch, Auswertung |
| `assets/style.css` | Basis-Styles |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `scripts/pruefe_kette.js` | Testlauf der Logik inkl. Codekette und Schloss (`node scripts/pruefe_kette.js`) |
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
