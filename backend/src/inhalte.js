/**
 * Laedt den Spielinhalt des Vulkanspiels serverseitig.
 *
 * Warum das hier ist: Die Bewertungskriterien duerfen nicht vom Browser
 * kommen. Ein Schueler koennte sonst die Kriterien aendern und sich
 * volle Punkte geben. Der Dienst holt sie aus derselben Quelle wie das
 * Spiel — aus assets/inhalte.js.
 *
 * Die Datei enthaelt ein JSON-Objekt hinter window.VULKAN_STATIONEN.
 * Gelesen wird sie als Text und das JSON wird herausgeholt.
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HIER = path.dirname(fileURLToPath(import.meta.url));
export const WURZEL = path.resolve(HIER, '..', '..');
export const INHALTE_DATEI = path.join(WURZEL, 'assets', 'inhalte.js');

/**
 * Laedt assets/inhalte.js.
 *
 * Die Datei ist JavaScript, kein JSON: Das SVG der Skizzen wird mit "+"
 * zusammengesetzt. Sie wird deshalb wie im Browser geladen — in einer
 * Sandbox, in der ein leeres window-Objekt steht. So ist garantiert, dass
 * das Backend denselben Inhalt sieht wie das Spiel.
 */
export function leseInhalte(datei = INHALTE_DATEI) {
  const quelle = fs.readFileSync(datei, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);

  try {
    vm.runInContext(quelle, sandbox, { filename: path.basename(datei) });
  } catch (e) {
    throw new Error(
      'assets/inhalte.js laesst sich nicht auswerten: ' + (e && e.message ? e.message : e)
    );
  }

  const daten = sandbox.window.VULKAN_STATIONEN;
  if (!daten || !Array.isArray(daten.regionen)) {
    throw new Error(
      'In ' + datei + ' steht kein window.VULKAN_STATIONEN mit einer Regionsliste.'
    );
  }
  return daten;
}

/**
 * Eine Aufgabe mit ihren Kriterien finden.
 *
 * Liefert null, wenn die Station oder die Aufgabe nicht existiert oder die
 * Aufgabe kein Freitext ist. Der Dienst bewertet nur Freitexte, weil nur
 * die Kriterien dahinter stehen.
 */
export function findeAufgabe(inhalte, regionId, aufgabeId) {
  const region = (inhalte.regionen || []).find(function (r) {
    return r.id === regionId;
  });
  if (!region) return null;

  const list = region.aufgaben || [];

  // Aeltere Stationen ohne "aufgaben" liefern ihre Tagebuch-Frage umgesetzt.
  const frei = list.find(function (a) {
    return a.id === aufgabeId && a.typ === 'freitext';
  });
  if (frei) {
    return {
      id: frei.id,
      typ: 'freitext',
      frage: frei.frage,
      max: frei.punkte || 10,
      kriterien: (frei.daten && frei.daten.kriterien) || []
    };
  }

  if (list.length) return null;

  const tagebuch = (region.tagebuch || []).find(function (t) {
    return t.id === aufgabeId;
  });
  if (tagebuch) {
    return {
      id: tagebuch.id,
      typ: 'freitext',
      frage: tagebuch.frage,
      max: 10,
      kriterien: []
    };
  }

  return null;
}

/** Alle Freitext-Aufgaben des Spiels — fuer Pruefungen und Anzeige. */
export function alleFreitexte(inhalte) {
  const out = [];
  (inhalte.regionen || []).forEach(function (region) {
    const list = region.aufgaben || [];
    if (list.length) {
      list.forEach(function (a) {
        if (a.typ === 'freitext') {
          out.push({
            regionId: region.id,
            aufgabeId: a.id,
            frage: a.frage,
            max: a.punkte || 10,
            kriterien: (a.daten && a.daten.kriterien) || []
          });
        }
      });
      return;
    }
    (region.tagebuch || []).forEach(function (t) {
      out.push({
        regionId: region.id,
        aufgabeId: t.id,
        frage: t.frage,
        max: 10,
        kriterien: []
      });
    });
  });
  return out;
}
