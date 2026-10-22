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
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

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

console.log('\n[2] Codekette und verschlossene Regionen');
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

console.log('\n[3] Kette durchlaufen');
let erwarteteSymbole = [];
V.REGIONEN.forEach(function (r, i) {
  if (i > 0) {
    const ergebnis = V.codeEinloesen(r.id, V.REGIONEN[i - 1].code_naechste);
    pruefe('Region ' + r.kuerzel + ' mit Code geoeffnet', ergebnis.ok === true, JSON.stringify(ergebnis));
  }
  r.fragen.forEach(function (fr) {
    V.frageBeantworten(r.id, fr.id, fr.richtig);
  });
  erwarteteSymbole.push(r.symbol);
  const anzahl = V.symbole(alpha()).length;
  pruefe('Nach ' + r.kuerzel + ' sind ' + anzahl + ' Symbole', anzahl === i + 1, String(anzahl));
});

pruefe('Fortschritt 5 von 5', V.fortschritt(alpha()) === 5, String(V.fortschritt(alpha())));
pruefe('Symbole in der richtigen Reihenfolge',
      JSON.stringify(V.symbole(alpha()).map(s => s.symbol)) === JSON.stringify(erwarteteSymbole),
      JSON.stringify(V.symbole(alpha()).map(s => s.symbol)));
pruefe('Punkte 110 nach allen Fragen', alpha().punkte === 110, String(alpha().punkte));

console.log('\n[4] Schloss');
pruefe('Schloss ist bereit', V.schlossBereit(alpha()) === true);
pruefe('Schloss-Code steht in den Daten', typeof SCHLOSS_CODE === 'string' && SCHLOSS_CODE.length > 0);
const schloss = V.schlossOeffnen();
pruefe('Schloss oeffnen klappt', schloss.ok === true, JSON.stringify(schloss));
pruefe('Bonus wurde gutgeschrieben', schloss.bonus === inhalte.schloss.bonuspunkte, String(schloss.bonus));
pruefe('Punkte jetzt 120', alpha().punkte === 120, String(alpha().punkte));
pruefe('Abschluss-Code wird geliefert', schloss.code === SCHLOSS_CODE);
pruefe('Zweites Oeffnen abgelehnt', V.schlossOeffnen().ok === false);

V.gruppeWaehlen('Beta');
pruefe('Gruppe ohne Symbole: Schloss nicht bereit',
      V.schlossBereit(V.gruppen().find(g => g.name === 'Beta')) === false);
pruefe('Gruppe ohne Symbole: Oeffnen abgelehnt', V.schlossOeffnen().ok === false);

console.log('\n[5] Lehrkraft-Uebersicht');
V.gruppeWaehlen('Alpha');
const u = V.lehrkraftUebersicht();
pruefe('Startcode wird geliefert', u.startcode === STARTCODE, u.startcode);
pruefe('Kette hat fuenf Eintraege', u.kette.length === V.REGIONEN.length);
pruefe('Jeder Eintrag hat Region, Symbol und Code',
      u.kette.every(k => k.region && k.symbol && k.codeZumOeffnen));
pruefe('Code der ersten Region ist der Startcode', u.kette[0].codeZumOeffnen === STARTCODE);
pruefe('Code der zweiten Region ist der Folgencode der ersten',
      u.kette[1].codeZumOeffnen === u.kette[0].codeNaechste);
pruefe('Jeder Code ist mehr als drei Zeichen',
      u.kette.every(k => k.codeZumOeffnen.length > 3), JSON.stringify(u.kette.map(k => k.codeZumOeffnen)));
pruefe('Letzte Region hat keinen Folgencode', !u.kette[u.kette.length - 1].codeNaechste);
pruefe('Schloss-Code wird geliefert', u.schlossCode === SCHLOSS_CODE);

console.log('\n[6] Symbole und Schloss in der Punktetabelle');
const csv = V.exportCSV();
const zeilen = csv.trim().split(/\r\n/);
pruefe('CSV hat 7 Spalten', zeilen[0].split(';').length === 7, zeilen[0]);
pruefe('CSV listet Symbole und Schloss',
      zeilen[0].indexOf('Symbole') !== -1 && zeilen[0].indexOf('Schloss geoeffnet') !== -1);
