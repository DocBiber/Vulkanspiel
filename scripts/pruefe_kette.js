/**
 * Testlauf fuer die Vulkanspiel-Logik (Node, ohne Browser).
 * Laedt assets/inhalte.js und assets/logik.js in einer minimalen Browser-Umgebung
 * und prueft: Startcode, Codekette, verschlossene Regionen, Symbole, Schloss,
 * Punkte, Tagebuch und Export.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function ladeSkript(rel, globalName) {
  const quelle = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(quelle, sandbox, { filename: path.basename(rel) });
  return sandbox.window[globalName];
}

const inhalte = ladeSkript('assets/inhalte.js', 'VULKAN_STATIONEN');
const typen = ladeSkript('assets/aufgaben.js', 'AUFGABEN_TYPEN');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const oberflaeche = fs.readFileSync(path.join(ROOT, 'assets/oberflaeche.js'), 'utf8');

function baueUmgebung() {
  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };

  const knoten = {};
  inhalte.regionen.forEach((r) => {
    knoten[r.svg_id] = {
      klassen: new Set(),
      attribute: {},
      setAttribute(a, v) { this.attribute[a] = String(v); },
      removeAttribute(a) { delete this.attribute[a]; },
      getAttribute(a) { return (a in this.attribute) ? this.attribute[a] : null; },
      classList: {
        add: (c) => knoten[r.svg_id].klassen.add(c),
        remove: (c) => knoten[r.svg_id].klassen.delete(c),
        toggle: (c, an) => { if (an) knoten[r.svg_id].klassen.add(c); else knoten[r.svg_id].klassen.delete(c); },
        contains: (c) => knoten[r.svg_id].klassen.has(c),
      },
    };
  });
  knoten['spielfigur'] = { attribute: {}, setAttribute(a, v) { this.attribute[a] = String(v); } };
  knoten['spielfigur-symbol'] = { textContent: '' };

  const sandbox = {
    console, localStorage, setTimeout, Date,
    VULKAN_STATIONEN: inhalte,
    AUFGABEN_TYPEN: typen,
    Blob: class { constructor(t) { this.teile = t; } },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: {
      getElementById: (id) => (id in knoten ? knoten[id] : null),
      querySelectorAll: () => [],
      createElement: () => ({ click() {}, style: {}, setAttribute() {} }),
      body: { appendChild() {}, removeChild() {} },
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/logik.js'), 'utf8'), sandbox, { filename: 'logik.js' });
  return { V: sandbox.window.VulkanSpiel, knoten };
}

let bestanden = 0, fehler = 0;
function pruefe(name, ok, detail) {
  if (ok) { bestanden++; console.log('  ok    ' + name); }
  else { fehler++; console.log('  FEHLT ' + name + (detail !== undefined ? '  -> ' + detail : '')); }
}

const { V, knoten } = baueUmgebung();
const STARTCODE = inhalte.startcode;
const SCHLOSS_CODE = inhalte.schloss.code;

console.log('\n[1] Startcode und Anmeldung');
pruefe('Keine Gruppe aktiv nach Start', V.aktivGruppe() === null);
pruefe('Anmeldung ohne Name abgelehnt', V.gruppeAnmelden('   ', 'vulkan', STARTCODE).ok === false);
pruefe('Anmeldung ohne Code abgelehnt', V.gruppeAnmelden('Alpha', 'vulkan', '').ok === false);
pruefe('Falscher Code abgelehnt', V.gruppeAnmelden('Alpha', 'vulkan', 'FALSCH').ok === false);
pruefe('Anmeldung ohne Figur abgelehnt', V.gruppeAnmelden('Alpha', null, STARTCODE).ok === false);
pruefe('Richtiger Code akzeptiert', V.gruppeAnmelden('Alpha', 'vulkan', STARTCODE).ok === true);
pruefe('Startcode in Kleinschreibung akzeptiert',
      V.gruppeAnmelden('Beta', 'team', STARTCODE.toLowerCase()).ok === true);
pruefe('Startcode mit Leerzeichen akzeptiert',
      V.gruppeAnmelden('Gamma', 'team', '  ' + STARTCODE + '  ').ok === true);
pruefe('Beide Gruppen mit 10 Punkten', V.gruppen().every(g => g.punkte === 10));
pruefe('Doppelter Name abgelehnt', V.gruppeAnmelden('Alpha', 'vulkan', STARTCODE).ok === false);

// Die zuletzt angemeldete Gruppe ist aktiv. Fuer den Kettentest zu Alpha wechseln.
V.gruppeWaehlen('Alpha');
pruefe('Aktive Gruppe ist Alpha', V.aktivGruppe() === 'Alpha', V.aktivGruppe());

console.log('\n[2] Jede Gruppe darf an einer anderen Station anfangen');
const startcodes = inhalte.startcodes || {};
pruefe('Startcodes fuer alle fuenf Stationen hinterlegt',
      V.REGIONEN.every(r => !!startcodes[r.id]),
      JSON.stringify(Object.keys(startcodes)));
pruefe('Alle fuenf Startcodes sind verschieden',
      new Set(V.REGIONEN.map(r => startcodes[r.id])).size === V.REGIONEN.length,
      JSON.stringify(V.REGIONEN.map(r => startcodes[r.id])));

// Eine Gruppe, die am Hot-Spot anfaengt.
V.gruppeAnmelden('Hotstart', 'gletscher', startcodes.hotspot, 'hotspot');
const hot = V.gruppen().find(g => g.name === 'Hotstart');
pruefe('Gruppe mit Startcode des Hot-Spot angenommen',
      hot && hot.startRegion === 'hotspot', hot ? String(hot.startRegion) : 'fehlt');
pruefe('Nur die gewaehlte Station ist offen',
      hot.regionen.hotspot.freigeschaltet === true &&
      V.REGIONEN.filter(r => r.id !== 'hotspot').every(r => !hot.regionen[r.id].freigeschaltet));
pruefe('Code der falschen Station wird abgelehnt',
      (function () {
        const vorher = V.gruppen().length;
        const e = V.gruppeAnmelden('Falsch', 'team', startcodes.maar, 'hotspot');
        return e.ok === false && V.gruppen().length === vorher;
      })());
pruefe('Code passt nicht, wenn keine Station gewaehlt ist',
      V.gruppeAnmelden('OhneStation', 'team', STARTCODE, null).ok === true);
const ohne = V.gruppen().find(g => g.name === 'OhneStation');
pruefe('Ohne Wahl wird die erste Station genommen',
      ohne && ohne.startRegion === V.REGIONEN[0].id, ohne ? String(ohne.startRegion) : 'fehlt');
pruefe('Ohne Wahl ist die erste Station offen',
      ohne && ohne.regionen[V.REGIONEN[0].id].freigeschaltet === true);

// Zurueck zu Alpha, damit die folgenden Abschnitte mit einem sauberen Zustand laufen.
V.gruppeWaehlen('Alpha');

console.log('\n[3] Die Kette laeuft zyklisch');
V.gruppeWaehlen('Hotstart');
const HOT = 'hotspot';
pruefe('Der Hot-Spot ist offen', hot.regionen[HOT].freigeschaltet === true);
pruefe('Der Hot-Spot traegt einen Aufdruck', !!V.REGIONEN.find(r => r.id === HOT).code_naechste);
// Der Aufdruck des Hot-Spot oeffnet die naechste Station.
const naechsteNachHot = V.naechsteRegionVon(HOT);
pruefe('Nach dem Hot-Spot kommt das Maar-Feld', naechsteNachHot === 'maar', String(naechsteNachHot));
pruefe('Der Aufdruck des Hot-Spot oeffnet die naechste Station',
      V.REGIONEN.find(r => r.id === HOT).code_naechste === startcodes[naechsteNachHot],
      V.REGIONEN.find(r => r.id === HOT).code_naechste + ' vs ' + startcodes[naechsteNachHot]);
// Am Ende der Kette kommt die Gruppe zur Startstation der ersten Gruppe.
const letzte = V.REGIONEN[V.REGIONEN.length - 1];
pruefe('Die letzte Station gibt einen Aufdruck weiter', !!letzte.code_naechste, String(letzte.code_naechste));
pruefe('Nach der letzten Station kommt die erste (zyklisch)',
      V.naechsteRegionVon(letzte.id) === V.REGIONEN[0].id, String(V.naechsteRegionVon(letzte.id)));
pruefe('Der Aufdruck der letzten Station oeffnet die erste Station',
      letzte.code_naechste === startcodes[V.REGIONEN[0].id],
      letzte.code_naechste + ' vs ' + startcodes[V.REGIONEN[0].id]);
pruefe('Der Aufdruck jeder Station oeffnet genau die naechste',
      V.REGIONEN.every(function (r) {
        const folge = V.naechsteRegionVon(r.id);
        if (!folge) return true;
        return r.code_naechste === startcodes[folge];
      }), JSON.stringify(V.REGIONEN.map(r => r.kuerzel + '->' + r.code_naechste)));

// Zurueck zu Alpha fuer die folgenden Abschnitte.
V.gruppeWaehlen('Alpha');

console.log('\n[4] Codekette und verschlossene Stationen');
const alpha = () => V.gruppen().find(g => g.name === 'Alpha');
const erste = V.REGIONEN[0].id;
pruefe('Erste Region nach Anmeldung offen', alpha().regionen[erste].freigeschaltet === true);
pruefe('Zweite Region zu Beginn verschlossen',
      alpha().regionen[V.REGIONEN[1].id].freigeschaltet === false);
pruefe('Alle weiteren Regionen verschlossen',
      V.REGIONEN.slice(2).every(r => alpha().regionen[r.id].freigeschaltet === false));
pruefe('Schloss zu Beginn geschlossen', alpha().schlossAuf === false);

const vorher = alpha().punkte;
pruefe('Frage in verschlossener Region abgelehnt',
      V.frageBeantworten(V.REGIONEN[1].id, V.REGIONEN[1].fragen[0].id, V.REGIONEN[1].fragen[0].richtig).ok === false);
pruefe('Keine Punkte durch verschlossene Region', alpha().punkte === vorher);
pruefe('Falscher Code oeffnet nichts',
      V.codeEinloesen(V.REGIONEN[1].id, 'FALSCH').ok === false &&
      alpha().regionen[V.REGIONEN[1].id].freigeschaltet === false);
pruefe('Code einer anderen Region wird abgelehnt',
      V.codeEinloesen(V.REGIONEN[2].id, V.REGIONEN[0].code_naechste).ok === false);

console.log('\n[5] Kette durchlaufen');
let erwarteteSymbole = [];

/**
 * Eine Station generisch loesen. Station 1 traegt Aufgaben neuer Typen,
 * die uebrigen liefern ihre alten Fragen und Tagebuch-Fragen umgesetzt.
 * Hier wird nur geprueft, dass die Station aufgedeckt wird und ein Symbol
 * bringt — die eigentliche Aufgabenpruefung steht in pruefe_aufgaben.js.
 */
