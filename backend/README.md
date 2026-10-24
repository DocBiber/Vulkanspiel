# Bewertungs-Backend

Bewertet die Freitext-Antworten des Vulkanspiels mit Gemini. Der API-Schlüssel
liegt nur hier, nie im Browser.

## Warum dieses Backend

Alles, was der Browser lädt, kann ein Schüler einsehen — auch ein
API-Schlüssel. Das Backend hält den Schlüssel und ruft Gemini auf. Das Spiel
schickt ihm nur die Antworten.

Die Bewertungskriterien kommen aus derselben Quelle wie das Spiel
(`assets/inhalte.js`). Ein Schüler kann die Rubrik also nicht ändern.

## Einrichten

    npm install

Dann die Vorlage kopieren und den Schlüssel eintragen:

    copy .env.example .env

Die Datei `.env` wird von Git ignoriert und kommt nie ins Repository.

Der Schlüssel kommt aus [Google AI Studio](https://aistudio.google.com) —
kostenlos, ohne Kreditkarte.

## Starten

    npm start

Der Dienst läuft auf Port 8080 und hört auf `0.0.0.0`. Im Spiel unter
„Auswertung" den Abschnitt „Bewertungsdienst (Weg A)" benutzen.

## Schnittstellen

    GET  /health           -> {"ok":true,"modell":"...","schluesselVorhanden":true}
    GET  /api/aufgaben     -> alle Freitext-Aufgaben mit ihren Kriterien
    POST /api/evaluate     -> {"gruppe","regionId","aufgabeId","antwort"}
                              -> {"ok":true,"punkte":7,"max":10,"hinweis":"..."}

Die Kriterien kommen aus dem Spielinhalt, nicht aus der Anfrage.

## Prüfungen

    npm test

Die Prüfungen rufen Gemini nicht auf. Geprüft wird der Spielinhalt, das
Einlesen der Bewertung und die Schranken des Endpunkts.

## Sicherheit

- Der Schlüssel steht nur in `.env` und wird nie in eine Antwort, ein Log oder
  einen Fehler geschrieben.
- Die Spielereingabe gilt als nicht vertrauenswürdige Daten. Sie steht in
  eigenen Tags, und der Prompt weist das Modell an, darin stehende Anweisungen
  zu ignorieren.
- Die Antwort wird auf das Maximum begrenzt und auf eine vernünftige Länge
  gekürzt.
- Eingaben werden geprüft, bevor Gemini aufgerufen wird: Gruppe vorhanden,
  Station und Aufgabe existieren, Antwort zwischen 1 und 2000 Zeichen.
- CORS ist keine Zugriffskontrolle. Die Prüfung der Eingaben ist die
  eigentliche Schranke.

## Deployment

`../Dockerfile` baut ein Container-Image für Cloud Run. Der Schlüssel kommt
zur Laufzeit als Umgebungsvariable.

Dafür braucht es die Google Cloud CLI und ein Projekt mit aktivierter
Abrechnung. Beides ist nicht Teil dieses Repositories.

## Zum lokalen Dienst

Der Ordner `../scripts/bewerten.py` enthält einen kleinen Dienst in Python,
der dasselbe tut und keine Node-Installation braucht. Wer Node ohnehin schon
hat, kann dieses Backend benutzen; wer es nicht hat, nimmt das Skript.
