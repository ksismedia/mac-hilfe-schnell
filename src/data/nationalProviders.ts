// Überregionale Großanbieter für verschiedene Branchen
// Diese werden nur zur Referenz angezeigt und fließen NICHT in die Bewertung ein

export interface NationalProvider {
  name: string;
  industry: string;
  services: string[];
  website: string;
  description: string;
  coverage: string; // z.B. "Deutschlandweit" oder "Baden-Württemberg, Bayern, Hessen"
}

// SHK-Branche: Große überregionale Anbieter
export const shkNationalProviders: NationalProvider[] = [
  {
    name: 'Thermondo',
    industry: 'shk',
    services: [
      'Heizungsinstallation',
      'Wärmepumpen',
      'Gas-Brennwertheizung',
      'Öl-Brennwertheizung',
      'Heizungswartung',
      'Fördermittelberatung',
      'Energieberatung',
      'Smart-Home-Integration'
    ],
    website: 'thermondo.de',
    description: 'Deutschlands größter Heizungsinstallateur',
    coverage: 'Deutschlandweit'
  },
  {
    name: '1komma5°',
    industry: 'shk',
    services: [
      'Wärmepumpen',
      'Photovoltaik',
      'Stromspeicher',
      'Wallbox',
      'Energiemanagement',
      'Smart-Home-Integration',
      'Komplettlösungen Energie',
      'Fördermittelberatung'
    ],
    website: '1komma5.com',
    description: 'Anbieter für erneuerbare Energiesysteme',
    coverage: 'Deutschlandweit (über lokale Partner)'
  },
  {
    name: 'Enpal',
    industry: 'shk',
    services: [
      'Photovoltaik (Mietmodell)',
      'Wärmepumpen',
      'Stromspeicher',
      'Wallbox',
      'Energiemanagement',
      'Cloud-Lösung',
      'Rundum-Service'
    ],
    website: 'enpal.de',
    description: 'Solar- und Wärmepumpen-Anbieter mit Mietmodell',
    coverage: 'Deutschlandweit'
  },
  {
    name: 'Kesselheld',
    industry: 'shk',
    services: [
      'Heizungsinstallation',
      'Heizungswartung',
      'Gas-Brennwertheizung',
      'Öl-Brennwertheizung',
      'Wärmepumpen',
      'Online-Angebotsrechner',
      'Festpreisgarantie'
    ],
    website: 'kesselheld.de',
    description: 'Online-Plattform für Heizungsinstallation',
    coverage: 'Deutschlandweit (über Partner-Handwerker)'
  }
];

// Funktion um Anbieter nach Branche zu filtern
export const getNationalProvidersByIndustry = (industry: string): NationalProvider[] => {
  switch (industry) {
    case 'shk':
      return shkNationalProviders;
    // Weitere Branchen können hier ergänzt werden
    case 'elektriker':
      return []; // Für spätere Erweiterung
    case 'dachdecker':
      return []; // Für spätere Erweiterung
    default:
      return [];
  }
};

// Prüft ob für eine Branche überregionale Anbieter verfügbar sind
export const hasNationalProviders = (industry: string): boolean => {
  return getNationalProvidersByIndustry(industry).length > 0;
};
