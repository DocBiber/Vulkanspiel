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
 *     fragen[]         Multiple-Choice-Fragen (Punkte plus Erklaerung)
 *     tagebuch[]       Offene Fragen, die als Freitext ins Tagebuch wandern
 *
 * Pro Region: 2 Multiple-Choice-Fragen (je 10 Punkte) und 1 Tagebuch-Frage
 * (5 Punkte). Mit 10 Startpunkten sind 135 Punkte moeglich.
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
      "fragen": [
        {
          "id": "hot-1",
          "typ": "mc",
          "punkte": 10,
          "frage": "Warum entsteht über einem Hot Spot eine Vulkankette?",
          "optionen": [
            "Die lithosphärische Platte wandert über eine fest stehende Mantelplume.",
            "Der Hot Spot wandert unter der Platte entlang.",
            "Die Platte bleibt an einem Ort liegen.",
            "Dort liegen viele Hot Spots nebeneinander."
          ],
          "richtig": 0,
          "erklaerung": "Die Mantelplume steht fest, die Platte wandert darüber hinweg. So entsteht eine Kette mit zunehmendem Alter in Plattenbewegungsrichtung — von Hawaii über Midway bis zur Kaiser-Kette."
        },
        {
          "id": "hot-2",
          "typ": "mc",
          "punkte": 10,
          "frage": "Was ist typisch für das Magma eines Schildvulkans?",
          "optionen": [
            "Hoher SiO2-Gehalt, hoch viskos, explosiv",
            "Niedriger SiO2-Gehalt, niedrig viskos, effusiv",
            "Sehr hoher Gasdruck, stets explosiv",
            "Keine gelösten Gase, daher keine Eruptionen"
          ],
          "richtig": 1,
          "erklaerung": "Schildvulkane wie Kilauea oder Mauna Loa spucken basaltisches Magma mit niedrigem SiO2-Gehalt. Es ist wenig viskos, Gase entweichen leicht — die Eruptionen sind überwiegend effusiv."
        }
      ],
      "tagebuch": [
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
      "fragen": [
        {
          "id": "maar-1",
          "typ": "mc",
          "punkte": 10,
          "frage": "Wie entsteht ein Maar?",
          "optionen": [
            "Durch langsame Erosion des Bodens",
            "Durch Kollaps einer geleerten Magmakammer",
            "Durch eine phreatomagmatische Explosion bei Kontakt von Magma mit Wasser",
            "Durch das Aufstauen einer Lava-Decke"
          ],
          "richtig": 2,
          "erklaerung": "Magma trifft auf Grundwasser oder Oberflächenwasser. Die Explosion reisst Gestein heraus und hinterlässt eine kreisrunde Mulde mit einem Tuffring — das Maar."
        },
        {
          "id": "maar-2",
          "typ": "mc",
          "punkte": 10,
          "frage": "Warum kann ein Maar auch bei basischem, also niedrig viskosem, Magma explosiv sein?",
          "optionen": [
            "Weil das Magma sehr heiß ist",
            "Weil Wasser das Magma abkühlt und es spröde wird",
            "Weil der Kontakt mit Wasser eine phreatomagmatische Explosion auslöst",
            "Weil Basalt grundsätzlich explosiv ist"
          ],
          "richtig": 2,
          "erklaerung": "Entscheidend ist nicht die Viskosität, sondern der Wasser-Magma-Kontakt: Das Wasser verdampft schlagartig und sprengt das Magma. Deshalb sind Maare auch in der Eifel bei basischem Magma explosiv."
        }
      ],
      "tagebuch": [
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
      "fragen": [
        {
          "id": "lip-1",
          "typ": "mc",
          "punkte": 10,
          "frage": "Was ist eine Large Igneous Province?",
          "optionen": [
            "Ein einzelner sehr hoher Vulkan",
            "Eine große Fläche mit aufgestauten Basalt-Decken",
            "Ein einzelner Hot Spot unter dem Meer",
            "Eine Subduktionszone mit vielen Vulkanen"
          ],
          "richtig": 1,
          "erklaerung": "Eine Large Igneous Province ist eine ausgedehnte vulkanische Provinz: riesige Flächen mit übereinanderliegenden Basalt-Decken. Die Deccan-Trapp in Indien umfasst rund 500.000 km²."
        },
        {
          "id": "lip-2",
          "typ": "mc",
          "punkte": 10,
          "frage": "Welche Klimawirkung hat SO2 bei einer Vulkanischen Decke?",
          "optionen": [
            "Langfristige Erwärmung, weil SO2 ein Treibhausgas ist",
            "Kurzfristige Abkühlung, weil SO2 stratosphärische Aerosole bildet",
            "Keine Wirkung, das Gas bleibt im Boden",
            "Nur Säureregen auf den Ozeanen"
          ],
          "richtig": 1,
          "erklaerung": "SO2 steigt in die Stratosphäre und bildet dort Aerosole, die Sonnenlicht zurückwerfen — das kühlt kurzfristig ab (Pinatubo 1991). CO2 dagegen wirkt langfristig als Treibhausgas."
        }
      ],
      "tagebuch": [
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
      "fragen": [
        {
          "id": "ris-1",
          "typ": "mc",
          "punkte": 10,
          "frage": "Woraus setzt sich das Risiko an einem Vulkanort zusammen?",
          "optionen": [
            "Nur aus der Gefährdung durch den Vulkan",
            "Gefährdung × Exposition × Vulnerabilität",
            "Nur aus der Entfernung zum Vulkan",
            "Nur aus der Bevölkerungszahl"
          ],
          "richtig": 1,
          "erklaerung": "Das Risiko ist das Produkt aus Gefährdung (Hazard), der Betroffenheit (Exposition) und der Verwundbarkeit (Vulnerabilität). Fehlt ein Faktor, ist das Risiko gering — so bei unbewohnnten Vulkanen."
        },
        {
          "id": "ris-2",
          "typ": "mc",
          "punkte": 10,
          "frage": "Warum ist das Risiko in Goma höher als in Napoli, obwohl beide Städte an aktiven Vulkanen liegen?",
          "optionen": [
            "In Goma gibt es mehr Vulkane.",
            "Goma hat eine hohe Exposition und eine hohe Vulnerabilität.",
            "Napoli liegt weiter vom Vulkan entfernt.",
            "Der Vulkan in Goma ist viel höher."
          ],
          "richtig": 1,
          "erklaerung": "Goma liegt unmittelbar am Nyiragongo und ist dicht besiedelt; hinzu kommen wenig Infrastruktur und kaum Frühwarnung. In Napoli ist die Exposition ebenfalls hoch, die Vulnerabilität aber geringer — durch Frühwarnsysteme, Evakuierungspläne und Wirtschaftskraft."
        }
      ],
      "tagebuch": [
        {
          "id": "ris-t1",
          "frage": "Was würdest du tun, um die Menschen in Goma besser vor dem Vulkan zu schützen?"
        }
      ]
    }
  ]
};
