/**
 * Testlauf fuer die Spiel-Logik (Node, ohne Browser).
 * Laedt assets/spiel.js in einer minimalen Browser-Umgebung und prueft
 * die Regeln aus REGELN.md.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const spielSrc = fs.readFileSync(path.join(ROOT, 'assets', 'spiel.js'), 'utf8');
const stationenJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stationen.json'), 'utf8'));

/**
 * Laedt assets/stationen.js und gibt das enthaltene Datenobjekt zurueck.
 * Die Datei ist eine reine JavaScript-Datei (kein JSON), weil sie per
 * <script src> eingebunden und nicht per fetch() geladen wird.
 */
function ladeStationenJs() {
  const quelle = fs.readFileSync(path.join(ROOT, 'assets', 'stationen.js'), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(quelle, sandbox, { filename: 'stationen.js' });
  return sandbox.window.VULKAN_STATIONEN;
}

const stationenJs = ladeStationenJs();
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
  stationenJs.kartenstuecke.forEach((k) => { knoten[k.svg_id] = { opacity: '0', klassen: new Set() }; });

  const sandbox = {
    console, localStorage, setTimeout,
    VULKAN_STATIONEN: stationenJs,
    Blob: class { constructor(t) { this.teile = t; } },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    document: {
      getElementById: (id) => (id in knoten ? {
        getAttribute: (a) => (a === 'opacity' ? knoten[id].opacity : null),
        setAttribute: (a, v) => { if (a === 'opacity') knoten[id].opacity = String(v); },
        classList: {
          add: (c) => knoten[id].klassen.add(c),
          remove: (c) => knoten[id].klassen.delete(c),
        },
      } : null),
      createElement: () => ({ click() {}, style: {}, setAttribute() {} }),
      body: { appendChild() {}, removeChild() {} },
    },
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(spielSrc, sandbox, { filename: 'spiel.js' });
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
pruefe('Leerer Name abgelehnt', V.gruppeAnmelden('   ').ok === false);
pruefe('Anmeldung Alpha ok, 10 Punkte', V.gruppeAnmelden('Alpha').ok === true);
pruefe('Doppelter Name abgelehnt', V.gruppeAnmelden('Alpha').ok === false);
pruefe('Anmeldung Beta ok, Beta aktiv', V.gruppeAnmelden('Beta').ok === true && V.aktivGruppe() === 'Beta');
pruefe('Beide Gruppen mit 10 Startpunkten', V.gruppen().every(g => g.punkte === 10),
      JSON.stringify(V.gruppen().map(g => [g.name, g.punkte])));

console.log('\n[2] Codes');
const c1 = V.lehrkraftCode(1);
pruefe('Code Station 1 erzeugt', typeof c1 === 'string' && c1.length === 4, c1);
pruefe('Code bleibt stabil', V.lehrkraftCode(1) === c1);
pruefe('Code Station 2 anders als Station 1', V.lehrkraftCode(2) !== c1);
pruefe('Alle 5 Codes eindeutig',
      new Set(V.STATIONEN.map(s => V.lehrkraftCode(s.id))).size === 5,
      V.STATIONEN.map(s => V.lehrkraftCode(s.id)).join(', '));
pruefe('Kein I oder O in den Codes', V.STATIONEN.every(s => !/[IO]/.test(V.lehrkraftCode(s.id))));

console.log('\n[3] Stationslogik');
const beta = () => V.gruppen().find(g => g.name === 'Beta');
pruefe('Keine Station zu Beginn abgeschlossen', Object.keys(beta().stationen).length === 0);
const freigabe = V.stationFreigeben(1, true, true);
pruefe('Station 1 freigegeben', freigabe.ok, JSON.stringify(freigabe));
pruefe('Punkte = 10 + 5 + 3 = 18', freigabe.punkte === 18, 'tatsächlich ' + freigabe.punkte);
pruefe('Gesamt = 10 + 18 = 28', beta().punkte === 28, 'tatsächlich ' + beta().punkte);
pruefe('Doppelfreigabe abgelehnt', V.stationFreigeben(1, true, true).ok === false);
pruefe('Freigabe liefert den Code', typeof freigabe.code === 'string' && freigabe.code.length === 4);
const ohneBonus = V.stationFreigeben(2, false, false);
pruefe('Station 2 ohne Boni = 10 Punkte', ohneBonus.punkte === 10, 'tatsächlich ' + ohneBonus.punkte);
pruefe('Gesamt jetzt 38', beta().punkte === 38, 'tatsächlich ' + beta().punkte);

console.log('\n[4] Code-Einloesung');
pruefe('Richtiger Code wird akzeptiert', V.codeEinloesen(1, c1).ok === true);
pruefe('Karte Station 1 ist sichtbar', knoten['piece-subduktion'].opacity === '1');
pruefe('Falscher Code abgelehnt', V.codeEinloesen(2, 'ZZZZ').ok === false);
pruefe('Falscher Code kostet 5 Punkte', beta().punkte === 33, 'tatsächlich ' + beta().punkte);
const c2 = V.lehrkraftCode(2);
pruefe('Richtiger Code Station 2 akzeptiert', V.codeEinloesen(2, c2).ok === true, c2);
pruefe('Code mit 3 Zeichen abgelehnt', V.codeEinloesen(3, 'SUB').ok === false);
pruefe('Code ohne Freigabe abgelehnt',
      (V.reset(), V.gruppeAnmelden('Gamma'), V.codeEinloesen(3, 'AAAA').ok === false));
pruefe('Kleinbuchstaben akzeptiert',
      (V.stationFreigeben(3, true, false), V.codeEinloesen(3, V.lehrkraftCode(3).toLowerCase()).ok === true));
pruefe('Code mit Leerzeichen wird bereinigt',
      (V.stationFreigeben(4, false, false), V.codeEinloesen(4, ' ' + V.lehrkraftCode(4).replace(/(.)/g, ' $1').trim()).ok === true));

console.log('\n[5] Kartenstuecke');
pruefe('Zwei Stuecke sichtbar (3 und 4)', V.sichtbareStuecke().length === 2 &&
      JSON.stringify(V.sichtbareStuecke()) === '[3,4]', JSON.stringify(V.sichtbareStuecke()));
pruefe('piece-maar sichtbar', knoten['piece-maar'].opacity === '1');
pruefe('piece-subduktion nach Reset verborgen', knoten['piece-subduktion'].opacity === '0');
pruefe('piece-risiko noch verborgen', knoten['piece-risiko'].opacity === '0');

console.log('\n[6] Persistenz');
const umgebung2 = baueUmgebung();
pruefe('Neue Umgebung beginnt leer', umgebung2.V.gruppen().length === 0);

console.log('\n[7] CSV-Export');
V.gruppeAnmelden('Delta');                 // zweite Gruppe fuer den Vergleich
const csv = V.exportCSV();
const zeilen = csv.trim().split(/\r\n/);
pruefe('CSV hat 3 Zeilen (Kopf + 2 Gruppen)', zeilen.length === 3, 'Zeilen: ' + zeilen.length);
pruefe('CSV hat 13 Spalten in jeder Zeile',
      zeilen.every(z => z.split(';').length === 13),
      zeilen.map(z => z.split(';').length).join(', '));
pruefe('CSV listet Gamma mit 35 Punkten (10 + 15 + 10)',
      zeilen.some(z => z.indexOf('Gamma;35;2') !== -1), zeilen[1]);
pruefe('CSV listet Delta mit 10 Punkten und 0 Stationen',
      zeilen.some(z => z.indexOf('Delta;10;0') !== -1));
pruefe('CSV hat 5 Begruendungsspalten',
      zeilen[0].split(';').filter(s => s.endsWith('Begruendung')).length === 5);
pruefe('CSV verwendet Semikolon', zeilen[0].indexOf(';') !== -1);
pruefe('CSV hat UTF-8-BOM', V.csvBlob().teile[0].charCodeAt(0) === 0xFEFF);
pruefe('CSV hat Kopfzeile mit Gruppe und Punkten',
      zeilen[0].indexOf('Gruppe;Punkte gesamt;Stationen abgeschlossen') === 0, zeilen[0]);
pruefe('CSV markiert Begruendung mit ja/nein',
      zeilen.some(z => z.indexOf(';ja;') !== -1 || z.indexOf('ja;') !== -1), zeilen[1]);

console.log('\n[8] Datendateien');
pruefe('5 Stationen in stationen.json', stationenJson.stationen.length === 5);
pruefe('5 Stationen in stationen.js', stationenJs.stationen.length === 5);
pruefe('Jede Station hat Auftrag, Loesungshinweis und 3+ Pruefkriterien',
      stationenJs.stationen.every(s => s.auftrag && s.loesungshinweis && s.pruefkriterien.length >= 3));
pruefe('Jede Station hat Ort, Thema und Zeitangabe',
      stationenJs.stationen.every(s => s.ort && s.thema && s.zeit_minuten > 0));
pruefe('Jede Station nennt mindestens eine Quelle',
      stationenJs.stationen.every(s => Array.isArray(s.quellen) && s.quellen.length >= 1));
pruefe('stationen.js und stationen.json sind gleich (Abgleich der Aufträge)',
      JSON.stringify(stationenJs.stationen.map(s => [s.id, s.auftrag])) ===
      JSON.stringify(stationenJson.stationen.map(s => [s.id, s.auftrag])));

// Die Daten muessen das Spiel auch wirklich steuern, nicht nur daneben liegen.
const aktiveStationen = V.STATIONEN;
pruefe('Spiel nutzt die Daten aus stationen.js (Auftrag vorhanden)',
      aktiveStationen.length === stationenJs.stationen.length &&
      aktiveStationen.every(st => st.auftrag && st.auftrag.length > 20),
      JSON.stringify(aktiveStationen.map(st => st.auftrag ? st.auftrag.length : 'fehlt')));
pruefe('Spiel nutzt die Kartenstueck-IDs aus den Daten',
      aktiveStationen.every(st => stationenJs.kartenstuecke.some(k => k.svg_id === st.svg)),
      JSON.stringify(aktiveStationen.map(st => st.svg)));
pruefe('stationenDaten() liefert die Rohdaten',
      V.stationenDaten() && V.stationenDaten().stationen.length === 5);
pruefe('index.html bindet stationen.js vor spiel.js ein',
      (() => {
        const i = html.indexOf('src="assets/stationen.js"');
        const j = html.indexOf('src="assets/spiel.js"');
        return i !== -1 && j !== -1 && i < j;
      })());
pruefe('Jede Station hat ein Kartenstueck',
      stationenJson.stationen.every(s => stationenJson.kartenstuecke.some(k => k.id === s.kartenstueck)));
pruefe('Jedes Kartenstueck hat Farbe und Hinweis',
      stationenJson.kartenstuecke.every(k => k.farbe && k.hinweis && k.svg_id));
pruefe('Stationen und Kartenstuecke stimmen ueberein (Anzahl)',
      stationenJson.stationen.length === stationenJson.kartenstuecke.length);
pruefe('SVG enthaelt alle Stueck-IDs aus den Daten',
      stationenJson.kartenstuecke.every(k => html.indexOf('id="' + k.svg_id + '"') !== -1),
      stationenJson.kartenstuecke.map(k => k.svg_id).join(', '));
const svgStart = html.indexOf('<svg');
const svgEnde = html.indexOf('</svg>') + 6;
const svgBlock = html.slice(svgStart, svgEnde);
pruefe('SVG hat viewBox und kein Script',
      svgBlock.indexOf('viewBox=') !== -1 && svgBlock.indexOf('<script') === -1);
pruefe('Karte ist inline eingebettet (kein fetch noetig)',
      svgStart !== -1 && html.indexOf('fetch(') === -1);

console.log('\n[9] Reset');
V.reset();
pruefe('Nach Reset keine Gruppen', V.gruppen().length === 0);
pruefe('Nach Reset keine Kartenstuecke', V.sichtbareStuecke().length === 0);

console.log('\n----------------------------------------');
console.log('Bestanden: ' + bestanden + '  |  Fehlgeschlagen: ' + fehler);
process.exit(fehler === 0 ? 0 : 1);
