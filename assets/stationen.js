/**
 * Stationsdaten des Vulkanspiels.
 *
 * Diese Datei ist die eine Quelle fuer die Aufgaben. Sie wird ueber
 * <script src="assets/stationen.js"> eingebunden und nicht per fetch() geladen,
 * damit das Spiel auch per Doppelklick (file://) laeuft.
 *
 * Aufbau je Station:
 *   id              Nummer der Station (1..n)
 *   kuerzel         Kuerzel fuer Anzeige und Codes
 *   titel           Ueberschrift der Station
 *   ort             Wo die Station im Klassenraum steht
 *   thema           Fachliches Thema (fuer die Lehrkraft)
 *   zeit_minuten    Geplante Bearbeitungszeit
 *   kartenstueck    Schluessel des Kartenstuecks in der Liste "kartenstuecke"
 *   auftrag         Der Aufgabentext, der den Schuelerinnen und Schuelern gezeigt wird
 *   loesungshinweis Erwartete Loesung (nur Lehrkraft)
 *   pruefkriterien  Woran die Lehrkraft die Loesung misst
 *   moegliche_fehler Typische Fehler (nur Lehrkraft)
 *   kompetenz       Kompetenzbereiche nach Bildungsplan 2016
 *   quellen         Woher die Fakten stammen
 *
 * Damit eine geaenderte Datei sofort wirkt, genuegt ein Neuladen des Browsers.
 */