function loeseStation(regionId) {
  const list = V.aufgabenVon(regionId);
  let geloest = 0;
  list.forEach(function (a) {
    if (a.typ === 'mc') {
      const d = a.daten || a;
      if (V.aufgabePruefen(regionId, a.id, d.richtig).ok) geloest++;
    } else if (a.typ === 'zuordnung') {
      const d = a.daten || {};
      const angabe = {};
      d.felder.forEach(f => { angabe[f.id] = f.richtig || (d.loesung || {})[f.id]; });
      if (V.aufgabePruefen(regionId, a.id, angabe).ok) geloest++;
    } else if (a.typ === 'richtig_falsch') {
      const d = a.daten || {};
      const angabe = {};
      d.aussagen.forEach((s, i) => { angabe[i] = s.richtig; });
      if (V.aufgabePruefen(regionId, a.id, angabe).ok) geloest++;
    } else if (a.typ === 'lueckentext') {
      const d = a.daten || {};
      const angabe = {};
      d.loesungen.forEach(l => { angabe[l.id] = l.wort; });
      if (V.aufgabePruefen(regionId, a.id, angabe).ok) geloest++;
    } else if (a.typ === 'wortgitter') {
      const d = a.daten || {};
      const angabe = {};
      d.woerter.forEach(w => w.buchstabe.forEach(b => { angabe[b.x + ',' + b.y] = b.richtig; }));
      if (V.aufgabePruefen(regionId, a.id, angabe).ok) geloest++;
    } else if (a.typ === 'fehler') {
      const d = a.daten || {};
      const angabe = {};
      d.fehler.forEach(f => { angabe[f.id] = true; });
      if (V.aufgabePruefen(regionId, a.id, angabe).ok) geloest++;
    } else if (a.typ === 'freitext') {
      if (V.freitextSpeichern(regionId, a.id, 'Testantwort der Gruppe Alpha mit genug Text.').ok) geloest++;
    }
  });
  return geloest;
}

