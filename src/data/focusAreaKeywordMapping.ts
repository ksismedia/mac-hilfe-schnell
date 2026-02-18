// Maps focus area IDs to keyword patterns that belong to each focus area
// Keywords matching these patterns will be included when the focus area is selected

export const focusAreaKeywordMapping: Record<string, Record<string, string[]>> = {
  shk: {
    heizung: [
      'heizung', 'heizungsbau', 'heizungssanierung', 'heizungsoptimierung', 'heizkessel',
      'brenner', 'thermostat', 'heizkörper', 'fußbodenheizung', 'gasheizung', 'ölheizung',
      'fernwärme', 'heizungstechnik', 'heizungswartung'
    ],
    sanitaer: [
      'sanitär', 'bad', 'badezimmer', 'dusche', 'wc', 'toilette', 'rohrreinigung',
      'badsanierung', 'badplanung', 'badumbau', 'badmodernisierung', 'badausstattung',
      'badrenovierung', 'badeinrichtung', 'badfliesen', 'badkeramik', 'badmöbel',
      'badewanne', 'badgarnitur', 'badezimmersanierung',
      'sanitärinstallation', 'wasserinstallation', 'abwasser', 'rohrleitungsbau',
      'sanitärtechnik', 'wassertechnik', 'rohrverlegung', 'sanitärkeramik',
      'armaturen', 'wasserhahn', 'spüle', 'waschbecken', 'bidet'
    ],
    klima: [
      'klima', 'klimaanlage', 'lüftung', 'klimatechnik', 'lüftungstechnik',
      'belüftung', 'entlüftung', 'raumlufttechnik', 'luftqualität',
      'wohnraumlüftung', 'klimaservice'
    ],
    solar: [
      'wärmepumpe', 'solarthermie', 'solar', 'photovoltaik', 'erneuerbare'
    ],
    notdienst: [
      'notdienst', 'notfall', 'sofort', '24h', 'schnellservice'
    ],
    wartung: [
      'wartung', 'service', 'installation', 'installateur', 'handwerker', 'reparatur'
    ],
  },
  maler: {
    innenanstrich: [
      'innenanstrich', 'raumgestaltung', 'wohnraumgestaltung', 'deckenanstrich',
      'wandanstrich', 'tapeten', 'vliestapete', 'rauhfaser', 'strukturputz',
      'dekorputz', 'spachteltechnik', 'lasurtechnik', 'wischtechnik',
      'tapezieren', 'streichen', 'wandgestaltung', 'farbe'
    ],
    aussenanstrich: [
      'fassade', 'fassadenanstrich', 'fassadensanierung', 'fassadenreinigung',
      'fassadendämmung', 'außenanstrich', 'fassadengestaltung', 'putz'
    ],
    lackierung: [
      'lackierung', 'lackierer', 'holzlackierung', 'metalllackierung', 'möbellackierung',
      'türenlackierung', 'fensterlackierung', 'heizkörperlackierung',
      'korrosionsschutz', 'grundierung'
    ],
    tapezieren: [
      'tapezieren', 'tapeten', 'vliestapete', 'rauhfaser', 'wandgestaltung'
    ],
    daemmung: [
      'wärmedämmung', 'vollwärmeschutz', 'fassadendämmung', 'dämmung'
    ],
    bodenbelaege: [
      'bodenbelag', 'laminat', 'parkett', 'vinyl', 'pvc', 'teppichboden',
      'fliesen', 'bodenbeschichtung', 'estrich', 'bodenverlegung', 'bodensanierung'
    ],
  },
  elektriker: {
    installation: [
      'elektro', 'elektriker', 'installation', 'elektroinstallation', 'strom',
      'kabel', 'sicherung', 'steckdose', 'lichtschalter', 'elektrotechnik',
      'elektroplanung', 'hauselektrik', 'gebäudeelektrik', 'industrieelektrik',
      'kabelverlegung', 'leitungsverlegung', 'verteilerbau', 'schaltschrankbau',
      'sicherungskasten', 'fi-schutzschalter', 'überspannungsschutz'
    ],
    smarthome: [
      'smart home', 'hausautomation', 'gebäudeautomation', 'smarthome', 'iot',
      'vernetzung', 'smart-home-system', 'intelligente-steuerung', 'app-steuerung',
      'sprachsteuerung', 'sensortechnik', 'überwachungstechnik'
    ],
    photovoltaik: [
      'photovoltaik', 'solar', 'solaranlage', 'photovoltaikanlage', 'pv-anlage',
      'solartechnik', 'energiespeicher', 'batteriespeicher', 'netzeinspeisung'
    ],
    sicherheitstechnik: [
      'sicherheitstechnik', 'alarmanlage', 'videoüberwachung', 'zutrittskontrolle'
    ],
    beleuchtung: [
      'beleuchtung', 'led-beleuchtung', 'außenbeleuchtung', 'innenbeleuchtung',
      'lichtplanung', 'lichtsteuerung', 'dimmer', 'bewegungsmelder', 'zeitschaltuhr',
      'notbeleuchtung', 'sicherheitsbeleuchtung', 'gartenbeleuchtung'
    ],
    emobility: [
      'wallbox', 'elektromobilität', 'ladesäule', 'energiemanagement', 'e-mobilität'
    ],
  },
  dachdecker: {
    steildach: [
      'steildach', 'satteldach', 'walmdach', 'pultdach', 'mansarddach', 'tonnendach',
      'sheddach', 'dachziegel', 'dachstein', 'tonziegel', 'betondachstein',
      'schieferplatte', 'holzschindel'
    ],
    flachdach: [
      'flachdach', 'flachdachabdichtung', 'bitumen', 'schweißbahn', 'kunststoffbahn',
      'epdm', 'tpo', 'pvc-folie'
    ],
    dachsanierung: [
      'dachsanierung', 'dach', 'dachdecker', 'dachdeckung', 'bedachung', 'dachaufbau'
    ],
    daemmung: [
      'dachdämmung', 'zwischensparrendämmung', 'aufsparrendämmung', 'untersparrendämmung',
      'wärmedämmung', 'dampfsperre', 'dampfbremse', 'unterspannbahn', 'unterdeckbahn'
    ],
    dachfenster: [
      'dachfenster', 'dachgaube', 'lichtkuppel', 'oberlicht'
    ],
    fassade: [
      'fassade', 'fassadenverkleidung', 'metalldach', 'blechdach', 'kupferdach',
      'zinkdach', 'trapezblech', 'wellblech'
    ],
  },
  stukateur: {
    innenputz: [
      'innenputz', 'grundputz', 'oberputz', 'edelputz', 'strukturputz', 'reibeputz',
      'kratzputz', 'scheibenputz', 'mineralputz', 'silikatputz', 'silikonputz',
      'kunstharzputz', 'kalkputz', 'lehmputz', 'gipsputz', 'zementputz'
    ],
    aussenputz: [
      'außenputz', 'fassade', 'putz', 'verputz', 'sanierung'
    ],
    trockenbau: [
      'trockenbau', 'gipskarton', 'trockenbauwand', 'vorsatzschale', 'ständerwand',
      'metallständer', 'gipskartonplatte', 'gipsfaserplatte', 'osb-platte',
      'rigips', 'knauf', 'abhangdecke', 'unterdecke', 'akustikdecke'
    ],
    stuck: [
      'stuck', 'stuckateur', 'stuckarbeiten', 'stuckrestaurierung', 'stuckprofile',
      'stuckleisten', 'stuckrosetten', 'stuck-ornamente', 'gipsstuck',
      'kunststoffstuck', 'styroporstuck', 'polyurethanstuck', 'profilleisten', 'zierleisten'
    ],
    wdvs: [
      'wärmedämmung', 'dämmung', 'innendämmung', 'kerndämmung', 'perimeterdämmung',
      'kellerdämmung', 'bodendämmung', 'deckendämmung', 'wanddämmung', 'dämmstoff',
      'mineralwolle', 'steinwolle', 'glaswolle', 'polystyrol', 'polyurethan'
    ],
    estrich: [
      'estrich', 'bodenbelag', 'bodenbeschichtung'
    ],
  },
  planungsbuero: {
    architektur: [
      'architektur', 'objektplanung', 'bauplanung', 'ausführungsplanung',
      'entwurfsplanung', 'genehmigungsplanung', 'werkplanung', 'detailplanung'
    ],
    bauleitung: [
      'bauleitung', 'projektierung', 'consulting', 'planung', 'planungsbüro',
      'ingenieurbüro', 'fachplanung', 'technische-planung'
    ],
    energieberatung: [
      'energieplanung', 'energiekonzept', 'energieberatung', 'energieausweis',
      'nachhaltigkeit', 'green-building', 'passivhaus', 'nullenergiehaus',
      'plusenergiehaus', 'kfw-standard', 'leed', 'breeam', 'dgnb'
    ],
    tragwerksplanung: [
      'tragwerksplanung', 'statik', 'bemessung'
    ],
    brandschutz: [
      'brandschutzplanung', 'brandschutz', 'sicherheitstechnik'
    ],
    gebaeudetechnik: [
      'gebäudetechnik', 'haustechnik', 'versorgungstechnik', 'technikplanung',
      'heizungsplanung', 'lüftungsplanung', 'sanitärplanung', 'elektroplanung',
      'msr-technik', 'automation', 'gebäudeleittechnik',
      'cad-planung', 'bim', 'building-information-modeling', '3d-planung',
      'simulation', 'energiesimulation'
    ],
  },
  'facility-management': {
    gebaeudereinigung: [
      'reinigung', 'gebäudereinigung', 'büroreinigung', 'unterhaltsreinigung',
      'grundreinigung', 'glasreinigung', 'fensterreinigung', 'teppichreinigung',
      'industriereinigung', 'sonderreinigung', 'desinfektionsreinigung',
      'praxisreinigung', 'ladenreinigung', 'restaurantreinigung', 'hotelreinigung',
      'schulreinigung'
    ],
    haustechnik: [
      'wartung', 'instandhaltung', 'technischer service', 'anlagenwartung',
      'haustechnik', 'gebäudetechnik', 'klimawartung', 'heizungswartung',
      'aufzugswartung', 'störungsdienst', 'reparaturdienst', 'kleinreparaturen',
      'handwerkerdienste', 'hausmeisterdienst', 'hausmeister'
    ],
    winterdienst: [
      'winterdienst', 'schneeräumung', 'streudienst', 'gehwegreinigung'
    ],
    gruenpflege: [
      'grünpflege', 'gartenpflege', 'landschaftspflege', 'außenanlagenpflege',
      'rasenpflege', 'heckenschnitt', 'baumschnitt', 'unkrautentfernung',
      'bewässerung', 'spielplatzwartung', 'parkplatzreinigung'
    ],
    sicherheit: [
      'sicherheitsdienst', 'pförtnerdienst', 'empfangsdienst', 'kontrolldienst',
      'objektschutz', 'überwachung', 'zutrittskontrolle', 'werkschutz',
      'bewachung', 'sicherheitskonzept', 'alarmanlage', 'videoüberwachung'
    ],
    energiemanagement: [
      'energiemanagement', 'energieoptimierung', 'energieeffizienz',
      'verbrauchsmanagement', 'nachhaltigkeit', 'energiecontrolling',
      'energiemonitoring'
    ],
  },
  holzverarbeitung: {
    schreinerei: [
      'schreiner', 'schreinerei', 'tischler', 'tischlerei', 'handwerk',
      'maßanfertigung', 'holzbearbeitung', 'hobeln', 'sägen', 'fräsen',
      'verbindungen', 'holzverbindungen'
    ],
    zimmerei: [
      'zimmerei', 'holz', 'holzbau', 'dachstuhl', 'holzkonstruktion'
    ],
    moebelbau: [
      'möbel', 'möbelbau', 'einbauschrank', 'massivholz', 'furnierte',
      'küche', 'restaurierung', 'antike möbel'
    ],
    fenster: [
      'fenster', 'türen', 'holzfenster', 'holztüren'
    ],
    treppen: [
      'treppen', 'treppenbau'
    ],
    holzfassade: [
      'holzfassade', 'fassade', 'verkleidung'
    ],
  },
  baeckerei: {
    brot: ['brot', 'brötchen', 'backwaren', 'vollkorn', 'sauerteig'],
    kuchen: ['kuchen', 'torten', 'gebäck', 'sahnetorte'],
    konditorei: ['konditorei', 'patisserie', 'praline', 'konfekt'],
    snacks: ['snacks', 'belegte brötchen', 'imbiss', 'mittagstisch'],
    cafe: ['café', 'bistro', 'kaffee', 'frühstück'],
    lieferservice: ['lieferservice', 'catering', 'bestellung', 'liefern'],
  },
  blechbearbeitung: {
    dachrinnen: [
      'dachrinnen', 'entwässerung', 'rinne', 'fallrohr', 'regenrinne'
    ],
    fassadenverkleidung: [
      'fassadenverkleidung', 'fassade', 'verkleidung', 'blechfassade'
    ],
    metallbau: [
      'metallbau', 'metall', 'stahl', 'edelstahl', 'aluminium'
    ],
    schweissen: [
      'schweißarbeiten', 'schweißen', 'wig', 'mig', 'mag'
    ],
    blechzuschnitt: [
      'blechzuschnitt', 'blechbearbeitung', 'kantung', 'abkantung', 'stanzen'
    ],
    spenglerei: [
      'spenglerei', 'klempnerei', 'klempner', 'spengler', 'blechner'
    ],
  },
  innenausbau: {
    trockenbau: [
      'trockenbau', 'gipskarton', 'rigips', 'trockenbauwand', 'ständerwand',
      'vorsatzschale', 'trennwand'
    ],
    akustik: [
      'akustikdecken', 'akustikwände', 'akustik', 'schallschutz', 'schalldämmung',
      'raumakustik'
    ],
    bodenbelaege: [
      'bodenbeläge', 'boden', 'parkett', 'laminat', 'vinyl', 'teppich',
      'designboden', 'industrieboden'
    ],
    ladenbau: [
      'ladenbau', 'ladenausbau', 'shopfitting', 'einzelhandel', 'verkaufsraum'
    ],
    messebau: [
      'messebau', 'messestand', 'ausstellungsbau', 'eventbau'
    ],
    bueroausbau: [
      'büroausbau', 'büroeinrichtung', 'objektausbau', 'gewerbebau'
    ],
    brandschutz: [
      'brandschutz', 'brandschutzverkleidung', 'feuerschutz', 'brandschutztür'
    ],
    altbausanierung: [
      'altbausanierung', 'sanierung', 'renovierung', 'modernisierung', 'umbau'
    ],
  },
};