window.VULKAN_STATIONEN = {
  "spiel": "Vulkanspiel",
  "version": "2.0.0",
  "created": "2026-10-21",
  "updated": "2026-10-21",
  "zielgruppe": "LK Geografie, Gymnasium Baden-Württemberg, Klassen 11/12",
  "dauer_minuten": 45,
  "gruppen": 5,
  "startpunkte": 10,
  "stationen": [
    {
      "id": 1,
      "kuerzel": "SUB",
      "titel": "Vulkanismus an Subduktionszonen",
      "ort": "Station 1 im Klassenraum, Tafelbereich Nord",
      "thema": "Schichtvulkan, explosiver Vulkanismus, Subduktionsmechanismus",
      "zeit_minuten": 6,
      "kartenstueck": "subduktionszone_pazifik",
      "auftrag": "Erklärt, warum an der Westküste Südamerikas bevorzugt Schichtvulkane mit explosiven Ausbrüchen entstehen. Benennt den entscheidenden geologischen Mechanismus und ein Beispiel.",
      "loesungshinweis": "Abtauchende ozeanische Platte führt Wasser in den Mantel, Schmelzpunkt sinkt, Partialschmelze. Mittel- bis hochvisköses Magma (Andesit, Dacit) sperrt Gase, Druck baut sich auf, explosive Eruption. Beispiel: Cotopaxi (Ecuador) oder Mount St. Helens (USA).",
      "pruefkriterien": [
        "Mechanismus Subduktion mit Wassereintrag genannt",
        "Zusammenhang SiO2-Gehalt, Viskosität, Gasdruck, Explosivität erklärt",
        "mindestens ein konkretes Beispiel benannt",
        "2 bis 3 Sätze, Fachbegriffe korrekt verwendet"
      ],
      "moegliche_fehler": [
        "Schichtvulkan mit Schildvulkan verwechselt",
        "Erklärt Explosion mit 'Hitze' statt mit Gasdruck und Viskosität",
        "Beispiel gehört nicht in eine Subduktionszone"
      ],
      "kompetenz": ["Analysekompetenz", "Orientierungskompetenz"],
      "quellen": ["wiki:entities/vulkanarten.md", "wiki:concepts/vulkanprozesse.md"]
    },
    {
      "id": 2,
      "kuerzel": "HOT",
      "titel": "Schildvulkane und Hot Spots",
      "ort": "Station 2 im Klassenraum, Fensterbereich West",
      "thema": "Schildvulkan, effusiver Vulkanismus, Hot-Spot-Mechanismus",
      "zeit_minuten": 6,
      "kartenstueck": "hotspot_hawaii",
      "auftrag": "Beschreibt den Unterschied zwischen einem Hot-Spot-Vulkan und einem Vulkan an einer Subduktionszone. Erklärt, warum aus Hot Spots Vulkanketten mit einem Alterungsgradienten entstehen.",
      "loesungshinweis": "Hot Spot: feste Mantelplume, Platte wandert darüber, daher Kette mit zunehmendem Alter in Plattenbewegungsrichtung (Hawaii, Midway, Kaiser-Kette). Magma basaltisch, niedrig viskos, Gase entweichen leicht, daher effusiv. Subduktion: Magma intermediär, viskos, explosiv.",
      "pruefkriterien": [
        "Mechanismus Mantelplume richtig beschrieben",
        "Alterungsgradient als Folge der Plattenbewegung erklärt",
        "Magma-Viskosität und Eruptionsstil korrekt zugeordnet",
        "2 bis 3 Sätze"
      ],
      "moegliche_fehler": [
        "Hot Spot als 'Punkt im Inneren der Erde' unklar formuliert",
        "Alterungsrichtung falsch herum erklärt",
        "Schildvulkan als explosiv beschrieben"
      ],
      "kompetenz": ["Analysekompetenz", "Methodenkompetenz"],
      "quellen": ["wiki:entities/vulkanarten.md"]
    },
    {
      "id": 3,
      "kuerzel": "MAAR",
      "titel": "Maare und Vulkanfelder",
      "ort": "Station 3 im Klassenraum, Regalbereich",
      "thema": "Maar, phreatomagmatische Eruption, Intraplatten-Vulkanismus",
      "zeit_minuten": 6,
      "kartenstueck": "maar_eifel",
      "auftrag": "Erklärt die Entstehung eines Maars und begründet, warum ein Maar auch bei basischem Magma explosiv sein kann. Welche Gefahren gehen von Maaren aus?",
      "loesungshinweis": "Magma trifft auf Grundwasser oder Oberflächenwasser, phreatomagmatische Explosion, kreisrunde Mulde mit Tuffring. Gefahren: Aschefall, lahare bei Wasserführung, Grundwasserkontamination. Beispiel: Laacher See (Eifel).",
      "pruefkriterien": [
        "Wasserkontakt als Auslöser benannt",
        "phreatomagmatische Explosion erklärt",
        "Maar-Form mit Tuffring beschrieben",
        "mindestens eine Gefahr genannt"
      ],
      "moegliche_fehler": [
        "Maar als Erosionsform beschrieben",
        "Vergleich mit Caldera ohne Differenzierung",
        "Erklärt Explosion nur mit Gesteinsdruck"
      ],
      "kompetenz": ["Analysekompetenz", "Urteilskompetenz"],
      "quellen": ["wiki:entities/vulkanarten.md"]
    },
    {
      "id": 4,
      "kuerzel": "LIP",
      "titel": "Vulkanische Decken und Large Igneous Provinces",
      "ort": "Station 4 im Klassenraum, Türbereich Süd",
      "thema": "Vulkanische Decke, Flood Basalte, Klima-Effekte",
      "zeit_minuten": 6,
      "kartenstueck": "lip_deccan",
      "auftrag": "Ein Schüler behauptet, ein einzelner Vulkanausbruch könne das Weltklima über Jahre verändern. Prüft diese Behauptung anhand des Beispiels der Deccan-Trapp-Basalte und erklärt den Mechanismus.",
      "loesungshinweis": "Großflächige, effusive Entgasung über lange Zeit: riesige SO2-Menge → stratosphärische Aerosole → kurze Abkühlung, Säureregen, CO2 → langfristige Erwärmung. Pinatubo 1991 (kurz), Deccan-Trapp (lang, ~66 Mio. Jahre, Kreide-Paläogen-Grenze).",
      "pruefkriterien": [
        "Unterschied kurzfristig (SO2, Aerosol, Abkühlung) und langfristig (CO2, Erwärmung) erklärt",
        "Deccan-Trapp mit Fläche und Alter benannt",
        "Behauptung differenziert bewertet statt pauschal bejaht",
        "2 bis 3 Sätze"
      ],
      "moegliche_fehler": [
        "Nur CO2 erwähnt und Abkühlung vergessen",
        "Deccan-Trapp als 'einzelner Ausbruch' beschrieben",
        "Aschefall mit Klimawirkung verwechselt"
      ],
      "kompetenz": ["Urteilskompetenz", "Analysekompetenz"],
      "quellen": ["wiki:entities/vulkanarten.md", "wiki:concepts/vulkanprozesse.md"]
    },
    {
      "id": 5,
      "kuerzel": "RISIKO",
      "titel": "Risiko und Vulnerabilität",
      "ort": "Station 5 im Klassenraum, Mitte",
      "thema": "Risiko, Hazard, Exposition, Vulnerabilität, Resilienz",
      "zeit_minuten": 6,
      "kartenstueck": "risiko_nyiragongo",
      "auftrag": "Anny wohnt in Goma (Nyiragongo, DR Kongo), Ben in Napoli (Vesuv, Italien). Beide leben an einem aktiven Vulkan. Erklärt, warum das Risiko trotzdem nicht gleich ist, und begründet, welche Art von Risikominderung in Goma besonders schwer umsetzbar ist.",
      "loesungshinweis": "Risiko = Hazard × Exposition × Vulnerabilität. Goma: hohe Exposition (dicht besiedelt, unmittelbar am Vulkan), hohe Vulnerabilität (arm, wenig Infrastruktur, wenig Frühwarnung). Napoli: hohe Exposition, aber niedrigere Vulnerabilität (Frühwarnsysteme, Evakuierungspläne, Wirtschaftskraft). Goma: Vorhersage und Evakuierung am schwierigsten, da wenig Zeit und wenige Fluchtmöglichkeiten.",
      "pruefkriterien": [
        "Risiko als Produkt aus Hazard, Exposition und Vulnerabilität erklärt",
        "Goma und Napoli in Exposition und Vulnerabilität unterschieden",
        "konkrete Risikominderung benannt (Frühwarnung, Evakuierung, Raumplanung, Vorsorge)",
        "2 bis 3 Sätze"
      ],
      "moegliche_fehler": [
        "Risiko mit Gefahr gleichgesetzt",
        "Nur die Entfernung zum Vulkan betrachtet",
        "Vulnerabilität als 'Gefährlichkeit' missverstanden"
      ],
      "kompetenz": ["Urteilskompetenz", "Handlungskompetenz"],
      "quellen": ["wiki:concepts/vulnerabilitaet-begriffe.md", "wiki:concepts/vulnerabilitaet-raumbeispiele.md"]
    }
  ],
  "kartenstuecke": [
    {
      "id": "subduktionszone_pazifik",
      "name": "Subduktionszonen des Pazifiks",
      "station": 1,
      "svg_id": "piece-subduktion",
      "farbe": "#c0392b",
      "hinweis": "Ring of Fire: Feuerkette entlang der pazifischen Subduktionszonen."
    },
    {
      "id": "hotspot_hawaii",
      "name": "Hawaii-Hot-Spot",
      "station": 2,
      "svg_id": "piece-hotspot",
      "farbe": "#e67e22",
      "hinweis": "Vulkankette mit Alterungsgradienten in Richtung Nordwesten."
    },
    {
      "id": "maar_eifel",
      "name": "Maar-Feld der Eifel",
      "station": 3,
      "svg_id": "piece-maar",
      "farbe": "#8e44ad",
      "hinweis": "Laacher See und Dauner Maare — phreatomagmatische Felder in der Eifel."
    },
    {
      "id": "lip_deccan",
      "name": "Deccan-Trapp",
      "station": 4,
      "svg_id": "piece-lip",
      "farbe": "#16a085",
      "hinweis": "Eine der größten vulkanischen Provinzen der Erde, ~500.000 km²."
    },
    {
      "id": "risiko_nyiragongo",
      "name": "Nyiragongo und Goma",
      "station": 5,
      "svg_id": "piece-risiko",
      "farbe": "#2c3e50",
      "hinweis": "Aktiver Vulkan mit extrem flüssigen Lavaströmen in dicht besiedeltem Gebiet."
    }
  ]
};