V.REGIONEN.forEach(function (r, i) {
  if (i > 0) {
    const ergebnis = V.codeEinloesen(r.id, V.REGIONEN[i - 1].code_naechste);
    pruefe('Region ' + r.kuerzel + ' mit Code geoeffnet', ergebnis.ok === true, JSON.stringify(ergebnis));
  }
  const geloest = loeseStation(r.id);
  pruefe('Region ' + r.kuerzel + ': alle ' + V.aufgabenVon(r.id).length + ' Aufgaben geloest',
    geloest === V.aufgabenVon(r.id).length, geloest + ' von ' + V.aufgabenVon(r.id).length);
  erwarteteSymbole.push(r.symbol);
  const anzahl = V.symbole(alpha()).length;
  pruefe('Nach ' + r.kuerzel + ' sind ' + anzahl + ' Symbole', anzahl === i + 1, String(anzahl));
});

pruefe('Fortschritt 5 von 5', V.fortschritt(alpha()) === 5, String(V.fortschritt(alpha())));
pruefe('Symbole in der richtigen Reihenfolge',
      JSON.stringify(V.symbole(alpha()).map(s => s.symbol)) === JSON.stringify(erwarteteSymbole),
      JSON.stringify(V.symbole(alpha()).map(s => s.symbol)));
