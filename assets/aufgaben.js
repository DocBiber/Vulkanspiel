/**
 * Aufgabentypen des Vulkanspiels.
 *
 * Jede Aufgabe in assets/inhalte.js hat ein "typ" und ein "daten"-Objekt.
 * Dieser Text beschreibt beide pro Typ: welches Datenformat erwartet wird und
 * welche Rueckgabe die Pruefung liefert.
 *
 * Einheitliches Ergebnis der Pruefung:
 *   { richtig: true|false, punkte: n, max: n, hinweis: 'Text',
 *     details: [ { id, ok, hinweis } ], moeglich: bool }
 *
 *   punkte  - die tatsaechlich vergebenen Punkte (0 bei Fehlschlag)
 *   max     - die moeglichen Punkte dieser Aufgabe
 *   hinweis - ein Satz fuer die Gruppe, wird unter der Aufgabe angezeigt
 *   details - pro Teil (bei mehrteiligen Aufgaben)
 *   moeglich- false, wenn die Aufgabe noch nicht vollstaendig bearbeitet ist
 *             (z. B. Ziehen ohne Loesung, Freitext noch nicht abgeschickt)
 *
 * Die Typen "mc", "zuordnung", "richtig_falsch", "lueckentext" und "wortgitter"
 * werden hier vollstaendig geprueft. "fehler" und "freitext" liegen ebenfalls hier,
 * brauchen aber eine Skizze beziehungsweise eine KI — siehe Hinweis am Typ.
 */

