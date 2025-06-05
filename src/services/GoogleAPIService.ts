
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

  // Google Places API - Firmendetails abrufen
  static async getPlaceDetails(query: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      console.log('Searching for company:', query);
      
      // Zuerst Place ID finden
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`,
        { method: 'GET' }
      );
      
      if (!searchResponse.ok) {
        console.warn('Places Search API failed, status:', searchResponse.status);
        return null;
      }

      const searchData = await searchResponse.json();
      console.log('Search result:', searchData);
      
      if (!searchData.candidates || searchData.candidates.length === 0) {
        console.log('No candidates found for query:', query);
        return null;
      }

      const placeId = searchData.candidates[0].place_id;
      console.log('Found place ID:', placeId);

      // Detaillierte Informationen abrufen
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number,types,business_status&key=${apiKey}`,
        { method: 'GET' }
      );

      if (!detailsResponse.ok) {
        console.warn('Places Details API failed, status:', detailsResponse.status);
        return null;
      }

      const detailsData = await detailsResponse.json();
      console.log('Details result:', detailsData);
      return detailsData.result;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }

  // PageSpeed Insights API
  static async getPageSpeedInsights(url: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      console.log('Analyzing PageSpeed for:', url);
      
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&category=SEO&strategy=MOBILE&category=ACCESSIBILITY`
      );

      if (!response.ok) {
        console.warn('PageSpeed API failed, status:', response.status);
        return null;
      }

      const data = await response.json();
      console.log('PageSpeed result:', data);
      return data;
    } catch (error) {
      console.error('PageSpeed API error:', error);
      return null;
    }
  }

  // Nearby Search für Konkurrenten - verbessert
  static async getNearbyCompetitors(location: string, businessType: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      console.log('Finding competitors near:', location, 'for business type:', businessType);
      
      // Geocoding für Koordinaten
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
      );

      if (!geocodeResponse.ok) {
        console.warn('Geocoding API failed');
        return null;
      }

      const geocodeData = await geocodeResponse.json();
      console.log('Geocoding result:', geocodeData);
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        console.log('No geocoding results for:', location);
        return null;
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;
      console.log('Coordinates found:', lat, lng);

      // Mehrere Suchbegriffe für bessere Ergebnisse
      const searchTerms = this.getBusinessSearchTerms(businessType);
      let allResults = [];

      for (const term of searchTerms) {
        try {
          const nearbyResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=${encodeURIComponent(term)}&key=${apiKey}`
          );

          if (nearbyResponse.ok) {
            const nearbyData = await nearbyResponse.json();
            console.log(`Nearby search for "${term}":`, nearbyData);
            
            if (nearbyData.results) {
              allResults.push(...nearbyData.results);
            }
          }
        } catch (error) {
          console.error(`Error searching for ${term}:`, error);
        }
      }

      // Duplikate entfernen und nach Bewertungen sortieren
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex(t => t.place_id === item.place_id)
      );

      return {
        results: uniqueResults.slice(0, 8) // Top 8 Ergebnisse
      };
    } catch (error) {
      console.error('Nearby search API error:', error);
      return null;
    }
  }

  // Website-Inhalt für Impressum-Analyse abrufen
  static async analyzeWebsiteContent(url: string): Promise<any> {
    try {
      console.log('Analyzing website content for:', url);
      
      // Da direktes Crawling durch CORS blockiert wird, verwenden wir eine Proxy-Lösung
      // oder analysieren über die verfügbaren APIs
      
      // Versuche über PageSpeed Insights zusätzliche Informationen zu bekommen
      const pageSpeedData = await this.getPageSpeedInsights(url);
      
      if (pageSpeedData?.lighthouseResult?.audits) {
        const audits = pageSpeedData.lighthouseResult.audits;
        
        return {
          hasImprint: this.detectImprintFromAudits(audits),
          title: audits['document-title']?.details?.items?.[0]?.text || '',
          metaDescription: audits['meta-description']?.details?.items?.[0]?.description || '',
          links: audits['crawlable-anchors']?.details?.items || [],
          // Weitere Daten extrahieren...
        };
      }
      
      return null;
    } catch (error) {
      console.error('Website content analysis error:', error);
      return null;
    }
  }

  private static detectImprintFromAudits(audits: any): boolean {
    // Suche nach Hinweisen auf Impressum in verfügbaren Daten
    const titleText = audits['document-title']?.details?.items?.[0]?.text || '';
    const links = audits['crawlable-anchors']?.details?.items || [];
    
    const imprintKeywords = ['impressum', 'imprint', 'rechtlich', 'legal', 'datenschutz'];
    
    // Prüfe Titel
    if (imprintKeywords.some(keyword => titleText.toLowerCase().includes(keyword))) {
      return true;
    }
    
    // Prüfe Links
    return links.some((link: any) => 
      imprintKeywords.some(keyword => 
        (link.text || '').toLowerCase().includes(keyword) ||
        (link.href || '').toLowerCase().includes(keyword)
      )
    );
  }

  private static getBusinessSearchTerms(industry: string): string[] {
    const terms = {
      'shk': ['Sanitär', 'Heizung', 'Klima', 'Installation', 'Installateur', 'SHK'],
      'maler': ['Maler', 'Lackierer', 'Malerbetrieb', 'Anstrich', 'Fassade'],
      'elektriker': ['Elektriker', 'Elektro', 'Elektroinstallation', 'Beleuchtung'],
      'dachdecker': ['Dachdecker', 'Bedachung', 'Dach', 'Zimmerei'],
      'stukateur': ['Stuckateur', 'Putz', 'Fassade', 'Trockenbau'],
      'planungsbuero': ['Planungsbüro', 'Ingenieurbüro', 'Technikplanung', 'Versorgungstechnik'],
    };
    
    return terms[industry as keyof typeof terms] || ['Handwerk', 'Service'];
  }
}