pruefe('CSV: Alpha hat 5 Regionen, 0 Tagebuch, 5 Symbole, Schloss offen',
      zeilen.some(z => z.indexOf('Alpha;Vulkanforscherin;120;5;0;5;ja') === 0), zeilen.join(' | '));

console.log('\n[7] Tagebuch');
const tb = V.tagebuchSpeichern(V.REGIONEN[0].id, V.REGIONEN[0].tagebuch[0].id, 'Wir packen eine Maske ein.');
pruefe('Tagebuch-Abgabe ok', tb.ok === true && tb.neu === true);
pruefe('Tagebuch gibt 5 Punkte', tb.punkte === 5, String(tb.punkte));
pruefe('Punkte jetzt 125', alpha().punkte === 125, String(alpha().punkte));
pruefe('Leere Antwort abgelehnt',
      V.tagebuchSpeichern(V.REGIONEN[0].id, V.REGIONEN[0].tagebuch[0].id, 'kurz').ok === false);
pruefe('Tagebuch-Text enthaelt die Antwort', V.exportTagebuch().indexOf('Maske') !== -1);

console.log('\n[8] Dateien und Verdrahtung');
pruefe('index.html laedt inhalte.js', html.indexOf('src="assets/inhalte.js"') !== -1);
pruefe('index.html laedt logik.js', html.indexOf('src="assets/logik.js"') !== -1);
pruefe('index.html laedt oberflaeche.js', html.indexOf('src="assets/oberflaeche.js"') !== -1);
pruefe('Alte Skripte werden nicht mehr geladen',
      html.indexOf('src="assets/spiel.js"') === -1 && html.indexOf('src="assets/ui.js"') === -1);
pruefe('Kein fetch() im Spiel', html.indexOf('fetch(') === -1);
pruefe('Startcode-Eingabe vorhanden', html.indexOf('id="startcode"') !== -1);
pruefe('Schloss-Bereich vorhanden', html.indexOf('id="schlossBox"') !== -1);
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

console.log('\n[9] Inhalte');
pruefe('5 Regionen geladen', V.REGIONEN.length === 5, String(V.REGIONEN.length));
pruefe('Jede Region hat 2 Fragen und 1 Tagebuch-Frage',
      V.REGIONEN.every(r => r.fragen.length === 2 && r.tagebuch.length === 1));
pruefe('Jede Frage hat 4 Optionen und genau eine richtige',
      V.REGIONEN.every(r => r.fragen.every(f => f.optionen.length === 4 && f.richtig >= 0 && f.richtig < 4)));
pruefe('Jede Frage hat eine Erklaerung',
      V.REGIONEN.every(r => r.fragen.every(f => f.erklaerung && f.erklaerung.length > 40)));
pruefe('Jede Region hat ein Symbol und einen Namen', V.REGIONEN.every(r => r.symbol && r.symbol_name));
pruefe('Alle fuenf Symbole sind verschieden',
      new Set(V.REGIONEN.map(r => r.symbol)).size === V.REGIONEN.length);
pruefe('Erste vier Regionen haben einen Folgencode',
      V.REGIONEN.slice(0, 4).every(r => r.code_naechste && r.code_naechste.length > 3));
pruefe('Fuenfte Region hat keinen Folgencode',
      !V.REGIONEN[V.REGIONEN.length - 1].code_naechste);
pruefe('5 Spielfiguren vorhanden', V.FIGUREN.length === 5);
pruefe('Inhalte-Version wird geliefert', V.inhaltVersion === inhalte.version, V.inhaltVersion);

console.log('\n[10] Reset');
V.reset();
pruefe('Nach Reset keine Gruppen', V.gruppen().length === 0);
pruefe('Nach Reset keine Region offen',
      Object.keys(knoten).every(k => !knoten[k].klassen || !knoten[k].klassen.has('offen')));
pruefe('Nach Reset leeres Tagebuch', V.tagebuchEintraege().length === 0);

console.log('\n----------------------------------------');
console.log('Bestanden: ' + bestanden + '  |  Fehlgeschlagen: ' + fehler);
process.exit(fehler === 0 ? 0 : 1);