pruefe('Punkte nach allen Aufgaben: 10 Start + 30 Station 1 + 80 Stationen 2-5 = 120',
      alpha().punkte === 120, String(alpha().punkte));

console.log('\n[6] Schloss');
pruefe('Schloss ist bereit', V.schlossBereit(alpha()) === true);
pruefe('Schloss-Code steht in den Daten', typeof SCHLOSS_CODE === 'string' && SCHLOSS_CODE.length > 0);
const schloss = V.schlossOeffnen();
pruefe('Schloss oeffnen klappt', schloss.ok === true, JSON.stringify(schloss));
pruefe('Bonus wurde gutgeschrieben', schloss.bonus === inhalte.schloss.bonuspunkte, String(schloss.bonus));
pruefe('Punkte jetzt 130', alpha().punkte === 130, String(alpha().punkte));
pruefe('Abschluss-Code wird geliefert', schloss.code === SCHLOSS_CODE);
pruefe('Zweites Oeffnen abgelehnt', V.schlossOeffnen().ok === false);

V.gruppeWaehlen('Beta');
pruefe('Gruppe ohne Symbole: Schloss nicht bereit',
      V.schlossBereit(V.gruppen().find(g => g.name === 'Beta')) === false);
pruefe('Gruppe ohne Symbole: Oeffnen abgelehnt', V.schlossOeffnen().ok === false);

console.log('\n[7] Lehrkraft-Uebersicht');
V.gruppeWaehlen('Alpha');
const u = V.lehrkraftUebersicht();
pruefe('Startcode wird geliefert', u.startcode === STARTCODE, u.startcode);
pruefe('Kette hat fuenf Eintraege', u.kette.length === V.REGIONEN.length);
pruefe('Jeder Eintrag hat Station, Symbol, Startcode und Folgencode',
      u.kette.every(k => k.region && k.symbol && k.startcode && k.codeNaechste),
      JSON.stringify(u.kette));
pruefe('Startcode der ersten Station ist der Code des Spiels', u.kette[0].startcode === STARTCODE);
pruefe('Jeder Startcode ist mehr als drei Zeichen',
      u.kette.every(k => k.startcode.length > 3), JSON.stringify(u.kette.map(k => k.startcode)));
pruefe('Die letzten Station gibt einen Aufdruck weiter (zyklisch)',
      !!u.kette[u.kette.length - 1].codeNaechste);
pruefe('Der Aufdruck jeder Station oeffnet genau die naechste',
      V.REGIONEN.every(function (r) {
        var folge = V.naechsteRegionVon(r.id);
        return !!folge && r.code_naechste === (inhalte.startcodes || {})[folge];
      }), JSON.stringify(V.REGIONEN.map(function (r) { return r.kuerzel + ' -> ' + r.code_naechste; })));
pruefe('Schloss-Code wird geliefert', u.schlossCode === SCHLOSS_CODE);

