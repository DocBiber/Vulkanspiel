/**
 * Testlauf fuer die Vulkanspiel-Logik (Node, ohne Browser).
 * Laedt assets/inhalte.js und assets/logik.js in einer minimalen Browser-Umgebung
 * und prueft den Ablauf: Anmeldung mit Figur, Fragen, Tagebuch, Punkte, Export.
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
      kinder: [
        { klassen: new Set(['loch']), style: {} },
        { klassen: new Set(), style: {} }
      ],
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
  knoten['spielfigur'] = { attribute: {}, kinder: [] };
  knoten['spielfigur'].setAttribute = function (a, v) { this.attribute[a] = String(v); };
  knoten['spielfigur'].getAttribute = function (a) { return (a in this.attribute) ? this.attribute[a] : null; };
  knoten['spielfigur-symbol'] = { textContent: '' };

  const sandbox = {
    console, localStorage, setTimeout, Date,
    VULKAN_STATIONEN: inhalte,
    Blob: class { constructor(t) { this.teile = t; } },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: {
      getElementById: (id) => {
        if (id in knoten) return knoten[id];
        if (id === 'spielfigur-symbol') return knoten['spielfigur-symbol'];
        return null;
      },
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

console.log('\n[1] Anmeldung');
pruefe('Keine Gruppe aktiv nach Start', V.aktivGruppe() === null);
pruefe('Anmeldung ohne Name abgelehnt', V.gruppeAnmelden('   ', 'vulkan').ok === false);
pruefe('Anmeldung ohne Figur abgelehnt', V.gruppeAnmelden('Alpha', null).ok === false);
pruefe('Anmeldung mit Figur ok, 10 Punkte', V.gruppeAnmelden('Alpha', 'vulkan').ok === true);
pruefe('Gruppe hat Figur und Symbol',
      V.gruppen()[0].figur === 'vulkan' && V.gruppen()[0].symbol === '🌋',
      JSON.stringify({ f: V.gruppen()[0].figur, s: V.gruppen()[0].symbol }));
pruefe('Doppelter Name abgelehnt', V.gruppeAnmelden('Alpha', 'gletscher').ok === false);
pruefe('Zweite Gruppe Beta aktiv', V.gruppeAnmelden('Beta', 'team').ok === true && V.aktivGruppe() === 'Beta');

console.log('\n[2] Regionen und Inhalte');
pruefe('5 Regionen geladen', V.REGIONEN.length === 5, String(V.REGIONEN.length));
pruefe('Jede Region hat 2 Fragen und 1 Tagebuch-Frage',
      V.REGIONEN.every(r => r.fragen.length === 2 && r.tagebuch.length === 1));
pruefe('Jede Frage hat 4 Optionen und genau eine richtige',
      V.REGIONEN.every(r => r.fragen.every(f => f.optionen.length === 4 && f.richtig >= 0 && f.richtig < 4)));
pruefe('Jede Frage hat eine Erklaerung',
      V.REGIONEN.every(r => r.fragen.every(f => f.erklaerung && f.erklaerung.length > 40)));
pruefe('5 Spielfiguren vorhanden', V.FIGUREN.length === 5);
pruefe('Jede Figur hat Symbol und Name', V.FIGUREN.every(f => f.symbol && f.name));
pruefe('Inhalte kommen aus inhalte.js', V.inhaltVersion === inhalte.version, V.inhaltVersion);

console.log('\n[3] Fragen beantworten');
const beta = () => V.gruppen().find(g => g.name === 'Beta');
const r1 = V.REGIONEN[0];
pruefe('Startpunkte 10', beta().punkte === 10, String(beta().punkte));
const falsch = V.frageBeantworten(r1.id, r1.fragen[0].id, (r1.fragen[0].richtig + 1) % 4);
pruefe('Falsche Antwort wird erkannt', falsch.ok === false && falsch.richtig === false);
pruefe('Falsche Antwort gibt keine Punkte', beta().punkte === 10, String(beta().punkte));
const richtig = V.frageBeantworten(r1.id, r1.fragen[0].id, r1.fragen[0].richtig);
pruefe('Richtige Antwort gibt 10 Punkte', richtig.punkte === 10, String(richtig.punkte));
pruefe('Punkte jetzt 20', beta().punkte === 20, String(beta().punkte));
pruefe('Noch nicht aufgedeckt (1 von 2 richtig)', richtig.regionOffen === false);
pruefe('Erklaerung wird geliefert', typeof richtig.erklaerung === 'string' && richtig.erklaerung.length > 20);
pruefe('Dieselbe Frage ein zweites Mal ablehnen',
      V.frageBeantworten(r1.id, r1.fragen[0].id, r1.fragen[0].richtig).ok === false);

console.log('\n[4] Region aufdecken');
const r2 = V.frageBeantworten(r1.id, r1.fragen[1].id, r1.fragen[1].richtig);
pruefe('Zweite Frage richtig', r2.richtig === true);
pruefe('Region jetzt aufgedeckt', r2.regionOffen === true);
pruefe('Fortschritt 1 von 5', V.fortschritt(beta()) === 1, String(V.fortschritt(beta())));
pruefe('Region im DOM als offen markiert', knoten[r1.svg_id].klassen.has('offen'));
pruefe('Region traegt data-offen', knoten[r1.svg_id].getAttribute('data-offen') === '1');

console.log('\n[5] Tagebuch');
pruefe('Leere Antwort abgelehnt',
      V.tagebuchSpeichern(r1.id, r1.tagebuch[0].id, 'kurz').ok === false);
const tb = V.tagebuchSpeichern(r1.id, r1.tagebuch[0].id, 'Wir packen eine Atemschutzmaske und einen Helmet ein.');
pruefe('Tagebuch-Abgabe ok', tb.ok === true && tb.neu === true);
pruefe('Tagebuch gibt 5 Punkte', tb.punkte === 5, String(tb.punkte));
pruefe('Punkte jetzt 35 (10 + 2x10 + 5)', beta().punkte === 35, String(beta().punkte));
const tb2 = V.tagebuchSpeichern(r1.id, r1.tagebuch[0].id, 'Wir packen eine Atemschutzmaske ein.');
pruefe('Aenderung gibt keine Punkte mehr', tb2.neu === false && tb2.punkte === 0);
pruefe('Punkte unveraendert', beta().punkte === 35, String(beta().punkte));
pruefe('Tagebuch-Eintrag vorhanden', V.tagebuchEintraege().length === 1);
pruefe('Tagebuch-Eintrag enthaelt Gruppe, Region und Antwort',
      V.tagebuchEintraege()[0].gruppe === 'Beta' &&
      V.tagebuchEintraege()[0].region === r1.name &&
      V.tagebuchEintraege()[0].antwort.length > 10);

console.log('\n[6] Mehrere Gruppen');
V.gruppeWaehlen('Alpha');
const a1 = V.REGIONEN[1];
V.frageBeantworten(a1.id, a1.fragen[0].id, a1.fragen[0].richtig);
V.frageBeantworten(a1.id, a1.fragen[1].id, a1.fragen[1].richtig);
pruefe('Alpha hat 30 Punkte (10 + 2x10)', V.gruppen().find(g => g.name === 'Alpha').punkte === 30);
pruefe('Beta bleibt bei 35', beta().punkte === 35, String(beta().punkte));
pruefe('Fortschritt der Gruppen unterschiedlich',
      V.fortschritt(V.gruppen().find(g => g.name === 'Alpha')) === 1 &&
      V.fortschritt(beta()) === 1);

console.log('\n[7] Export');
const csv = V.exportCSV();
const zeilen = csv.trim().split(/\r\n/);
pruefe('CSV hat Kopfzeile und 2 Gruppen', zeilen.length === 3, 'Zeilen: ' + zeilen.length);
pruefe('CSV hat 5 Spalten', zeilen[0].split(';').length === 5, zeilen[0]);
pruefe('CSV listet Beta mit 35 Punkten', zeilen.some(z => z.indexOf('Beta;Feldteam;35;1;1') !== -1), zeilen.join(' | '));
pruefe('CSV listet Alpha mit 30 Punkten', zeilen.some(z => z.indexOf('Alpha;Vulkanforscherin;30;1;0') !== -1));
pruefe('CSV hat UTF-8-BOM', V.csvBlob().teile[0].charCodeAt(0) === 0xFEFF);
const tbt = V.exportTagebuch();
pruefe('Tagebuch-Text enthaelt Gruppe und Frage',
      tbt.indexOf('=== Beta ===') !== -1 && tbt.indexOf(r1.tagebuch[0].frage) !== -1);
pruefe('Tagebuch-Text enthaelt die Antwort', tbt.indexOf('Atemschutzmaske') !== -1);

console.log('\n[8] Dateien und Verdrahtung');
pruefe('index.html laedt inhalte.js', html.indexOf('src="assets/inhalte.js"') !== -1);
pruefe('index.html laedt logik.js', html.indexOf('src="assets/logik.js"') !== -1);
pruefe('index.html laedt oberflaeche.js', html.indexOf('src="assets/oberflaeche.js"') !== -1);
pruefe('index.html bindet inhalte.js vor logik.js',
      html.indexOf('src="assets/inhalte.js"') < html.indexOf('src="assets/logik.js"'));
pruefe('Alte Skripte werden nicht mehr geladen',
      html.indexOf('src="assets/spiel.js"') === -1 && html.indexOf('src="assets/ui.js"') === -1);
pruefe('Kein fetch() im Spiel', html.indexOf('fetch(') === -1);
pruefe('Karte ist inline eingebettet', html.indexOf('<svg') !== -1);
pruefe('Karte enthaelt alle 5 Regions-Gruppen',
      inhalte.regionen.every(r => html.indexOf('id="' + r.svg_id + '"') !== -1));
pruefe('Jede Region hat data-region',
      inhalte.regionen.every(r => html.indexOf('data-region="' + r.id + '"') !== -1));
pruefe('Spielfigur ist in der Karte', html.indexOf('id="spielfigur"') !== -1);
pruefe('Panels vorhanden',
      ['figurwahl', 'regionsbereich', 'tagebuchBox', 'auswertungBox', 'kartenStatus']
        .every(id => html.indexOf('id="' + id + '"') !== -1));
const svgStart = html.indexOf('<svg');
const svgBlock = html.slice(svgStart, html.indexOf('</svg>') + 6);
pruefe('SVG hat viewBox und kein Script',
      svgBlock.indexOf('viewBox=') !== -1 && svgBlock.indexOf('<script') === -1);

// Die Karte muss echte Geodaten enthalten, keine stilisierten Umrisse.
pruefe('Karte enthaelt Landflaechen-Pfade',
      /<g class="laender"><path d="([^"]{5000,})"/.test(svgBlock),
      'Pfadlaenge: ' + ((/<g class="laender"><path d="([^"]+)"/.exec(svgBlock) || [])[1] || '').length);
pruefe('Karte enthaelt Gradnetz (Aequator und Wendekreise)',
      svgBlock.indexOf('class="aequator"') !== -1 &&
      svgBlock.indexOf('class="wendekreis"') !== -1 &&
      svgBlock.indexOf('class="nullmeridian"') !== -1);
pruefe('Karte enthaelt Legende',
      svgBlock.indexOf('class="legende"') !== -1 && svgBlock.indexOf('class="legendetext"') !== -1);

// Regions-Positionen in der Karte muessen zu den Daten passen.
pruefe('Regions-Positionen in der Karte stimmen mit den Daten ueberein',
      inhalte.regionen.every(r => {
        const kreis = new RegExp('id="' + r.svg_id + '"[\\s\\S]{0,200}?cx="' + r.figur.x + '"\\s+cy="' + r.figur.y + '"');
        return kreis.test(svgBlock);
      }),
      inhalte.regionen.map(r => r.svg_id + '@' + r.figur.x + ',' + r.figur.y).join(' | '));

pruefe('Jede Region liegt innerhalb der Kartenflaeche',
      inhalte.regionen.every(r => r.figur.x > 0 && r.figur.x < 1000 && r.figur.y > 0 && r.figur.y < 500),
      inhalte.regionen.map(r => Math.round(r.figur.x) + ',' + Math.round(r.figur.y)).join(' | '));

pruefe('Keine zwei Regionen liegen an derselben Stelle',
      (() => {
        const positionen = inhalte.regionen.map(r => r.figur.x + ',' + r.figur.y);
        return new Set(positionen).size === positionen.length;
      })());

console.log('\n[9] Reset');
V.reset();
pruefe('Nach Reset keine Gruppen', V.gruppen().length === 0);
pruefe('Nach Reset keine Region offen', Object.keys(knoten).every(k => !knoten[k].klassen || !knoten[k].klassen.has('offen')));
pruefe('Nach Reset leeres Tagebuch', V.tagebuchEintraege().length === 0);

console.log('\n----------------------------------------');
console.log('Bestanden: ' + bestanden + '  |  Fehlgeschlagen: ' + fehler);
process.exit(fehler === 0 ? 0 : 1);
