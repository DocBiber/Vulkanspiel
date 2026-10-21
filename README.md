# Vulkanspiel

Sammelspiel zur Wiederholung der physischen Geografie (LK Geografie, Gymnasium Baden-Württemberg,
Bildungsplan 2016). Browser-Game, läuft ohne Installation und ohne Internetverbindung.
Eine Runde dauert 45 Minuten.

## Schnellstart

1. `index.html` im Browser öffnen (Doppelklick genügt, kein Server nötig).
2. Gruppe anmelden: Name eingeben, 10 Startpunkte werden gutgeschrieben.
3. Aufgabenzettel an den Stationen in der Klasse auslegen.
4. Die Gruppe löst die Aufgabe, die Lehrkraft gibt die Station frei und liest den Kurzcode vor.
5. Die Gruppe trägt den Code ein — das Kartenstück erscheint auf der Weltkarte.
6. Am Ende: Punkteübersicht als CSV exportieren.

Die ausführlichen Regeln stehen in [REGELN.md](REGELN.md).

## Die fünf Stationen

| Nr. | Kürzel | Thema | Station im Raum |
|---|---|---|---|
| 1 | SUB | Vulkanismus an Subduktionszonen | Tafelbereich Nord |
| 2 | HOT | Schildvulkane und Hot Spots | Fensterbereich West |
| 3 | MAAR | Maare und Vulkanfelder | Regalbereich |
| 4 | LIP | Vulkanische Decken (LIPs) | Türbereich Süd |
| 5 | RISIKO | Risiko und Vulnerabilität | Mitte |

## Punkte

| Leistung | Punkte |
|---|---|
| Station gelöst und Code eingegeben | 10 |
| Begründung vollständig | +5 |
| Station als Erste gelöst | +3 |
| Code falsch eingegeben | −5 |

Höchstpunktzahl pro Gruppe: 100 (10 Startpunkte + 5 × 18).

## Wie die Codes funktionieren

Jede Station hat genau einen Kurzcode aus vier Zeichen (A–Z ohne I und O, also
331.776 mögliche Kombinationen). Die Codes werden beim ersten Start zufällig erzeugt
und im Browser gespeichert. Sie sind nicht ableitbar und nicht ratbar.

Die Freigabe erfolgt ausschließlich durch die Lehrkraft über „Station freigeben".
Das Eingabefeld bleibt bis dahin gesperrt. Ein falscher Code kostet Punkte, schließt
die Gruppe aber nicht aus.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Oberfläche (Karte inline als SVG, Stationen, Punkte, Export) |
| `assets/spiel.js` | Spiel-Logik: Gruppen, Punkte, Codes, CSV |
| `assets/ui.js` | Oberfläche: Anmeldung, Stationen, Karte, Export |
| `assets/style.css` | Basis-Styles |
| `REGELN.md` | Spielregeln für Lehrkraft und Schüler |
| `data/stationen.json` | Aufgaben, Lösungshinweise, Prüfkriterien |
| `scripts/pruefe_spiel.js` | Testlauf der Logik (`node scripts/pruefe_spiel.js`) |
| `log.md` | Änderungsjournal |

Die Weltkarte ist als SVG direkt in `index.html` eingebettet. Damit funktioniert das
Spiel auch per Doppelklick über `file://` — ohne Server und ohne `fetch`.

## Inhaltsquellen

Die Aufgaben und Lösungshinweise beruhen auf dem Geografie-Wiki des Projekts
([GeoWiki](https://github.com/DocBiber/GeoWiki)): Vulkanarten, Vulkanprozesse,
Vulnerabilitäts-Begriffe und Raumbeispiele. Die Aufgaben zu Station 2 (Hot Spots),
Station 4 (Vulkanische Decken) und Station 5 (Risiko/Vulnerabilität) sind eigene
Ergänzungen.

## Mitmachen

Fehler oder Verbesserungen gern als Issue oder Pull Request. Die Aufgaben lassen sich
in `data/stationen.json` anpassen, ohne den Code zu ändern.