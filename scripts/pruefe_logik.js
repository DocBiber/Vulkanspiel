/**
 * Testlauf fuer die Vulkanspiel-Logik (Node, ohne Browser).
 * Laedt assets/inhalte.js und assets/logik.js in einer minimalen Browser-Umgebung
 * und prueft den Ablauf: Anmeldung mit Figur und Aufdruck, Aufgaben, Punkte, Export.
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
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'assets/aufgaben.js'), 'utf8'), sandbox, { filename: 'aufgaben.js' });
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
const START = inhalte.startcodes[inhalte.regionen[0].id];
pruefe('Anmeldung mit Figur und Aufdruck ok',
      V.gruppeAnmelden('Alpha', 'vulkan', START).ok === true);
pruefe('Gruppe hat Figur und Symbol',
      V.gruppen()[0].figur === 'vulkan' && V.gruppen()[0].symbol === '🔭',
      JSON.stringify({ f: V.gruppen()[0].figur, s: V.gruppen()[0].symbol }));
pruefe('Doppelter Name abgelehnt', V.gruppeAnmelden('Alpha', 'gletscher', START).ok === false);
pruefe('Zweite Gruppe Beta aktiv',
      V.gruppeAnmelden('Beta', 'team', START).ok === true && V.aktivGruppe() === 'Beta');

console.log('\n[2] Regionen und Inhalte');
pruefe('5 Regionen geladen', V.REGIONEN.length === 5, String(V.REGIONEN.length));
pruefe('Jede Region hat fuenf Aufgaben',
      V.REGIONEN.every(r => r.aufgaben.length === 5));
pruefe('Jede Multiple-Choice-Aufgabe hat 4 Optionen und genau eine richtige',
      V.REGIONEN.every(r => r.aufgaben.filter(a => a.typ === 'mc')
        .every(a => a.daten.optionen.length === 4 && a.daten.richtig >= 0 && a.daten.richtig < 4)));
pruefe('Jede Multiple-Choice-Aufgabe hat eine Erklaerung',
      V.REGIONEN.every(r => r.aufgaben.filter(a => a.typ === 'mc')
        .every(a => a.daten.erklaerung && a.daten.erklaerung.length > 40)));
pruefe('Jede Zuordnung verweist auf eine vorhandene Skizze',
      V.REGIONEN.every(r => r.aufgaben.filter(a => a.typ === 'zuordnung')
        .every(a => inhalte.skizzen[a.daten.skizze])));
pruefe('Jeder Lueckentext hat zu jeder Luecke eine Loesung',
      V.REGIONEN.every(r => r.aufgaben.filter(a => a.typ === 'lueckentext').every(a => {
        const ids = (a.daten.text.match(/\[\d\]/g) || []).map(s => s[1]);
        return new Set(ids).size === a.daten.loesungen.length;
      })));
pruefe('5 Spielfiguren vorhanden', V.FIGUREN.length === 5);
pruefe('Jede Figur hat Symbol und Name', V.FIGUREN.every(f => f.symbol && f.name));
pruefe('Inhalte kommen aus inhalte.js', V.inhaltVersion === inhalte.version, V.inhaltVersion);

console.log('\n[3] Aufgabe beantworten');
const beta = () => V.gruppen().find(g => g.name === 'Beta');
const r1 = V.REGIONEN[0];
const mcAufgabe = r1.aufgaben[0];
pruefe('Startpunkte 10', beta().punkte === 10, String(beta().punkte));
V.aufgabePruefen(r1.id, mcAufgabe.id, (mcAufgabe.daten.richtig + 1) % 4);
pruefe('Falsche Antwort gibt keine Punkte', beta().punkte === 10, String(beta().punkte));
const richtig = V.aufgabePruefen(r1.id, mcAufgabe.id, mcAufgabe.daten.richtig);
pruefe('Richtige Antwort wird erkannt', richtig.ok === true, JSON.stringify(richtig));
pruefe('Punkte steigen um den Wert der Aufgabe',
      beta().punkte === 10 + mcAufgabe.punkte, String(beta().punkte));
pruefe('Eine geloeste Aufgabe wird nicht ein zweites Mal gewertet',
      V.aufgabePruefen(r1.id, mcAufgabe.id, mcAufgabe.daten.richtig).ok === false);

console.log('\n[4] Mehrere Gruppen');
V.gruppeWaehlen('Alpha');
pruefe('Alpha hat noch 10 Punkte', V.gruppen().find(g => g.name === 'Alpha').punkte === 10);
pruefe('Beta behaelt seine Punkte', beta().punkte === 10 + mcAufgabe.punkte, String(beta().punkte));

console.log('\n[5] Export');
const csv = V.exportCSV();
const zeilen = csv.trim().split(/\r\n/);
pruefe('CSV hat Kopfzeile und 2 Gruppen', zeilen.length === 3, 'Zeilen: ' + zeilen.length);
pruefe('CSV hat neun Spalten', zeilen[0].split(';').length === 9, zeilen[0]);
pruefe('CSV listet Beta mit seinen Punkten',
      zeilen.some(z => z.indexOf('Beta;Feldteam;' + (10 + mcAufgabe.punkte) + ';') === 0), zeilen.join(' | '));
pruefe('CSV hat UTF-8-BOM', V.csvBlob().teile[0].charCodeAt(0) === 0xFEFF);

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

console.log('\n----------------------------------------');
console.log('Bestanden: ' + bestanden + '  |  Fehlgeschlagen: ' + fehler);
process.exit(fehler === 0 ? 0 : 1);
