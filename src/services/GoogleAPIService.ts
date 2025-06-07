
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

  // Echte Google Places API - nur reale Daten
  static async getPlaceDetails(query: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No Google API Key provided');
      return null;
    }

    try {
      console.log('Searching for company:', query);
      
      // Versuche verschiedene Proxy-Services für CORS
      const proxies = [
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
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
      
      console.warn('Could not find real company data');
      return null;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }

  // PageSpeed Insights API
  static async getPageSpeedInsights(url: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No API Key, cannot get PageSpeed data');
      return null;
    }

    try {
      console.log('Analyzing PageSpeed for:', url);
      
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&category=SEO&strategy=MOBILE`;
      
      // Versuche mit CORS-Proxy
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
        `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
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

  // Nearby Search - nur echte lokale Konkurrenten
  static async getNearbyCompetitors(location: string, businessType: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No API Key, cannot search for competitors');
      return { results: [] };
    }

    try {
      console.log('Finding real competitors near:', location, 'for business type:', businessType);
      
      // Zunächst Geocoding für exakte Koordinaten
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
      
      try {
        const geocodeResponse = await fetch(geocodeUrl);
        if (!geocodeResponse.ok) {
          throw new Error('Geocoding failed');
        }

        const geocodeData = await geocodeResponse.json();
        if (!geocodeData?.results?.length) {
          throw new Error('No geocoding results');
        }

        const { lat, lng } = geocodeData.results[0].geometry.location;
        console.log('Found coordinates:', lat, lng);
        
        // Verschiedene Suchbegriffe je nach Branche
        const searchTerms = this.getIndustrySearchTerms(businessType);
        let allCompetitors = [];
        
        // Für jeden Suchbegriff eine separate Suche
        for (const term of searchTerms) {
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&keyword=${encodeURIComponent(term)}&type=establishment&key=${apiKey}`;
          
          try {
            const nearbyResponse = await fetch(nearbyUrl);
            if (nearbyResponse.ok) {
              const nearbyData = await nearbyResponse.json();
              if (nearbyData?.results?.length) {
                console.log(`Found ${nearbyData.results.length} results for "${term}"`);
                
                // Filtere nur Unternehmen mit Bewertungen und relevanten Typen
                const validCompetitors = nearbyData.results.filter(place => 
                  place.rating && 
                  place.user_ratings_total > 0 &&
                  this.isRelevantBusinessType(place, businessType) &&
                  this.calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng) <= 15 // Max 15km
                );
                
                allCompetitors = allCompetitors.concat(validCompetitors);
              }
            }
          } catch (error) {
            console.warn(`Search for "${term}" failed:`, error);
          }
        }
        
        // Duplikate entfernen und nach Bewertung sortieren
        const uniqueCompetitors = this.removeDuplicates(allCompetitors);
        const sortedCompetitors = uniqueCompetitors
          .sort((a, b) => (b.rating * b.user_ratings_total) - (a.rating * a.user_ratings_total))
          .slice(0, 5); // Top 5 Konkurrenten
        
        console.log(`Found ${sortedCompetitors.length} real competitors`);
        return { results: sortedCompetitors };
        
      } catch (error) {
        console.error('Competitor search failed:', error);
        return { results: [] };
      }
      
    } catch (error) {
      console.error('Nearby search API error:', error);
      return { results: [] };
    }
  }

  // Branchenspezifische Suchbegriffe
  private static getIndustrySearchTerms(businessType: string): string[] {
    const searchTerms = {
      'shk': ['Sanitär', 'Heizung', 'Klempner', 'Installateur', 'SHK', 'Heizungsbau'],
      'maler': ['Maler', 'Lackierer', 'Malerbetrieb', 'Anstreicher'],
      'elektriker': ['Elektriker', 'Elektroinstallation', 'Elektrotechnik', 'Elektrobetrieb'],
      'dachdecker': ['Dachdecker', 'Dachbau', 'Bedachung'],
      'stukateur': ['Stuckateur', 'Trockenbau', 'Putz'],
      'planungsbuero': ['Planungsbüro', 'Architekt', 'Bauplanung', 'Ingenieur']
    };
    
    return searchTerms[businessType] || ['Handwerker'];
  }

  // Prüfe ob der Geschäftstyp relevant ist
  private static isRelevantBusinessType(place: any, businessType: string): boolean {
    const placeTypes = place.types || [];
    const name = (place.name || '').toLowerCase();
    
    const relevantTypes = {
      'shk': ['plumber', 'electrician', 'general_contractor'],
      'maler': ['painter', 'general_contractor'],
      'elektriker': ['electrician', 'general_contractor'],
      'dachdecker': ['roofing_contractor', 'general_contractor'],
      'stukateur': ['general_contractor'],
      'planungsbuero': ['architect', 'engineer', 'general_contractor']
    };
    
    const keywords = {
      'shk': ['sanitär', 'heizung', 'klempner', 'installateur', 'shk'],
      'maler': ['maler', 'lackier', 'anstreich'],
      'elektriker': ['elektr'],
      'dachdecker': ['dach', 'bedach'],
      'stukateur': ['stuck', 'putz', 'trocken'],
      'planungsbuero': ['plan', 'architekt', 'ingenieur']
    };
    
    // Prüfe Geschäftstypen
    const hasRelevantType = placeTypes.some(type => 
      relevantTypes[businessType]?.includes(type)
    );
    
    // Prüfe Keywords im Namen
    const hasRelevantKeyword = keywords[businessType]?.some(keyword => 
      name.includes(keyword)
    );
    
    return hasRelevantType || hasRelevantKeyword;
  }

  // Berechne Entfernung zwischen zwei Koordinaten
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Erdradius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Entferne Duplikate basierend auf Name und Adresse
  private static removeDuplicates(competitors: any[]): any[] {
    const seen = new Set();
    return competitors.filter(comp => {
      const key = `${comp.name}_${comp.vicinity}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Website-Inhalt für Impressum-Analyse
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
