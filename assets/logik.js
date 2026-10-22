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
 * Die Inhalte kommen aus assets/inhalte.js (window.VULKAN_STATIONEN).
 * Gespeichert wird nur im Browser (localStorage), es gibt keinen Server.
 */
(function () {
  'use strict';

  var SPEICHER_KEY = 'vulkanspiel.v4';
  var INHALTE = (typeof window !== 'undefined' && window.VULKAN_STATIONEN) || null;

  // Fallback, falls assets/inhalte.js nicht geladen werden konnte.
  var REGIONEN_FALLBACK = [
    { id: 'subduktion', nr: 1, kuerzel: 'SUB', name: 'Subduktionszonen des Pazifiks', svg_id: 'piece-subduktion', farbe: '#c0392b', figur: { x: 120, y: 180 }, symbol: '🌋', symbol_name: 'Vulkan', code_naechste: 'FUNKEN', fragen: [], tagebuch: [] },
    { id: 'hotspot',    nr: 2, kuerzel: 'HOT', name: 'Hawaii-Hot-Spot',               svg_id: 'piece-hotspot',    farbe: '#e67e22', figur: { x: 150, y: 330 }, symbol: '🌊', symbol_name: 'Welle', code_naechste: 'WELLE', fragen: [], tagebuch: [] },
    { id: 'maar',       nr: 3, kuerzel: 'MAAR', name: 'Maar-Feld der Eifel',          svg_id: 'piece-maar',       farbe: '#8e44ad', figur: { x: 500, y: 150 }, symbol: '💧', symbol_name: 'Tropfen', code_naechste: 'TROPFEN', fragen: [], tagebuch: [] },
    { id: 'lip',        nr: 4, kuerzel: 'LIP', name: 'Deccan-Trapp, Indien',         svg_id: 'piece-lip',        farbe: '#16a085', figur: { x: 680, y: 320 }, symbol: '🪨', symbol_name: 'Gestein', code_naechste: 'DECKE', fragen: [], tagebuch: [] },
    { id: 'risiko',     nr: 5, kuerzel: 'RISIKO', name: 'Nyiragongo und Goma',       svg_id: 'piece-risiko',     farbe: '#2c3e50', figur: { x: 660, y: 300 }, symbol: '🔥', symbol_name: 'Feuer', code_naechste: '', fragen: [], tagebuch: [] }
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
      version: 4,
      gruppen: [],
      aktivGruppe: null,
      gestartet: false
    };
  }

  function lade() {
    var z = null;
    try { z = JSON.parse(localStorage.getItem(SPEICHER_KEY) || 'null'); } catch (e) { z = null; }
    if (!z || z.version !== 4) return neuerZustand();
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

  function frage(regionId, frageId) {
    var r = region(regionId);
    if (!r) return null;
    for (var i = 0; i < r.fragen.length; i++) {
      if (r.fragen[i].id === frageId) return r.fragen[i];
    }
    return null;
  }

  function tagebuchFrage(regionId, frageId) {
    var r = region(regionId);
    if (!r) return null;
    for (var i = 0; i < r.tagebuch.length; i++) {
      if (r.tagebuch[i].id === frageId) return r.tagebuch[i];
    }
    return null;
  }

  /** Leerer Fortschritt fuer eine Gruppe (wird beim Anmelden angelegt). */
  function neuerFortschritt() {
    var f = {};
    REGIONEN.forEach(function (r) {
      f[r.id] = {
        freigeschaltet: false,  // Code eingegeben, Region darf bearbeitet werden
        fragen: {},             // frageId -> { auswahl, richtig, punkte }
        tagebuch: {},           // frageId -> { text }
        offen: false            // alle Fragen richtig, Region aufgedeckt
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

  /** Zaehlt, wieviele Fragen einer Region richtig beantwortet sind. */
  function richtigeInRegion(g, regionId) {
    var r = region(regionId);
    var f = g.regionen[regionId];
    if (!r || !f) return 0;
    var n = 0;
    r.fragen.forEach(function (fr) {
      var e = f.fragen[fr.id];
      if (e && e.richtig) n++;
    });
    return n;
  }

  /** Ist eine Region vollstaendig aufgedeckt? */
  function regionIstOffen(g, regionId) {
    var r = region(regionId);
    if (!r) return false;
    return r.fragen.length > 0 && richtigeInRegion(g, regionId) === r.fragen.length;
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
   * Eine Multiple-Choice-Frage beantworten. Eine richtige Antwort gibt Punkte
   * und deckt die Region auf, sobald alle Fragen der Region richtig sind.
   */
  function frageBeantworten(regionId, frageId, auswahl) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var fr = frage(regionId, frageId);
    if (!fr) return { ok: false, fehler: 'Unbekannte Frage.' };

    var f = g.regionen[regionId];
    if (!f.freigeschaltet) {
      return { ok: false, fehler: 'Diese Region ist noch verschlossen. Ihr braucht zuerst den richtigen Code.' };
    }

    var bisher = f.fragen[frageId];
    if (bisher && bisher.richtig) {
      return { ok: false, fehler: 'Diese Frage wurde bereits richtig beantwortet.' };
    }

    var richtig = Number(auswahl) === fr.richtig;
    if (richtig) {
      var pkt = fr.punkte || PUNKTE.FRAGE_RICHTIG;
      f.fragen[frageId] = { auswahl: Number(auswahl), richtig: true, punkte: pkt };
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
        erklaerung: fr.erklaerung || '',
        regionOffen: f.offen,
        richtige: richtigeInRegion(g, regionId),
        gesamt: r.fragen.length,
        // Erst wenn die Region vollstaendig aufgedeckt ist, wird der Zettel
        // mit dem Symbol und dem Code der naechsten Station gezeigt.
        symbol: f.offen ? r.symbol : '',
        symbolName: f.offen ? r.symbol_name : '',
        codeNaechste: f.offen ? r.code_naechste : ''
      };
    }

    speichere(zustand);
    return {
      ok: false,
      richtig: false,
      richtige: richtigeInRegion(g, regionId),
      gesamt: region(regionId).fragen.length,
      fehler: 'Nicht richtig. Lies die Erklaerung und versuche es erneut.'
    };
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

  /**
   * Eine Tagebuch-Frage mit Freitext beantworten. Jede Abgabe gibt einmalig
   * Punkte; das Schreiben kann danach beliebig geaendert werden.
   */
  function tagebuchSpeichern(regionId, frageId, text) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var tf = tagebuchFrage(regionId, frageId);
    if (!tf) return { ok: false, fehler: 'Unbekannte Frage.' };

    text = String(text == null ? '' : text).trim();
    if (text.length < 5) {
      return { ok: false, fehler: 'Bitte schreibt mindestens ein bis zwei Saetze.' };
    }

    var f = g.regionen[regionId];
    var bisher = f.tagebuch[frageId];
    var neu = !bisher;

    f.tagebuch[frageId] = { text: text, datum: new Date().toISOString() };
    if (neu) g.punkte += PUNKTE.TAGEBUCH_ABGABE;

    speichere(zustand);
    return {
      ok: true,
      neu: neu,
      punkte: neu ? PUNKTE.TAGEBUCH_ABGABE : 0,
      gesamt: g.punkte
    };
  }

  /** Alle Tagebuecher-Eintraege aller Gruppen (fuer den Export). */
  function tagebuchEintraege() {
    var out = [];
    zustand.gruppen.forEach(function (g) {
      REGIONEN.forEach(function (r) {
        var f = g.regionen[r.id];
        if (!f) return;
        r.tagebuch.forEach(function (tf) {
          var e = f.tagebuch[tf.id];
          if (e && e.text) {
            out.push({
              gruppe: g.name,
              region: r.name,
              frage: tf.frage,
              antwort: e.text
            });
          }
        });
      });
    });
    return out;
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
                'Tagebuch-Eintraege', 'Symbole', 'Schloss geoeffnet'];
    var zeilen = [kopf.join(';')];
    zustand.gruppen.forEach(function (g) {
      var eintraege = 0;
      REGIONEN.forEach(function (r) {
        var f = g.regionen[r.id];
        if (!f) return;
        r.tagebuch.forEach(function (tf) {
          if (f.tagebuch[tf.id] && f.tagebuch[tf.id].text) eintraege++;
        });
      });
      zeilen.push([
        csvZitat(g.name),
        csvZitat(g.figurName),
        g.punkte,
        fortschritt(g),
        eintraege,
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
    var eintraege = tagebuchEintraege();
    if (!eintraege.length) return '';
    var letzteGruppe = null;
    eintraege.forEach(function (e) {
      if (e.gruppe !== letzteGruppe) {
        teile.push('=== ' + e.gruppe + ' ===');
        letzteGruppe = e.gruppe;
      }
      teile.push('[' + e.region + '] ' + e.frage);
      teile.push(e.antwort);
      teile.push('');
    });
    return teile.join('\r\n');
  }

  function csvBlob() {
    return new Blob(['\uFEFF' + exportCSV()], { type: 'text/csv;charset=utf-8' });
  }

  function tagebuchBlob() {
    return new Blob([exportTagebuch()], { type: 'text/plain;charset=utf-8' });
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
    frageBeantworten: frageBeantworten,
    tagebuchSpeichern: tagebuchSpeichern,
    tagebuchEintraege: tagebuchEintraege,
    richtigeInRegion: function (g, regionId) { return richtigeInRegion(g, regionId); },
    regionIstOffen: function (g, regionId) { return regionIstOffen(g, regionId); },
    fortschritt: function (g) { return fortschritt(g || aktiv()); },
    symbole: function (g) { return symbole(g || aktiv()); },
    schlossBereit: function (g) { return schlossBereit(g || aktiv()); },
    schlossOeffnen: schlossOeffnen,
    lehrkraftUebersicht: lehrkraftUebersicht,
    exportCSV: exportCSV,
    exportTagebuch: exportTagebuch,
    csvBlob: csvBlob,
    tagebuchBlob: tagebuchBlob,
    reset: reset
  };
})();
