/**
 * Das Bewertungs-Backend des Vulkanspiels.
 *
 * Warum dieses Backend existiert: Der API-Schluessel darf nicht in den
 * Browser, weil alles, was der Browser laedt, fuer jeden einsehbar ist.
 * Dieses Backend haelt den Schluessel und ruft Gemini auf. Es laedt die
 * Bewertungskriterien aus derselben Quelle wie das Spiel, sodass ein
 * Schueler die Rubrik nicht aendern kann.
 *
 * Start:            npm install && npm start
 * Ohne Schluessel:  der Dienst startet nicht und erklart, was zu tun ist.
 */

import 'dotenv/config';

import path from 'node:path';

import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { bewerte, Fehler } from './bewertung.js';
import { alleFreitexte, findeAufgabe, leseInhalte, INHALTE_DATEI } from './inhalte.js';

const PORT = Number(process.env.PORT || 8080);
const API_KEY = process.env.GEMINI_API_KEY;
const MODELL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Urspruenge, die den Dienst aufrufen duerfen. CORS ist keine
// Zugriffskontrolle — sie verhindert nur, dass fremde Seiten im Browser
// das Ergebnis lesen. Die Pruefung der Eingaben unten ist die eigentliche
// Schranke.
const ERLAUBT = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(function (o) { return o.trim(); })
  .filter(Boolean);

const MAX_ANTWORT = 2000;
const MAX_KRITERIEN = 10;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '16kb' }));

app.use(cors({
  origin: function (origin, callback) {
    // Anfragen ohne Ursprung (curl, der lokale Dienst) und der Ursprung
    // "null" — das sendet ein Browser-Tab, das eine Datei direkt oeffnet —
    // durchlassen. Fremde Browserseiten abweisen.
    //
    // CORS ist keine Zugriffskontrolle. Sie verhindert nur, dass fremde
    // Seiten das Ergebnis im Browser lesen. Die Pruefung der Eingaben
    // unten ist die eigentliche Schranke.
    if (!origin || origin === 'null' || ERLAUBT.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Origin nicht erlaubt.'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Haeufigkeit begrenzen. Pro Serverprozess — bei mehreren Instanzen braucht
// es fuer ein belastbares globales Limit einen gemeinsamen Speicher.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

app.use('/api/', limiter);

/** Kurze Pruefung, ob der Dienst lebt. Ohne Schluessel-Offenbarung. */
app.get('/health', function (_req, res) {
  res.json({ ok: true, modell: MODELL, schluesselVorhanden: Boolean(API_KEY) });
});

/** Zeigt, welche Freitexte das Spiel hat. Zum Nachpruefen der Rubrik. */
app.get('/api/aufgaben', function (_req, res) {
  try {
    res.json({ ok: true, aufgaben: alleFreitexte(inhalte) });
  } catch (e) {
    res.status(500).json({ ok: false, fehler: 'Der Spielinhalt ist nicht lesbar.' });
  }
});

/**
 * Bewertet eine Freitext-Antwort.
 *
 * Die Kriterien kommen aus dem Spielinhalt, nicht aus der Anfrage. Die
 * Anfrage liefert nur, wessen Antwort bewertet werden soll.
 */
app.post('/api/evaluate', async function (req, res) {
  const koerper = req.body || {};

  // --- Eingaben pruefen, bevor irgendetwas an Gemini geht. ---
  const gruppe = typeof koerper.gruppe === 'string' ? koerper.gruppe.trim() : '';
  const regionId = typeof koerper.regionId === 'string' ? koerper.regionId.trim() : '';
  const aufgabeId = typeof koerper.aufgabeId === 'string' ? koerper.aufgabeId.trim() : '';
  const antwort = typeof koerper.antwort === 'string' ? koerper.antwort : '';

  if (!gruppe) {
    return res.status(400).json({ ok: false, fehler: 'Bitte eine Gruppe angeben.' });
  }
  if (gruppe.length > 40) {
    return res.status(400).json({ ok: false, fehler: 'Der Gruppenname ist zu lang.' });
  }
  if (!regionId || !aufgabeId) {
    return res.status(400).json({ ok: false, fehler: 'Station oder Aufgabe fehlt.' });
  }
  if (!antwort.trim()) {
    return res.status(400).json({ ok: false, fehler: 'Es liegt keine Antwort vor.' });
  }
  if (antwort.length > MAX_ANTWORT) {
    return res.status(400).json({
      ok: false,
      fehler: 'Die Antwort ist zu lang (hoechstens ' + MAX_ANTWORT + ' Zeichen).'
    });
  }

  // --- Die Aufgabe muss im Spielinhalt stehen. ---
  const aufgabe = findeAufgabe(inhalte, regionId, aufgabeId);
  if (!aufgabe) {
    return res.status(404).json({
      ok: false,
      fehler: 'Diese Aufgabe gibt es nicht oder ist kein Freitext.'
    });
  }

  if (!API_KEY) {
    return res.status(503).json({
      ok: false,
      fehler: 'Kein API-Schluessel eingetragen. Siehe backend/.env.example.'
    });
  }

  // --- Bewerten. ---
  try {
    const ergebnis = await bewerte(aufgabe, antwort, {
      apiSchluessel: API_KEY,
      modell: MODELL
    });

    return res.json({
      ok: true,
      gruppe: gruppe,
      regionId: regionId,
      aufgabeId: aufgabeId,
      punkte: ergebnis.punkte,
      max: ergebnis.max,
      hinweis: ergebnis.hinweis
    });
  } catch (e) {
    if (e instanceof Fehler) {
      // Erreichbar, aber keine verwertbare Bewertung.
      return res.status(502).json({ ok: false, fehler: e.message });
    }
    // Unerwarteter Fehler: Ursache nennen, aber nichts vom Schluessel.
    console.error('Bewertung fehlgeschlagen: ' + (e && e.name ? e.name : 'unbekannt'));
    return res.status(502).json({
      ok: false,
      fehler: 'Die Antwort konnte gerade nicht bewertet werden.'
    });
  }
});

// --- Spielinhalt einmalig laden, damit jeder Aufruf denselben hat. ---
let inhalte;
try {
  inhalte = leseInhalte();
} catch (e) {
  console.error('Der Spielinhalt ist nicht lesbar:');
  console.error('  ' + (e && e.message ? e.message : e));
  console.error('  Erwartet wird: ' + INHALTE_DATEI);
  process.exit(1);
}

const anzahlFrei = alleFreitexte(inhalte).length;

// --- Der Dienst laeuft nur, wenn er direkt aufgerufen wird. ---
// Beim Import (in den Tests) wird nur die App geliefert, nicht der Port
// belegt.
const DIREKT = process.argv[1] &&
  import.meta.url === new URL('file://' + path.resolve(process.argv[1]).replace(/\\/g, '/')).href;

if (DIREKT) {
  if (!API_KEY) {
    console.error('Kein API-Schluessel eingetragen (GEMINI_API_KEY).');
    console.error('  Kopiere backend/.env.example nach backend/.env');
    console.error('  und traege deinen Schluessel ein.');
    console.error('  Der Dienst wird NICHT gestartet.');
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', function () {
    console.log('Bewertungs-Backend laeuft auf Port ' + PORT);
    console.log('  Modell:      ' + MODELL);
    console.log('  Freitexte:   ' + anzahlFrei + ' Aufgaben im Spielinhalt');
    console.log('  Erlaubt:     ' + ERLAUBT.join(', '));
    console.log('  Gesund:      GET  /health');
    console.log('  Bewerten:    POST /api/evaluate');
  });
}

export { app, inhalte };
