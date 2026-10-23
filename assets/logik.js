/**
 * Vulkanspiel — Logik (Offline, localStorage).
 *
 * Spielidee, angelehnt an das LMZ GeoPortal (https://geo.lmz-bw.de/gu/vegetation/#/):
 * Die Weltkarte ist das Spielfeld. Eine Gruppe klickt eine Region an, beantwortet
 * dort Multiple-Choice-Fragen und schreibt Antworten ins Tagebuch. Jede richtige
 * Antwort deckt die Region auf und bringt Punkte. Das Tagebuch sammelt Freitext.
 *
 * Zusaetzlich zum LMZ-Vorbild: Es gibt Punkte und einen Wettbewerb, dazu einen
 * Fortschritt (Spielstand) als Anzahl aufgedeckter Regionen.
 *
 * Codekette und Schloss:
 *   Die Gruppe bekommt am Anfang einen Zettel mit einem Aufdruck (Startcode).
 *   Der Code oeffnet die erste Region. Das Loesen einer Region liefert das Symbol
 *   der Station und den Code der naechsten Region. Mit allen fuenf Symbolen
 *   laesst sich das Schloss oeffnen.
 *
 * Aufgabentypen:
 *   Eine Region traegt eine Liste "aufgaben". Jede Aufgabe hat "typ" und "daten".
 *   Die Typen liegen in assets/aufgaben.js (window.AUFGABEN_TYPEN). Neue Typen
 *   koennen dort ergaenzt werden, ohne diese Datei zu aendern — der einzige
 *   Sonderfall ist "freitext", weil dessen Punkte erst mit der Bewertung fallen.
 *
 *   Aeltere Regionen ohne "aufgaben" (nur "fragen" und "tagebuch") werden
 *   automatisch umgesetzt, damit sie weiterlaufen.
 *
 * Freitext:
 *   Eine Freitext-Antwort gibt Punkte erst, wenn eine Bewertung vorliegt. Das kann
 *   der lokale Bewertungsdienst sein (Weg A) oder eine Bewertungsdatei, die die
 *   Lehrkraft einfuegt (Weg B). Ohne Bewertung gilt die Antwort als abgegeben,
 *   die Station kann also auch ohne KI aufgedeckt werden.
 *
 * Die Inhalte kommen aus assets/inhalte.js (window.VULKAN_STATIONEN).
 * Gespeichert wird nur im Browser (localStorage), es gibt keinen Server.
 */
