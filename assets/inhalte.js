/**
 * Inhalte des Vulkanspiels: Spielfiguren, Regionen, Fragen.
 *
 * Diese Datei ist die eine Quelle fuer den Spielinhalt. Sie wird ueber
 * <script src="assets/inhalte.js"> eingebunden und nicht per fetch() geladen,
 * damit das Spiel auch per Doppelklick (file://) laeuft.
 *
 * Aufbau:
 *   spielfiguren[]   Figuren, die eine Gruppe am Start waehlen kann
 *   regionen[]       Klickbare Regionen auf der Weltkarte
 *     aufgaben[]       Fuenf Aufgaben je Region (mc, zuordnung, richtig_falsch,
 *                      lueckentext, freitext)
 *     tagebuch_alt[]   Offene Frage der aelteren Fassung
 *
 * Codekette und Schloss:
 *   startcode        Der Aufdruck auf dem Zettel, der die Gruppe am Anfang bekommt.
 *                    Oeffnet die erste Region.
 *   code_naechste    Das Loesen einer Region liefert den Code der naechsten Region.
 *   symbol           Jede Region traegt ein Symbol. Mit allen fuenf Symbolen
 *                    laesst sich das Schloss oeffnen (Bonus und Abschluss).
 *
 * Die Codes sind bewusst kurze deutsche Worte, damit sie sich gut auf einen
 * Zettel schreiben und vorlesen lassen. Sie sind nicht die Loesung einer Frage,
 * sondern Teil der Spielhandlung.
 */