(function () {
  'use strict';

  var A = (typeof window !== 'undefined' && window.AUFGABEN_TYPEN) || null;

  // ---------- Hilfen ----------

  /** Zeichenkette normalisieren: trimmen, Leerzeichen zusammenziehen. */
  function norm(text) {
    return String(text == null ? '' : text)
      .replace(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Worte vergleichen. Gross-/Kleinschreibung, Satzzeichen am Rand und
   * deutsche Umlaute werden ignoriert. Fuer Schuelerantworten zu verzeihend,
   * ohne die Aufgabe dadurch loesbar zu machen.
   */
  function wortgleich(a, b) {
    function bereinige(s) {
      return norm(s)
        .toLowerCase()
        .replace(/[\.,;:!?"'“”()\[\]]/g, '')
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[-\/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    return bereinige(a) === bereinige(b);
  }

  /** Enthaelt eine Liste von Wörtern ein anderes Wort? */
  function enthaelt(wort, liste) {
    var w = norm(wort).toLowerCase();
    return liste.some(function (x) { return norm(x).toLowerCase() === w; });
  }

  /** Sind alle noetigen Angaben vorhanden? */
  function vollstaendig(angaben, felder) {
    return felder.every(function (f) { return angaben[f] !== undefined && angaben[f] !== null && angaben[f] !== ''; });
  }

  // ---------- Typ: Multiple Choice ----------

  /**
   * daten: { optionen: [s], richtig: i, erklaerung: s, max: n }
   * angabe: Nummer der gewaehlten Option
   *
   * "max" ist die Punktzahl der Aufgabe; ohne sie zaehlt eine richtige Antwort 1.
   */
  function pruefeMc(daten, angabe) {
    var max = daten.max || 1;
    var i = Number(angabe);
    if (!isFinite(i) || i < 0 || i >= daten.optionen.length) {
      return { richtig: false, punkte: 0, max: max, moeglich: false,
               hinweis: 'Bitte zuerst eine der vier Antworten anklicken.' };
    }
    var ok = i === daten.richtig;
    return {
      richtig: ok,
      punkte: ok ? max : 0,
      max: max,
      moeglich: true,
      hinweis: ok ? (daten.erklaerung || 'Richtig.') : 'Nicht richtig. Lies die Erklaerung und versucht es erneut.',
      details: []
    };
  }

  // ---------- Typ: Begriffe einer Skizze zuordnen ----------

  /**
   * daten: {
   *   skizze: 'name',                       // optional, nur fuer die Anzeige
   *   felder: [{ id, x, y, richtig? }],
   *   begriffe: ['Wort'],                  // die ziehbaren Kaertchen
   *   loesung: { A: 'Krater' }              // Alternative zu "richtig" im Feld
   * }
   * angabe: { A: 'Krater' } — die Zuordnung, die die Gruppe getroffen hat
   *
   * Die Punktzahl ist die Anzahl richtig zugeordneter Felder, damit eine
   * halb richtige Loesung auch halb Punkte bringt.
   */
  function pruefeZuordnung(daten, angabe) {
    angabe = angabe || {};
    var felder = daten.felder || [];
    var loesung = daten.loesung || {};
    var max = daten.max || felder.length;
    if (!felder.length) {
      return { richtig: false, punkte: 0, max: 0, moeglich: false, hinweis: 'Diese Aufgabe ist nicht vollstaendig.' };
    }

    var offen = felder.filter(function (f) { return !norm(angabe[f.id]); });
    if (offen.length) {
      return {
        richtig: false, punkte: 0, max: max, moeglich: false,
        hinweis: 'Noch ' + offen.length + ' von ' + max + ' Feldern sind leer. Zieht jeden Begriff auf ein Feld.'
      };
    }

    var details = felder.map(function (f) {
      var erwartet = f.richtig || loesung[f.id] || '';
      var ok = wortgleich(angabe[f.id], erwartet);
      return { id: f.id, ok: ok, hinweis: ok ? 'Richtig.' : 'Hier gehoert „' + erwartet + '“ hin.' };
    });

    var richtige = details.filter(function (d) { return d.ok; }).length;
    var punkte = Math.round(max * richtige / felder.length);
    return {
      richtig: richtige === felder.length,
      punkte: punkte,
      max: max,
      moeglich: true,
      hinweis: richtige === felder.length
        ? 'Alle Felder richtig zugeordnet. ' + (daten.hinweis || '')
        : richtige + ' von ' + felder.length + ' Feldern richtig. ' + (daten.hinweis || 'Versucht die anderen noch einmal.'),
      details: details
    };
  }

  // ---------- Typ: Richtig/Falsch-Aussagen ----------

  /**
   * daten: { aussagen: [{ text: s, richtig: true|false }] }
   * angabe: { aussageIndex: true|false }
   *
   * Jede richtig bewertete Aussage bringt einen Punkt.
   */
  function pruefeRichtigFalsch(daten, angabe) {
    angabe = angabe || {};
    var aussagen = daten.aussagen || [];
    var max = daten.max || aussagen.length;
    if (!aussagen.length) {
      return { richtig: false, punkte: 0, max: 0, moeglich: false, hinweis: 'Diese Aufgabe ist nicht vollstaendig.' };
    }

    var offen = aussagen.filter(function (a, i) { return angabe[i] === undefined; });
    if (offen.length) {
      return {
        richtig: false, punkte: 0, max: max, moeglich: false,
        hinweis: 'Noch ' + offen.length + ' von ' + aussagen.length + ' Aussagen sind nicht bewertet.'
      };
    }

    var details = aussagen.map(function (a, i) {
      var ok = Boolean(angabe[i]) === Boolean(a.richtig);
      return { id: String(i), ok: ok, hinweis: ok ? 'Richtig.' : 'Diese Aussage ist ' + (a.richtig ? 'richtig.' : 'falsch.') };
    });

    var richtige = details.filter(function (d) { return d.ok; }).length;
    var punkte = Math.round(max * richtige / aussagen.length);
    return {
      richtig: richtige === aussagen.length,
      punkte: punkte,
      max: max,
      moeglich: true,
      hinweis: richtige === aussagen.length
        ? 'Alle Aussagen richtig bewertet.'
        : richtige + ' von ' + aussagen.length + ' Aussagen richtig.',
      details: details
    };
  }

  // ---------- Typ: Lückentext ----------

  /**
   * daten: {
   *   text: 'Satz mit [1] und [2] in der Mitte.',
   *   loesungen: [{ id: '1', wort: 'Magma', alternativen: ['Magma'] }],
   *   distraktoren: ['Lava', 'Granit']   // falsche Wortvorschlaege
   * }
   * angabe: { '1': 'Magma' }
   *
   * Die Luecken muessen im Text als [1], [2], ... markiert sein. Pro Luecke
   * einen Punkt. Alternativwortformen (mit/ohne Umlaut, Plural) sind erlaubt.
   */
  function pruefeLueckentext(daten, angabe) {
    angabe = angabe || {};
    var loesungen = daten.loesungen || [];
    var max = daten.max || loesungen.length;
    if (!loesungen.length) {
      return { richtig: false, punkte: 0, max: 0, moeglich: false, hinweis: 'Diese Aufgabe ist nicht vollstaendig.' };
    }

    var offen = loesungen.filter(function (l) { return !norm(angabe[l.id]); });
    if (offen.length) {
      return {
        richtig: false, punkte: 0, max: max, moeglich: false,
        hinweis: 'Noch ' + offen.length + ' von ' + loesungen.length + ' Luecken sind leer.'
      };
    }

    var details = loesungen.map(function (l) {
      var erlaubt = [l.wort].concat(l.alternativen || []);
      var ok = erlaubt.some(function (e) { return wortgleich(angabe[l.id], e); });
      return { id: l.id, ok: ok, hinweis: ok ? 'Richtig.' : 'Hier passt „' + l.wort + '“ hinein.' };
    });

    var richtige = details.filter(function (d) { return d.ok; }).length;
    var punkte = Math.round(max * richtige / loesungen.length);
    return {
      richtig: richtige === loesungen.length,
      punkte: punkte,
      max: max,
      moeglich: true,
      hinweis: richtige === loesungen.length
        ? 'Alle Luecken richtig.'
        : richtige + ' von ' + loesungen.length + ' Luecken richtig.',
      details: details
    };
  }

  /** Schüttelwörter aus den Lückentext-Lösungen und Distraktoren bauen. */
  function wuerfelFuer(daten) {
    var worte = [];
    (daten.loesungen || []).forEach(function (l) {
      worte.push(l.wort);
      (l.alternativen || []).forEach(function (a) { if (worte.indexOf(a) === -1) worte.push(a); });
    });
    (daten.distraktoren || []).forEach(function (d) { if (worte.indexOf(d) === -1) worte.push(d); });
    // Einfache Mischung, damit die Reihenfolge in der Datei nicht die Loesung verraet.
    return worte.map(function (w, i) { return { wort: w, schluessel: i * 2654435761 % 4294967296 }; })
      .sort(function (a, b) { return a.schluessel - b.schluessel; })
      .map(function (x) { return x.wort; });
  }

  // ---------- Typ: Wortgitter ----------

  /**
   * daten: {
   *   breite: 6, hoehe: 6,
   *   woerter: [{ buchstabe: [{ x: 0, y: 0 }, ...], hinweis: 's', punkte: 1 }]
   * }
   * angabe: { 'x,y': 'A' }
   *
   * Die Zellen sind schluessel 'x,y'. Pro Wort gibt es einen Punkt, wenn alle
   * Buchstaben des Wortes stimmen. Falsche Buchstaben in freien Zellen zaehlen
   * nicht gegen die Gruppe, damit ein Tippfehler nicht die ganze Aufgabe killt.
   */
  function pruefeWortgitter(daten, angabe) {
    angabe = angabe || {};
    var woerter = daten.woerter || [];
    var max = daten.max || woerter.length;
    if (!woerter.length) {
      return { richtig: false, punkte: 0, max: 0, moeglich: false, hinweis: 'Diese Aufgabe ist nicht vollstaendig.' };
    }

    var details = woerter.map(function (w, i) {
      var buchstaben = w.buchstabe || [];
      var richtig = buchstaben.filter(function (b) {
        var schluessel = b.x + ',' + b.y;
        return angabe[schluessel] && wortgleich(angabe[schluessel], b.richtig);
      }).length;
      return {
        id: String(i),
        ok: richtig === buchstaben.length,
        hinweis: richtig === buchstaben.length ? 'Richtig.' : richtig + ' von ' + buchstaben.length + ' Buchstaben stimmen.'
      };
    });

    var richtige = details.filter(function (d) { return d.ok; }).length;
    var punkte = Math.round(max * richtige / woerter.length);
    return {
      richtig: richtige === woerter.length,
      punkte: punkte,
      max: max,
      moeglich: true,
      hinweis: richtige === woerter.length
        ? 'Alle Woerter gefunden.'
        : richtige + ' von ' + woerter.length + ' Woertern gefunden.',
      details: details
    };
  }

  // ---------- Typ: Fehler entdecken ----------

  /**
   * daten: {
   *   text: 'Ein Satz, der [F1]drei[/F1] Fehler enthaelt.',
   *   fehler: [{ id: 'F1', hinweis: 's' }]
   * }
   * angabe: { 'F1': true } — die Stellen, die die Gruppe als fehlerhaft markiert hat
   *
   * Pro gefundenen echten Fehler einen Punkt. Faelschlicherweise markierte
   * Stellen kosten nichts — wer etwas anklickt, ohne es zu kennen, soll die
   * Aufgabe noch loesen koennen.
   */
  function pruefeFehler(daten, angabe) {
    angabe = angabe || {};
    var fehler = daten.fehler || [];
    var max = daten.max || fehler.length;
    if (!fehler.length) {
      return { richtig: false, punkte: 0, max: 0, moeglich: false, hinweis: 'Diese Aufgabe ist nicht vollstaendig.' };
    }

    var gefunden = fehler.filter(function (f) { return angabe[f.id]; }).length;
    var details = fehler.map(function (f) {
      var ok = Boolean(angabe[f.id]);
      return { id: f.id, ok: ok, hinweis: ok ? 'Richtig erkannt: ' + (f.hinweis || '') : 'Diese Stelle war richtig.' };
    });

    var punkte = Math.round(max * gefunden / fehler.length);
    return {
      richtig: gefunden === fehler.length,
      punkte: punkte,
      max: max,
      moeglich: true,
      hinweis: gefunden === fehler.length
        ? 'Alle ' + fehler.length + ' Fehler gefunden.'
        : gefunden + ' von ' + fehler.length + ' Fehlern gefunden.',
      details: details
    };
  }

  // ---------- Typ: Freitext (KI-bewertet) ----------

  /**
   * daten: { frage: s, hinweis: s, punkte: 10, kriterien: [s] }
   *
   * Der Freitext wird nicht hier geprueft. Die Logik speichert die Antwort und
   * gibt Punkte erst, wenn eine Bewertung vorliegt — entweder vom lokalen
   * Bewertungsdienst (Weg A) oder aus der Bewertungsdatei (Weg B).
   * Siehe logik.js: freitextSpeichern und freitextBewerten.
   */
  function pruefeFreitext(daten, angabe) {
    var text = norm(angabe);
    if (!text) {
      return { richtig: false, punkte: 0, max: daten.max || daten.punkte || 10, moeglich: false,
               hinweis: 'Bitte schreibt zuerst eure Antwort.' };
    }
    return {
      richtig: false, punkte: 0, max: daten.max || daten.punkte || 10, moeglich: true,
      hinweis: 'Antwort uebernommen. Sie wird bewertet, sobald die Bewertung zurueck ist.'
    };
  }

  // ---------- Verzeichnis ----------

  window.AUFGABEN_TYPEN = {
    mc:            { name: 'Multiple Choice',        pruefe: pruefeMc },
    zuordnung:     { name: 'Begriffe zuordnen',     pruefe: pruefeZuordnung },
    richtig_falsch:{ name: 'Richtig oder Falsch',   pruefe: pruefeRichtigFalsch },
    lueckentext:   { name: 'Lueckentext',           pruefe: pruefeLueckentext },
    wortgitter:    { name: 'Wortgitter',            pruefe: pruefeWortgitter },
    fehler:        { name: 'Fehler entdecken',      pruefe: pruefeFehler },
    freitext:      { name: 'Freitext (KI)',         pruefe: pruefeFreitext },
    wuerfel:       wuerfelFuer,
    wortgleich:    wortgleich,
    norm:          norm,
    _intern:       { vollstaendig: vollstaendig, enthaelt: enthaelt }
  };
})();
