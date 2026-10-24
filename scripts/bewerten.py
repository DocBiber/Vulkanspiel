#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lokaler Bewertungsdienst fuer das Vulkanspiel (Weg A).

Der Dienst lauscht auf einem Port auf dem eigenen Rechner und bewertet
Freitext-Antworten mit einem KI-Dienst. Der API-Schluessel liegt in
local/konfiguration.json und kommt nie ins Repository.

Warum ein eigener Dienst? Das Spiel laeuft bei den Schuelern im Browser,
oft ueber file://. Von dort duerfte ein Schluessel nicht mitgeladen werden,
weil ihn sonst jeder Schueler im Klartext haette. Der Dienst haelt den
Schluessel auf dem Rechner der Lehrkraft.

Start:

    python scripts/bewerten.py

Der Dienst laeuft, bis du Strg+C drueckst. Das Spiel findet ihn unter
http://127.0.0.1:8765/bewerten.

Schnittstellen:

    GET  /gesund        -> {"ok": true, "dienst": "google", "modell": "..."}
    GET  /              -> kurze Anleitung
    POST /bewerten      -> {"gruppe","frage","kriterien","max","antwort"}
                          -> {"ok":true,"punkte":7,"hinweis":"..."}
                          oder {"ok":false,"fehler":"..."}

