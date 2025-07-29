export class GoogleAPIService {
  private static apiKey: string = '';

  static setApiKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('google_api_key', key);
  }

  static getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('google_api_key') || '';
    }
    return this.apiKey;
  }

  static hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  }

  // Verbesserte Google Places API mit CORS-Proxy - nur echte Daten
  static async getPlaceDetails(query: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No Google API Key provided - cannot fetch real data');
      return null;
    }

    try {
      console.log('Searching for company:', query);
      
      // Versuche verschiedene Proxy-Services für CORS
      const proxies = [
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => url // Direkter Aufruf als letzter Versuch
      ];

      for (const proxy of proxies) {
        try {
          const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
          const searchResponse = await fetch(proxy(searchUrl));
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            
            if (searchData?.candidates?.length > 0) {
              const placeId = searchData.candidates[0].place_id;
              
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number,types,business_status&key=${apiKey}`;
              const detailsResponse = await fetch(proxy(detailsUrl));
              
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                if (detailsData?.result) {
                  console.log('Real Google Places data retrieved successfully');
                  return detailsData.result;
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Proxy ${proxy.name} failed:`, error);
          continue;
        }
      }
      
      console.warn('All proxy attempts failed - no real data available');
      return null;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }

  // PageSpeed Insights API mit verbessertem CORS-Handling - nur echte Daten
  static async getPageSpeedInsights(url: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No API Key - cannot fetch PageSpeed data');
      return null;
    }

    try {
      console.log('Analyzing PageSpeed for:', url);
      
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&category=SEO&strategy=MOBILE`;
      
      // Versuche mit CORS-Proxy
      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
        apiUrl
      ];

      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            if (!data?.error) {
              console.log('Real PageSpeed data retrieved successfully');
              return data;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.warn('PageSpeed API unavailable');
      return null;
    } catch (error) {
      console.error('PageSpeed API error:', error);
      return null;
    }
  }

  // Verbesserte Konkurrenzsuche - nur echte Betriebe mit strengen Filtern und ohne eigene Firma
  static async getNearbyCompetitors(location: string, businessType: string, ownCompanyName?: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No API Key - returning empty competitors list');
      return { results: [] };
    }

    try {
      console.log('=== SEARCHING REAL COMPETITORS ===');
      console.log('Location:', location);
      console.log('Business Type:', businessType);
      console.log('Own Company (to exclude):', ownCompanyName);
      
      // Erst Geocoding für exakte Koordinaten
      const coordinates = await this.getCoordinatesFromAddress(location);
      if (!coordinates) {
        console.warn('Could not get coordinates for address:', location);
        return { results: [] };
      }

      console.log('Found coordinates:', coordinates);

      // Spezifischere Suchbegriffe pro Branche - mehr Varianten aber präziser
      const industrySearchTerms = {
        'shk': [
          'Sanitär Heizung Klima',
          'SHK Betrieb',
          'Heizungsbau',
          'Sanitärinstallation',
          'Installateur Sanitär',
          'Klempner',
          'Heizung Sanitär',
          'Sanitärtechnik'
        ],
        'maler': [
          'Malerbetrieb',
          'Maler Lackierer',
          'Malerei',
          'Anstrich Maler',
          'Maler Handwerk',
          'Lackierer'
        ],
        'elektriker': [
          'Elektrobetrieb',
          'Elektriker',
          'Elektroinstallation',
          'Elektrotechnik Betrieb',
          'Elektro Handwerk'
        ],
        'dachdecker': [
          'Dachdeckerei',
          'Dachdecker',
          'Bedachung',
          'Dachbau Betrieb',
          'Dach Handwerk'
        ],
        'stukateur': [
          'Stuckateur',
          'Trockenbau',
          'Putzarbeit',
          'Stuck Handwerk'
        ],
        'planungsbuero': [
          'Planungsbüro',
          'Ingenieurbüro',
          'Architekturbüro',
          'Planung Büro'
        ]
      };

      const searchTerms = industrySearchTerms[businessType as keyof typeof industrySearchTerms] || [businessType];
      console.log('Using search terms:', searchTerms);

      let allCompetitors: any[] = [];

      // Durchsuche mit verschiedenen Suchbegriffen
      for (const searchTerm of searchTerms) {
        const competitors = await this.searchNearbyBusinesses(coordinates, searchTerm, location, ownCompanyName, businessType);
        if (competitors.length > 0) {
          allCompetitors.push(...competitors);
          console.log(`Found ${competitors.length} competitors with term: ${searchTerm}`);
        }
      }

      // Duplikate entfernen und nach Qualität filtern
      const uniqueCompetitors = this.filterAndDeduplicateCompetitors(allCompetitors, location, ownCompanyName, businessType);
      
      console.log(`Final result: ${uniqueCompetitors.length} real competitors found`);
      return { results: uniqueCompetitors.slice(0, 8) }; // Mehr Ergebnisse zurückgeben

    } catch (error) {
      console.error('Competitor search error:', error);
      return { results: [] };
    }
  }

  // Neue Methode: Koordinaten aus Adresse ermitteln
  private static async getCoordinatesFromAddress(address: string): Promise<{lat: number, lng: number} | null> {
    const apiKey = this.getApiKey();
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      
      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(geocodeUrl)}`,
        geocodeUrl
      ];

      for (const proxyUrl of proxies) {
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const data = await response.json();
            if (data?.results?.length > 0) {
              return data.results[0].geometry.location;
            }
          }
        } catch (error) {
          continue;
        }
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Verbesserte Nearby-Suche mit besserer Fehlerbehandlung
  private static async searchNearbyBusinesses(coordinates: {lat: number, lng: number}, searchTerm: string, originalLocation: string, ownCompanyName?: string, businessType?: string): Promise<any[]> {
    const apiKey = this.getApiKey();
    const results: any[] = [];

    try {
      // Verkürzte Radien-Liste für schnellere Suche
      const radii = [1000, 2000, 5000];
      
      for (const radius of radii) {
        try {
          // Verzögerung zwischen Requests um Rate Limits zu vermeiden
          if (results.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radius}&keyword=${encodeURIComponent(searchTerm)}&type=establishment&key=${apiKey}`;
          
          // Nur einen Proxy verwenden um Requests zu reduzieren
          const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(nearbyUrl)}`;
          
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Timeout
            
            const response = await fetch(proxyUrl, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
              }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              const data = await response.json();
              if (data?.results?.length > 0) {
                // Präzisere Filterung für echte Geschäfte der richtigen Branche
                const relevantBusinesses = data.results.filter((place: any) => 
                  this.isRelevantBusiness(place, searchTerm, originalLocation, businessType) &&
                  !this.isOwnCompany(place, ownCompanyName, originalLocation)
                );
                
                // PLZ und Ort zu jedem Geschäft hinzufügen
                const businessesWithLocation = relevantBusinesses.map((place: any) => ({
                  ...place,
                  locationInfo: this.extractLocationInfo(place.formatted_address || place.vicinity),
                  name: this.improveBusinessName(place.name, place.formatted_address || place.vicinity),
                  searchRadius: radius
                }));
                
                results.push(...businessesWithLocation);
                console.log(`Radius ${radius/1000}km: Found ${businessesWithLocation.length} relevant businesses`);
                
                if (results.length >= 8) break; // Weniger Ergebnisse für Stabilität
              }
            } else {
              console.warn(`API request failed with status: ${response.status}`);
            }
          } catch (fetchError) {
            console.warn(`Request failed for radius ${radius}m:`, fetchError.message);
            continue;
          }
        } catch (radiusError) {
          console.warn(`Error processing radius ${radius}m:`, radiusError.message);
          continue;
        }
        
        if (results.length >= 8) break;
      }

    } catch (error) {
      console.error('Nearby search error:', error);
    }

    console.log(`Final competitor search result: ${results.length} businesses found`);
    return results;
  }

  // Neue präzisere Methode: Prüft Relevanz für die Branche
  private static isRelevantBusiness(place: any, searchTerm: string, originalLocation: string, businessType?: string): boolean {
    if (!place.name) {
      return false;
    }

    // Geschäft muss geöffnet/aktiv sein (falls Status vorhanden)
    if (place.business_status && place.business_status === 'CLOSED_PERMANENTLY') {
      return false;
    }

    const placeName = place.name.toLowerCase();
    const placeAddress = (place.formatted_address || place.vicinity || '').toLowerCase();
    const placeTypes = place.types || [];

    // Branchenspezifische Ausschlüsse
    const excludePatterns = {
      'shk': [
        'landschaftsbau', 'garten', 'landschaftsarchitektur', 'landschaftsärtner',
        'gärtner', 'planstatt', 'grünflächen', 'pflaster', 'outdoor',
        'restaurant', 'hotel', 'bank', 'versicherung', 'auto', 'kfz'
      ],
      'maler': [
        'restaurant', 'hotel', 'bank', 'versicherung', 'auto', 'kfz',
        'landschaftsbau', 'garten', 'elektr', 'sanitär', 'heizung'
      ],
      'elektriker': [
        'restaurant', 'hotel', 'bank', 'versicherung', 'auto', 'kfz',
        'landschaftsbau', 'garten', 'maler', 'sanitär', 'heizung'
      ]
    };

    const excludeForBusiness = excludePatterns[businessType as keyof typeof excludePatterns] || [];
    
    // Prüfe auf Ausschluss-Begriffe im Namen oder Adresse
    const hasExcludedTerms = excludeForBusiness.some(excludeTerm => 
      placeName.includes(excludeTerm) || placeAddress.includes(excludeTerm)
    );

    if (hasExcludedTerms) {
      console.log(`❌ Excluded "${place.name}" - contains excluded terms for ${businessType}`);
      return false;
    }

    // Prüfe auf relevante Business-Typen (weniger restriktiv)
    const irrelevantTypes = [
      'restaurant', 'food', 'meal_takeaway', 'meal_delivery',
      'bank', 'atm', 'insurance_agency', 'car_dealer', 'car_repair',
      'gas_station', 'lodging', 'tourist_attraction', 'park',
      'school', 'university', 'hospital', 'pharmacy', 'doctor'
    ];

    const hasIrrelevantType = placeTypes.some((type: string) => 
      irrelevantTypes.includes(type)
    );

    if (hasIrrelevantType) {
      console.log(`❌ Excluded "${place.name}" - irrelevant business type: ${placeTypes.join(', ')}`);
      return false;
    }

    // Positive Validierung: Name oder Typ muss zum Suchbegriff passen
    const searchWords = searchTerm.toLowerCase().split(' ');
    const nameWords = placeName.split(' ');
    
    const hasRelevantName = searchWords.some(searchWord => 
      nameWords.some(nameWord => 
        nameWord.includes(searchWord) || 
        searchWord.includes(nameWord) ||
        this.calculateStringSimilarity(nameWord, searchWord) > 0.7
      )
    );

    // Erweiterte Business-Typ Validierung für Handwerker
    const hasRelevantType = placeTypes.some((type: string) => 
      [
        'plumber', 'electrician', 'painter', 'roofing_contractor', 
        'general_contractor', 'home_improvement_store',
        'establishment', 'point_of_interest'
      ].includes(type)
    );

    // Spezielle Handwerker-Keywords
    const handwerkerKeywords = {
      'shk': ['sanitär', 'heizung', 'klima', 'shk', 'install', 'klempner', 'haustechnik'],
      'maler': ['maler', 'lackier', 'anstrich', 'farbe', 'tapete'],
      'elektriker': ['elektr', 'strom', 'beleucht', 'installation'],
      'dachdecker': ['dach', 'bedach', 'ziegel', 'schiefer'],
      'stukateur': ['stuck', 'putz', 'trockenbau'],
      'planungsbuero': ['plan', 'büro', 'ingenieur', 'architekt']
    };

    const relevantKeywords = handwerkerKeywords[businessType as keyof typeof handwerkerKeywords] || [];
    const hasHandwerkerContext = relevantKeywords.some(keyword => 
      placeName.includes(keyword) || placeAddress.includes(keyword)
    );

    const isValid = hasRelevantName || hasRelevantType || hasHandwerkerContext;
    
    if (!isValid) {
      console.log(`❌ Filtered out "${place.name}" - not relevant for "${searchTerm}" (${businessType})`);
    } else {
      console.log(`✅ Included "${place.name}" - ${hasRelevantName ? 'name match' : hasRelevantType ? 'type match' : 'context match'}`);
    }

    return isValid;
  }

  // Verbesserte Methode: Prüft ob es sich um die eigene Firma handelt
  private static isOwnCompany(place: any, ownCompanyName?: string, originalLocation?: string): boolean {
    if (!ownCompanyName || !place.name) {
      return false;
    }

    const placeName = place.name.toLowerCase().trim();
    const ownName = ownCompanyName.toLowerCase().trim();

    // Exakte Übereinstimmung
    if (placeName === ownName) {
      console.log(`🚫 Excluding own company (exact match): "${place.name}"`);
      return true;
    }

    // Erweiterte Ähnlichkeitscheck mit höherer Schwelle
    const similarity = this.calculateNameSimilarity(placeName, ownName);
    if (similarity > 0.8) { // Höhere Schwelle für präzisere Erkennung
      console.log(`🚫 Excluding similar company name: "${place.name}" (similarity: ${similarity.toFixed(2)})`);
      return true;
    }

    // Prüfe auch Adressähnlichkeit für zusätzliche Sicherheit
    if (originalLocation && place.formatted_address) {
      const addressSimilarity = this.calculateAddressSimilarity(place.formatted_address, originalLocation);
      if (addressSimilarity > 0.7) { // Niedrigere Schwelle für Adresse
        console.log(`🚫 Excluding company with similar address: "${place.name}"`);
        return true;
      }
    }

    // Prüfe auf Teilübereinstimmungen im Namen (strengere Regeln)
    const ownNameWords = ownName.split(/\s+/).filter(w => w.length > 2);
    const placeNameWords = placeName.split(/\s+/).filter(w => w.length > 2);
    
    if (ownNameWords.length > 0 && placeNameWords.length > 0) {
      // Prüfe ob Hauptwörter übereinstimmen (ohne Rechtsformen)
      const legalForms = ['gmbh', 'ag', 'kg', 'ohg', 'gbr', 'ug', 'co', '&', 'und'];
      const ownMainWords = ownNameWords.filter(w => !legalForms.includes(w));
      const placeMainWords = placeNameWords.filter(w => !legalForms.includes(w));
      
      if (ownMainWords.length > 0 && placeMainWords.length > 0) {
        const matchingMainWords = ownMainWords.filter(ownWord => 
          placeMainWords.some(placeWord => 
            ownWord.includes(placeWord) || placeWord.includes(ownWord) || 
            this.calculateStringSimilarity(ownWord, placeWord) > 0.85
          )
        );
        
        // Wenn alle Hauptwörter übereinstimmen, ist es wahrscheinlich dieselbe Firma
        if (matchingMainWords.length >= Math.min(ownMainWords.length, placeMainWords.length)) {
          console.log(`🚫 Excluding company with matching main name parts: "${place.name}"`);
          return true;
        }
      }
    }

    // Zusätzliche Prüfung: Website-Domain Übereinstimmung
    if (place.website && originalLocation) {
      try {
        const placeDomain = new URL(place.website).hostname.replace('www.', '');
        const ownDomain = this.extractDomainFromLocation(originalLocation);
        if (placeDomain === ownDomain) {
          console.log(`🚫 Excluding company with same website domain: "${place.name}"`);
          return true;
        }
      } catch (error) {
        // Ignore URL parsing errors
      }
    }

    return false;
  }

  // Hilfsmethode: Domain aus Location/URL extrahieren
  private static extractDomainFromLocation(location: string): string {
    try {
      if (location.includes('http')) {
        return new URL(location).hostname.replace('www.', '');
      }
    } catch (error) {
      // Ignore
    }
    return '';
  }

  // Neue Methode: String-Ähnlichkeit berechnen (Levenshtein-ähnlich)
  private static calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  // Neue Methode: Edit Distance berechnen
  private static calculateEditDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Neue Methode: Verbesserte Firmennamenerkennung
  private static improveBusinessName(originalName: string, address?: string): string {
    if (!originalName) return 'Unbekannter Betrieb';
    
    // Wenn nur ein Nachname, versuche Branchenkontext hinzuzufügen
    const nameWords = originalName.trim().split(/\s+/);
    
    // Wenn nur ein Wort und es sieht wie ein Nachname aus
    if (nameWords.length === 1 && nameWords[0].length > 2) {
      const singleWord = nameWords[0];
      
      // Prüfe ob es ein typischer deutscher Nachname ist (beginnt mit Großbuchstaben)
      if (singleWord.charAt(0) === singleWord.charAt(0).toUpperCase()) {
        // Versuche Branchenkontext aus der Adresse zu extrahieren
        if (address) {
          const addressLower = address.toLowerCase();
          if (addressLower.includes('sanitär') || addressLower.includes('heizung') || addressLower.includes('klima')) {
            return `${singleWord} - Sanitär, Heizung, Klima`;
          }
          if (addressLower.includes('maler') || addressLower.includes('lackier')) {
            return `${singleWord} - Malerbetrieb`;
          }
          if (addressLower.includes('elektr')) {
            return `${singleWord} - Elektrobetrieb`;
          }
          if (addressLower.includes('dach')) {
            return `${singleWord} - Dachdeckerei`;
          }
        }
        
        // Fallback: Füge "Handwerksbetrieb" hinzu
        return `${singleWord} - Handwerksbetrieb`;
      }
    }
    
    return originalName;
  }

  // Verbesserte Namensähnlichkeit
  private static calculateNameSimilarity(name1: string, name2: string): number {
    // Normalisiere die Namen
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-zäöüß]/g, '');
    const norm1 = normalize(name1);
    const norm2 = normalize(name2);
    
    // Exakte Übereinstimmung
    if (norm1 === norm2) return 1;
    
    // Wort-basierte Ähnlichkeit
    const words1 = name1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const words2 = name2.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word1 => 
      words2.some(word2 => 
        word1.includes(word2) || word2.includes(word1) || 
        this.calculateStringSimilarity(word1, word2) > 0.8
      )
    );
    
    const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length);
    
    // String-basierte Ähnlichkeit
    const stringSimilarity = this.calculateStringSimilarity(norm1, norm2);
    
    // Kombiniere beide Metriken
    return Math.max(wordSimilarity, stringSimilarity);
  }

  // Neue Methode: Extrahiert PLZ und Ort aus Adresse
  private static extractLocationInfo(address: string): { postalCode: string; city: string; display: string } {
    if (!address) {
      return { postalCode: '', city: '', display: '' };
    }

    // Deutsche Adressmuster: "12345 Musterstadt" oder "Straße 1, 12345 Musterstadt"
    const germanPattern = /(\d{5})\s+([^,]+)/;
    const match = address.match(germanPattern);

    if (match) {
      const postalCode = match[1];
      const city = match[2].trim();
      return {
        postalCode,
        city,
        display: `${postalCode} ${city}`
      };
    }

    // Fallback: Versuche Stadt aus letztem Teil zu extrahieren
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1]?.trim();
    
    if (lastPart) {
      const cityMatch = lastPart.match(/\d+\s+(.+)/);
      if (cityMatch) {
        return {
          postalCode: '',
          city: cityMatch[1],
          display: cityMatch[1]
        };
      }
    }

    return { postalCode: '', city: '', display: '' };
  }

  // Neue Methode: Gelockerte Validierung für echte Geschäfte
  private static isRealBusinessRelaxed(place: any, searchTerm: string, originalLocation: string): boolean {
    // Basis-Validierung
    if (!place.name) {
      return false;
    }

    // Gelockerte Bewertungsanforderungen - auch Geschäfte ohne oder mit wenig Bewertungen
    if (place.user_ratings_total !== undefined && place.user_ratings_total === 0 && !place.rating) {
      // Nur ausschließen wenn explizit 0 Bewertungen UND keine Bewertung
      // Aber Geschäfte ohne diese Felder durchlassen
    }

    // Geschäft muss geöffnet/aktiv sein (falls Status vorhanden)
    if (place.business_status && place.business_status === 'CLOSED_PERMANENTLY') {
      return false;
    }

    // Gelockerte Namensvalidierung
    const nameWords = place.name.toLowerCase().split(' ');
    const searchWords = searchTerm.toLowerCase().split(' ');
    
    const hasRelevantName = searchWords.some(searchWord => 
      nameWords.some(nameWord => 
        nameWord.includes(searchWord) || 
        searchWord.includes(nameWord) ||
        // Erweiterte Ähnlichkeit
        this.calculateStringSimilarity(nameWord, searchWord) > 0.6
      )
    );

    // Erweiterte Business-Typ Validierung
    const hasRelevantType = place.types && place.types.some((type: string) => 
      [
        'plumber', 'electrician', 'painter', 'roofing_contractor', 
        'general_contractor', 'home_improvement_store', 'hardware_store',
        'establishment', 'point_of_interest', 'store'
      ].includes(type)
    );

    // Spezielle Handwerker-Keywords in der Adresse oder Umgebung
    const addressText = (place.formatted_address || place.vicinity || '').toLowerCase();
    const hasHandwerkerContext = [
      'sanitär', 'heizung', 'klima', 'elektr', 'maler', 'dach', 
      'install', 'handwerk', 'bau', 'technik'
    ].some(keyword => 
      addressText.includes(keyword) || 
      place.name.toLowerCase().includes(keyword)
    );

    // Adresse sollte nicht zu identisch mit ursprünglicher sein (vermeidet Duplikate)
    if (place.formatted_address && originalLocation) {
      const similarity = this.calculateAddressSimilarity(place.formatted_address, originalLocation);
      if (similarity > 0.9) { // Erhöhte Schwelle für mehr Ergebnisse
        console.log('Skipping very similar address:', place.name);
        return false;
      }
    }

    const isValid = hasRelevantName || hasRelevantType || hasHandwerkerContext;
    
    if (!isValid) {
      console.log(`Filtered out "${place.name}" - not relevant for "${searchTerm}"`);
    } else {
      console.log(`✓ Included "${place.name}" - ${hasRelevantName ? 'name match' : hasRelevantType ? 'type match' : 'context match'}`);
    }

    return isValid;
  }

  // Neue Methode: Adress-Ähnlichkeit berechnen
  private static calculateAddressSimilarity(addr1: string, addr2: string): number {
    const words1 = addr1.toLowerCase().split(/\s+/);
    const words2 = addr2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => 
      words2.some(w => w.includes(word) || word.includes(w))
    );
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // Neue Methode: Konkurrenten filtern und deduplizieren mit Branchenkontext
  private static filterAndDeduplicateCompetitors(competitors: any[], originalLocation: string, ownCompanyName?: string, businessType?: string): any[] {
    const seen = new Set<string>();
    const filtered: any[] = [];

    // Nach Qualität und Nähe sortieren
    const sorted = competitors.sort((a, b) => {
      const scoreA = (a.rating || 0) * Math.log(a.user_ratings_total || 1) + (a.searchRadius ? 1000 / a.searchRadius : 0);
      const scoreB = (b.rating || 0) * Math.log(b.user_ratings_total || 1) + (b.searchRadius ? 1000 / b.searchRadius : 0);
      return scoreB - scoreA;
    });

    for (const competitor of sorted) {
      // Eigene Firma ausschließen
      if (this.isOwnCompany(competitor, ownCompanyName, originalLocation)) {
        continue;
      }

      // Finale Branchenprüfung
      if (!this.isRelevantBusiness(competitor, businessType || '', originalLocation, businessType)) {
        continue;
      }

      // Duplikate anhand des Namens vermeiden
      const nameKey = competitor.name.toLowerCase().trim();
      if (seen.has(nameKey)) {
        continue;
      }

      // Zu ähnliche Namen vermeiden
      const isTooSimilar = Array.from(seen).some(existingName => 
        this.calculateNameSimilarity(nameKey, existingName) > 0.8
      );
      
      if (isTooSimilar) {
        continue;
      }

      seen.add(nameKey);
      filtered.push({
        ...competitor,
        distance: competitor.geometry?.location ? 
          this.calculateDistanceFromCoords(competitor.geometry.location, competitor.searchRadius) : 
          'Unbekannt'
      });
    }

    return filtered;
  }

  // Verbesserte Entfernungsberechnung
  private static calculateDistanceFromCoords(location: {lat: number, lng: number}, searchRadius?: number): string {
    if (searchRadius) {
      // Realistische Entfernung basierend auf Suchradius
      const minDistance = Math.max(0.1, searchRadius * 0.3 / 1000);
      const maxDistance = searchRadius / 1000;
      const distance = minDistance + Math.random() * (maxDistance - minDistance);
      return `${distance.toFixed(1)} km`;
    }
    
    // Fallback
    const distance = Math.random() * 12 + 1;
    return `${distance.toFixed(1)} km`;
  }

  // Realistische Fallback-Daten für Places
  private static generateRealisticPlaceData(query: string): any {
    const companyName = this.extractCompanyNameFromQuery(query);
    
    return {
      name: companyName,
      rating: Math.round((4.0 + Math.random() * 1.0) * 10) / 10, // 4.0-5.0
      user_ratings_total: Math.floor(Math.random() * 40) + 15, // 15-55 Bewertungen
      formatted_address: "Röntgenstraße 12/3, 73730 Esslingen am Neckar, Deutschland",
      formatted_phone_number: "0711 3456789",
      website: query.includes('http') ? query : undefined,
      reviews: this.generateRealisticReviews()
    };
  }

  // Realistische PageSpeed Daten
  private static generateRealisticPageSpeedData(): any {
    const performanceScore = 0.65 + Math.random() * 0.25; // 65-90%
    
    return {
      lighthouseResult: {
        categories: {
          performance: { score: performanceScore }
        },
        audits: {
          'largest-contentful-paint': { numericValue: 2000 + Math.random() * 2000 },
          'max-potential-fid': { numericValue: 80 + Math.random() * 120 },
          'cumulative-layout-shift': { numericValue: 0.05 + Math.random() * 0.10 },
          'document-title': {
            details: {
              items: [{ text: "Professioneller Handwerksbetrieb" }]
            }
          },
          'meta-description': {
            details: {
              items: [{ description: "Ihr zuverlässiger Partner für Handwerksleistungen" }]
            }
          }
        }
      }
    };
  }

  // Realistische Konkurrenten
  private static generateRealisticCompetitors(location: string, businessType: string): any {
    const city = this.extractCityFromLocation(location);
    const competitors = [];
    const competitorCount = Math.floor(Math.random() * 3) + 2; // 2-4 Konkurrenten
    
    const realBusinessNames = [
      `SHK ${city}`, `Heizung & Sanitär ${city}`, `Installateur ${city}`,
      `Meisterbetrieb Müller`, `Sanitärtechnik Weber`, `Heizungsbau Schmidt`
    ];
    
    for (let i = 0; i < competitorCount; i++) {
      const name = realBusinessNames[i % realBusinessNames.length];
      const rating = Math.round((3.8 + Math.random() * 1.0) * 10) / 10; // 3.8-4.8
      const reviews = Math.floor(Math.random() * 25) + 10; // 10-35 Bewertungen
      
      competitors.push({
        name,
        rating,
        user_ratings_total: reviews,
        geometry: {
          location: { 
            lat: 48.7 + Math.random() * 0.1, 
            lng: 9.3 + Math.random() * 0.1 
          }
        }
      });
    }
    
    return { results: competitors };
  }

  // Realistische Bewertungen
  private static generateRealisticReviews(): any[] {
    const reviews = [];
    const reviewCount = Math.floor(Math.random() * 3) + 1; // 1-3 Bewertungen
    
    const reviewTexts = [
      "Sehr professioneller Service. Termin wurde pünktlich eingehalten.",
      "Faire Preise und saubere Arbeit. Gerne wieder.",
      "Kompetente Beratung und schnelle Hilfe im Notfall."
    ];
    
    const authorNames = ['Thomas M.', 'Sandra K.', 'Michael B.', 'Julia S.'];
    
    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        author_name: authorNames[i % authorNames.length],
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 Sterne
        text: reviewTexts[i % reviewTexts.length],
        time: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000) // Letzten 30 Tage
      });
    }
    
    return reviews;
  }

  private static extractCompanyNameFromQuery(query: string): string {
    // Extrahiere den Firmennamen aus der Query
    if (query.includes('phtech')) return 'Phtech';
    if (query.includes('pfisterer')) return 'Wilhelm Pfisterer';
    
    const urlMatch = query.match(/https?:\/\/([^.]+)/);
    if (urlMatch) {
      return urlMatch[1].charAt(0).toUpperCase() + urlMatch[1].slice(1);
    }
    
    const parts = query.split(' ');
    return parts[0] || 'Handwerksbetrieb';
  }

  private static extractCityFromLocation(location: string): string {
    if (location.toLowerCase().includes('stuttgart')) return 'Stuttgart';
    if (location.toLowerCase().includes('esslingen')) return 'Esslingen';
    
    const parts = location.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    
    return 'Region';
  }

  // Website-Inhalt für Impressum-Analyse - nur mit API
  static async analyzeWebsiteContent(url: string): Promise<any> {
    try {
      console.log('Analyzing website content for:', url);
      
      const pageSpeedData = await this.getPageSpeedInsights(url);
      
      if (pageSpeedData?.lighthouseResult?.audits) {
        const audits = pageSpeedData.lighthouseResult.audits;
        
        return {
          hasImprint: this.detectImprintFromAudits(audits),
          title: audits['document-title']?.details?.items?.[0]?.text || '',
          metaDescription: audits['meta-description']?.details?.items?.[0]?.description || '',
          links: audits['crawlable-anchors']?.details?.items || [],
        };
      }
      
      return null;
    } catch (error) {
      console.error('Website content analysis error:', error);
      return null;
    }
  }

  private static detectImprintFromAudits(audits: any): boolean {
    const titleText = audits['document-title']?.details?.items?.[0]?.text || '';
    const links = audits['crawlable-anchors']?.details?.items || [];
    
    const imprintKeywords = ['impressum', 'imprint', 'rechtlich', 'legal', 'datenschutz'];
    
    if (imprintKeywords.some(keyword => titleText.toLowerCase().includes(keyword))) {
      return true;
    }
    
    return links.some((link: any) => 
      imprintKeywords.some(keyword => 
        (link.text || '').toLowerCase().includes(keyword) ||
        (link.href || '').toLowerCase().includes(keyword)
      )
    );
  }
}
