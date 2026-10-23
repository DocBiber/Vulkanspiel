/**
 * Testlauf fuer die Aufgabentypen des Vulkanspiels (Node, ohne Browser).
 *
 * Prueft die Typen in assets/aufgaben.js direkt und die Verknuepfung mit der
 * Logik: Station oeffnet sich erst, wenn alle Aufgaben geloest sind, und der
 * Freitext bekommt seine Punkte erst mit der Bewertung.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

function lade(rel, globalName) {
  const quelle = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(quelle, sandbox, { filename: path.basename(rel) });
  return sandbox.window[globalName];
}

const inhalte = lade('assets/inhalte.js', 'VULKAN_STATIONEN');
const typen = lade('assets/aufgaben.js', 'AUFGABEN_TYPEN');

let bestanden = 0, fehler = 0;
function pruefe(name, ok, detail) {
  if (ok) { bestanden++; console.log('  ok    ' + name); }
  else { fehler++; console.log('  FEHLT ' + name + (detail !== undefined ? '  -> ' + detail : '')); }
}

// ---------- Die Typen direkt ----------

console.log('\n[1] Typen vorhanden');
['mc', 'zuordnung', 'richtig_falsch', 'lueckentext', 'wortgitter', 'fehler', 'freitext']
  .forEach(function (t) {
    pruefe('Typ "' + t + '" ist registriert', !!(typen[t] && typeof typen[t].pruefe === 'function'));
  });
pruefe('Schuettelwoerter-Funktion vorhanden', typeof typen.wuerfel === 'function');

console.log('\n[2] Multiple Choice');
var mc = { optionen: ['a', 'b', 'c', 'd'], richtig: 1, erklaerung: 'Warum.' };
pruefe('Richtige Option gibt 1 Punkt', typen.mc.pruefe(mc, 1).punkte === 1);
pruefe('Falsche Option gibt 0 Punkte', typen.mc.pruefe(mc, 0).punkte === 0);
pruefe('Keine Auswahl ist nicht moeglich', typen.mc.pruefe(mc, undefined).moeglich === false);
pruefe('Index ausserhalb ist nicht moeglich', typen.mc.pruefe(mc, 9).moeglich === false);
pruefe('Erklaerung wird mitgeliefert', typen.mc.pruefe(mc, 1).hinweis.indexOf('Warum') !== -1);

console.log('\n[3] Begriffe einer Skizze zuordnen');
var zu = {
  felder: [
    { id: 'A', x: 1, y: 1 }, { id: 'B', x: 2, y: 2 },
    { id: 'C', x: 3, y: 3 }, { id: 'D', x: 4, y: 4 }
  ],
  loesung: { A: 'Krater', B: 'Schlot', C: 'Koerper', D: 'Kammer' }
};
pruefe('Alle vier richtig gibt 4 Punkte',
  typen.zuordnung.pruefe(zu, { A: 'Krater', B: 'Schlot', C: 'Koerper', D: 'Kammer' }).punkte === 4);
pruefe('Zwei von vier richtig gibt 2 Punkte',
  typen.zuordnung.pruefe(zu, { A: 'Krater', B: 'Schlot', C: 'X', D: 'Y' }).punkte === 2);
pruefe('Teillaesung zaehlt nicht als richtig',
  typen.zuordnung.pruefe(zu, { A: 'Krater', B: 'Schlot', C: 'X', D: 'Y' }).richtig === false);
pruefe('Leeres Feld ist nicht moeglich',
  typen.zuordnung.pruefe(zu, { A: 'Krater' }).moeglich === false);
pruefe('Gross-/Kleinschreibung zaehlt nicht',
  typen.zuordnung.pruefe(zu, { A: 'krater', B: 'SCHLOT', C: 'koerper', D: 'kammer' }).punkte === 4);
pruefe('Umlaute werden verzeiht',
  typen.zuordnung.pruefe(zu, { A: 'Krater', B: 'Schlot', C: 'Körper', D: 'Kammer' }).punkte === 4);

console.log('\n[4] Richtig/Falsch-Aussagen');
var rf = { aussagen: [
  { text: 'eins', richtig: true }, { text: 'zwei', richtig: false },
  { text: 'drei', richtig: true }, { text: 'vier', richtig: true }
] };
pruefe('Alle vier richtig gibt 4 Punkte',
  typen.richtig_falsch.pruefe(rf, { 0: true, 1: false, 2: true, 3: true }).punkte === 4);
pruefe('Eine falsche Bewertung gibt 3 Punkte',
  typen.richtig_falsch.pruefe(rf, { 0: true, 1: true, 2: true, 3: true }).punkte === 3);
pruefe('Nicht bewertete Aussage ist nicht moeglich',
  typen.richtig_falsch.pruefe(rf, { 0: true }).moeglich === false);

console.log('\n[5] Lueckentext');
var lt = {
  text: 'Die [1] Platte taucht ab und es entsteht [2].',
  loesungen: [
    { id: '1', wort: 'dichtere', alternativen: ['dichte'] },
    { id: '2', wort: 'Magma', alternativen: ['magma'] }
  ],
  distraktoren: ['Meer']
};
pruefe('Beide Luecken richtig gibt 2 Punkte',
  typen.lueckentext.pruefe(lt, { 1: 'dichtere', 2: 'Magma' }).punkte === 2);
pruefe('Alternative Wortform zaehlt',
  typen.lueckentext.pruefe(lt, { 1: 'dichte', 2: 'magma' }).punkte === 2);
pruefe('Distraktor zaehlt nicht',
  typen.lueckentext.pruefe(lt, { 1: 'Meer', 2: 'Magma' }).punkte === 1);
pruefe('Leere Luecke ist nicht moeglich',
  typen.lueckentext.pruefe(lt, { 1: 'dichtere' }).moeglich === false);
pruefe('Schuettelwoerter enthalten Loesung und Distraktoren',
  (function () {
    var w = typen.wuerfel(lt);
    return w.indexOf('dichtere') !== -1 && w.indexOf('Meer') !== -1;
  })());
pruefe('Schuettelwoerter sind gemischt (nicht in Dateireihenfolge)',
  (function () {
    var w = typen.wuerfel(lt);
    return w.join('|') !== ['dichtere', 'dichte', 'Magma', 'magma', 'Meer'].join('|');
  })());

console.log('\n[6] Wortgitter');
var wg = {
  breite: 5, hoehe: 5,
  woerter: [
    { buchstabe: [{ x: 0, y: 0, richtig: 'M' }, { x: 1, y: 0, richtig: 'A' }, { x: 2, y: 0, richtig: 'G' }], hinweis: 'a' },
    { buchstabe: [{ x: 0, y: 2, richtig: 'S' }, { x: 1, y: 2, richtig: 'O' }], hinweis: 'b' }
  ]
};
pruefe('Beide Woerter richtig gibt 2 Punkte',
  typen.wortgitter.pruefe(wg, { '0,0': 'M', '1,0': 'A', '2,0': 'G', '0,2': 'S', '1,2': 'O' }).punkte === 2);
pruefe('Ein Wort richtig gibt 1 Punkt',
  typen.wortgitter.pruefe(wg, { '0,0': 'M', '1,0': 'A', '2,0': 'G' }).punkte === 1);
pruefe('Falscher Buchstabe im Wort zaehlt gegen das Wort',
  typen.wortgitter.pruefe(wg, { '0,0': 'M', '1,0': 'X', '2,0': 'G' }).punkte === 0);
pruefe('Kleinschreibung wird akzeptiert',
  typen.wortgitter.pruefe(wg, { '0,0': 'm', '1,0': 'a', '2,0': 'g' }).punkte === 1);

console.log('\n[7] Fehler entdecken');
var fh = {
  text: 'Ein Satz [F1] mit Fehlern [F2] und noch einem [F3].',
  fehler: [{ id: 'F1', hinweis: 'a' }, { id: 'F2', hinweis: 'b' }, { id: 'F3', hinweis: 'c' }]
};
pruefe('Alle drei Fehler gefunden gibt 3 Punkte',
  typen.fehler.pruefe(fh, { F1: true, F2: true, F3: true }).punkte === 3);
pruefe('Ein gefundener Fehler gibt 1 Punkt',
  typen.fehler.pruefe(fh, { F1: true }).punkte === 1);
pruefe('Nichts angeklickt gibt 0 Punkte',
  typen.fehler.pruefe(fh, {}).punkte === 0);

console.log('\n[8] Freitext');
var ft = { frage: 'Frage?', punkte: 10 };
pruefe('Leere Antwort ist nicht moeglich', typen.freitext.pruefe(ft, '').moeglich === false);
pruefe('Antwort ohne Bewertung gibt 0 Punkte', typen.freitext.pruefe(ft, 'Ich denke, dass ...').punkte === 0);
pruefe('Antwort wartet auf Bewertung',
  typen.freitext.pruefe(ft, 'Ich denke, dass ...').hinweis.indexOf('bewertet') !== -1);

// ---------- Verknuepfung mit der Logik ----------

function baueUmgebung() {
  const store = {};
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
  const knoten = {};
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
  return sandbox.window.VulkanSpiel;
}

const V = baueUmgebung();
const SUB = 'subduktion';
const aufgaben = V.aufgabenVon(SUB);

console.log('\n[9] Station 1 traegt fuenf Aufgaben');
pruefe('Fuenf Aufgaben geladen', aufgaben.length === 5, String(aufgaben.length));
pruefe('Jede Aufgabe hat einen Typ',
  aufgaben.every(a => !!a.typ));
pruefe('Vier verschiedene Aufgabentypen in der Station',
  new Set(aufgaben.map(a => a.typ)).size >= 4, aufgaben.map(a => a.typ).join(','));
pruefe('Freitext-Aufgabe ist vorhanden', aufgaben.some(a => a.typ === 'freitext'));
pruefe('Freitext-Aufgabe traegt Kriterien',
  (aufgaben.filter(a => a.typ === 'freitext')[0] || { daten: {} }).daten.kriterien.length > 0);

console.log('\n[10] Station oeffnet sich erst nach allen fuenf Aufgaben');
pruefe('Anmeldung klappt mit Startcode', V.gruppeAnmelden('Alpha', 'vulkan', 'ASCHE').ok === true);
pruefe('Station ist freigeschaltet', V.lade().gruppen[0].regionen[SUB].freigeschaltet === true);
pruefe('Station ist noch nicht offen', V.regionIstOffen(V.gruppen()[0], SUB) === false);

const A = {};
aufgaben.forEach(a => { A[a.id] = a; });

var ergebnis = V.aufgabePruefen(SUB, A['sub-1'].id, 1);
pruefe('Multiple Choice richtig gibt Punkte', ergebnis.ok === true && ergebnis.punkte > 0,
  JSON.stringify(ergebnis));
pruefe('Station ist noch nicht offen (1 von 5)', V.regionIstOffen(V.gruppen()[0], SUB) === false);

var ergebnis2 = V.aufgabePruefen(SUB, A['sub-2'].id, { A: 'Krater', B: 'Schlot', C: 'Schichtkoerper', D: 'Magma-Kammer' });
pruefe('Zuordnung richtig gibt die vollen acht Punkte', ergebnis2.ok === true && ergebnis2.punkte === 8,
  JSON.stringify(ergebnis2));

var ergebnis3 = V.aufgabePruefen(SUB, A['sub-3'].id, { 0: true, 1: true, 2: false, 3: true });
pruefe('Richtig/Falsch richtig gibt die vollen sechs Punkte', ergebnis3.ok === true && ergebnis3.punkte === 6,
  JSON.stringify(ergebnis3));

var ergebnis4 = V.aufgabePruefen(SUB, A['sub-4'].id, { 1: 'dichtere', 2: 'leichtere', 3: 'Magma', 4: 'Schlot' });
pruefe('Lueckentext richtig gibt die vollen acht Punkte', ergebnis4.ok === true && ergebnis4.punkte === 8,
  JSON.stringify(ergebnis4));

pruefe('Station ist noch nicht offen (4 von 5)', V.regionIstOffen(V.gruppen()[0], SUB) === false);
pruefe('Vier von fuenf Aufgaben geloest',
  V.geloesteInRegion(V.gruppen()[0], SUB) === 4,
  String(V.geloesteInRegion(V.gruppen()[0], SUB)));

var frei = V.freitextSpeichern(SUB, A['sub-5'].id, 'Ich erwaehne die Exposition und die Vulnerabilitaet.');
pruefe('Freitext-Antwort wird uebernommen', frei.ok === true, JSON.stringify(frei));
pruefe('Freitext gibt noch keine Punkte', V.gruppen()[0].punkte === 10 + 8 + 8 + 6 + 8,
  String(V.gruppen()[0].punkte));
pruefe('Station ist jetzt offen (5 von 5)', V.regionIstOffen(V.gruppen()[0], SUB) === true);
pruefe('Station ist als offen markiert', V.gruppen()[0].regionen[SUB].offen === true);
pruefe('Symbol der Station ist frei', V.symbole(V.gruppen()[0]).length === 1);

console.log('\n[11] Freitext-Bewertung');
var offen = V.freitextOffen();
pruefe('Ein Freitext ist noch offen', offen.length === 1, String(offen.length));
pruefe('Offener Freitext enthaelt Gruppe, Aufgabe und Antwort',
  offen[0].gruppe === 'Alpha' && offen[0].aufgabeId === 'sub-5' && !!offen[0].antwort);
pruefe('Offener Freitext enthaelt Kriterien', offen[0].kriterien.length > 0);
pruefe('Offener Freitext enthaelt das Maximum', offen[0].max > 0);

var punkteVorher = V.gruppen()[0].punkte;
var bewertung = V.freitextBewerten(SUB, 'sub-5', 8, 'Zwei Kriterien erfuellt, das dritte fehlt.');
pruefe('Bewertung wird eingetragen', bewertung.ok === true && bewertung.punkte === 8);
pruefe('Punkte wurden gutgeschrieben', V.gruppen()[0].punkte === punkteVorher + 8,
  String(V.gruppen()[0].punkte));
pruefe('Kein offener Freitext mehr', V.freitextOffen().length === 0);

var erneut = V.freitextBewerten(SUB, 'sub-5', 5, 'Nachkorrektur.');
pruefe('Erneute Bewertung ersetzt die Punkte (kein Doppelzaehlen)',
  V.gruppen()[0].punkte === punkteVorher + 5, String(V.gruppen()[0].punkte));
pruefe('Bewertung begrenzt aufs Maximum',
  V.freitextBewerten(SUB, 'sub-5', 99, 'zu viel').punkte === 10);

console.log('\n[12] Bewertungsdatei einlesen (Weg B)');
pruefe('Falsches JSON wird abgelehnt',
  V.freitextImport('kein json').ok === false);
pruefe('Kein Array wird abgelehnt',
  V.freitextImport('{"a":1}').ok === false);
var importErgebnis = V.freitextImport(JSON.stringify([
  { gruppe: 'Alpha', regionId: SUB, aufgabeId: 'sub-5', punkte: 7, hinweis: 'Aus der Datei.' }
]));
pruefe('Gueltige Bewertungsdatei wird eingelesen', importErgebnis.ok === true && importErgebnis.eingetragen === 1,
  JSON.stringify(importErgebnis));
pruefe('Punkte aus der Datei stehen auf der Gruppe',
  V.gruppen()[0].punkte === punkteVorher + 7, String(V.gruppen()[0].punkte));
var mitFehler = V.freitextImport(JSON.stringify([
  { gruppe: 'Unbekannt', regionId: SUB, aufgabeId: 'sub-5', punkte: 1 }
]));
pruefe('Unbekannte Gruppe wird gemeldet',
  mitFehler.ok === true && mitFehler.fehler.length === 1, JSON.stringify(mitFehler));
var mitRegion = V.freitextImport(JSON.stringify([
  { gruppe: 'Alpha', region: 'SUB', aufgabeId: 'sub-5', punkte: 6, hinweis: 'Ueber Kuerzel.' }
]));
pruefe('Region kann auch als Kuerzel angegeben werden',
  mitRegion.eingetragen === 1, JSON.stringify(mitRegion));

console.log('\n[13] Export und CSV');
var exportJson = V.freitextAufgabeExport();
pruefe('Export ohne offene Freitexte ist ein leeres Array', exportJson === '[]', exportJson);
var csv = V.exportCSV();
var zeilen = csv.trim().split(/\r\n/);
pruefe('CSV hat neun Spalten', zeilen[0].split(';').length === 9, zeilen[0]);
pruefe('CSV nennt die neuen Spalten',
  zeilen[0].indexOf('Aufgaben geloest') !== -1 && zeilen[0].indexOf('Freitext bewertet') !== -1);
pruefe('CSV: Alpha hat fuenf von siebzehn Aufgaben',
  zeilen.some(z => z.indexOf('Alpha;Vulkanforscherin;') === 0 && z.indexOf(';5 von 17;') !== -1),
  zeilen.join(' | '));
pruefe('Tagebuch-Export zeigt die Bewertung',
  V.exportTagebuch().indexOf('bewertet: 6') !== -1);

console.log('\n[14] Aeltere Stationen laufen weiter');
var hot = V.aufgabenVon('hotspot');
pruefe('Hotspot liefert zwei Aufgaben aus den alten Daten',
  hot.length === 3, String(hot.length));
pruefe('Erste Aufgabe des Hotspots ist Multiple Choice',
  hot[0].typ === 'mc', hot[0].typ);
pruefe('Letzte Aufgabe des Hotspots ist Freitext',
  hot[hot.length - 1].typ === 'freitext', hot[hot.length - 1].typ);
var alt = (function () {
  // Der Hotspot ist die zweite Station und braucht ihren Code.
  var schloss = V.codeEinloesen('hotspot', 'FUNKEN');
  if (!schloss.ok) return { ok: false, fehler: 'Hotspot nicht freigeschaltet: ' + schloss.fehler };
  return V.aufgabePruefen('hotspot', hot[0].id, 0);
})();
pruefe('Alte Multiple-Choice-Frage laeuft weiter', alt.ok === true && alt.punkte > 0,
  JSON.stringify(alt));

console.log('\n[15] Inhalte');
pruefe('Inhalte-Version ist 5', V.inhaltVersion === '5.0.0', V.inhaltVersion);
pruefe('Alle Stationen haben Symbole',
  V.REGIONEN.every(r => r.symbol && r.symbol_name));
pruefe('Station 1 hat fuenf Aufgaben',
  V.aufgabenVon('subduktion').length === 5);
pruefe('Skizzen sind hinterlegt',
  inhalte.skizzen && Object.keys(inhalte.skizzen).length > 0);
pruefe('Jede Skizze hat viewBox und SVG',
  Object.keys(inhalte.skizzen).every(k =>
    !!inhalte.skizzen[k].viewBox && inhalte.skizzen[k].svg.indexOf('<') === 0));

console.log('\n----------------------------------------');
console.log('Bestanden: ' + bestanden + '  |  Fehlgeschlagen: ' + fehler);
process.exit(fehler === 0 ? 0 : 1);