(function () {
  'use strict';

  var SPEICHER_KEY = 'vulkanspiel.v5';
  var INHALTE = (typeof window !== 'undefined' && window.VULKAN_STATIONEN) || null;
  var TYPEN = (typeof window !== 'undefined' && window.AUFGABEN_TYPEN) || null;

  // Fallback, falls assets/inhalte.js nicht geladen werden konnte.
  var REGIONEN_FALLBACK = [
    { id: 'subduktion', nr: 1, kuerzel: 'SUB', name: 'Subduktionszonen des Pazifiks', svg_id: 'piece-subduktion', farbe: '#c0392b', figur: { x: 120, y: 180 }, symbol: '🌋', symbol_name: 'Vulkan', code_naechste: 'FUNKEN', aufgaben: [] },
    { id: 'hotspot',    nr: 2, kuerzel: 'HOT', name: 'Hawaii-Hot-Spot',               svg_id: 'piece-hotspot',    farbe: '#e67e22', figur: { x: 150, y: 330 }, symbol: '🌊', symbol_name: 'Welle', code_naechste: 'WELLE', aufgaben: [] },
    { id: 'maar',       nr: 3, kuerzel: 'MAAR', name: 'Maar-Feld der Eifel',          svg_id: 'piece-maar',       farbe: '#8e44ad', figur: { x: 500, y: 150 }, symbol: '💧', symbol_name: 'Tropfen', code_naechste: 'TROPFEN', aufgaben: [] },
    { id: 'lip',        nr: 4, kuerzel: 'LIP', name: 'Deccan-Trapp, Indien',         svg_id: 'piece-lip',        farbe: '#16a085', figur: { x: 680, y: 320 }, symbol: '🪨', symbol_name: 'Gestein', code_naechste: 'DECKE', aufgaben: [] },
    { id: 'risiko',     nr: 5, kuerzel: 'RISIKO', name: 'Nyiragongo und Goma',       svg_id: 'piece-risiko',     farbe: '#2c3e50', figur: { x: 660, y: 300 }, symbol: '🔥', symbol_name: 'Feuer', code_naechste: '', aufgaben: [] }
  ];

  var FIGUREN_FALLBACK = [
    { id: 'vulkan', symbol: '🔭', name: 'Vulkanforscherin' },
    { id: 'gletscher', symbol: '🧊', name: 'Gletscherforscherin' },
    { id: 'seismologe', symbol: '📡', name: 'Seismologin' },
    { id: 'fernerkun', symbol: '🛰️', name: 'Fernerkundung' },
    { id: 'team', symbol: '🧭', name: 'Feldteam' }
  ];

  var PUNKTE = {
    FRAGE_RICHTIG: (INHALTE && INHALTE.punkte && INHALTE.punkte.frage_richtig) || 10,
    TAGEBUCH_ABGABE: (INHALTE && INHALTE.punkte && INHALTE.punkte.tagebuch_abgabe) || 5
  };

  var STARTPUNKTE = (INHALTE && INHALTE.startpunkte) || 10;
  var STARTCODE = (INHALTE && INHALTE.startcode) || 'ASCHE';
  var SCHLOSS_BONUS = (INHALTE && INHALTE.schloss && INHALTE.schloss.bonuspunkte) || 10;

  var REGIONEN = (INHALTE && INHALTE.regionen && INHALTE.regionen.length)
    ? INHALTE.regionen
    : REGIONEN_FALLBACK;

  var FIGUREN = (INHALTE && INHALTE.spielfiguren && INHALTE.spielfiguren.length)
    ? INHALTE.spielfiguren
    : FIGUREN_FALLBACK;

  // ---------- Zustand ----------

  function neuerZustand() {
    return {
      version: 5,
      gruppen: [],
      aktivGruppe: null,
      gestartet: false
    };
  }

  function lade() {
    var z = null;
    try { z = JSON.parse(localStorage.getItem(SPEICHER_KEY) || 'null'); } catch (e) { z = null; }
    if (!z || z.version !== 5) return neuerZustand();
    return z;
  }

  function speichere(z) {
    try { localStorage.setItem(SPEICHER_KEY, JSON.stringify(z)); }
    catch (e) { console.warn('Zustand konnte nicht gespeichert werden:', e); }
  }

  var zustand = lade();

  // ---------- Hilfen ----------

  function gruppe(name) {
    if (!name) return null;
    for (var i = 0; i < zustand.gruppen.length; i++) {
      if (zustand.gruppen[i].name === name) return zustand.gruppen[i];
    }
    return null;
  }

  function aktiv() { return gruppe(zustand.aktivGruppe); }

  function region(id) {
    for (var i = 0; i < REGIONEN.length; i++) {
      if (REGIONEN[i].id === id) return REGIONEN[i];
    }
    return null;
  }

  function figur(id) {
    for (var i = 0; i < FIGUREN.length; i++) {
      if (FIGUREN[i].id === id) return FIGUREN[i];
    }
    return FIGUREN[0];
  }

  /**
   * Die Aufgaben einer Region als einheitliche Liste.
   *
   * Eine Region traegt "aufgaben": [{ id, typ, punkte, frage, ...daten }].
   * Eine aeltere Region ohne "aufgaben" liefert ihre "fragen" und "tagebuch"
   * umgesetzt, damit sie unveraendert weiterlaeuft.
   */
  function aufgabenVon(regionId) {
    var r = region(regionId);
    if (!r) return [];

    if (r.aufgaben && r.aufgaben.length) {
      return r.aufgaben.map(function (a) {
        var punkte = a.punkte || PUNKTE.FRAGE_RICHTIG;
        // "max" ist die Punktzahl, die ein Typpruefer skaliert.
        var d = Object.assign({ max: punkte }, a.daten || {});
        return Object.assign({}, a, { punkte: punkte, daten: d });
      });
    }

    var out = [];
    (r.fragen || []).forEach(function (fr) {
      var punkte = fr.punkte || PUNKTE.FRAGE_RICHTIG;
      out.push(Object.assign({}, fr, {
        typ: 'mc',
        punkte: punkte,
        daten: Object.assign({ max: punkte }, fr)
      }));
    });
    (r.tagebuch || []).forEach(function (tf) {
      var punkte = PUNKTE.TAGEBUCH_ABGABE;
      out.push({
        id: tf.id,
        typ: 'freitext',
        punkte: punkte,
        frage: tf.frage,
        daten: { max: punkte }
      });
    });
    return out;
  }

  function aufgabe(regionId, aufgabeId) {
    var list = aufgabenVon(regionId);
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === aufgabeId) return list[i];
    }
    return null;
  }

  /** Ist eine Aufgabe ein Freitext? */
  function istFreitext(a) {
    return !!a && a.typ === 'freitext';
  }

  /** Leerer Fortschritt fuer eine Gruppe (wird beim Anmelden angelegt). */
  function neuerFortschritt() {
    var f = {};
    REGIONEN.forEach(function (r) {
      f[r.id] = {
        freigeschaltet: false,  // Code eingegeben, Region darf bearbeitet werden
        aufgaben: {},            // aufgabeId -> Eintrag
        offen: false            // alle Aufgaben geloest, Region aufgedeckt
      };
    });
    return f;
  }

  /** Der Code, der zum Oeffnen einer Region noetig ist. */
  function codeFuerRegion(regionId) {
    for (var i = 0; i < REGIONEN.length; i++) {
      if (REGIONEN[i].id !== regionId) continue;
      return i === 0 ? STARTCODE : (REGIONEN[i - 1].code_naechste || '');
    }
    return '';
  }

  /** Die Position einer Region in der Kette (1 bis 5). */
  function kettenPosition(regionId) {
    for (var i = 0; i < REGIONEN.length; i++) {
      if (REGIONEN[i].id === regionId) return i + 1;
    }
    return 0;
  }

  /** Offene Regionen auf der Karte sichtbar machen. */
  function regionAufdecken(regionId) {
    var r = region(regionId);
    if (!r) return;
    var el = document.getElementById(r.svg_id);
    if (el) {
      el.classList.add('offen');
      el.setAttribute('data-offen', '1');
    }
  }

  /** Anzahl der geloesten Aufgaben einer Region. */
  function geloesteInRegion(g, regionId) {
    var f = g.regionen[regionId];
    if (!f) return 0;
    var n = 0;
    aufgabenVon(regionId).forEach(function (a) {
      var e = f.aufgaben[a.id];
      if (e && e.geloest) n++;
    });
    return n;
  }

  /** Ist eine Region vollstaendig aufgedeckt? */
  function regionIstOffen(g, regionId) {
    var list = aufgabenVon(regionId);
    return list.length > 0 && geloesteInRegion(g, regionId) === list.length;
  }

  /** Fortschritt: Anzahl aufgedeckter Regionen. */
  function fortschritt(g) {
    var n = 0;
    REGIONEN.forEach(function (r) {
      if (g.regionen[r.id] && g.regionen[r.id].offen) n++;
    });
    return n;
  }

  // ---------- Aktionen ----------

  /**
   * Eine Gruppe anmelden. Der Code vom Zettel (Startcode) muss stimmen, sonst
   * beginnt das Spiel nicht.
   */
  function gruppeAnmelden(name, figurId, startcode) {
    name = String(name == null ? '' : name).trim();
    if (!name) return { ok: false, fehler: 'Bitte einen Gruppennamen eingeben.' };
    if (name.length > 24) return { ok: false, fehler: 'Name zu lang (max. 24 Zeichen).' };
    if (gruppe(name)) return { ok: false, fehler: 'Dieser Gruppenname ist bereits vergeben.' };
    if (!figurId) return { ok: false, fehler: 'Bitte eine Spielfigur waehlen.' };

    var code = String(startcode == null ? '' : startcode).trim().toUpperCase();
    if (!code) return { ok: false, fehler: 'Bitte den Aufdruck vom Zettel eintragen.' };
    if (code !== String(STARTCODE).toUpperCase()) {
      return { ok: false, fehler: 'Das ist nicht der Aufdruck vom Zettel. Schaut noch einmal genau hin.' };
    }

    var f = figur(figurId);
    var regionen = neuerFortschritt();
    // Der Startcode oeffnet die erste Region der Kette.
    regionen[REGIONEN[0].id].freigeschaltet = true;

    zustand.gruppen.push({
      name: name,
      figur: f.id,
      symbol: f.symbol,
      figurName: f.name,
      punkte: STARTPUNKTE,
      regionen: regionen,
      schlossAuf: false
    });
    zustand.aktivGruppe = name;
    zustand.gestartet = true;
    speichere(zustand);
    return { ok: true, punkte: STARTPUNKTE, figur: f };
  }

  /**
   * Einen Code fuer eine Region einloesen. Stimmt er, wird die Region
   * freigeschaltet; sonst bleibt sie verschlossen.
   */
  function codeEinloesen(regionId, code) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var r = region(regionId);
    if (!r) return { ok: false, fehler: 'Unbekannte Region.' };
    var f = g.regionen[regionId];
    if (f.freigeschaltet) {
      return { ok: false, fehler: 'Diese Region ist bereits geoeffnet.' };
    }

    var eingegeben = String(code == null ? '' : code).trim().toUpperCase();
    var erwartet = String(codeFuerRegion(regionId)).toUpperCase();
    if (!eingegeben) {
      return { ok: false, fehler: 'Bitte zuerst den Code eintragen.' };
    }
    if (eingegeben !== erwartet) {
      return { ok: false, fehler: 'Der Code passt nicht zu dieser Region. Versucht es erneut.' };
    }

    f.freigeschaltet = true;
    speichere(zustand);
    return { ok: true, region: r.id, kettenPosition: kettenPosition(regionId) };
  }

  function gruppeWaehlen(name) {
    if (!gruppe(name)) return { ok: false, fehler: 'Gruppe nicht gefunden.' };
    zustand.aktivGruppe = name;
    speichere(zustand);
    return { ok: true };
  }

  /**
   * Eine Aufgabe pruefen. Der Typ entscheidet, wie die Angabe ausgewertet wird.
   *
   * Eine geloeste Aufgabe gibt ihre Punkte einmalig. Falsche Versuche kosten
   * nichts, damit eine Gruppe ausprobieren kann. Freitext-Aufgaben sind eine
   * Ausnahme: sie zaehlen als geloest, sobald eine Antwort vorliegt, geben aber
   * erst mit der Bewertung Punkte (siehe freitextBewerten).
   */
  function aufgabePruefen(regionId, aufgabeId, angabe) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var a = aufgabe(regionId, aufgabeId);
    if (!a) return { ok: false, fehler: 'Unbekannte Aufgabe.' };

    var f = g.regionen[regionId];
    if (!f.freigeschaltet) {
      return { ok: false, fehler: 'Diese Region ist noch verschlossen. Ihr braucht zuerst den richtigen Code.' };
    }

    var bisher = f.aufgaben[aufgabeId];
    if (bisher && bisher.geloest) {
      return { ok: false, fehler: 'Diese Aufgabe ist bereits geloest.', bereitsGeloest: true };
    }

    var typ = a.typ || 'mc';
    var pruefer = TYPEN && TYPEN[typ] ? TYPEN[typ].pruefe : null;
    if (!pruefer) {
      return { ok: false, fehler: 'Dieser Aufgabentyp wird nicht unterstuetzt: ' + typ };
    }

    // Neue Aufgaben tragen ihre Werte unter "daten", aeltere unter dem
    // Aufgabenobjekt selbst. Beides wird hier gleich behandelt.
    var ergebnis = pruefer(a.daten || a, angabe);

    // Noch nicht vollstaendig bearbeitet: nichts speichern, nichts werten.
    if (ergebnis.moeglich === false) {
      return {
        ok: false,
        richtig: false,
        moeglich: false,
        punkte: 0,
        max: ergebnis.max || a.punkte || 0,
        hinweis: ergebnis.hinweis,
        details: ergebnis.details || []
      };
    }

    // Freitext: die Antwort zaehlt als geloest, Punkte kommen mit der Bewertung.
    if (istFreitext(a)) {
      f.aufgaben[aufgabeId] = {
        angabe: angabe,
        geloest: true,
        bewertet: false,
        punkte: 0,
        hinweis: ergebnis.hinweis
      };
      if (regionIstOffen(g, regionId)) {
        f.offen = true;
        regionAufdecken(regionId);
      }
      speichere(zustand);
      return {
        ok: true,
        richtig: true,
        geloest: true,
        wartetAufBewertung: true,
        punkte: 0,
        max: a.punkte || PUNKTE.TAGEBUCH_ABGABE,
        hinweis: ergebnis.hinweis,
        regionOffen: f.offen,
        geloeste: geloesteInRegion(g, regionId),
        gesamt: aufgabenVon(regionId).length
      };
    }

    // Automatische Typen: Punkte fallen sofort an.
    if (!ergebnis.richtig) {
      speichere(zustand);
      return {
        ok: false,
        richtig: false,
        punkte: 0,
        max: ergebnis.max || a.punkte || 0,
        hinweis: ergebnis.hinweis,
        details: ergebnis.details || [],
        geloeste: geloesteInRegion(g, regionId),
        gesamt: aufgabenVon(regionId).length,
        fehler: ergebnis.hinweis
      };
    }

    var pkt = ergebnis.punkte || 0;
    f.aufgaben[aufgabeId] = {
      angabe: angabe,
      geloest: true,
      bewertet: true,
      punkte: pkt,
      hinweis: ergebnis.hinweis,
      details: ergebnis.details || []
    };
    g.punkte += pkt;

    if (regionIstOffen(g, regionId)) {
      f.offen = true;
      regionAufdecken(regionId);
    }
    speichere(zustand);

    var r = region(regionId);
    return {
      ok: true,
      richtig: true,
      punkte: pkt,
      max: ergebnis.max || a.punkte || 0,
      hinweis: ergebnis.hinweis,
      details: ergebnis.details || [],
      regionOffen: f.offen,
      geloeste: geloesteInRegion(g, regionId),
      gesamt: aufgabenVon(regionId).length,
      // Erst wenn die Region vollstaendig aufgedeckt ist, wird der Zettel
      // mit dem Symbol und dem Code der naechsten Station gezeigt.
      symbol: f.offen ? r.symbol : '',
      symbolName: f.offen ? r.symbol_name : '',
      codeNaechste: f.offen ? r.code_naechste : ''
    };
  }

  /**
   * Kompatibilitaet: eine Multiple-Choice-Frage beantworten. Leitet an
   * aufgabePruefen weiter, damit aeltere Aufrufer weiterlaufen.
   */
  function frageBeantworten(regionId, frageId, auswahl) {
    return aufgabePruefen(regionId, frageId, auswahl);
  }

  /** Die Symbole, die eine Gruppe bisher gefunden hat. */
  function symbole(g) {
    var out = [];
    REGIONEN.forEach(function (r) {
      var f = g.regionen[r.id];
      if (f && f.offen) {
        out.push({ region: r.name, symbol: r.symbol, symbolName: r.symbol_name, kuerzel: r.kuerzel });
      }
    });
    return out;
  }

  /** Sind alle fuenf Symbole gesammelt? */
  function schlossBereit(g) {
    return symbole(g).length === REGIONEN.length && REGIONEN.length > 0;
  }

  /**
   * Das Schloss oeffnen. Geschieht nur, wenn alle Symbole gesammelt sind.
   * Bringt einen Bonus und den Abschluss.
   */
  function schlossOeffnen() {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    if (g.schlossAuf) return { ok: false, fehler: 'Das Schloss ist bereits geoeffnet.' };
    if (!schlossBereit(g)) {
      return {
        ok: false,
        fehler: 'Euch fehlen noch ' + (REGIONEN.length - symbole(g).length) + ' Symbole.',
        fehlende: REGIONEN.length - symbole(g).length
      };
    }

    g.schlossAuf = true;
    g.punkte += SCHLOSS_BONUS;
    speichere(zustand);
    return {
      ok: true,
      bonus: SCHLOSS_BONUS,
      code: (INHALTE && INHALTE.schloss && INHALTE.schloss.code) || '',
      text: (INHALTE && INHALTE.schloss && INHALTE.schloss.text) || '',
      gesamt: g.punkte
    };
  }

  // ---------- Freitext ----------

  /**
   * Eine Freitext-Antwort speichern. Die Antwort zaehlt als geloest, gibt aber
   * erst mit der Bewertung Punkte.
   */
  function freitextSpeichern(regionId, aufgabeId, text) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var a = aufgabe(regionId, aufgabeId);
    if (!a) return { ok: false, fehler: 'Unbekannte Aufgabe.' };
    if (!istFreitext(a)) return { ok: false, fehler: 'Diese Aufgabe ist kein Freitext.' };

    text = String(text == null ? '' : text).trim();
    if (text.length < 5) {
      return { ok: false, fehler: 'Bitte schreibt mindestens ein bis zwei Saetze.' };
    }

    var f = g.regionen[regionId];
    var bisher = f.aufgaben[aufgabeId];

    // Erneutes Schreiben aendert den Text, gibt aber keine Punkte mehr.
    f.aufgaben[aufgabeId] = {
      angabe: text,
      geloest: true,
      bewertet: !!(bisher && bisher.bewertet),
      punkte: bisher ? bisher.punkte : 0,
      hinweis: 'Antwort uebernommen. Sie wird bewertet, sobald die Bewertung zurueck ist.'
    };
    if (regionIstOffen(g, regionId)) {
      f.offen = true;
      regionAufdecken(regionId);
    }
    speichere(zustand);
    return { ok: true, neu: !bisher, gesamt: g.punkte };
  }

  /**
   * Eine Bewertung eintragen. Punkte fallen hier, nicht beim Schreiben.
   * Wird vom Bewertungsdienst (Weg A) oder aus der Bewertungsdatei (Weg B)
   * aufgerufen.
   */
  function freitextBewerten(regionId, aufgabeId, punkte, hinweis) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var a = aufgabe(regionId, aufgabeId);
    if (!a) return { ok: false, fehler: 'Unbekannte Aufgabe.' };

    var f = g.regionen[regionId];
    var e = f.aufgaben[aufgabeId];
    if (!e) return { ok: false, fehler: 'Es liegt noch keine Antwort vor.' };

    var max = a.punkte || PUNKTE.TAGEBUCH_ABGABE;
    var neu = Number(punkte);
    if (!isFinite(neu) || neu < 0) neu = 0;
    if (neu > max) neu = max;

    // Differenz verbuchen, damit eine erneute Bewertung nicht doppelt zaehlt.
    g.punkte = g.punkte - (e.punkte || 0) + neu;
    f.aufgaben[aufgabeId] = {
      angabe: e.angabe,
      geloest: true,
      bewertet: true,
      punkte: neu,
      hinweis: hinweis || '',
      bewertetAm: new Date().toISOString()
    };
    speichere(zustand);
    return { ok: true, punkte: neu, max: max, gesamt: g.punkte };
  }

  /** Alle Freitext-Antworten aller Gruppen (fuer Export und Bewertung). */
  function freitextEintraege() {
    var out = [];
    zustand.gruppen.forEach(function (g) {
      REGIONEN.forEach(function (r) {
        var f = g.regionen[r.id];
        if (!f) return;
        aufgabenVon(r.id).forEach(function (a) {
          if (!istFreitext(a)) return;
          var e = f.aufgaben[a.id];
          if (e && e.angabe) {
            out.push({
              gruppe: g.name,
              regionId: r.id,
              region: r.name,
              aufgabeId: a.id,
              frage: a.frage,
              kriterien: (a.daten && a.daten.kriterien) || a.kriterien || [],
              max: a.punkte || PUNKTE.TAGEBUCH_ABGABE,
              antwort: e.angabe,
              bewertet: !!e.bewertet,
              punkte: e.punkte || 0
            });
          }
        });
      });
    });
    return out;
  }

  /** Die noch nicht bewerteten Freitexte — der Eingang fuer Weg B. */
  function freitextOffen() {
    return freitextEintraege().filter(function (e) { return !e.bewertet; });
  }

  /**
   * Eine Bewertungsdatei einlesen (Weg B).
   *
   * Erwartetes Format: JSON-Array mit { gruppe, aufgabeId, punkte, hinweis }
   * oder { gruppe, region, aufgabeId, punkte, hinweis }. Passt ein Eintrag zu
   * einer Freitext-Antwort, wird er eingetragen.
   */
  function freitextImport(text) {
    var daten = null;
    try { daten = JSON.parse(text); } catch (e) {
      return { ok: false, fehler: 'Die Datei ist kein gueltiges JSON.', eingetragen: 0 };
    }
    if (!Array.isArray(daten)) {
      return { ok: false, fehler: 'Die Datei muss ein JSON-Array sein.', eingetragen: 0 };
    }

    var eingetragen = 0;
    var fehler = [];

    daten.forEach(function (z) {
      var gruppeName = z.gruppe || z.Gruppe;
      var g = gruppe(gruppeName);
      if (!g) { fehler.push('Unbekannte Gruppe: ' + gruppeName); return; }

      var regionId = z.regionId || '';
      if (!region(regionId) && z.region) {
        // Die Region kann auch als Name oder Kuerzel angegeben sein.
        REGIONEN.forEach(function (r) {
          if (r.id === regionId) return;
          if (r.name === z.region || r.kuerzel === z.region) regionId = r.id;
        });
      }
      if (!region(regionId)) { fehler.push('Unbekannte Region: ' + (z.region || regionId)); return; }

      var aufgabeId = z.aufgabeId || z.frageId || '';
      var a = aufgabe(regionId, aufgabeId);
      if (!a || !istFreitext(a)) {
        fehler.push('Unbekannte Freitext-Aufgabe: ' + aufgabeId + ' in ' + regionId);
        return;
      }

      var frueher = zustand.aktivGruppe;
      zustand.aktivGruppe = g.name;
      var ergebnis = freitextBewerten(regionId, aufgabeId, z.punkte, z.hinweis);
      zustand.aktivGruppe = frueher;
      if (ergebnis.ok) eingetragen++;
      else fehler.push(ergebnis.fehler);
    });

    speichere(zustand);
    return { ok: true, eingetragen: eingetragen, fehler: fehler };
  }

  function reset() {
    zustand = neuerZustand();
    speichere(zustand);
    REGIONEN.forEach(function (r) {
      var el = document.getElementById(r.svg_id);
      if (el) {
        el.classList.remove('offen');
        el.removeAttribute('data-offen');
      }
    });
    return { ok: true };
  }

  // ---------- Export ----------

  function csvZitat(wert) {
    var s = String(wert == null ? '' : wert);
    if (/[",\n\r;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  /** Punkte, Fortschritt und Schloss je Gruppe. */
  function exportCSV() {
    var kopf = ['Gruppe', 'Spielfigur', 'Punkte', 'Regionen aufgedeckt',
                'Aufgaben geloest', 'Tagebuch-Eintraege', 'Freitext bewertet',
                'Symbole', 'Schloss geoeffnet'];
    var zeilen = [kopf.join(';')];
    zustand.gruppen.forEach(function (g) {
      var tagebuch = 0, bewertet = 0, aufgaben = 0, maxAufgaben = 0;
      REGIONEN.forEach(function (r) {
        var f = g.regionen[r.id];
        if (!f) return;
        var list = aufgabenVon(r.id);
        maxAufgaben += list.length;
        list.forEach(function (a) {
          var e = f.aufgaben[a.id];
          if (e && e.geloest) {
            aufgaben++;
            if (istFreitext(a)) {
              tagebuch++;
              if (e.bewertet) bewertet++;
            }
          }
        });
      });
      zeilen.push([
        csvZitat(g.name),
        csvZitat(g.figurName),
        g.punkte,
        fortschritt(g),
        aufgaben + ' von ' + maxAufgaben,
        tagebuch,
        bewertet,
        symbole(g).length,
        g.schlossAuf ? 'ja' : 'nein'
      ].join(';'));
    });
    return zeilen.join('\r\n') + '\r\n';
  }

  /** Die Codekette — nur fuer die Lehrkraft. */
  function lehrkraftUebersicht() {
    var kette = REGIONEN.map(function (r, i) {
      return {
        position: i + 1,
        region: r.name,
        kuerzel: r.kuerzel,
        symbol: r.symbol,
        symbolName: r.symbol_name,
        codeZumOeffnen: codeFuerRegion(r.id),
        codeNaechste: r.code_naechste || ''
      };
    });
    return {
      startcode: STARTCODE,
      startcodeText: (INHALTE && INHALTE.startcode_text) || '',
      schlossCode: (INHALTE && INHALTE.schloss && INHALTE.schloss.code) || '',
      kette: kette
    };
  }

  /** Das Tagebuch als Text (zum Weitergeben oder Ausdruck). */
  function exportTagebuch() {
    var teile = [];
    var eintraege = freitextEintraege();
    if (!eintraege.length) return '';
    var letzteGruppe = null;
    eintraege.forEach(function (e) {
      if (e.gruppe !== letzteGruppe) {
        teile.push('=== ' + e.gruppe + ' ===');
        letzteGruppe = e.gruppe;
      }
      teile.push('[' + e.region + '] ' + e.frage);
      teile.push(e.antwort);
      teile.push(e.bewertet ? '(bewertet: ' + e.punkte + ' Punkte)' : '(noch nicht bewertet)');
      teile.push('');
    });
    return teile.join('\r\n');
  }

  /**
   * Die offenen Freitexte als JSON — die Datei, die die Lehrkraft der Bewertung
   * zufuehrt (Weg B). enthaelt alles, was eine Bewertung braucht: Gruppe, Region,
   * Frage, Kriterien, Maximum und die Antwort.
   */
  function freitextAufgabeExport() {
    return JSON.stringify(freitextOffen().map(function (e) {
      return {
        gruppe: e.gruppe,
        regionId: e.regionId,
        aufgabeId: e.aufgabeId,
        frage: e.frage,
        kriterien: e.kriterien,
        max: e.max,
        antwort: e.antwort
      };
    }), null, 2);
  }

  function csvBlob() {
    return new Blob(['\uFEFF' + exportCSV()], { type: 'text/csv;charset=utf-8' });
  }

  function tagebuchBlob() {
    return new Blob([exportTagebuch()], { type: 'text/plain;charset=utf-8' });
  }

  function freitextBlob() {
    return new Blob([freitextAufgabeExport()], { type: 'application/json;charset=utf-8' });
  }

  // ---------- Oeffentliche Schnittstelle ----------

  window.VulkanSpiel = {
    REGIONEN: REGIONEN,
    FIGUREN: FIGUREN,
    PUNKTE: PUNKTE,
    STARTPUNKTE: STARTPUNKTE,
    STARTCODE: STARTCODE,
    inhaltVersion: (INHALTE && INHALTE.version) || 'unbekannt',
    lade: function () { return zustand; },
    gruppen: function () { return zustand.gruppen; },
    aktivGruppe: function () { return zustand.aktivGruppe; },
    gruppeAnmelden: gruppeAnmelden,
    gruppeWaehlen: gruppeWaehlen,
    codeEinloesen: codeEinloesen,
    aufgabenVon: aufgabenVon,
    aufgabePruefen: aufgabePruefen,
    frageBeantworten: frageBeantworten,
    freitextSpeichern: freitextSpeichern,
    freitextBewerten: freitextBewerten,
    freitextImport: freitextImport,
    freitextEintraege: freitextEintraege,
    freitextOffen: freitextOffen,
    geloesteInRegion: function (g, regionId) { return geloesteInRegion(g, regionId); },
    regionIstOffen: function (g, regionId) { return regionIstOffen(g, regionId); },
    fortschritt: function (g) { return fortschritt(g || aktiv()); },
    symbole: function (g) { return symbole(g || aktiv()); },
    schlossBereit: function (g) { return schlossBereit(g || aktiv()); },
    schlossOeffnen: schlossOeffnen,
    lehrkraftUebersicht: lehrkraftUebersicht,
    exportCSV: exportCSV,
    exportTagebuch: exportTagebuch,
    freitextAufgabeExport: freitextAufgabeExport,
    csvBlob: csvBlob,
    tagebuchBlob: tagebuchBlob,
    freitextBlob: freitextBlob,
    reset: reset
  };
})();
