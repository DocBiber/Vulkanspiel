/* Vulkanspiel — Oberflaeche: Start, Karte, Regionen, Tagebuch, Auswertung */
(function () {
  'use strict';
  var V = window.VulkanSpiel;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function gruppe() {
    return V.gruppen().filter(function (g) { return g.name === V.aktivGruppe(); })[0];
  }

  // ---------- Start: Name und Spielfigur ----------

  var gewaehlteFigur = null;

  function figurWaehlen(id) {
    gewaehlteFigur = id;
    document.querySelectorAll('.figurwahl button').forEach(function (b) {
      b.classList.toggle('gewaehlt', b.getAttribute('data-figur') === id);
    });
  }

  function zeichneFigurwahl() {
    var box = $('figurwahl');
    box.innerHTML = V.FIGUREN.map(function (f) {
      return '<button type="button" data-figur="' + esc(f.id) + '">' +
        '<span class="symbol">' + esc(f.symbol) + '</span>' +
        '<span class="name">' + esc(f.name) + '</span></button>';
    }).join('');
    box.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { figurWaehlen(b.getAttribute('data-figur')); });
    });
  }

  function meldeGruppeAn() {
    var ergebnis = V.gruppeAnmelden($('gruppenName').value, gewaehlteFigur);
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

  // ---------- Karte ----------

  /** Setzt die Spielfigur auf die Position einer Region. */
  function bewegeFigur(region) {
    var marker = $('spielfigur');
    if (!marker || !region) return;
    marker.setAttribute('transform', 'translate(' + region.figur.x + ',' + region.figur.y + ')');
  }

  function klickRegion(regionId) {
    var g = gruppe();
    if (!g) return;
    var r = V.REGIONEN.filter(function (x) { return x.id === regionId; })[0];
    if (!r) return;
    bewegeFigur(r);
    zeigeRegion(regionId);
  }

  /** Markiert eine Region als aufgedeckt und traegt die Figur ein. */
  function markiereRegionen() {
    var g = gruppe();
    V.REGIONEN.forEach(function (r) {
      var el = $(r.svg_id);
      if (!el) return;
      var offen = !!(g && g.regionen[r.id] && g.regionen[r.id].offen);
      el.classList.toggle('offen', offen);
      if (offen) el.setAttribute('data-offen', '1');
      else el.removeAttribute('data-offen');
      el.setAttribute('data-region', r.id);
      // Fuellfarbe steht in den Daten (data-farbe), CSS kann data-Attribute nicht lesen.
      el.querySelectorAll('path, circle').forEach(function (node) {
        if (node.classList.contains('loch')) return;
        node.style.fill = offen ? r.farbe : '';
      });
    });
    if (g && g.figur) {
      var f = $('spielfigur');
      var sym = $('spielfigur-symbol');
      if (f && sym) sym.textContent = g.symbol;
    }
  }

  // ---------- Regionsbereich ----------

  function zeigeRegion(regionId) {
    var g = gruppe();
    var r = V.REGIONEN.filter(function (x) { return x.id === regionId; })[0];
    if (!g || !r) return;

    var f = g.regionen[r.id];
    var offen = f.offen;
    var richtige = V.richtigeInRegion(g, r.id);

    var html = '<h3>' + esc(r.name) + '</h3>' +
      '<p class="ort">' + esc(r.kuerzel) + ' · Fortschritt: ' + richtige + ' von ' +
      r.fragen.length + ' Fragen richtig</p>';

    if (offen) {
      html += '<p class="ok">Region aufgedeckt. Die Fragen bleiben zum Nachlesen offen.</p>';
    } else if (richtige > 0) {
      html += '<p class="hinweis">Schon ' + richtige + ' von ' + r.fragen.length +
        ' Fragen richtig. Beantwortet alle Fragen richtig, um die Region aufzudecken.</p>';
    }

    html += '<div class="fragen">';

    r.fragen.forEach(function (fr, i) {
      var e = f.fragen[fr.id];
      html += '<div class="frage' + (e && e.richtig ? ' richtig' : '') + '">' +
        '<p class="fragentext"><strong>Frage ' + (i + 1) + ':</strong> ' + esc(fr.frage) + '</p>';
      html += '<div class="optionen">';
      fr.optionen.forEach(function (opt, j) {
        var klasse = '';
        if (e && e.richtig) {
          klasse = j === fr.richtig ? ' richtig' : '';
        } else if (e && e.auswahl === j) {
          klasse = ' falsch';
        }
        html += '<button type="button" class="option' + klasse + '" data-region="' + esc(r.id) +
          '" data-frage="' + esc(fr.id) + '" data-auswahl="' + j + '"' +
          (e && e.richtig ? ' disabled' : '') + '>' + esc(opt) + '</button>';
      });
      html += '</div>';
      if (e && e.richtig && fr.erklaerung) {
        html += '<p class="erklaerung">Erklaerung: ' + esc(fr.erklaerung) + '</p>';
      }
      html += '</div>';
    });

    html += '</div>';

    // Tagebuch-Frage der Region
    r.tagebuch.forEach(function (tf) {
      var e = f.tagebuch[tf.id];
      html += '<div class="tagebuch-frage">' +
        '<p class="fragentext"><strong>Tagebuch:</strong> ' + esc(tf.frage) + '</p>' +
        '<textarea id="tagebuch-' + esc(tf.id) + '" rows="3" placeholder="Eure Antwort ...">' +
        esc(e && e.text ? e.text : '') + '</textarea>' +
        '<div class="tagebuch-aktionen">' +
        '<button type="button" data-tagebuch="' + esc(r.id) + '|' + esc(tf.id) + '">Antwort speichern (+' +
        V.PUNKTE.TAGEBUCH_ABGABE + ' Punkte)</button>' +
        (e && e.text ? '<span class="ok">Gespeichert.</span>' : '') +
        '</div></div>';
    });

    html += '<p class="hinweis">Klickt auf eine andere Region, um weiterzuerkunden. ' +
      'Das Tagebuch sammelt eure Antworten.</p>';

    var box = $('regionsbereich');
    box.innerHTML = html;
    box.setAttribute('data-region', regionId);
    box.classList.add('sichtbar');

    box.querySelectorAll('button.option').forEach(function (b) {
      b.addEventListener('click', function () {
        antworten(b.getAttribute('data-region'), b.getAttribute('data-frage'),
          Number(b.getAttribute('data-auswahl')), b);
      });
    });
    box.querySelectorAll('button[data-tagebuch]').forEach(function (b) {
      b.addEventListener('click', function () {
        var teile = b.getAttribute('data-tagebuch').split('|');
        tagebuchAbspeichern(teile[0], teile[1]);
      });
    });
  }

  function antworten(regionId, frageId, auswahl, knopf) {
    var ergebnis = V.frageBeantworten(regionId, frageId, auswahl);

    if (!ergebnis.ok) {
      // Falsche Antwort: nur markieren und hinweisen. Der Bereich bleibt stehen,
      // damit der Hinweis sichtbar bleibt und die Gruppe erneut antworten kann.
      if (knopf) knopf.classList.add('falsch');
      var hinweis = $('regionsbereich-hinweis');
      if (!hinweis) {
        hinweis = document.createElement('p');
        hinweis.id = 'regionsbereich-hinweis';
        hinweis.className = 'hinweis';
        var box = $('regionsbereich');
        box.insertBefore(hinweis, box.firstChild);
      }
      hinweis.textContent = ergebnis.fehler || 'Nicht richtig, versucht es erneut.';
      return;
    }

    zeichne();
    zeigeRegion(regionId);
  }

  function tagebuchAbspeichern(regionId, frageId) {
    var feld = $('tagebuch-' + frageId);
    var ergebnis = V.tagebuchSpeichern(regionId, frageId, feld ? feld.value : '');
    if (!ergebnis.ok) {
      // Einzeilige Meldung im Spiel statt eines Dialogs: Ein alert blockiert den
      // Browser und stoppt damit auch die Klasse mitten in der Stunde.
      var box = $('regionsbereich');
      var hinweis = $('tagebuch-hinweis');
      if (!hinweis) {
        hinweis = document.createElement('p');
        hinweis.id = 'tagebuch-hinweis';
        hinweis.className = 'hinweis';
        box.insertBefore(hinweis, box.firstChild);
      }
      hinweis.textContent = ergebnis.fehler;
      return;
    }
    zeichne();
    zeigeRegion(regionId);
  }

  // ---------- Tagebuch ----------

  function zeichneTagebuch() {
    var box = $('tagebuchBox');
    var eintraege = V.tagebuchEintraege();
    if (!eintraege.length) {
      box.innerHTML = '<p class="hinweis">Noch keine Tagebuch-Eintraege. ' +
        'Beantwortet in einer Region eine Tagebuch-Frage, dann erscheint sie hier.</p>';
      return;
    }
    var html = '<table><thead><tr><th>Gruppe</th><th>Region</th><th>Frage</th><th>Antwort</th></tr></thead><tbody>';
    eintraege.forEach(function (e) {
      html += '<tr><td>' + esc(e.gruppe) + '</td><td>' + esc(e.region) + '</td><td>' +
        esc(e.frage) + '</td><td>' + esc(e.antwort) + '</td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
  }

  // ---------- Auswertung ----------

  function zeichneAuswertung() {
    var box = $('auswertungBox');
    var gruppen = V.gruppen();
    if (!gruppen.length) {
      box.innerHTML = '<p class="hinweis">Noch keine Ergebnisse vorhanden.</p>';
      return;
    }
    var html = '<table><thead><tr><th>Gruppe</th><th>Figur</th><th>Punkte</th>' +
      '<th>Regionen</th><th>Tagebuch</th></tr></thead><tbody>';
    gruppen.slice().sort(function (a, b) { return b.punkte - a.punkte; }).forEach(function (g, i) {
      var eintraege = 0;
      V.REGIONEN.forEach(function (r) {
        var f = g.regionen[r.id];
        if (!f) return;
        r.tagebuch.forEach(function (tf) {
          if (f.tagebuch[tf.id] && f.tagebuch[tf.id].text) eintraege++;
        });
      });
      html += '<tr><td>' + (i === 0 ? '★ ' : '') + esc(g.name) + '</td><td>' +
        esc(g.symbol) + ' ' + esc(g.figurName) + '</td><td>' + g.punkte + '</td><td>' +
        V.fortschritt(g) + '/' + V.REGIONEN.length + '</td><td>' + eintraege + '</td></tr>';
    });
    html += '</tbody></table>';

    var eintraege = V.tagebuchEintraege().length;
    html += '<div class="exportaktionen">' +
      '<button type="button" id="csvHerunterladen">Punkte als CSV</button>' +
      (eintraege ? '<button type="button" id="tagebuchHerunterladen">Tagebuch herunterladen</button>' : '') +
      '<button type="button" id="csvVorschauBtn">CSV anzeigen</button>' +
      '<button type="button" id="spielZuruecksetzen">Spiel zuruecksetzen</button>' +
      '</div><pre id="csvVorschau" style="display:none"></pre>';
    box.innerHTML = html;

    $('csvHerunterladen').addEventListener('click', function () { download(V.csvBlob(), 'vulkanspiel_punkte.csv'); });
    var tb = $('tagebuchHerunterladen');
    if (tb) tb.addEventListener('click', function () { download(V.tagebuchBlob(), 'vulkanspiel_tagebuch.txt'); });
    $('csvVorschauBtn').addEventListener('click', function () {
      var pre = $('csvVorschau');
      if (pre.style.display === 'none') { pre.textContent = V.exportCSV(); pre.style.display = 'block'; }
      else { pre.style.display = 'none'; pre.textContent = ''; }
    });
    $('spielZuruecksetzen').addEventListener('click', function () {
      if (window.confirm('Wirklich alle Gruppen, Punkte, Regionen und Tagebuch-Eintraege loeschen?')) {
        V.reset();
        $('regionsbereich').classList.remove('sichtbar');
        $('regionsbereich').innerHTML = '';
        zeichne();
      }
    });
  }

  function download(blob, dateiname) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = dateiname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // ---------- Gruppenliste ----------

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
      html += '<li class="' + (aktiv ? 'aktiv' : '') + '">' +
        '<button type="button" data-gruppe="' + esc(g.name) + '">' +
        '<span class="symbol">' + esc(g.symbol) + '</span> ' + esc(g.name) + '</button>' +
        '<span class="punktestand">' + g.punkte + ' Punkte</span>' +
        '<span class="fortschritt">' + V.fortschritt(g) + '/' + V.REGIONEN.length + ' Regionen</span>' +
        '</li>';
    });
    html += '</ul>';
    box.innerHTML = html;
    box.querySelectorAll('button[data-gruppe]').forEach(function (b) {
      b.addEventListener('click', function () { waehleGruppe(b.getAttribute('data-gruppe')); });
    });
  }

  // ---------- Gesamtzeichnen ----------

  function zeichne() {
    zeichneGruppenliste();
    markiereRegionen();
    var g = gruppe();

    var status = $('kartenStatus');
    if (g) {
      status.textContent = g.name + ' · ' + g.punkte + ' Punkte · ' +
        V.fortschritt(g) + ' von ' + V.REGIONEN.length + ' Regionen aufgedeckt. ' +
        'Klickt eine Region auf der Karte an.';
    } else {
      status.textContent = 'Bitte zuerst eine Gruppe anmelden und eine Spielfigur waehlen.';
    }

    zeichneTagebuch();
    zeichneAuswertung();

    // Bereits gewaehlte Region erneut zeigen, damit der Zustand erhalten bleibt
    var offen = $('regionsbereich');
    var aktuell = offen.getAttribute('data-region');
    if (aktuell && g) zeigeRegion(aktuell);
  }

  // Bindet die Kartenklicks ein: jede Region ist anklickbar.
  function initKarte() {
    document.querySelectorAll('[data-region]').forEach(function (el) {
      el.addEventListener('click', function () { klickRegion(el.getAttribute('data-region')); });
    });
  }

  function init() {
    // Versionsanzeige: Damit ist sofort erkennbar, ob der Browser die aktuelle
    // Datei geladen hat. In Version 3 gibt es keine Kurzcodes mehr.
    var anzeige = $('versionsanzeige');
    if (anzeige) {
      anzeige.textContent = 'Version ' + V.inhaltVersion + ' · ohne Kurzcodes';
    }

    zeichneFigurwahl();
    $('gruppenAnmeldenBtn').addEventListener('click', meldeGruppeAn);
    $('gruppenName').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); meldeGruppeAn(); }
    });
    initKarte();
    zeichne();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