console.log('\n[8] Symbole und Schloss in der Punktetabelle');
const csv = V.exportCSV();
const zeilen = csv.trim().split(/\r\n/);
pruefe('CSV hat neun Spalten', zeilen[0].split(';').length === 9, zeilen[0]);
pruefe('CSV listet Symbole und Schloss',
      zeilen[0].indexOf('Symbole') !== -1 && zeilen[0].indexOf('Schloss geoeffnet') !== -1);
pruefe('CSV: Alpha hat 17 Aufgaben geloest und das Schloss offen',
      zeilen.some(z => z.indexOf('Alpha;Vulkanforscherin;130;5;17 von 17;5;0;5;ja') === 0),
      zeilen.join(' | '));

console.log('\n[9] Freitext');
const freiId = V.aufgabenVon('hotspot').filter(a => a.typ === 'freitext')[0].id;
const vorherFreitext = alpha().punkte;
const tb = V.freitextSpeichern('hotspot', freiId, 'Wir packen eine Maske ein, weil Asche die Atemwege reizt.');
pruefe('Freitext-Antwort wird uebernommen', tb.ok === true, JSON.stringify(tb));
pruefe('Freitext-Antwort gibt noch keine Punkte', alpha().punkte === vorherFreitext,
      String(alpha().punkte));
const bewertung = V.freitextBewerten('hotspot', freiId, 5, 'Kriterien erfuellt.');
pruefe('Bewertung gibt Punkte', bewertung.ok === true && bewertung.punkte === 5);
pruefe('Punkte jetzt 135', alpha().punkte === 135, String(alpha().punkte));
pruefe('Zu kurze Antwort abgelehnt',
      V.freitextSpeichern('hotspot', freiId, 'kurz').ok === false);
pruefe('Tagebuch-Text enthaelt die Antwort', V.exportTagebuch().indexOf('Maske') !== -1);
pruefe('Tagebuch-Export zeigt die Bewertung', V.exportTagebuch().indexOf('bewertet: 5') !== -1);

console.log('\n[9b] Mehrere Bewertungen auf einmal (Weg A)');
var batch = V.freitextBatch([
  { gruppe: 'Alpha', regionId: 'subduktion', aufgabeId: 'sub-5', punkte: 9, hinweis: 'Aus dem Dienst.' }
]);
pruefe('Batch traegt die Bewertung ein', batch.ok === true && batch.eingetragen === 1,
  JSON.stringify(batch));
pruefe('Punkte jetzt 144', alpha().punkte === 144, String(alpha().punkte));
var batchZwei = V.freitextBatch([
  { gruppe: 'Alpha', regionId: 'subduktion', aufgabeId: 'sub-5', punkte: 6, hinweis: 'Nachkorrektur.' }
]);
pruefe('Erneute Batch-Bewertung ersetzt die Punkte',
  V.gruppen().find(function (g) { return g.name === 'Alpha'; }).punkte === 141,
  String(V.gruppen().find(function (g) { return g.name === 'Alpha'; }).punkte));
var batchFalsch = V.freitextBatch([
  { gruppe: 'Gibt es nicht', regionId: 'subduktion', aufgabeId: 'sub-5', punkte: 5 }
]);
pruefe('Unbekannte Gruppe wird gemeldet',
  batchFalsch.eingetragen === 0 && batchFalsch.fehler.length === 1, JSON.stringify(batchFalsch));
var batchLeer = V.freitextBatch([]);
pruefe('Leere Liste ist harmlos', batchLeer.ok === true && batchLeer.eingetragen === 0);

console.log('\n[10] Dateien und Verdrahtung');
pruefe('index.html laedt inhalte.js', html.indexOf('src="assets/inhalte.js"') !== -1);
pruefe('index.html laedt aufgaben.js', html.indexOf('src="assets/aufgaben.js"') !== -1);
pruefe('index.html laedt logik.js', html.indexOf('src="assets/logik.js"') !== -1);
pruefe('index.html laedt oberflaeche.js', html.indexOf('src="assets/oberflaeche.js"') !== -1);
pruefe('Alte Skripte werden nicht mehr geladen',
      html.indexOf('src="assets/spiel.js"') === -1 && html.indexOf('src="assets/ui.js"') === -1);
pruefe('index.html laedt keine Daten per fetch', html.indexOf('fetch(') === -1);
pruefe('Nur der lokale Bewertungsdienst wird angerufen',
      oberflaeche.indexOf('/bewerten') !== -1 &&
      oberflaeche.indexOf('/gesund') !== -1);
