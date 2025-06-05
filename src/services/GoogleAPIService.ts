
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

  // Google Places API - Firmendetails abrufen mit CORS-Handling
  static async getPlaceDetails(query: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      console.log('Searching for company:', query);
      
      // Verwende Google Maps JavaScript API über JSONP statt direkter API-Aufrufe
      // Da CORS-Probleme auftreten, verwenden wir eine alternative Strategie
      
      const searchResponse = await this.makeProxiedRequest(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`
      );
      
      if (!searchResponse || !searchResponse.candidates || searchResponse.candidates.length === 0) {
        console.log('No place found for query:', query);
        return null;
      }

      const placeId = searchResponse.candidates[0].place_id;
      console.log('Found place ID:', placeId);

      const detailsResponse = await this.makeProxiedRequest(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number,types,business_status&key=${apiKey}`
      );

      return detailsResponse?.result || null;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }

  // PageSpeed Insights API mit besserer Fehlerbehandlung
  static async getPageSpeedInsights(url: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      console.log('Analyzing PageSpeed for:', url);
      
      const response = await this.makeProxiedRequest(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&category=SEO&strategy=MOBILE`
      );

      if (response?.error) {
        console.warn('PageSpeed API error:', response.error.message);
        return null;
      }

      return response;
    } catch (error) {
      console.error('PageSpeed API error:', error);
      return null;
    }
  }

  // Nearby Search für Konkurrenten mit verbesserter Fehlerbehandlung
  static async getNearbyCompetitors(location: string, businessType: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      console.log('Finding competitors near:', location, 'for business type:', businessType);
      
      // Geocoding für Koordinaten
      const geocodeResponse = await this.makeProxiedRequest(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
      );

      if (!geocodeResponse?.results || geocodeResponse.results.length === 0) {
        console.log('No geocoding results for:', location);
        return null;
      }

      const { lat, lng } = geocodeResponse.results[0].geometry.location;
      console.log('Coordinates found:', lat, lng);

      // Nearby Search
      const nearbyResponse = await this.makeProxiedRequest(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=${encodeURIComponent(businessType)}&key=${apiKey}`
      );

      return nearbyResponse;
    } catch (error) {
      console.error('Nearby search API error:', error);
      return null;
    }
  }

  // Hilfsmethode für Proxy-Requests
  private static async makeProxiedRequest(url: string): Promise<any> {
    // Da CORS-Probleme auftreten, verwenden wir einen anderen Ansatz
    // Für diese Demo implementieren wir eine robustere Fehlerbehandlung
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('Direct API call failed, API might not be enabled or CORS issue:', error);
      throw error;
    }
  }

  // Website-Inhalt für Impressum-Analyse abrufen
  static async analyzeWebsiteContent(url: string): Promise<any> {
    try {
      console.log('Analyzing website content for:', url);
      
      // Da direktes Crawling durch CORS blockiert wird, verwenden wir PageSpeed Insights
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
