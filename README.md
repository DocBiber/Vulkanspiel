# Vulkanspiel

Sammelspiel zur Wiederholung der physischen Geografie (LK Geografie, Gymnasium Baden-Württemberg,
Bildungsplan 2016). Browser-Game, läuft ohne Installation und ohne Internetverbindung.
Eine Runde dauert 45 Minuten.

Das Spiel orientiert sich am [LMZ GeoPortal](https://geo.lmz-bw.de/gu/vegetation/#/): Die
Weltkarte ist das Spielfeld, jede richtige Antwort deckt eine Region auf.

## Schnellstart

1. `index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Gruppe anmelden: Spielfigur wählen, Name eingeben, 10 Startpunkte werden gutgeschrieben.
3. Eine Region auf der Weltkarte anklicken.
4. Zwei Fragen beantworten — richtig beantwortet deckt die Region farbig auf und bringt Punkte.
5. Eine Antwort ins Tagebuch schreiben.
6. Am Ende: Punkte als CSV und das Tagebuch als Text herunterladen.

Die ausführlichen Regeln stehen in [REGELN.md](REGELN.md).

## Die fünf Regionen

| Nr. | Kürzel | Region | Thema |
|---|---|---|---|
| 1 | SUB | Subduktionszonen des Pazifiks | Schichtvulkan, explosiver Vulkanismus |
| 2 | HOT | Hawaii-Hot-Spot | Schildvulkan, effusiver Vulkanismus |
| 3 | MAAR | Maar-Feld der Eifel | Phreatomagmatische Explosion |
| 4 | LIP | Deccan-Trapp, Indien | Vulkanische Decken, Klimawirkung |
| 5 | RISIKO | Nyiragongo und Goma | Risiko, Exposition, Vulnerabilität |

## Punkte und Fortschritt

| Leistung | Punkte |
|---|---|
| Multiple-Choice-Frage richtig beantwortet | 10 |
| Tagebuch-Frage abgegeben | 5 |

Pro Region sind 25 Punkte möglich. Höchstpunktzahl: 135 (10 Startpunkte + 5 × 25).
Der Fortschritt zeigt zusätzlich an, wieviele der fünf Regionen aufgedeckt sind.

## Ablauf in einer Region

1. Die Gruppe klickt eine Region auf der Weltkarte an.
2. Zwei Multiple-Choice-Fragen, jede mit vier Antwortmöglichkeiten — genau eine ist richtig.
3. Eine richtige Antwort bringt 10 Punkte und wird mit einer Erklärung bestätigt.
4. Sind beide Fragen richtig, wird die Region farbig aufgedeckt.
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
| `assets/inhalte.js` | Inhalte: Regionen, Multiple-Choice-Fragen, Tagebuch-Fragen, Spielfiguren |
| `assets/logik.js` | Logik: Gruppen, Figuren, Fragen, Punkte, Fortschritt, Tagebuch, Export |
| `assets/oberflaeche.js` | Oberfläche: Anmeldung, Karte, Regionsbereich, Tagebuch, Auswertung |
| `assets/style.css` | Basis-Styles |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `scripts/pruefe_logik.js` | Testlauf der Logik (`node scripts/pruefe_logik.js`) |
| `log.md` | Änderungsjournal |

Die Inhalte liegen in `assets/inhalte.js`, die Weltkarte ist als SVG direkt in `index.html`
eingebettet. Beides wird ohne `fetch()` geladen, funktioniert also auch per Doppelklick
über `file://`.

## Inhaltsquellen

Die Fragen und Erklärungen beruhen auf dem Geografie-Wiki des Projekts
([GeoWiki](https://github.com/DocBiber/GeoWiki)): Vulkanarten, Vulkanprozesse,
Vulnerabilitäts-Begriffe und Raumbeispiele.

## Mitmachen

Fehler oder Verbesserungen gern als Issue oder Pull Request. Die Fragen und Tagebuchfragen
lässt sich in `assets/inhalte.js` anpassen, ohne den Code zu ändern.