Ohne Schluessel läuft der Dienst nicht. Dann bleibt nur Weg B uebrig:
die Freitexte als JSON-Datei herunterladen und von Hand oder von einer
anderen Stelle bewerten.
"""

import json
import os
import sys
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HIER = os.path.dirname(os.path.abspath(__file__))
WURZEL = os.path.dirname(HIER)
KONFIG = os.path.join(WURZEL, "local", "konfiguration.json")
VORLAGE = os.path.join(WURZEL, "local", "konfiguration.example.json")

STANDARD = {
    "dienst": "google",
    "modell": "gemini-2.5-flash",
    "port": 8765,
    "maxZeitSekunden": 60,
}


def lese_konfiguration(pfad=KONFIG):
    """Liest local/konfiguration.json und mischt sie mit den Standardwerten."""
    werte = dict(STANDARD)
    if os.path.isfile(pfad):
        with open(pfad, "r", encoding="utf-8") as f:
            werte.update(json.load(f))
    return werte


def schluessel_pruefen(konfig):
    """
    Prueft, ob ein echter Schluessel eingetragen ist.

    Die Vorlage traegt 'HIER-DEIN-SCHLUESSEL-EINTRAGEN'. Das ist keine
    versteckte Information, sondern ein Platzhalter, an dem man sieht,
    dass die Datei noch nicht ausgefuellt ist.
    """
    schluessel = str(konfig.get("apiSchluessel") or "").strip()
    if not schluessel:
        return False, "Kein API-Schluessel in local/konfiguration.json."
    if schluessel == "HIER-DEIN-SCHLUESSEL-EINTRAGEN":
        return False, (
            "In local/konfiguration.json steht noch der Platzhalter. "
            "Traege deinen Schluessel ein und starte den Dienst neu."
        )
    if len(schluessel) < 20:
        return False, (
            "Der Schluessel in local/konfiguration.json ist viel zu kurz. "
            "Google-Schluessel beginnen mit 'AIza' und sind etwa 39 Zeichen lang."
        )
    return True, ""


def baue_prompt(daten):
    """Der Text, der dem KI-Dienst geschickt wird."""
    frage = daten.get("frage") or ""
    kriterien = daten.get("kriterien") or []
    maximum = int(daten.get("max") or 10)
    antwort = daten.get("antwort") or ""

    if kriterien:
        liste = "\n".join(
            "  {}. {}".format(i + 1, k) for i, k in enumerate(kriterien)
        )
    else:
        liste = "  (keine Kriterien angegeben — bewerte sachlich und nachvollziehbar)"

    return (
        "Du bist eine Geografie-Lehrkraft und bewertest eine Schuelerantwort "
        "nach einer festen Rubrik.\n\n"
        "Frage an die Schueler:\n{frage}\n\n"
        "Kriterien:\n{liste}\n\n"
        "Maximale Punktzahl: {maximum}\n\n"
        "Antwort der Gruppe:\n{antwort}\n\n"
        "Bewerte die Antwort nur nach den Kriterien. Gib eine ganze Zahl "
        "zwischen 0 und {maximum} an, die dem Erfuellungsgrad entspricht. "
        "Eine Antwort, die ein Kriterium nur ansatzweise erfuellt, bekommt "
        "Teilpunkte. Schreibe danach in ein bis zwei Saetzen, was gut war "
        "und was fehlt.\n\n"
        "Antworte ausschliesslich mit einem JSON-Objekt, sonst nichts:\n"
        '{{"punkte": <Zahl>, "hinweis": "<Begruendung>"}}'
    ).format(frage=frage, liste=liste, maximum=maximum, antwort=antwort)


def rufe_google(schluessel, modell, prompt, timeout):
    """Bewertung ueber Google AI Studio (Gemini)."""
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "{}:generateContent?key={}".format(modell, schluessel)
    )
    koerper = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 400},
    }).encode("utf-8")
    anfrage = urllib.request.Request(
        url, data=koerper, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(anfrage, timeout=timeout) as antwort:
        roh = json.loads(antwort.read().decode("utf-8"))
    text = roh["candidates"][0]["content"]["parts"][0]["text"]
    return text


def rufe_groq(schluessel, modell, prompt, timeout):
    """Bewertung ueber Groq (OpenAI-kompatibel)."""
    url = "https://api.groq.com/openai/v1/chat/completions"
    koerper = json.dumps({
        "model": modell,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 400,
    }).encode("utf-8")
    anfrage = urllib.request.Request(url, data=koerper, headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer " + schluessel,
    })
    with urllib.request.urlopen(anfrage, timeout=timeout) as antwort:
        roh = json.loads(antwort.read().decode("utf-8"))
    return roh["choices"][0]["message"]["content"]


def parse_bewertung(text, maximum):
    """
    Zieht Punkte und Hinweis aus der Antwort des Dienstes.

    Der Dienst soll JSON liefern. Damit ein Tippfehler oder ein Satz davor
    das Ergebnis nicht kaputt macht, wird das JSON im Text gesucht.
    """
    text = (text or "").strip()

    # Direkt als JSON?
    try:
        daten = json.loads(text)
        if isinstance(daten, dict):
            return saeubere(daten, maximum, text)
    except ValueError:
        pass

    # JSON in geschweiften Klammern suchen.
    anfang = text.find("{")
    ende = text.rfind("}")
    if anfang >= 0 and ende > anfang:
        try:
            daten = json.loads(text[anfang:ende + 1])
            if isinstance(daten, dict):
                return saeubere(daten, maximum, text)
        except ValueError:
            pass

    return {
        "ok": False,
        "fehler": (
            "Der Dienst hat keine verwertbare Bewertung geliefert. "
            "Die Antwort war: " + text[:200]
        ),
    }


def saeubere(daten, maximum, rohtext):
    """Rechnet die Punkte in den gueltigen Bereich und liefert sie zurueck."""
    roh = daten.get("punkte")
    try:
        punkte = int(float(roh))
    except (TypeError, ValueError):
        return {
            "ok": False,
            "fehler": "Der Dienst hat keine Zahl geliefert: " + str(roh)[:80],
        }
    punkte = max(0, min(maximum, punkte))

    hinweis = str(daten.get("hinweis") or "").strip()
    if not hinweis:
        hinweis = "Bewertet mit {} von {} Punkten.".format(punkte, maximum)

    return {"ok": True, "punkte": punkte, "max": maximum, "hinweis": hinweis}


def bewerten(konfig, daten):
    """Eine Antwort bewerten. Liefert immer ein Ergebnis-Objekt."""
    if not daten.get("antwort") or not str(daten.get("antwort")).strip():
        return {"ok": False, "fehler": "Es liegt keine Antwort vor."}

    maximum = int(daten.get("max") or 10)
    prompt = baue_prompt(daten)
    schluessel = str(konfig.get("apiSchluessel") or "")
    modell = str(konfig.get("modell") or STANDARD["modell"])
    dienst = str(konfig.get("dienst") or STANDARD["dienst"]).lower()
    timeout = int(konfig.get("maxZeitSekunden") or STANDARD["maxZeitSekunden"])

    try:
        if dienst == "groq":
            text = rufe_groq(schluessel, modell, prompt, timeout)
        else:
            text = rufe_google(schluessel, modell, prompt, timeout)
    except urllib.error.HTTPError as e:
        detail = ""
        try:
            detail = e.read().decode("utf-8")[:300]
        except Exception:
            pass
        return {
            "ok": False,
            "fehler": (
                "Der Dienst hat geantwortet mit HTTP {}. {}".format(e.code, detail)
            ),
        }
    except urllib.error.URLError as e:
        return {
            "ok": False,
            "fehler": (
                "Keine Verbindung zum Dienst: {}. Ist die Internetverbindung "
                "an?".format(e.reason)
            ),
        }
    except Exception as e:  # noqa: BLE001 - dem Nutzer die Ursache zeigen
        return {
            "ok": False,
            "fehler": "Unerwarteter Fehler: {} ({})".format(type(e).__name__, e),
        }

    return parse_bewertung(text, maximum)


class Handler(BaseHTTPRequestHandler):
    """Nimmt Anfragen aus dem Spiel entgegen."""

    server_version = "VulkanspielBewertung/1.0"
    konfig = {}

    def log_message(self, format, *args):  # noqa: A002 - Schublade von BaseHTTPRequestHandler
        # Ruhiger als die Standard-Ausgabe, damit die Konsole lesbar bleibt.
        sys.stdout.write("  %s - %s\n" % (self.address_string(), format % args))

    def _cors(self):
        # Das Spiel laeuft oft ueber file://. Ohne diese Header blockiert
        # der Browser den Aufruf, weil der Ursprung 'null' ist.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _sende(self, code, koerper, typ="application/json"):
        roh = json.dumps(koerper, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", typ + "; charset=utf-8")
        self.send_header("Content-Length", str(len(roh)))
        self._cors()
        self.end_headers()
        self.wfile.write(roh)

    def do_OPTIONS(self):  # noqa: N802 - Name kommt von BaseHTTPRequestHandler
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):  # noqa: N802
        if self.path.startswith("/gesund"):
            ok, meldung = schluessel_pruefen(self.konfig)
            self._sende(200, {
                "ok": ok,
                "dienst": self.konfig.get("dienst"),
                "modell": self.konfig.get("modell"),
                "fehler": meldung,
            })
            return

        if self.path in ("/", "/anleitung"):
            self._sende(200, {
                "ok": True,
                "dienst": "lokaler Bewertungsdienst fuer das Vulkanspiel",
                "ende": {
                    "GET /gesund": "zeigt, ob ein Schluessel eingetragen ist",
                    "POST /bewerten": (
                        '{"gruppe","frage","kriterien","max","antwort"} -> '
                        '{"ok":true,"punkte":n,"hinweis":"..."}'
                    ),
                },
                "hinweis": (
                    "Der Schluessel liegt in local/konfiguration.json und "
                    "kommt nicht ins Repository."
                ),
            })
            return

        self._sende(404, {"ok": False, "fehler": "Unbekannter Pfad: " + self.path})

    def do_POST(self):  # noqa: N802
        if self.path != "/bewerten":
            self._sende(404, {"ok": False, "fehler": "Unbekannter Pfad: " + self.path})
            return

        try:
            laenge = int(self.headers.get("Content-Length") or 0)
            roh = self.rfile.read(laenge) if laenge else b""
            daten = json.loads(roh.decode("utf-8"))
        except (ValueError, UnicodeDecodeError) as e:
            self._sende(400, {"ok": False, "fehler": "Anfrage ist kein gueltiges JSON: " + str(e)})
            return

        if not isinstance(daten, dict):
            self._sende(400, {"ok": False, "fehler": "Die Anfrage muss ein JSON-Objekt sein."})
            return

        ergebnis = bewerten(self.konfig, daten)
        self._sende(200 if ergebnis.get("ok") else 502, ergebnis)


def main():
    konfig = lese_konfiguration()
    ok, meldung = schluessel_pruefen(konfig)

    print("Lokaler Bewertungsdienst fuer das Vulkanspiel")
    print("=" * 46)
    print("Konfiguration: {}".format(KONFIG if os.path.isfile(KONFIG) else VORLAGE))
    print("Dienst:        {}".format(konfig.get("dienst")))
    print("Modell:        {}".format(konfig.get("modell")))
    print("Port:          {}".format(konfig.get("port")))
    print()

    if not ok:
        print("Der Dienst wird NICHT gestartet.")
        print()
        print(meldung)
        print()
        print("So gehst du vor:")
        print("  1. Kopiere die Vorlage:")
        print("       local/konfiguration.example.json")
        print("     nach")
        print("       local/konfiguration.json")
        print("  2. Traege deinen API-Schluessel in diese Datei ein.")
        print("  3. Starte den Dienst erneut:  python scripts/bewerten.py")
        print()
        print("Die Datei local/ wird von Git ignoriert.")
        print()
        print("Ohne diesen Dienst bleibt Weg B: Freitexte als JSON-Datei")
        print("herunterladen, von Hand bewerten und zurueck einlesen.")
        return 1

    Handler.konfig = konfig
    port = int(konfig.get("port") or STANDARD["port"])
    try:
        server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    except OSError as e:
        print("Der Port {} ist nicht frei: {}".format(port, e))
        print("Traege in local/konfiguration.json einen anderen Port ein.")
        return 1

    print("Der Dienst laeuft auf http://127.0.0.1:{}".format(port))
    print("Im Spiel:  Bewertungsdienst eintragen unter 'Auswertung'.")
    print("Zum Beenden: Strg+C")
    print()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print()
        print("Beendet.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