pruefe('Der Schluessel kommt nicht ins Spiel',
      oberflaeche.indexOf('apiSchluessel') === -1 &&
      oberflaeche.indexOf('AIza') === -1);
pruefe('Startcode-Eingabe vorhanden', html.indexOf('id="startcode"') !== -1);
pruefe('Schloss-Bereich vorhanden', html.indexOf('id="schlossBox"') !== -1);
pruefe('Aufgaben-Styles vorhanden', html.indexOf('.kaertchen-item') !== -1);
pruefe('Freitext-Import wird erzeugt', oberflaeche.indexOf('bewertungImportBtn') !== -1);
pruefe('Freitext-Export wird erzeugt', oberflaeche.indexOf('freitextHerunterladen') !== -1);
pruefe('Bewertungsdatei wird eingelesen', oberflaeche.indexOf('freitextImport') !== -1);
pruefe('Karte enthaelt alle 5 Regions-Gruppen',
      inhalte.regionen.every(r => html.indexOf('id="' + r.svg_id + '"') !== -1));
const svgStart = html.indexOf('<svg');
const svgBlock = html.slice(svgStart, html.indexOf('</svg>') + 6);
pruefe('Karte enthaelt Landflaechen-Pfade',
      /<g class="laender"><path d="([^"]{5000,})"/.test(svgBlock));
pruefe('Karte enthaelt Gradnetz',
      svgBlock.indexOf('class="aequator"') !== -1 && svgBlock.indexOf('class="wendekreis"') !== -1);
pruefe('Regionspositionen stimmen mit den Daten ueberein',
      inhalte.regionen.every(r => {
        const kreis = new RegExp('id="' + r.svg_id + '"[\\s\\S]{0,200}?cx="' + r.figur.x + '"\\s+cy="' + r.figur.y + '"');
        return kreis.test(svgBlock);
      }));

console.log('\n[11] Inhalte');
pruefe('5 Regionen geladen', V.REGIONEN.length === 5, String(V.REGIONEN.length));
pruefe('Jede Region hat Aufgaben oder die alten Fragen',
      V.REGIONEN.every(r => (r.aufgaben && r.aufgaben.length) || (r.fragen && r.fragen.length)));
pruefe('Jede alte Frage hat 4 Optionen und genau eine richtige',
      V.REGIONEN.every(r => (r.fragen || []).every(f => f.optionen.length === 4 && f.richtig >= 0 && f.richtig < 4)));
pruefe('Jede alte Frage hat eine Erklaerung',
      V.REGIONEN.every(r => (r.fragen || []).every(f => f.erklaerung && f.erklaerung.length > 40)));
pruefe('Station 1 hat fuenf Aufgaben neuer Typen',
      V.aufgabenVon('subduktion').length === 5);
pruefe('Station 1 nutzt mindestens vier verschiedene Typen',
      new Set(V.aufgabenVon('subduktion').map(a => a.typ)).size >= 4);
pruefe('Jede Region hat ein Symbol und einen Namen', V.REGIONEN.every(r => r.symbol && r.symbol_name));
pruefe('Alle fuenf Symbole sind verschieden',
      new Set(V.REGIONEN.map(r => r.symbol)).size === V.REGIONEN.length);
pruefe('Erste vier Regionen haben einen Folgencode',
      V.REGIONEN.slice(0, 4).every(r => r.code_naechste && r.code_naechste.length > 3));
pruefe('Fuenfte Station gibt einen Aufdruck weiter (Kette ist zyklisch)',
      !!V.REGIONEN[V.REGIONEN.length - 1].code_naechste);
pruefe('5 Spielfiguren vorhanden', V.FIGUREN.length === 5);
pruefe('Inhalte-Version wird geliefert', V.inhaltVersion === inhalte.version, V.inhaltVersion);

console.log('\n[12] Reset');
V.reset();
pruefe('Nach Reset keine Gruppen', V.gruppen().length === 0);
pruefe('Nach Reset keine Region offen',
      Object.keys(knoten).every(k => !knoten[k].klassen || !knoten[k].klassen.has('offen')));
pruefe('Nach Reset keine Freitexte', V.freitextEintraege().length === 0);

console.log('\n----------------------------------------');
console.log('Bestanden: ' + bestanden + '  |  Fehlgeschlagen: ' + fehler);
process.exit(fehler === 0 ? 0 : 1);
