/**
 * Vulkanspiel — Kernlogik (Offline, localStorage).
 *
 * Ablauf: Die Gruppe loest die Aufgabe an ihrer Station. Die Lehrkraft prueft die
 * Loesung und gibt der Gruppe den Code dieser Station bekannt. Dazu drueckt sie
 * "Station freigeben" — der Code wird nur in der Lehrkraft-Ansicht angezeigt.
 * Die Gruppe traegt den Code ein, das Kartenstueck wird aufgedeckt.
 *
 * Die Codes werden beim ersten Start zufaellig aus 4 Zeichen erzeugt
 * (Alphabet ohne I und O) und einmalig pro Station in localStorage abgelegt.
 * Sie sind nicht ableitbar und nicht ratbar (331.776 Kombinationen).
 */
(function () {
  'use strict';

  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // ohne I und O
  var CODE_LEN = 4;

  var SPEICHER_KEY = 'vulkanspiel.v2';

  // Fallback-Liste, falls assets/stationen.js nicht geladen werden konnte.
  var STATIONEN_FALLBACK = [
    { id: 1, kuerzel: 'SUB',    titel: 'Vulkanismus an Subduktionszonen', svg: 'piece-subduktion' },
    { id: 2, kuerzel: 'HOT',    titel: 'Schildvulkane und Hot Spots',    svg: 'piece-hotspot' },
    { id: 3, kuerzel: 'MAAR',   titel: 'Maare und Vulkanfelder',         svg: 'piece-maar' },
    { id: 4, kuerzel: 'LIP',    titel: 'Vulkanische Decken (LIPs)',      svg: 'piece-lip' },
    { id: 5, kuerzel: 'RISIKO', titel: 'Risiko und Vulnerabilitaet',     svg: 'piece-risiko' }
  ];

  /**
   * Liest die Stationsdaten aus assets/stationen.js. Diese Datei wird per
   * <script src> eingebunden und nicht per fetch(), damit das Spiel auch
   * unter file:// laeuft. Fehlt die Datei, wird die Fallback-Liste genutzt.
   */
  function stationenLaden() {
    var roh = (typeof window !== 'undefined' && window.VULKAN_STATIONEN) || null;
    if (!roh || !roh.stationen || !roh.stationen.length) return null;
    var stuecke = {};
    (roh.kartenstuecke || []).forEach(function (k) { stuecke[k.station] = k; });
    return roh.stationen.map(function (s) {
      var stueck = stuecke[s.id] || {};
      return {
        id: s.id,
        kuerzel: s.kuerzel,
        titel: s.titel,
        svg: stueck.svg_id || ('piece-' + s.id),
        auftrag: s.auftrag || '',
        loesungshinweis: s.loesungshinweis || '',
        pruefkriterien: s.pruefkriterien || [],
        moegliche_fehler: s.moegliche_fehler || [],
        ort: s.ort || '',
        thema: s.thema || '',
        zeit_minuten: s.zeit_minuten || 0,
        kompetenz: s.kompetenz || [],
        quellen: s.quellen || []
      };
    });
  }

  /** Die aktuell gueltige Stationsliste (Daten aus stationen.js, sonst Fallback). */
  var STATIONEN = stationenLaden() || STATIONEN_FALLBACK;

  /** Rohe Stationsdaten (inkl. Auftrag, Loesungshinweis, Pruefkriterien). */
  var STATIONEN_DATEN = (typeof window !== 'undefined' && window.VULKAN_STATIONEN) || null;

  var PUNKTE = {
    STATION_GELEST: 10,
    BEGRUENDUNG: 5,
    ZEITBONUS: 3,
    FALSCH: 0,
    FREMDER_CODE: -5
  };

  function neuerZustand() {
    return {
      version: 2,
      gruppen: [],          // [{name, punkte, stationen:{1:{besucht, punkte, begruendung, zeitbonus}}}]
      aktivGruppe: null,
      codes: {},            // stationId -> Code (nur fuer die Lehrkraft)
      gestartet: false
    };
  }

  function lade() {
    try {
      var roh = localStorage.getItem(SPEICHER_KEY);
      if (!roh) return neuerZustand();
      var z = JSON.parse(roh);
      if (!z || z.version !== 2) return neuerZustand();
      return z;
    } catch (e) {
      return neuerZustand();
    }
  }

  function speichere(z) {
    try {
      localStorage.setItem(SPEICHER_KEY, JSON.stringify(z));
    } catch (e) {
      // Speicher voll oder blockiert: Spiel laeuft weiter, aber nicht persistent.
      console.warn('Konnte Zustand nicht speichern:', e);
    }
  }

  var zustand = lade();

  // ---------- Hilfen ----------

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function station(id) {
    for (var i = 0; i < STATIONEN.length; i++) {
      if (STATIONEN[i].id === Number(id)) return STATIONEN[i];
    }
    return null;
  }

  function gruppe(name) {
    if (!name) return null;
    for (var i = 0; i < zustand.gruppen.length; i++) {
      if (zustand.gruppen[i].name === name) return zustand.gruppen[i];
    }
    return null;
  }

  function aktiv() {
    return gruppe(zustand.aktivGruppe);
  }

  function normCode(roh) {
    var s = String(roh == null ? '' : roh).toUpperCase();
    // I und O gibt es im Alphabet nicht: als 1 bzw. 0 lesen, damit Tippfehler
    // nicht zu einem Abbruch fuehren.
    s = s.replace(/I/g, '1').replace(/O/g, '0');
    return s.replace(/[^A-Z0-9]/g, '');
  }

  // ---------- Codes ----------

  function zufallsCode() {
    var teile = [];
    for (var i = 0; i < CODE_LEN; i++) {
      teile.push(ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length)));
    }
    return teile.join('');
  }

  function istCodeDoppelt(code, tabelle) {
    for (var sid in tabelle) {
      if (Object.prototype.hasOwnProperty.call(tabelle, sid) && tabelle[sid] === code) return true;
    }
    return false;
  }

  /** Fuellt fehlende Codes auf und legt sie ab. */
  function codesFuellen() {
    if (!zustand.codes) zustand.codes = {};
    var ergaenzt = false;
    STATIONEN.forEach(function (st) {
      if (zustand.codes[st.id]) return;
      var code;
      do { code = zufallsCode(); } while (istCodeDoppelt(code, zustand.codes));
      zustand.codes[st.id] = code;
      ergaenzt = true;
    });
    if (ergaenzt) speichere(zustand);
    return zustand.codes;
  }

  /** Code einer Station (Lehrkraft-Sicht). Wird beim ersten Aufruf erzeugt. */
  function lehrkraftCode(stationId) {
    codesFuellen();
    return zustand.codes[stationId] || null;
  }

  /** Stimmt der eingegebene Code mit dem Code der Station ueberein? */
  function codePasst(code, stationId) {
    codesFuellen();
    var erwartet = zustand.codes[stationId];
    return !!erwartet && String(code) === String(erwartet);
  }

  // ---------- Aktionen ----------

  function gruppeAnmelden(name) {
    name = String(name == null ? '' : name).trim();
    if (!name) return { ok: false, fehler: 'Bitte einen Gruppennamen eingeben.' };
    if (name.length > 24) return { ok: false, fehler: 'Name zu lang (max. 24 Zeichen).' };
    if (gruppe(name)) return { ok: false, fehler: 'Dieser Gruppenname ist bereits vergeben.' };
    zustand.gruppen.push({ name: name, punkte: 10, stationen: {} });
    zustand.aktivGruppe = name;
    zustand.gestartet = true;
    speichere(zustand);
    return { ok: true, punkte: 10 };
  }

  function gruppeWaehlen(name) {
    if (!gruppe(name)) return { ok: false, fehler: 'Gruppe nicht gefunden.' };
    zustand.aktivGruppe = name;
    speichere(zustand);
    return { ok: true };
  }

  function stationFreigeben(stationId, begruendung, zeitbonus) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var st = station(stationId);
    if (!st) return { ok: false, fehler: 'Unbekannte Station.' };
    if (g.stationen[stationId]) return { ok: false, fehler: 'Station wurde bereits abgeschlossen.' };

    var pkt = PUNKTE.STATION_GELEST + (begruendung ? PUNKTE.BEGRUENDUNG : 0) + (zeitbonus ? PUNKTE.ZEITBONUS : 0);

    g.stationen[stationId] = {
      besucht: true,
      punkte: pkt,
      begruendung: !!begruendung,
      zeitbonus: !!zeitbonus
    };
    g.punkte += pkt;

    speichere(zustand);
    return { ok: true, punkte: pkt, gesamt: g.punkte, code: lehrkraftCode(stationId) };
  }

  /**
   * Eine Gruppe gibt einen Code ein. Der Code muss zu der Station passen,
   * die die Lehrkraft gerade freigegeben hat.
   */
  function codeEinloesen(stationId, code) {
    var g = aktiv();
    if (!g) return { ok: false, fehler: 'Keine aktive Gruppe.' };
    var st = station(stationId);
    if (!st) return { ok: false, fehler: 'Unbekannte Station.' };
    if (!g.stationen[stationId]) {
      return { ok: false, fehler: 'Station wurde noch nicht freigegeben.' };
    }

    var c = normCode(code);
    if (c.length !== CODE_LEN) {
      return { ok: false, fehler: 'Der Code hat genau ' + CODE_LEN + ' Zeichen.' };
    }
    if (!codePasst(c, stationId)) {
      g.punkte += PUNKTE.FREMDER_CODE;
      speichere(zustand);
      return { ok: false, fehler: 'Code passt nicht zu dieser Station.', punktabzug: PUNKTE.FREMDER_CODE };
    }

    oeffneStueck(st.svg);
    return { ok: true };
  }

  function oeffneStueck(svgId) {
    var el = document.getElementById(svgId);
    if (el) {
      el.setAttribute('opacity', '1');
      el.classList.add('sichtbar');
    }
    return svgId;
  }

  function sichtbareStuecke() {
    var offen = [];
    STATIONEN.forEach(function (st) {
      var el = document.getElementById(st.svg);
      if (el && Number(el.getAttribute('opacity')) === 1) offen.push(st.id);
    });
    return offen;
  }

  function reset() {
    zustand = neuerZustand();
    speichere(zustand);
    STATIONEN.forEach(function (st) {
      var el = document.getElementById(st.svg);
      if (el) {
        el.setAttribute('opacity', '0');
        el.classList.remove('sichtbar');
      }
    });
    return { ok: true };
  }

  // ---------- CSV-Export ----------

  function csvZitat(wert) {
    var s = String(wert == null ? '' : wert);
    if (/[",\n\r;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function exportCSV() {
    var kopf = ['Gruppe', 'Punkte gesamt', 'Stationen abgeschlossen'];
    STATIONEN.forEach(function (st) {
      kopf.push('Station ' + st.id + ' ' + st.kuerzel + ' Punkte');
      kopf.push('Station ' + st.id + ' ' + st.kuerzel + ' Begruendung');
    });
    var zeilen = [kopf.join(';')];

    zustand.gruppen.forEach(function (g) {
      var anz = Object.keys(g.stationen).length;
      var zeile = [csvZitat(g.name), g.punkte, anz];
      STATIONEN.forEach(function (st) {
        var e = g.stationen[st.id];
        zeile.push(e ? e.punkte : '');
        zeile.push(e ? (e.begruendung ? 'ja' : 'nein') : '');
      });
      zeilen.push(zeile.join(';'));
    });

    return zeilen.join('\r\n') + '\r\n';
  }

  function csvBlob() {
    return new Blob(['\uFEFF' + exportCSV()], { type: 'text/csv;charset=utf-8' });
  }

  // ---------- Oeffentliche Schnittstelle ----------

  window.VulkanSpiel = {
    STATIONEN: STATIONEN,
    PUNKTE: PUNKTE,
    ALPHABET: ALPHABET,
    CODE_LEN: CODE_LEN,
    stationen: function () { return STATIONEN; },
    stationenDaten: function () { return STATIONEN_DATEN; },
    lade: function () { return zustand; },
    gruppen: function () { return zustand.gruppen; },
    aktivGruppe: function () { return zustand.aktivGruppe; },
    gruppeAnmelden: gruppeAnmelden,
    gruppeWaehlen: gruppeWaehlen,
    stationFreigeben: stationFreigeben,
    codeEinloesen: codeEinloesen,
    lehrkraftCode: lehrkraftCode,
    sichtbareStuecke: sichtbareStuecke,
    exportCSV: exportCSV,
    csvBlob: csvBlob,
    reset: reset
  };
})();
