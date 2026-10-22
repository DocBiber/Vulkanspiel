/* Vulkanspiel — Eingabemoeglichkeiten: Anmeldung, Stationen, Karte, Export */
(function () {
  'use strict';
  var V = window.VulkanSpiel;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function normCode(roh) { return String(roh || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  // ---------- Anmeldung ----------

  function meldeGruppeAn() {
    var name = $('gruppenName').value.trim();
    var ergebnis = V.gruppeAnmelden(name);
    if (!ergebnis.ok) {
      $('anmeldungFehler').textContent = ergebnis.fehler;
      return;
    }
    $('anmeldungFehler').textContent = '';
    $('gruppenName').value = '';
    zeichne();
  }

  function waehleGruppe(name) {
    V.gruppeWaehlen(name);
    zeichne();
  }

  // ---------- Stationen ----------

  function stationFreigeben(id) {
    var begruendung = $('begruendung-' + id).checked;
    var zeitbonus = $('zeitbonus-' + id).checked;
    var ergebnis = V.stationFreigeben(id, begruendung, zeitbonus);
    if (!ergebnis.ok) {
      $('stationFehler-' + id).textContent = ergebnis.fehler;
      return;
    }
    $('stationFehler-' + id).textContent = '';
    var feld = $('code-' + id);
    if (feld) {
      feld.disabled = false;
      var knopf = $('oeffnen-' + id);
      if (knopf) knopf.disabled = false;
      feld.focus();
    }
    zeichne();
  }

  // Der Code wird erst auf Knopfdruck angezeigt, damit er nicht offen auf einem
  // projizierten Bildschirm liegt. Er ist nur fuer die Lehrkraft bestimmt.
  function codeAnzeigen(id) {
    var feld = $('codeAnzeige-' + id);
    if (!feld) return;
    var code = V.lehrkraftCode(id);
    feld.textContent = code || '—';
    feld.classList.add('sichtbar');
  }

  function codeEinloesen(id) {
    var feld = $('code-' + id);
    if (!feld || feld.disabled) return;
    var ergebnis = V.codeEinloesen(id, feld.value);
    if (!ergebnis.ok) {
      $('codeFehler-' + id).textContent = ergebnis.fehler +
        (ergebnis.punktabzug ? ' (' + ergebnis.punktabzug + ' Punkte)' : '');
      return;
    }
    $('codeFehler-' + id).textContent = '';
    feld.value = '';
    feld.disabled = true;
    var knopf = $('oeffnen-' + id);
    if (knopf) knopf.disabled = true;
    zeichne();
  }

  // ---------- Export ----------

  function csvExportieren() {
    var blob = V.csvBlob();
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vulkanspiel_punkte.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function csvAnzeigen() {
    var pre = $('csvVorschau');
    if (pre.style.display === 'none') {
      pre.textContent = V.exportCSV();
      pre.style.display = 'block';
    } else {
      pre.style.display = 'none';
      pre.textContent = '';
    }
  }

  // ---------- Zeichnen ----------

  function zeichneGruppenliste() {
    var box = $('gruppenListe');
    var gruppen = V.gruppen();
    if (!gruppen.length) {
      box.innerHTML = '<p class="hinweis">Noch keine Gruppe angemeldet.</p>';
      return;
    }
    var html = '<ul class="gruppenliste">';
    gruppen.forEach(function (g) {
      var aktiv = g.name === V.aktivGruppe();
      var anz = Object.keys(g.stationen).length;
      html += '<li class="' + (aktiv ? 'aktiv' : '') + '">' +
        '<button type="button" data-gruppe="' + esc(g.name) + '">' + esc(g.name) + '</button>' +
        '<span class="punktestand">' + g.punkte + ' Punkte</span>' +
        '<span class="fortschritt">' + anz + '/' + V.STATIONEN.length + ' Stationen</span>' +
        '</li>';
    });
    html += '</ul>';
    box.innerHTML = html;
    box.querySelectorAll('button[data-gruppe]').forEach(function (b) {
      b.addEventListener('click', function () { waehleGruppe(b.getAttribute('data-gruppe')); });
    });
  }

  function zeichneStationen() {
    var box = $('stationenListe');
    var g = V.gruppen().filter(function (x) { return x.name === V.aktivGruppe(); })[0];

    var html = '<p class="hinweis">Aktive Gruppe: <strong>' + esc(V.aktivGruppe() || '—') +
      '</strong> · ' + (g ? g.punkte : 0) + ' Punkte</p>' +
      '<p class="hinweis lehrerhinweis">Lehrkraft-Ansicht: Der Code erscheint erst nach dem ' +
      'Klick auf „Code anzeigen“ und ist nicht fuer Schuelerinnen und Schueler bestimmt.</p>';

    V.STATIONEN.forEach(function (st) {
      var e = g && g.stationen[st.id];
      var offen = V.sichtbareStuecke().indexOf(st.id) !== -1;

      html += '<section class="station' + (e ? ' erledigt' : '') + '">' +
        '<h3>Station ' + st.id + ' · ' + esc(st.titel) + '</h3>';

      // Der Auftrag ist der eigentliche Inhalt der Station und gehoert immer ins Bild.
      if (st.auftrag) {
        html += '<p class="auftrag">' + esc(st.auftrag) + '</p>';
      }
      if (st.ort) {
        html += '<p class="ort">' + esc(st.ort) + ' · ' + (st.zeit_minuten || '—') +
          ' Minuten · ' + esc(st.thema) + '</p>';
      }

      if (e) {
        html += '<p class="ok">Abgeschlossen: ' + e.punkte + ' Punkte' +
          (e.begruendung ? ' · Begruendung vollstaendig' : '') +
          (e.zeitbonus ? ' · Zeitbonus' : '') + '</p>';
      }

      if (!e) {
        // Freigabe nur durch die Lehrkraft, nachdem die Gruppe die Loesung vorgelegt hat.
        html += '<div class="lehrerblock">' +
          '<p><button type="button" class="codeToggle" data-code="' + st.id + '">Code fuer Station ' +
          st.id + ' anzeigen</button> ' +
          '<span class="code-anzeige" id="codeAnzeige-' + st.id + '">····</span></p>' +
          '<label><input type="checkbox" id="begruendung-' + st.id + '"> Begruendung vollstaendig (+' + V.PUNKTE.BEGRUENDUNG + ')</label>' +
          '<label><input type="checkbox" id="zeitbonus-' + st.id + '"> Station zuerst geloest (+' + V.PUNKTE.ZEITBONUS + ')</label>' +
          '<button type="button" data-station="' + st.id + '" class="freigabe">Station freigeben (+' + V.PUNKTE.STATION_GELEST + ')</button>' +
          '<span class="fehler" id="stationFehler-' + st.id + '"></span>' +
          '</div>';

        // Loesungshinweis und Pruefkriterien sind nur fuer die Lehrkraft bestimmt.
        if (st.loesungshinweis) {
          html += '<details class="lehrerdetails"><summary>Loesungshinweis und Pruefkriterien</summary>' +
            '<p>' + esc(st.loesungshinweis) + '</p>';
          if (st.pruefkriterien.length) {
            html += '<ul>' + st.pruefkriterien.map(function (k) {
              return '<li>' + esc(k) + '</li>';
            }).join('') + '</ul>';
          }
          if (st.moegliche_fehler.length) {
            html += '<p class="fehler">Typische Fehler: ' + st.moegliche_fehler.map(esc).join(' · ') + '</p>';
          }
          html += '</details>';
        }
      }

      // Das Eingabefeld bleibt nach der Freigabe bestehen, bis das Stueck offen ist.
      var gesperrt = !e || offen;
      html += '<div class="codeblock">' +
        '<label for="code-' + st.id + '">Code eingeben:</label>' +
        '<input id="code-' + st.id + '" class="code-font" maxlength="4" size="6" autocomplete="off" ' +
        'placeholder="····"' + (gesperrt ? ' disabled' : '') + '>' +
        '<button type="button" id="oeffnen-' + st.id + '" data-code="' + st.id + '"' +
        (gesperrt ? ' disabled' : '') + '>Kartenstueck oeffnen</button>' +
        '<span class="fehler" id="codeFehler-' + st.id + '"></span>' +
        '</div>';

      html += '</section>';
    });

    box.innerHTML = html;

    box.querySelectorAll('button[data-station]').forEach(function (b) {
      b.addEventListener('click', function () { stationFreigeben(b.getAttribute('data-station')); });
    });
    box.querySelectorAll('button[data-code]').forEach(function (b) {
      b.addEventListener('click', function () { codeEinloesen(b.getAttribute('data-code')); });
    });
    box.querySelectorAll('button.codeToggle').forEach(function (b) {
      b.addEventListener('click', function () { codeAnzeigen(b.getAttribute('data-code')); });
    });
    box.querySelectorAll('input[id^="code-"]').forEach(function (inp) {
      inp.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          codeEinloesen(inp.id.replace('code-', ''));
        }
      });
      inp.addEventListener('input', function () {
        inp.value = normCode(inp.value);
      });
    });
  }

  function zeichneExport() {
    var box = $('exportBox');
    var gruppen = V.gruppen();
    if (!gruppen.length) {
      box.innerHTML = '<p class="hinweis">Noch keine Ergebnisse vorhanden.</p>';
      return;
    }
    var html = '<table><thead><tr><th>Gruppe</th><th>Punkte</th><th>Stationen</th></tr></thead><tbody>';
    gruppen.slice().sort(function (a, b) { return b.punkte - a.punkte; }).forEach(function (g, i) {
      html += '<tr><td>' + (i === 0 ? '★ ' : '') + esc(g.name) + '</td><td>' + g.punkte + '</td><td>' +
        Object.keys(g.stationen).length + '/' + V.STATIONEN.length + '</td></tr>';
    });
    html += '</tbody></table>';
    html += '<div class="exportaktionen">' +
      '<button type="button" id="csvHerunterladen">CSV herunterladen</button>' +
      '<button type="button" id="csvVorschauBtn">CSV anzeigen</button>' +
      '<button type="button" id="spielZuruecksetzen">Spiel zuruecksetzen</button>' +
      '</div><pre id="csvVorschau" style="display:none"></pre>';
    box.innerHTML = html;

    $('csvHerunterladen').addEventListener('click', csvExportieren);
    $('csvVorschauBtn').addEventListener('click', csvAnzeigen);
    $('spielZuruecksetzen').addEventListener('click', function () {
      if (window.confirm('Wirklich alle Gruppen, Punkte und Kartenstuecke loeschen?')) {
        V.reset();
        zeichne();
      }
    });
  }

  function zeichne() {
    zeichneGruppenliste();
    zeichneStationen();
    zeichneExport();
    var offen = V.sichtbareStuecke();
    $('kartenStatus').textContent = offen.length + ' von ' + V.STATIONEN.length +
      ' Kartenstuecken aufgedeckt.';
  }

  // ---------- Start ----------

  function init() {
    $('gruppenAnmeldenBtn').addEventListener('click', meldeGruppeAn);
    $('gruppenName').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); meldeGruppeAn(); }
    });
    zeichne();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