window.VULKAN_STATIONEN = {
  "spiel": "Vulkanspiel",
  "version": "5.1.0",
  "created": "2026-10-21",
  "updated": "2026-10-22",
  "zielgruppe": "LK Geografie, Gymnasium Baden-Württemberg, Klassen 11/12",
  "dauer_minuten": 45,
  "startpunkte": 10,
  "punkte": {
    "frage_richtig": 10,
    "tagebuch_abgabe": 5
  },
  "startcode": "ASCHE",
  "startcodes": {
    "subduktion": "ASCHE",
    "hotspot": "FUNKEN",
    "maar": "WELLE",
    "lip": "TROPFEN",
    "risiko": "DECKE"
  },
  "startcode_text": "Auf dem Zettel steht ein Wort und der Name einer Station. Wer zu dieser Station darf anfangen.",
  "schloss": {
    "bonuspunkte": 10,
    "code": "ERUPTION",
    "text": "Das Schloss springt auf. Darunter liegt ein Zettel: ERUPTION. Damit habt ihr den Vulkan erweckt."
  },
  "spielfiguren": [
    { "id": "vulkan",     "symbol": "🔭", "name": "Vulkanforscherin" },
    { "id": "gletscher",  "symbol": "🧊", "name": "Gletscherforscherin" },
    { "id": "seismologe", "symbol": "📡", "name": "Seismologin" },
    { "id": "fernerkun",  "symbol": "🛰️", "name": "Fernerkundung" },
    { "id": "team",       "symbol": "🧭", "name": "Feldteam" }
  ],
  "skizzen": {
    "schichtvulkan": {
      "name": "Schichtvulkan im Querschnitt",
      "viewBox": "0 0 1000 400",
      "svg": "<polygon points='180,340 820,340 500,110' class='skizze-koerper' />" +
        "<polygon points='460,110 540,110 520,150 480,150' class='skizze-krater' />" +
        "<line x1='500' y1='145' x2='500' y2='330' class='skizze-schlot' />" +
        "<ellipse cx='500' cy='360' rx='150' ry='26' class='skizze-magma' />" +
        "<line x1='300' y1='285' x2='700' y2='285' class='skizze-schicht' />" +
        "<line x1='250' y1='312' x2='750' y2='312' class='skizze-schicht' />" +
        "<line x1='420' y1='196' x2='580' y2='196' class='skizze-schicht' />"
    },
    "schildvulkan": {
      "name": "Schildvulkan im Querschnitt",
      "viewBox": "0 0 1000 400",
      "svg": "<polygon points='60,340 940,340 500,190' class='skizze-koerper' />" +
        "<polygon points='465,190 535,190 520,208 480,208' class='skizze-krater' />" +
        "<line x1='500' y1='205' x2='500' y2='340' class='skizze-schlot' />" +
        "<polygon points='470,340 530,340 515,400 485,400' class='skizze-magma' />" +
        "<line x1='200' y1='305' x2='800' y2='305' class='skizze-schicht' />" +
        "<line x1='330' y1='260' x2='670' y2='260' class='skizze-schicht' />"
    },
    "maar": {
      "name": "Maar im Querschnitt",
      "viewBox": "0 0 1000 400",
      "svg": "<polygon points='0,150 1000,150 1000,400 0,400' class='skizze-koerper' />" +
        "<polygon points='320,150 400,150 365,115' class='skizze-koerper' />" +
        "<polygon points='600,150 680,150 635,115' class='skizze-koerper' />" +
        "<polygon points='400,150 600,150 540,250 460,250' class='skizze-wasser' />" +
        "<polygon points='460,250 540,250 515,350 485,350' class='skizze-krater' />" +
        "<rect x='0' y='260' width='1000' height='40' class='skizze-wasser' />" +
        "<ellipse cx='500' cy='375' rx='140' ry='24' class='skizze-magma' />"
    },
    "trapp": {
      "name": "Flutbasalt-Provinz im Querschnitt",
      "viewBox": "0 0 1000 400",
      "svg": "<polygon points='0,320 1000,320 1000,400 0,400' class='skizze-koerper' />" +
        "<polygon points='150,320 850,320 820,280 180,280' class='skizze-krater' />" +
        "<polygon points='180,280 820,280 790,240 210,240' class='skizze-koerper' />" +
        "<polygon points='210,240 790,240 760,200 240,200' class='skizze-krater' />" +
        "<line x1='500' y1='200' x2='500' y2='365' class='skizze-schlot' />" +
        "<ellipse cx='500' cy='375' rx='160' ry='22' class='skizze-magma' />"
    },
    "risikoformel": {
      "name": "Die Risikoformel",
      "viewBox": "0 0 1000 400",
      "svg": "<rect x='40' y='140' width='180' height='120' rx='14' class='skizze-feld' />" +
        "<rect x='290' y='140' width='180' height='120' rx='14' class='skizze-feld' />" +
        "<rect x='540' y='140' width='180' height='120' rx='14' class='skizze-feld' />" +
        "<rect x='790' y='140' width='180' height='120' rx='14' class='skizze-feld' />" +
        "<text x='255' y='215' fill='#cfd8e3' font-size='64' text-anchor='middle'>=</text>" +
        "<text x='505' y='215' fill='#cfd8e3' font-size='64' text-anchor='middle'>×</text>" +
        "<text x='755' y='215' fill='#cfd8e3' font-size='64' text-anchor='middle'>×</text>"
    }
  },
  "regionen": [
    {
      "id": "subduktion",
      "nr": 1,
      "kuerzel": "SUB",
      "name": "Subduktionszonen des Pazifiks",
      "svg_id": "piece-subduktion",
      "farbe": "#c0392b",
      "figur": { "x": 291.7, "y": 291.7 },
      "symbol": "🌋",
      "symbol_name": "Vulkan",
      "code_naechste": "FUNKEN",
      "aufgaben": [
        {
          "id": "sub-1",
          "typ": "mc",
          "punkte": 8,
          "frage": "Warum sind Vulkanausbrüche an Subduktionszonen oft explosiv?",
          "daten": {
            "optionen": [
              "Das Magma ist basaltisch und niedrig viskos, Gase entweichen leicht.",
              "Das Magma ist intermediär bis felsisch und hoch viskos, Gase bleiben eingeschlossen.",
              "Es gibt dort kein Wasser im Mantel, daher kein Dampfdruck.",
              "Die Platten bewegen sich auseinander, dadurch entsteht Druck."
            ],
            "richtig": 1,
            "erklaerung": "Die abtauchende Platte führt Wasser in den Mantel, Partialschmelze erzeugt intermediäres bis felsisches Magma. Hoher SiO2-Gehalt bedeutet hohe Viskosität — Gase bleiben eingeschlossen, der Druck baut sich auf, die Eruption wird explosiv."
          }
        },
        {
          "id": "sub-2",
          "typ": "zuordnung",
          "punkte": 8,
          "frage": "Ordnet die vier Begriffe den Feldern A bis D der Skizze zu.",
          "daten": {
            "skizze": "schichtvulkan",
            "felder": [
              { "id": "A", "x": 500, "y": 60 },
              { "id": "B", "x": 500, "y": 215 },
              { "id": "C", "x": 300, "y": 305 },
              { "id": "D", "x": 500, "y": 368 }
            ],
            "begriffe": ["Krater", "Schlot", "Schichtkoerper", "Magma-Kammer"],
            "loesung": { "A": "Krater", "B": "Schlot", "C": "Schichtkoerper", "D": "Magma-Kammer" },
            "hinweis": "Der Krater ist die Oeffnung an der Oberflaeche, der Schlot der Kanal, der Schichtkoerper das gelaegerte Hanggestein und die Magma-Kammer der Speicher in der Tiefe."
          }
        },
        {
          "id": "sub-3",
          "typ": "richtig_falsch",
          "punkte": 6,
          "frage": "Bewertet jede Aussage: stimmt sie oder nicht?",
          "daten": {
            "aussagen": [
              { "text": "An einer Subduktionszone taucht eine dichtere Platte unter eine leichtere ab.", "richtig": true },
              { "text": "Das Wasser der abtauchenden Platte senkt die Schmelztemperatur des Mantels.", "richtig": true },
              { "text": "Vulkane an Subduktionszonen spucken immer basaltisches, niedrig viskoses Magma.", "richtig": false },
              { "text": "Die Anden sind ein Beispiel fuer Vulkanismus an einer Subduktionszone.", "richtig": true }
            ]
          }
        },
        {
          "id": "sub-4",
          "typ": "lueckentext",
          "punkte": 8,
          "frage": "Setzt die richtigen Wörter ein. Ihr könnt jedes Kärtchen nur einmal verwenden.",
          "daten": {
            "text": "Die [1] Platte taucht unter die [2] Platte ab. Dadurch gelangt Wasser in den Mantel und es entsteht [3]. Das hoch viskose Magma staut sich im [4] und die Eruption wird explosiv.",
            "loesungen": [
              { "id": "1", "wort": "dichtere", "alternativen": ["dichte", "dicht"] },
              { "id": "2", "wort": "leichtere", "alternativen": ["leichter"] },
              { "id": "3", "wort": "Magma", "alternativen": ["magma"] },
              { "id": "4", "wort": "Schlot", "alternativen": ["schlot"] }
            ],
            "distraktoren": ["Meer", "Wind", "Gestein"]
          }
        },
        {
          "id": "sub-5",
          "typ": "freitext",
          "punkte": 10,
          "frage": "Warum ist das Risiko an einem Vulkan wie dem Villarrica in Chile höher als an einem Vulkan in Alaska? Begründet mit zwei Faktoren.",
          "daten": {
            "kriterien": [
              "Erwaehnt die Exposition (Menschen und Infrastruktur in der Naehe).",
              "Erwaehnt die Vulnerabilitaet (Fruehwarnung, Infrastruktur, Wirtschaftskraft).",
              "Erklaert den Unterschied zwischen beiden Faellenn, nicht nur die beiden Orte."
            ]
          }
        }
      ],
      "tagebuch_alt": [
        {
          "id": "sub-t1",
          "frage": "Stell dir vor, du könntest an den Rand des Pazifischen Feuerrings reisen: Was würdest du unbedingt einpacken — und warum?"
        }
      ]
    },
    {
      "id": "hotspot",
      "nr": 2,
      "kuerzel": "HOT",
      "name": "Hawaii-Hot-Spot",
      "svg_id": "piece-hotspot",
      "farbe": "#e67e22",
      "figur": { "x": 69.4, "y": 194.4 },
      "symbol": "🌊",
      "symbol_name": "Welle",
      "code_naechste": "WELLE",
      "aufgaben": [
        {
          "id": "hot-1",
          "typ": "mc",
          "punkte": 8,
          "frage": "Warum entsteht über einem Hot Spot eine Vulkankette?",
          "daten": {
            "optionen": [
              "Die lithosphärische Platte wandert über eine fest stehende Mantelplume.",
              "Der Hot Spot wandert unter der Platte entlang.",
              "Die Platte bleibt an einem Ort liegen.",
              "Dort liegen viele Hot Spots nebeneinander."
            ],
            "richtig": 0,
            "erklaerung": "Die Mantelplume steht fest, die Platte wandert darüber hinweg. So entsteht eine Kette mit zunehmendem Alter in Plattenbewegungsrichtung — von Hawaii über Midway bis zur Kaiser-Kette."
          }
        },
        {
          "id": "hot-2",
          "typ": "zuordnung",
          "punkte": 8,
          "frage": "Ordnet die vier Begriffe den Feldern A bis D der Skizze zu.",
          "daten": {
            "skizze": "schildvulkan",
            "felder": [
              { "id": "A", "x": 500, "y": 165 },
              { "id": "B", "x": 500, "y": 255 },
              { "id": "C", "x": 270, "y": 300 },
              { "id": "D", "x": 500, "y": 372 }
            ],
            "begriffe": ["Gipfelkrater", "Schlot", "Lavastroeme", "Mantelplume"],
            "loesung": { "A": "Gipfelkrater", "B": "Schlot", "C": "Lavastroeme", "D": "Mantelplume" },
            "hinweis": "Der Gipfelkrater sitzt oben, der Schlot fuehrt das Magma hinauf, die duennfluessigen Lavastroeme bauen die flachen Flanken auf, und die Mantelplume speist den Vulkan aus der Tiefe."
          }
        },
        {
          "id": "hot-3",
          "typ": "richtig_falsch",
          "punkte": 6,
          "frage": "Bewertet jede Aussage: stimmt sie oder nicht?",
          "daten": {
            "aussagen": [
              { "text": "Schildvulkane haben flache Flanken, weil die Lava dünnflüssig ist.", "richtig": true },
              { "text": "Der Hawaii-Hot-Spot liegt an einer Plattengrenze.", "richtig": false },
              { "text": "Die Inseln der Hawaii-Kette werden mit zunehmender Entfernung vom Hot Spot älter.", "richtig": true },
              { "text": "Das Magma des Kilauea ist hoch viskos und führt zu explosiven Ausbrüchen.", "richtig": false }
            ]
          }
        },
        {
          "id": "hot-4",
          "typ": "lueckentext",
          "punkte": 8,
          "frage": "Setzt die richtigen Wörter ein. Ihr könnt jedes Kärtchen nur einmal verwenden.",
          "daten": {
            "text": "Über der ortsfesten [1] wandert die Platte hinweg. Das [2] Magma hat wenig SiO2 und ist niedrig [3]. Deshalb sind die Eruptionen überwiegend [4].",
            "loesungen": [
              { "id": "1", "wort": "Mantelplume", "alternativen": ["Plume", "mantelplume"] },
              { "id": "2", "wort": "basaltische", "alternativen": ["basaltisch", "basische", "basisch"] },
              { "id": "3", "wort": "viskos", "alternativen": ["zähflüssig", "zaehfluessig"] },
              { "id": "4", "wort": "effusiv", "alternativen": ["Effusiv"] }
            ],
            "distraktoren": ["felsische", "explosiv", "Subduktionszone"]
          }
        },
        {
          "id": "hot-5",
          "typ": "freitext",
          "punkte": 10,
          "frage": "Erklärt, warum die Hawaii-Inseln eine Kette bilden und warum die Ausbrüche dort meist ruhig verlaufen. Nutzt Begriffe aus der Skizze.",
          "daten": {
            "kriterien": [
              "Erklärt die Kette durch die über die Mantelplume wandernde Platte.",
              "Nennt niedrigen SiO2-Gehalt und niedrige Viskosität als Grund für effusive Eruptionen.",
              "Verknüpft beide Aspekte, statt sie nur nebeneinander zu nennen."
            ]
          }
        }
      ],
      "tagebuch_alt": [
        {
          "id": "hot-t1",
          "frage": "Wie würdest du das Klima auf Hawaii mit nur drei Worten beschreiben?"
        }
      ]
    },
    {
      "id": "maar",
      "nr": 3,
      "kuerzel": "MAAR",
      "name": "Maar-Feld der Eifel",
      "svg_id": "piece-maar",
      "farbe": "#8e44ad",
      "figur": { "x": 519.4, "y": 110.6 },
      "symbol": "💧",
      "symbol_name": "Tropfen",
      "code_naechste": "TROPFEN",
      "aufgaben": [
        {
          "id": "maar-1",
          "typ": "mc",
          "punkte": 8,
          "frage": "Wie entsteht ein Maar?",
          "daten": {
            "optionen": [
              "Durch langsame Erosion des Bodens",
              "Durch Kollaps einer geleerten Magmakammer",
              "Durch eine phreatomagmatische Explosion bei Kontakt von Magma mit Wasser",
              "Durch das Aufstauen einer Lava-Decke"
            ],
            "richtig": 2,
            "erklaerung": "Magma trifft auf Grundwasser oder Oberflächenwasser. Die Explosion reisst Gestein heraus und hinterlässt eine kreisrunde Mulde mit einem Tuffring — das Maar."
          }
        },
        {
          "id": "maar-2",
          "typ": "zuordnung",
          "punkte": 8,
          "frage": "Ordnet die vier Begriffe den Feldern A bis D der Skizze zu.",
          "daten": {
            "skizze": "maar",
            "felder": [
              { "id": "A", "x": 345, "y": 112 },
              { "id": "B", "x": 500, "y": 195 },
              { "id": "C", "x": 180, "y": 285 },
              { "id": "D", "x": 500, "y": 372 }
            ],
            "begriffe": ["Tuffring", "Maarsee", "Grundwasser", "Magma"],
            "loesung": { "A": "Tuffring", "B": "Maarsee", "C": "Grundwasser", "D": "Magma" },
            "hinweis": "Der Tuffring ist der Wall aus ausgeworfenem Material, der Maarsee fuellt die Mulde, das Grundwasser loest beim Kontakt mit dem aufsteigenden Magma die Explosion aus."
          }
        },
        {
          "id": "maar-3",
          "typ": "richtig_falsch",
          "punkte": 6,
          "frage": "Bewertet jede Aussage: stimmt sie oder nicht?",
          "daten": {
            "aussagen": [
              { "text": "Ein Maar entsteht durch Kontakt von Magma mit Wasser.", "richtig": true },
              { "text": "Maare sind typischerweise hohe, steile Kegel.", "richtig": false },
              { "text": "In der Eifel gibt es viele mit Wasser gefüllte Maare.", "richtig": true },
              { "text": "Für ein Maar braucht es immer hoch viskoses, felsisches Magma.", "richtig": false }
            ]
          }
        },
        {
          "id": "maar-4",
          "typ": "lueckentext",
          "punkte": 8,
          "frage": "Setzt die richtigen Wörter ein. Ihr könnt jedes Kärtchen nur einmal verwenden.",
          "daten": {
            "text": "Steigt [1] auf und trifft auf [2], verdampft dieses schlagartig. Diese [3] Explosion reißt Gestein heraus. Zurück bleiben eine kreisrunde Mulde und ein [4].",
            "loesungen": [
              { "id": "1", "wort": "Magma", "alternativen": ["magma"] },
              { "id": "2", "wort": "Grundwasser", "alternativen": ["grundwasser", "Wasser"] },
              { "id": "3", "wort": "phreatomagmatische", "alternativen": ["phreatomagmatisch"] },
              { "id": "4", "wort": "Tuffring", "alternativen": ["tuffring"] }
            ],
            "distraktoren": ["effusive", "Schildvulkan", "Gletscher"]
          }
        },
        {
          "id": "maar-5",
          "typ": "freitext",
          "punkte": 10,
          "frage": "Warum kann ein Maar auch bei dünnflüssigem, basischem Magma explosiv sein? Erklärt den Vorgang Schritt für Schritt.",
          "daten": {
            "kriterien": [
              "Nennt den Kontakt von Magma und Wasser als Auslöser.",
              "Beschreibt das schlagartige Verdampfen des Wassers und die Explosion.",
              "Stellt klar, dass nicht die Viskosität, sondern der Wasserkontakt entscheidend ist."
            ]
          }
        }
      ],
      "tagebuch_alt": [
        {
          "id": "maar-t1",
          "frage": "Welche Geräusche oder Gerüche stellst du dir an einem Maar-See vor?"
        }
      ]
    },
    {
      "id": "lip",
      "nr": 4,
      "kuerzel": "LIP",
      "name": "Deccan-Trapp, Indien",
      "svg_id": "piece-lip",
      "farbe": "#16a085",
      "figur": { "x": 711.1, "y": 197.2 },
      "symbol": "🪨",
      "symbol_name": "Gestein",
      "code_naechste": "DECKE",
      "aufgaben": [
        {
          "id": "lip-1",
          "typ": "mc",
          "punkte": 8,
          "frage": "Was ist eine Large Igneous Province?",
          "daten": {
            "optionen": [
              "Ein einzelner sehr hoher Vulkan",
              "Eine große Fläche mit aufgestauten Basalt-Decken",
              "Ein einzelner Hot Spot unter dem Meer",
              "Eine Subduktionszone mit vielen Vulkanen"
            ],
            "richtig": 1,
            "erklaerung": "Eine Large Igneous Province ist eine ausgedehnte vulkanische Provinz: riesige Flächen mit übereinanderliegenden Basalt-Decken. Die Deccan-Trapp in Indien umfasst rund 500.000 km²."
          }
        },
        {
          "id": "lip-2",
          "typ": "zuordnung",
          "punkte": 8,
          "frage": "Ordnet die vier Begriffe den Feldern A bis D der Skizze zu.",
          "daten": {
            "skizze": "trapp",
            "felder": [
              { "id": "A", "x": 500, "y": 195 },
              { "id": "B", "x": 500, "y": 300 },
              { "id": "C", "x": 200, "y": 345 },
              { "id": "D", "x": 500, "y": 372 }
            ],
            "begriffe": ["Basaltdecken", "Foerderspalte", "Erdkruste", "Magmareservoir"],
            "loesung": { "A": "Basaltdecken", "B": "Foerderspalte", "C": "Erdkruste", "D": "Magmareservoir" },
            "hinweis": "Viele uebereinanderliegende Basaltdecken bilden die treppenartige Trapp-Landschaft. Das Magma steigt aus dem Reservoir durch Foerderspalten in der Erdkruste auf."
          }
        },
        {
          "id": "lip-3",
          "typ": "richtig_falsch",
          "punkte": 6,
          "frage": "Bewertet jede Aussage: stimmt sie oder nicht?",
          "daten": {
            "aussagen": [
              { "text": "Der Deccan-Trapp besteht überwiegend aus Basalt.", "richtig": true },
              { "text": "Eine Large Igneous Province entsteht innerhalb weniger Tage.", "richtig": false },
              { "text": "Das Wort Trapp kommt vom schwedischen Wort für Treppe.", "richtig": true },
              { "text": "SO2 aus Vulkanen wirkt langfristig als Treibhausgas.", "richtig": false }
            ]
          }
        },
        {
          "id": "lip-4",
          "typ": "lueckentext",
          "punkte": 8,
          "frage": "Setzt die richtigen Wörter ein. Ihr könnt jedes Kärtchen nur einmal verwenden.",
          "daten": {
            "text": "Eine Large Igneous Province besteht aus riesigen [1]-Decken. Das [2] gelangt in die Stratosphäre und bildet [3], die das Sonnenlicht zurückwerfen. Das [4] wirkt dagegen langfristig als Treibhausgas.",
            "loesungen": [
              { "id": "1", "wort": "Basalt", "alternativen": ["basalt"] },
              { "id": "2", "wort": "SO2", "alternativen": ["Schwefeldioxid", "so2"] },
              { "id": "3", "wort": "Aerosole", "alternativen": ["aerosole"] },
              { "id": "4", "wort": "CO2", "alternativen": ["Kohlendioxid", "co2"] }
            ],
            "distraktoren": ["Granit", "Sauerstoff", "Stickstoff"]
          }
        },
        {
          "id": "lip-5",
          "typ": "freitext",
          "punkte": 10,
          "frage": "Erklärt, wie ein Großereignis wie der Deccan-Trapp das Klima kurzfristig und langfristig beeinflussen kann.",
          "daten": {
            "kriterien": [
              "Beschreibt die kurzfristige Abkühlung durch SO2 und stratosphärische Aerosole.",
              "Beschreibt die langfristige Erwärmung durch CO2 als Treibhausgas.",
              "Trennt beide Zeitskalen klar voneinander."
            ]
          }
        }
      ],
      "tagebuch_alt": [
        {
          "id": "lip-t1",
          "frage": "Was würdest du einer Freundin oder einem Freund erzählen, wenn sie noch nie vom Deccan-Trapp gehört hat?"
        }
      ]
    },
    {
      "id": "risiko",
      "nr": 5,
      "kuerzel": "RISIKO",
      "name": "Nyiragongo und Goma",
      "svg_id": "piece-risiko",
      "farbe": "#2c3e50",
      "figur": { "x": 581.1, "y": 254.2 },
      "symbol": "🔥",
      "symbol_name": "Feuer",
      "code_naechste": "ASCHE",
      "aufgaben": [
        {
          "id": "ris-1",
          "typ": "mc",
          "punkte": 8,
          "frage": "Woraus setzt sich das Risiko an einem Vulkanort zusammen?",
          "daten": {
            "optionen": [
              "Nur aus der Gefährdung durch den Vulkan",
              "Gefährdung × Exposition × Vulnerabilität",
              "Nur aus der Entfernung zum Vulkan",
              "Nur aus der Bevölkerungszahl"
            ],
            "richtig": 1,
            "erklaerung": "Das Risiko ist das Produkt aus Gefährdung (Hazard), der Betroffenheit (Exposition) und der Verwundbarkeit (Vulnerabilität). Fehlt ein Faktor, ist das Risiko gering — so bei unbewohnten Vulkanen."
          }
        },
        {
          "id": "ris-2",
          "typ": "zuordnung",
          "punkte": 8,
          "frage": "Ordnet die vier Begriffe den Feldern A bis D der Formel zu.",
          "daten": {
            "skizze": "risikoformel",
            "felder": [
              { "id": "A", "x": 130, "y": 200 },
              { "id": "B", "x": 380, "y": 200 },
              { "id": "C", "x": 630, "y": 200 },
              { "id": "D", "x": 880, "y": 200 }
            ],
            "begriffe": ["Risiko", "Gefaehrdung", "Exposition", "Vulnerabilitaet"],
            "loesung": { "A": "Risiko", "B": "Gefaehrdung", "C": "Exposition", "D": "Vulnerabilitaet" },
            "hinweis": "Das Risiko ist das Ergebnis aus Gefaehrdung (Hazard) mal Exposition (wer und was ist betroffen) mal Vulnerabilitaet (wie verwundbar ist es)."
          }
        },
        {
          "id": "ris-3",
          "typ": "richtig_falsch",
          "punkte": 6,
          "frage": "Bewertet jede Aussage: stimmt sie oder nicht?",
          "daten": {
            "aussagen": [
              { "text": "Frühwarnsysteme senken die Vulnerabilität.", "richtig": true },
              { "text": "Ein Vulkan ohne Menschen in der Nähe bedeutet ein hohes Risiko.", "richtig": false },
              { "text": "Goma liegt nur wenige Kilometer vom Nyiragongo entfernt.", "richtig": true },
              { "text": "Das Risiko hängt nur davon ab, wie oft ein Vulkan ausbricht.", "richtig": false }
            ]
          }
        },
        {
          "id": "ris-4",
          "typ": "lueckentext",
          "punkte": 8,
          "frage": "Setzt die richtigen Wörter ein. Ihr könnt jedes Kärtchen nur einmal verwenden.",
          "daten": {
            "text": "Das [1] ergibt sich aus Gefährdung, Exposition und Vulnerabilität. Eine dichte Besiedlung erhöht die [2]. Frühwarnung und Evakuierungspläne senken die [3]. Der [4] bei Goma ist ein Beispiel für einen aktiven Vulkan nahe einer Großstadt.",
            "loesungen": [
              { "id": "1", "wort": "Risiko", "alternativen": ["risiko"] },
              { "id": "2", "wort": "Exposition", "alternativen": ["exposition"] },
              { "id": "3", "wort": "Vulnerabilität", "alternativen": ["Vulnerabilitaet", "vulnerabilität"] },
              { "id": "4", "wort": "Nyiragongo", "alternativen": ["nyiragongo"] }
            ],
            "distraktoren": ["Maar", "Hot Spot", "Trapp"]
          }
        },
        {
          "id": "ris-5",
          "typ": "freitext",
          "punkte": 10,
          "frage": "Warum ist das Risiko in Goma höher als in Napoli, obwohl beide Städte an aktiven Vulkanen liegen? Begründet mit Exposition und Vulnerabilität.",
          "daten": {
            "kriterien": [
              "Nennt die hohe Exposition in Goma (Nähe zum Nyiragongo, dichte Besiedlung).",
              "Nennt die höhere Vulnerabilität in Goma (wenig Infrastruktur, kaum Frühwarnung, geringe Wirtschaftskraft).",
              "Vergleicht mit Napoli (Frühwarnung, Evakuierungspläne, Wirtschaftskraft)."
            ]
          }
        }
      ],
      "tagebuch_alt": [
        {
          "id": "ris-t1",
          "frage": "Was würdest du tun, um die Menschen in Goma besser vor dem Vulkan zu schützen?"
        }
      ]
    }
  ]
};
