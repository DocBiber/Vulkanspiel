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

  // ---------- Start: Name, Spielfigur und Startstation ----------

  var gewaehlteFigur = null;
  var gewaehlteStation = null;

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

  /**
   * Die fuenf Startstationen. Jede Gruppe darf an einer beliebigen Station
   * anfangen; der Aufdruck auf dem Zettel muss zu dieser Station passen.
   */
  function zeichneStationswahl() {
    var box = $('stationswahl');
    if (!box) return;
    box.innerHTML = '<p class="hinweis">Auf eurem Zettel steht der Name einer Station. ' +
      'Sucht sie auf der Karte und waehlt sie hier aus — dann tragt ihr den Aufdruck ein.</p>' +
      '<div class="stationswahl-liste">' + V.REGIONEN.map(function (r) {
        return '<button type="button" data-station="' + esc(r.id) + '">' +
          '<span class="symbol">' + esc(r.symbol) + '</span>' +
          '<span class="name">' + esc(r.name) + '</span>' +
          '<span class="kuerzel">' + esc(r.kuerzel) + '</span></button>';
      }).join('') + '</div>';
    box.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        gewaehlteStation = b.getAttribute('data-station');
        box.querySelectorAll('button').forEach(function (x) {
          x.classList.toggle('gewaehlt', x.getAttribute('data-station') === gewaehlteStation);
        });
      });
    });
  }

  function meldeGruppeAn() {
    var ergebnis = V.gruppeAnmelden($('gruppenName').value, gewaehlteFigur,
      $('startcode').value, gewaehlteStation);
    if (!ergebnis.ok) {
      $('anmeldungFehler').textContent = ergebnis.fehler;
      return;
    }
    $('anmeldungFehler').textContent = '';
    $('gruppenName').value = '';
    $('startcode').value = '';
    gewaehlteStation = null;
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
    // Die Figur wandert nur zu Regionen, die die Gruppe oeffnen darf.
    if (g.regionen[regionId] && g.regionen[regionId].freigeschaltet) bewegeFigur(r);
    zeigeRegion(regionId);
  }

  /** Markiert eine Region als aufgedeckt und traegt die Figur ein. */
  function markiereRegionen() {
    var g = gruppe();
    V.REGIONEN.forEach(function (r) {
      var el = $(r.svg_id);
      if (!el) return;
      var f = g && g.regionen[r.id];
      var offen = !!(f && f.offen);
      var freigeschaltet = !!(f && f.freigeschaltet);
      el.classList.toggle('offen', offen);
      el.classList.toggle('freigeschaltet', freigeschaltet);
      if (offen) el.setAttribute('data-offen', '1');
      else el.removeAttribute('data-offen');
      el.setAttribute('data-region', r.id);
      el.setAttribute('data-freigeschaltet', freigeschaltet ? '1' : '0');
      // Fuellfarbe steht in den Daten (data-farbe), CSS kann data-Attribute nicht lesen.
      el.querySelectorAll('path, circle').forEach(function (node) {
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

    // Verschlossene Region: erst der Code eintippen.
    if (!f.freigeschaltet) {
      var box0 = $('regionsbereich');
      box0.innerHTML =
        '<h3>' + esc(r.name) + ' — verschlossen</h3>' +
        '<p class="ort">' + esc(r.kuerzel) + ' · Station ' + V.REGIONEN.indexOf(r) + 1 +
        ' von ' + V.REGIONEN.length + '</p>' +
        '<p class="hinweis">Dieses Gebiet ist noch verschlossen. Sucht den Zettel, der zu ' +
        'dieser Station gehoert, und tragt den Aufdruck ein.</p>' +
        '<div class="codeblock">' +
        '<label for="region-code-' + esc(r.id) + '">Aufdruck:</label>' +
        '<input id="region-code-' + esc(r.id) + '" class="code-font" maxlength="20" ' +
        'autocomplete="off" placeholder="....">' +
        '<button type="button" data-code="' + esc(r.id) + '">Aufschliessen</button>' +
        '<span class="fehler" id="code-hinweis-' + esc(r.id) + '"></span>' +
        '</div>' +
        '<p class="hinweis">Der Aufdruck der ersten Station steht auf dem Zettel, den ihr am ' +
        'Anfang bekommen habt.</p>';
      box0.setAttribute('data-region', regionId);
      box0.classList.add('sichtbar');

      var eingabe = $('region-code-' + r.id);
      if (eingabe) {
        eingabe.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter') { ev.preventDefault(); codeEinloesen(r.id); }
        });
      }
      box0.querySelectorAll('button[data-code]').forEach(function (b) {
        b.addEventListener('click', function () { codeEinloesen(b.getAttribute('data-code')); });
      });
      return;
    }

    var offen = f.offen;
    var list = V.aufgabenVon(r.id);
    var geloeste = V.geloesteInRegion(g, r.id);

    var html = '<h3>' + esc(r.name) + '</h3>' +
      '<p class="ort">' + esc(r.kuerzel) + ' · Fortschritt: ' + geloeste + ' von ' +
      list.length + ' Aufgaben geloest</p>';

    if (offen) {
      html += '<p class="ok">Station aufgedeckt. Die Aufgaben bleiben zum Nachlesen offen.</p>';
      // Das Symbol der Station und der Code der naechsten Station.
      html += '<div class="stationszettel">' +
        '<div class="stationssymbol" title="' + esc(r.symbol_name) + '">' + esc(r.symbol) + '</div>' +
        '<div class="stationszettel-text">' +
        '<p><strong>Ihr findet einen Zettel mit einem Symbol:</strong> ' + esc(r.symbol) +
        ' (' + esc(r.symbol_name) + ')</p>' +
        '<p>Das Symbol ist euer Beweis fuer diese Station. Sammelt alle fuenf — sie oeffnen ' +
        'das Schloss.</p>';
      // Die Kette ist zyklisch. Ob der Aufdruck noch etwas oeffnet, haengt
      // davon ab, ob die naechste Station schon erledigt ist.
      var naechsteId = V.naechsteRegionVon(r.id);
      var naechsteFertig = naechsteId && g.regionen[naechsteId] && g.regionen[naechsteId].offen;

      if (r.code_naechste && !naechsteFertig) {
        html += '<p>Darunter steht ein Aufdruck: <span class="code-anzeige sichtbar">' +
          esc(r.code_naechste) + '</span></p>' +
          '<p class="hinweis">Dieser Aufdruck oeffnet die naechste Station: <strong>' +
          esc(regionName(naechsteId)) + '</strong>. Tragt ihn dort ein.</p>';
      } else {
        html += '<p class="hinweis">Das war die letzte Station. Mit allen fuenf Symbolen ' +
          'könnt ihr jetzt das Schloss öffnen.</p>';
      }
      html += '</div></div>';
    } else if (geloeste > 0) {
      html += '<p class="hinweis">Schon ' + geloeste + ' von ' + list.length +
        ' Aufgaben geloest. Loeset alle Aufgaben, um die Station aufzudecken.</p>';
    }

    html += '<div class="aufgaben">';
    list.forEach(function (a, i) {
      html += aufgabeHtml(r, a, f.aufgaben[a.id], i);
    });
    html += '</div>';

    html += '<p class="hinweis">Klickt auf eine andere Region, um weiterzuerkunden. ' +
      'Das Tagebuch sammelt eure Freitext-Antworten.</p>';

    var box = $('regionsbereich');
    box.innerHTML = html;
    box.setAttribute('data-region', regionId);
    box.classList.add('sichtbar');
    verteileAufgaben(box);
  }

  // ---------- Aufgabenrenderer ----------

  function skizzen() {
    return (window.VULKAN_STATIONEN && window.VULKAN_STATIONEN.skizzen) || {};
  }

  function typName(typ) {
    var T = window.AUFGABEN_TYPEN || {};
    return (T[typ] && T[typ].name) ? T[typ].name : typ;
  }

  function absendeText(typ) {
    if (typ === 'freitext') return 'Antwort abschicken';
    if (typ === 'zuordnung' || typ === 'lueckentext') return 'Pruefen';
    return 'Absenden';
  }

  /** Der Anzeigetext einer Aufgabe, inklusive ihres Typs. */
  function aufgabeHtml(r, a, e, i) {
    var typ = a.typ || 'mc';
    var geloest = !!(e && e.geloest);
    var html = '<div class="aufgabe aufgabe-' + esc(typ) + (geloest ? ' geloest' : '') + '"' +
      ' data-region="' + esc(r.id) + '" data-aufgabe="' + esc(a.id) + '">';
    html += '<p class="fragentext"><strong>Aufgabe ' + (i + 1) + ' · ' + esc(typName(typ)) +
      ':</strong> ' + esc(a.frage) + '</p>';

    if (geloest) {
      html += '<p class="ok">' + esc((e && e.hinweis) || 'Geloest.') +
        ' (+' + ((e && e.punkte) || 0) + ' Punkte)</p>';
      if (typ === 'mc') {
        var d = a.daten || a;
        if (d.erklaerung) {
          html += '<p class="erklaerung">Erklaerung: ' + esc(d.erklaerung) + '</p>';
        }
      }
      html += '</div>';
      return html;
    }

    if (typ === 'mc') html += mcHtml(a);
    else if (typ === 'zuordnung') html += zuordnungHtml(a);
    else if (typ === 'richtig_falsch') html += richtigFalschHtml(a);
    else if (typ === 'lueckentext') html += lueckentextHtml(a);
    else if (typ === 'wortgitter') html += wortgitterHtml(a);
    else if (typ === 'fehler') html += fehlerHtml(a);
    else if (typ === 'freitext') html += freitextHtml(r, a, e);
    else html += '<p class="hinweis">Dieser Aufgabentyp wird nicht angezeigt: ' + esc(typ) + '</p>';

    html += '<div class="aufgabe-aktionen">' +
      '<button type="button" class="absenden" data-absenden="' + esc(r.id) + '|' + esc(a.id) + '">' +
      esc(absendeText(typ)) + '</button>' +
      '<span class="fehler" data-fehler="' + esc(r.id) + '|' + esc(a.id) + '"></span>' +
      '</div>';

    if (e && e.hinweis) {
      html += '<p class="hinweis">' + esc(e.hinweis) + '</p>';
    }

    html += '</div>';
    return html;
  }

  function mcHtml(a) {
    var d = a.daten || a;
    var html = '<div class="optionen">';
    d.optionen.forEach(function (opt, j) {
      html += '<button type="button" class="option" data-wahl="' + j + '">' + esc(opt) + '</button>';
    });
    html += '</div>';
    return html;
  }

  function zuordnungHtml(a) {
    var d = a.daten || {};
    var sk = skizzen()[d.skizze];
    var html = '';

    if (sk) {
      html += '<div class="skizze-wrap"><svg viewBox="' + esc(sk.viewBox) + '" role="img" aria-label="' +
        esc(sk.name) + '">' + sk.svg;
      d.felder.forEach(function (f) {
        html += '<g class="feld" data-feld="' + esc(f.id) + '" transform="translate(' + f.x + ',' + f.y + ')">' +
          '<circle r="40" class="feld-kreis" />' +
          '<text class="feld-text" y="8">' + esc(f.id) + '</text></g>';
      });
      html += '</svg></div>';
    } else {
      html += '<div class="zuordnung-felder">';
      d.felder.forEach(function (f) {
        html += '<div class="feld-fallback" data-feld="' + esc(f.id) + '">' + esc(f.id) + '</div>';
      });
      html += '</div>';
    }

    html += '<div class="kaertchen">';
    d.begriffe.forEach(function (b) {
      html += '<span class="kaertchen-item" draggable="true" data-begriff="' + esc(b) + '">' +
        esc(b) + '</span>';
    });
    html += '</div>';
    html += '<p class="hinweis">Zieht jeden Begriff auf das richtige Feld der Skizze. ' +
      'Ein Klick auf ein belegtes Feld nimmt den Begriff wieder zurueck.</p>';
    return html;
  }

  function richtigFalschHtml(a) {
    var d = a.daten || {};
    var html = '<div class="aussagen">';
    d.aussagen.forEach(function (s, i) {
      html += '<div class="aussage" data-aussage="' + i + '">' +
        '<p>' + esc(s.text) + '</p>' +
        '<div class="aussage-knoepfe">' +
        '<button type="button" class="aussage-btn" data-wert="1">stimmt</button>' +
        '<button type="button" class="aussage-btn" data-wert="0">stimmt nicht</button>' +
        '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function lueckentextHtml(a) {
    var d = a.daten || {};
    var text = esc(d.text || '');
    // Die Luecken [1], [2], ... werden zu anklickbaren Stellen.
    text = text.replace(/\[(\d+)\]/g, function (_, n) {
      return '<button type="button" class="luecke" data-luecke="' + n + '">[' + n + ']</button>';
    });

    var wuerfel = [];
    if (window.AUFGABEN_TYPEN && window.AUFGABEN_TYPEN.wuerfel) {
      wuerfel = window.AUFGABEN_TYPEN.wuerfel(d);
    }

    var html = '<p class="lueckentext">' + text + '</p><div class="kaertchen">';
    wuerfel.forEach(function (w) {
      html += '<span class="kaertchen-item" draggable="true" data-begriff="' + esc(w) + '">' +
        esc(w) + '</span>';
    });
    html += '</div><p class="hinweis">Klickt ein Wort an und danach die Luecke, in die es ' +
      'passt. Ein Klick auf eine gefuellte Luecke leert sie wieder.</p>';
    return html;
  }

  function wortgitterHtml(a) {
    var d = a.daten || {};
    var breite = d.breite || 6, hoehe = d.hoehe || 6;
    var html = '<div class="wortgitter" style="grid-template-columns:repeat(' + breite +
      ',minmax(2.1rem,2.6rem))">';
    for (var y = 0; y < hoehe; y++) {
      for (var x = 0; x < breite; x++) {
        html += '<input class="gitter-zelle" data-x="' + x + '" data-y="' + y + '" maxlength="1" ' +
          'autocomplete="off" aria-label="Feld ' + x + ',' + y + '">';
      }
    }
    html += '</div><ol class="gitter-hinweise">';
    (d.woerter || []).forEach(function (w, i) {
      html += '<li>' + esc(w.hinweis || ('Wort ' + (i + 1))) + '</li>';
    });
    html += '</ol>';
    return html;
  }

  function fehlerHtml(a) {
    var d = a.daten || {};
    var teile = String(d.text || '').split(/(\[\w+\])/g);
    var html = '<p class="fehler-text">';
    teile.forEach(function (t) {
      var m = t.match(/^\[(\w+)\]$/);
      if (m) {
        html += '<span class="fehler-stelle" data-fehler-id="' + esc(m[1]) + '">[' + esc(m[1]) + ']</span>';
      } else {
        html += esc(t);
      }
    });
    html += '</p><p class="hinweis">Klickt die Stellen an, die eurer Meinung nach einen Fehler ' +
      'enthalten. Ihr findet ' + (d.fehler || []).length + ' Fehler.</p>';
    return html;
  }

  function freitextHtml(r, a, e) {
    var d = a.daten || {};
    var html = '<textarea class="freitext" data-freitext="' + esc(a.id) + '" rows="4" ' +
      'placeholder="Eure Antwort ...">' + esc((e && e.angabe) || '') + '</textarea>';
    if (d.kriterien && d.kriterien.length) {
      html += '<div class="kriterien"><p><strong>Bei der Bewertung zaehlt:</strong></p><ul>';
      d.kriterien.forEach(function (k) { html += '<li>' + esc(k) + '</li>'; });
      html += '</ul></div>';
    }
    return html;
  }

  // ---------- Eingaben sammeln ----------

  /** Die bisher eingetippten Angaben, Schlussel "regionId|aufgabeId". */
  var angaben = {};

  function schluessel(regionId, aufgabeId) {
    return regionId + '|' + aufgabeId;
  }

  function angabeFuer(r, a, e) {
    var key = schluessel(r.id, a.id);
    if (!(key in angaben)) {
      var gespeichert = e && e.angabe;
      angaben[key] = (gespeichert && typeof gespeichert === 'object') ? Object.assign({}, gespeichert) : null;
    }
    return angaben[key];
  }

  function feldBelegen(box, aufgabeId, feldId, begriff) {
    // Zeigt den eingetragenen Begriff im Feld der Skizze an.
    var feld = box.querySelector('.feld[data-feld="' + feldId + '"] .feld-text');
    if (feld) feld.textContent = begriff ? begriff : feldId;
  }

  function lueckeFuellen(box, aufgabeId, luecke, begriff) {
    var el = box.querySelector('.luecke[data-luecke="' + luecke + '"]');
    if (el) el.textContent = begriff ? begriff : ('[' + luecke + ']');
  }

  /** Verdraengt die Kaertchen, die bereits untergebracht sind. */
  function kaertchenAktualisieren(box, aufgabeId, typ) {
    var belegt = {};
    if (typ === 'zuordnung') {
      var ang = angaben[aufgabeId] || {};
      Object.keys(ang).forEach(function (k) { if (ang[k]) belegt[ang[k]] = true; });
    } else {
      var ang2 = angaben[aufgabeId] || {};
      Object.keys(ang2).forEach(function (k) { if (ang2[k]) belegt[ang2[k]] = true; });
    }
    box.querySelectorAll('.aufgabe[data-aufgabe="' + aufgabeId + '"] .kaertchen-item').forEach(function (chip) {
      var wort = chip.getAttribute('data-begriff');
      chip.classList.toggle('belegt', !!belegt[wort]);
      chip.setAttribute('draggable', belegt[wort] ? 'false' : 'true');
    });
  }

  /** Die Eingaben einer Aufgabe an die Logik uebergeben. */
  function absenden(regionId, aufgabeId, box) {
    var r = V.REGIONEN.filter(function (x) { return x.id === regionId; })[0];
    var a = V.aufgabenVon(regionId).filter(function (x) { return x.id === aufgabeId; })[0];
    var key = schluessel(regionId, aufgabeId);
    if (!r || !a) return;

    var angabe;
    if (a.typ === 'freitext') {
      var feld = box.querySelector('[data-freitext="' + aufgabeId + '"]');
      angabe = feld ? feld.value : '';
    } else if (a.typ === 'mc') {
      angabe = (angaben[key] === null || angaben[key] === undefined) ? undefined : angaben[key];
    } else {
      angabe = angaben[key] || {};
    }

    var hinweis = box.querySelector('[data-fehler="' + regionId + '|' + aufgabeId + '"]');

    if (a.typ === 'freitext') {
      var ergebnis = V.freitextSpeichern(regionId, aufgabeId, angabe);
      if (!ergebnis.ok) {
        if (hinweis) hinweis.textContent = ergebnis.fehler;
        return;
      }
      zeichne();
      zeigeRegion(regionId);
      return;
    }

    var e = V.aufgabePruefen(regionId, aufgabeId, angabe);
    if (!e.ok) {
      if (hinweis) hinweis.textContent = e.hinweis || e.fehler || 'Noch nicht richtig, versucht es erneut.';
      return;
    }
    zeichne();
    zeigeRegion(regionId);
  }

  /** Knoepfe, Ziehen und Tippen einer Station anschliessen. */
  function verteileAufgaben(box) {
    // Multiple Choice: Klick auf eine Option schickt direkt ab.
    box.querySelectorAll('.aufgabe-auf-mc, .aufgabe-mc').forEach(function () {});
    box.querySelectorAll('.aufgabe').forEach(function (el) {
      var regionId = el.getAttribute('data-region');
      var aufgabeId = el.getAttribute('data-aufgabe');
      var key = schluessel(regionId, aufgabeId);

      el.querySelectorAll('button.option').forEach(function (b) {
        b.addEventListener('click', function () {
          angaben[key] = Number(b.getAttribute('data-wahl'));
          absenden(regionId, aufgabeId, box);
        });
      });

      // Richtig/Falsch
      el.querySelectorAll('.aussage-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!angaben[key]) angaben[key] = {};
          angaben[key][b.parentNode.parentNode.getAttribute('data-aussage')] =
            b.getAttribute('data-wert') === '1';
          b.parentNode.querySelectorAll('.aussage-btn').forEach(function (x) { x.classList.remove('gewaehlt'); });
          b.classList.add('gewaehlt');
        });
      });

      // Lueckentext: Wort waehlen, dann Luecke
      var offenesWort = { wort: null };
      el.querySelectorAll('.lueckentext .kaertchen-item, .aufgabe-lueckentext .kaertchen-item').forEach(function (chip) {
        chip.addEventListener('click', function () {
          el.querySelectorAll('.kaertchen-item').forEach(function (c) { c.classList.remove('markiert'); });
          chip.classList.add('markiert');
          offenesWort.wort = chip.getAttribute('data-begriff');
        });
        chip.addEventListener('dragstart', function (ev) {
          ev.dataTransfer.setData('text/plain', chip.getAttribute('data-begriff'));
          offenesWort.wort = chip.getAttribute('data-begriff');
        });
      });
      el.querySelectorAll('.luecke').forEach(function (luecke) {
        luecke.addEventListener('click', function () {
          if (!angaben[key]) angaben[key] = {};
          var lueckenId = luecke.getAttribute('data-luecke');
          if (angaben[key][lueckenId]) {
            // Klick auf eine gefuellte Luecke leert sie.
            angaben[key][lueckenId] = '';
            lueckeFuellen(box, aufgabeId, lueckenId, '');
          } else if (offenesWort.wort) {
            angaben[key][lueckenId] = offenesWort.wort;
            lueckeFuellen(box, aufgabeId, lueckenId, offenesWort.wort);
            offenesWort.wort = null;
          }
          kaertchenAktualisieren(box, aufgabeId, 'lueckentext');
        });
      });

      // Zuordnung: Wort auf ein Feld der Skizze ziehen oder klicken
      var offenesFeldWort = { wort: null };
      el.querySelectorAll('.kaertchen-item').forEach(function (chip) {
        chip.addEventListener('click', function () {
          el.querySelectorAll('.kaertchen-item').forEach(function (c) { c.classList.remove('markiert'); });
          chip.classList.add('markiert');
          offenesFeldWort.wort = chip.getAttribute('data-begriff');
        });
        chip.addEventListener('dragstart', function (ev) {
          ev.dataTransfer.setData('text/plain', chip.getAttribute('data-begriff'));
        });
      });
      el.querySelectorAll('.feld, .feld-fallback').forEach(function (feld) {
        var feldId = feld.getAttribute('data-feld');
        feld.addEventListener('click', function () {
          if (!angaben[key]) angaben[key] = {};
          if (angaben[key][feldId]) {
            angaben[key][feldId] = '';
            feldBelegen(box, aufgabeId, feldId, '');
          } else if (offenesFeldWort.wort) {
            angaben[key][feldId] = offenesFeldWort.wort;
            feldBelegen(box, aufgabeId, feldId, offenesFeldWort.wort);
            offenesFeldWort.wort = null;
          }
          kaertchenAktualisieren(box, aufgabeId, 'zuordnung');
        });
        feld.addEventListener('dragover', function (ev) {
          ev.preventDefault();
          ev.dataTransfer.dropEffect = 'move';
        });
        feld.addEventListener('drop', function (ev) {
          ev.preventDefault();
          var begriff = ev.dataTransfer.getData('text/plain');
          if (!begriff) return;
          if (!angaben[key]) angaben[key] = {};
          angaben[key][feldId] = begriff;
          feldBelegen(box, aufgabeId, feldId, begriff);
          kaertchenAktualisieren(box, aufgabeId, 'zuordnung');
        });
      });

      // Wortgitter: Buchstaben einsammeln
      el.querySelectorAll('.gitter-zelle').forEach(function (zelle) {
        zelle.addEventListener('input', function () {
          if (!angaben[key]) angaben[key] = {};
          var b = zelle.value.trim().charAt(0);
          angaben[key][zelle.getAttribute('data-x') + ',' + zelle.getAttribute('data-y')] = b ? b.toUpperCase() : '';
        });
      });
    });

    box.querySelectorAll('button[data-absenden]').forEach(function (b) {
      b.addEventListener('click', function () {
        var teile = b.getAttribute('data-absenden').split('|');
        absenden(teile[0], teile[1], box);
      });
    });
  }

  /** Der Name einer Station. */
  function regionName(regionId) {
    var r = V.REGIONEN.filter(function (x) { return x.id === regionId; })[0];
    return r ? r.name : '';
  }

  function codeEinloesen(regionId) {
    var feld = $('region-code-' + regionId);
    var ergebnis = V.codeEinloesen(regionId, feld ? feld.value : '');
    if (!ergebnis.ok) {
      var hinweis = $('code-hinweis-' + regionId);
      if (hinweis) hinweis.textContent = ergebnis.fehler;
      return;
    }
    zeichne();
    zeigeRegion(regionId);
  }

  // ---------- Tagebuch ----------

  function zeichneTagebuch() {
    var box = $('tagebuchBox');
    var eintraege = V.freitextEintraege();
    if (!eintraege.length) {
      box.innerHTML = '<p class="hinweis">Noch keine Freitext-Antworten. ' +
        'Schreibt in einer Station eine Antwort, dann erscheint sie hier.</p>';
      return;
    }
    var html = '<table><thead><tr><th>Gruppe</th><th>Station</th><th>Frage</th>' +
      '<th>Antwort</th><th>Bewertung</th></tr></thead><tbody>';
    eintraege.forEach(function (e) {
      html += '<tr><td>' + esc(e.gruppe) + '</td><td>' + esc(e.region) + '</td><td>' +
        esc(e.frage) + '</td><td>' + esc(e.antwort) + '</td><td>' +
        (e.bewertet ? e.punkte + ' von ' + e.max + ' Punkten' : 'noch offen') + '</td></tr>';
    });
    html += '</tbody></table>';
    box.innerHTML = html;
  }

  // ---------- Weg A: lokaler Bewertungsdienst ----------

  /** Das letzte Ergebnis der Dienstbewertung. Bleibt beim Neuzeichnen stehen. */
  var dienstLetztesErgebnis = '';

  function dienstAdresse() {
    var wert = ($('dienstUrl') && $('dienstUrl').value || '').trim();
    return wert ? wert.replace(/\/+$/, '') : '';
  }

  /** Prueft, ob der lokale Dienst laeuft und einen Schluessel hat. */
  function dienstPruefen() {
    var adresse = dienstAdresse();
    var status = $('dienstStatus');
    var ergebnis = $('dienstErgebnis');
    var knopf = $('dienstBewerten');
    if (!adresse) {
      status.textContent = 'Bitte die Adresse des Dienstes eintragen.';
      return;
    }
    status.textContent = 'Pruefe …';
    if (ergebnis) ergebnis.textContent = '';

    fetch(adresse + '/health')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          status.textContent = 'Dienst erreichbar: ' + d.modell +
            (d.schluesselVorhanden ? ' · Schluessel eingetragen' : ' · KEIN Schluessel eingetragen');
          knopf.disabled = false;
        } else {
          status.textContent = 'Der Dienst antwortet nicht wie erwartet.';
          knopf.disabled = true;
        }
      })
      .catch(function () {
        status.textContent = 'Der Dienst ist nicht erreichbar. Gestartet? ' +
          '(npm start im Ordner backend)';
        knopf.disabled = true;
      });
  }

  /** Schickt alle offenen Freitexte an den Dienst und traegt die Punkte ein. */
  function dienstBewerten() {
    var adresse = dienstAdresse();
    var offen = V.freitextOffen();
    var status = $('dienstStatus');
    var ergebnis = $('dienstErgebnis');
    var knopf = $('dienstBewerten');

    if (!adresse) {
      status.textContent = 'Bitte die Adresse des Dienstes eintragen.';
      return;
    }
    if (!offen.length) {
      ergebnis.textContent = 'Es gibt keine offenen Freitexte.';
      return;
    }

    knopf.disabled = true;
    status.textContent = 'Bewertet ' + offen.length + ' Antwort(en) …';

    var warteschlange = offen.slice();
    var bewertungen = [];
    var fehler = 0;
    var fehlermeldungen = [];

    function naechste() {
      var eintrag = warteschlange.shift();
      if (!eintrag) { fertig(); return; }

      fetch(adresse + '/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gruppe: eintrag.gruppe,
          regionId: eintrag.regionId,
          aufgabeId: eintrag.aufgabeId,
          antwort: eintrag.antwort
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d && d.ok) {
            bewertungen.push({
              gruppe: eintrag.gruppe,
              regionId: eintrag.regionId,
              aufgabeId: eintrag.aufgabeId,
              punkte: d.punkte,
              hinweis: d.hinweis
            });
          } else {
            fehler++;
            fehlermeldungen.push(eintrag.gruppe + ': ' + (d && d.fehler ? d.fehler : 'unbekannt'));
          }
          naechste();
        })
        .catch(function () { fehler++; naechste(); });
    }

    function fertig() {
      var ergebnisObjekt = V.freitextBatch(bewertungen);
      var text = ergebnisObjekt.eingetragen + ' von ' + offen.length +
        ' Antwort(en) bewertet.';
      if (fehler) text += ' ' + fehler + ' konnten nicht bewertet werden.';
      if (ergebnisObjekt.fehler.length) text += ' ' + ergebnisObjekt.fehler.join(' · ');
      if (fehlermeldungen.length) {
        text += ' Grund: ' + fehlermeldungen[0].slice(0, 160);
      }

      // Vor dem Neuzeichnen merken, sonst geht die Meldung dabei verloren.
      dienstLetztesErgebnis = text;
      zeichne();

      var status = $('dienstStatus');
      if (status) status.textContent = '';
      var knopf = $('dienstBewerten');
      if (knopf) knopf.disabled = false;
    }

    naechste();
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
      '<th>Stationen</th><th>Aufgaben</th><th>Freitext</th>' +
      '<th>Symbole</th><th>Schloss</th></tr></thead><tbody>';
    gruppen.slice().sort(function (a, b) { return b.punkte - a.punkte; }).forEach(function (g, i) {
      var freitext = 0, bewertet = 0, aufgaben = 0, maxAufgaben = 0;
      V.REGIONEN.forEach(function (r) {
        var f = g.regionen[r.id];
        if (!f) return;
        var list = V.aufgabenVon(r.id);
        maxAufgaben += list.length;
        list.forEach(function (a) {
          var e = f.aufgaben[a.id];
          if (e && e.geloest) {
            aufgaben++;
            if (a.typ === 'freitext') {
              freitext++;
              if (e.bewertet) bewertet++;
            }
          }
        });
      });
      html += '<tr><td>' + (i === 0 ? '★ ' : '') + esc(g.name) + '</td><td>' +
        esc(g.symbol) + ' ' + esc(g.figurName) + '</td><td>' + g.punkte + '</td><td>' +
        V.fortschritt(g) + '/' + V.REGIONEN.length + '</td><td>' +
        aufgaben + '/' + maxAufgaben + '</td><td>' + freitext + ' (' + bewertet + ' bewertet)</td><td>' +
        V.symbole(g).length + '/' + V.REGIONEN.length + '</td><td>' +
        (g.schlossAuf ? 'geoeffnet' : '—') + '</td></tr>';
    });
    html += '</tbody></table>';

    var freitexte = V.freitextEintraege().length;
    var offen = V.freitextOffen().length;
    html += '<div class="exportaktionen">' +
      '<button type="button" id="csvHerunterladen">Punkte als CSV</button>' +
      (freitexte ? '<button type="button" id="tagebuchHerunterladen">Tagebuch herunterladen</button>' : '') +
      (offen ? '<button type="button" id="freitextHerunterladen">Freitexte zur Bewertung (' + offen + ')</button>' : '') +
      '<button type="button" id="csvVorschauBtn">CSV anzeigen</button>' +
      '<button type="button" id="lehrkraftUebersichtBtn">Lehrkraft: Codes anzeigen</button>' +
      '<button type="button" id="bewertungImportBtn">Bewertungen einlesen</button>' +
      '<button type="button" id="spielZuruecksetzen">Spiel zuruecksetzen</button>' +
      '</div><input type="file" id="bewertungDatei" accept="application/json" style="display:none">' +
      '<pre id="csvVorschau" style="display:none"></pre>' +
      '<pre id="lehrkraftVorschau" style="display:none"></pre>' +
      '<p class="hinweis" id="importHinweis"></p>';

    // Weg A: das Bewertungs-Backend.
    html += '<div class="dienstblock">' +
      '<p><strong>Bewertungsdienst (Weg A)</strong></p>' +
      '<p class="hinweis">Starte auf diesem Rechner <code>npm install</code> und ' +
      '<code>npm start</code> im Ordner <code>backend</code>. Der Dienst haelt den ' +
      'API-Schluessel in <code>backend/.env</code> und liest die Bewertungskriterien ' +
      'aus dem Spielinhalt — die kommen nie vom Schülerrechner.</p>' +
      '<div class="dienstaktionen">' +
      '<input id="dienstUrl" class="code-font" value="http://127.0.0.1:8080" ' +
      'placeholder="http://127.0.0.1:8080">' +
      '<button type="button" id="dienstPruefen">Verbindung pruefen</button>' +
      '<button type="button" id="dienstBewerten" disabled>Freitexte bewerten (' + offen + ')</button>' +
      '<span id="dienstStatus" class="hinweis"></span>' +
      '</div>' +
      '<p class="hinweis" id="dienstErgebnis">' + esc(dienstLetztesErgebnis) + '</p>' +
      '</div>';
    box.innerHTML = html;

    $('csvHerunterladen').addEventListener('click', function () { download(V.csvBlob(), 'vulkanspiel_punkte.csv'); });
    var tb = $('tagebuchHerunterladen');
    if (tb) tb.addEventListener('click', function () { download(V.tagebuchBlob(), 'vulkanspiel_tagebuch.txt'); });
    var ft = $('freitextHerunterladen');
    if (ft) ft.addEventListener('click', function () { download(V.freitextBlob(), 'vulkanspiel_freitexte.json'); });
    $('csvVorschauBtn').addEventListener('click', function () {
      var pre = $('csvVorschau');
      if (pre.style.display === 'none') { pre.textContent = V.exportCSV(); pre.style.display = 'block'; }
      else { pre.style.display = 'none'; pre.textContent = ''; }
    });
    $('lehrkraftUebersichtBtn').addEventListener('click', function () {
      var pre = $('lehrkraftVorschau');
      if (pre.style.display === 'none') { pre.textContent = lehrkraftText(); pre.style.display = 'block'; }
      else { pre.style.display = 'none'; pre.textContent = ''; }
    });
    $('bewertungImportBtn').addEventListener('click', function () {
      $('bewertungDatei').click();
    });
    $('bewertungDatei').addEventListener('change', function (ev) {
      var datei = ev.target.files && ev.target.files[0];
      if (!datei) return;
      var leser = new FileReader();
      leser.onload = function () {
        var ergebnis = V.freitextImport(String(leser.result || ''));
        var hinweis = $('importHinweis');
        if (!hinweis) return;
        if (!ergebnis.ok) {
          hinweis.textContent = ergebnis.fehler;
          return;
        }
        var text = ergebnis.eingetragen + ' Bewertung(en) eingetragen.';
        if (ergebnis.fehler.length) text += ' Nicht zugeordnet: ' + ergebnis.fehler.join(' · ');
        hinweis.textContent = text;
        zeichne();
      };
      leser.readAsText(datei);
      ev.target.value = '';
    });
    $('dienstPruefen').addEventListener('click', dienstPruefen);
    $('dienstBewerten').addEventListener('click', dienstBewerten);
    $('spielZuruecksetzen').addEventListener('click', function () {
      if (window.confirm('Wirklich alle Gruppen, Punkte, Regionen, Symbole und Tagebuch-Eintraege loeschen?')) {
        V.reset();
        $('regionsbereich').classList.remove('sichtbar');
        $('regionsbereich').innerHTML = '';
        zeichne();
      }
    });
  }

  /** Die Codekette als Text — nur fuer die Lehrkraft. */
  function lehrkraftText() {
    var u = V.lehrkraftUebersicht();
    var teile = [];
    teile.push('Auf eurem Zettel steht ein Wort und der Name einer Station.');
    teile.push('Wer an dieser Station anfaengt, traegt das Wort ein.');
    teile.push('');
    u.kette.forEach(function (s) {
      var zeile = s.position + '. ' + s.kuerzel + ' ' + s.region +
        ' — Symbol: ' + s.symbol + ' (' + s.symbolName + ')' +
        ' — Aufdruck zum Anfangen: ' + s.startcode +
        ' — Aufdruck nach dem Loesen: ' + (s.codeNaechste || '—');
      teile.push(zeile);
    });
    teile.push('');
    teile.push('Die Kette laeuft zyklisch: Wer am Hot-Spot anfaengt, kommt am Ende');
    teile.push('zur Subduktionszone. Fuenf Zettel, fuenf Stationen, jede Gruppe');
    teile.push('faengt woanders an.');
    teile.push('');
    teile.push('Schloss-Code: ' + u.schlossCode);
    return teile.join('\n');
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

  // ---------- Schloss ----------

  function zeichneSchloss() {
    var box = $('schlossBox');
    var g = gruppe();
    var gefunden = g ? V.symbole(g) : [];
    var bereit = g ? V.schlossBereit(g) : false;

    var html = '<h3>Das Schloss</h3>';
    if (!g) {
      html += '<p class="hinweis">Meldet zuerst eine Gruppe an.</p>';
      box.innerHTML = html;
      return;
    }

    if (g.schlossAuf) {
      var u = V.lehrkraftUebersicht();
      html += '<p class="ok">Das Schloss ist geoeffnet. ' + esc(u.schlossCode || '') + '</p>';
      box.innerHTML = html;
      return;
    }

    html += '<p class="hinweis">In jeder Station findet ihr ein Symbol. Mit allen ' +
      V.REGIONEN.length + ' Symbolen oeffnet sich das Schloss. ' +
      'Gefunden: ' + gefunden.length + ' von ' + V.REGIONEN.length + '.</p>';
    html += '<div class="schloss">';
    V.REGIONEN.forEach(function (r) {
      var hat = gefunden.some(function (s) { return s.symbol === r.symbol; });
      html += '<div class="schloss-feld' + (hat ? ' gefunden' : '') + '" title="' +
        esc(hat ? r.symbol_name : 'noch nicht gefunden') + '">' +
        (hat ? esc(r.symbol) : '?') + '</div>';
    });
    html += '</div>';
    html += '<div class="schloss-aktionen">' +
      '<button type="button" id="schlossKnopf"' + (bereit ? '' : ' disabled') + '>Schloss oeffnen</button>' +
      (bereit ? '<span class="ok">Alle Symbole beisammen.</span>'
              : '<span class="hinweis">Euch fehlen noch ' +
                (V.REGIONEN.length - gefunden.length) + ' Symbole.</span>') +
      '</div>';
    box.innerHTML = html;

    var knopf = $('schlossKnopf');
    if (knopf && bereit) {
      knopf.addEventListener('click', function () {
        var ergebnis = V.schlossOeffnen();
        if (!ergebnis.ok) {
          knopf.textContent = ergebnis.fehler;
          return;
        }
        zeichne();
        var box2 = $('schlossBox');
        box2.innerHTML = '<h3>Das Schloss ist offen</h3>' +
          '<p class="ok">' + esc(ergebnis.text) + '</p>' +
          '<p>Abschluss-Code: <span class="code-anzeige sichtbar">' + esc(ergebnis.code) +
          '</span> · Bonus: +' + ergebnis.bonus + ' Punkte · ' + ergebnis.gesamt + ' Punkte insgesamt.</p>';
      });
    }
  }

  // ---------- Gesamtzeichnen ----------

  function zeichne() {
    zeichneGruppenliste();
    markiereRegionen();
    var g = gruppe();

    var status = $('kartenStatus');
    if (g) {
      status.textContent = g.name + ' · ' + g.punkte + ' Punkte · ' +
        V.fortschritt(g) + ' von ' + V.REGIONEN.length + ' Stationen aufgedeckt · ' +
        V.symbole(g).length + ' von ' + V.REGIONEN.length + ' Symbolen. ' +
        'Klickt eine Station auf der Karte an.';
    } else {
      status.textContent = 'Bitte zuerst eine Gruppe anmelden, eine Spielfigur waehlen und den Aufdruck vom Zettel eintragen.';
    }

    zeichneTagebuch();
    zeichneSchloss();
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
    // Datei geladen hat. In Version 5 gibt es Aufgabentypen und Freitext-Bewertung.
    var anzeige = $('versionsanzeige');
    if (anzeige) {
      anzeige.textContent = 'Version ' + V.inhaltVersion + ' · Aufgabentypen';
    }

    zeichneFigurwahl();
    zeichneStationswahl();
    $('gruppenAnmeldenBtn').addEventListener('click', meldeGruppeAn);
    $('gruppenName').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { ev.preventDefault(); meldeGruppeAn(); }
    });
    var startcode = $('startcode');
    if (startcode) {
      startcode.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') { ev.preventDefault(); meldeGruppeAn(); }
      });
    }
    initKarte();
    zeichne();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
