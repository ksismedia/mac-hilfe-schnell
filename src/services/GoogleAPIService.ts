
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

  // Nur echte Google Places API Suche ohne Fallback
  static async getPlaceDetails(query: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.log('No Google API Key provided - no fallback data');
      return null;
    }

    try {
      console.log('Searching for real company:', query);
      
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        if (searchData?.candidates?.length > 0) {
          const placeId = searchData.candidates[0].place_id;
          
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number,types,business_status&key=${apiKey}`;
          const detailsResponse = await fetch(detailsUrl);
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            if (detailsData?.result) {
              console.log('Real Google Places data found:', detailsData.result.name);
              return detailsData.result;
            }
          }
        }
      }
      
      console.log('No real data found for query:', query);
      return null;
    } catch (error) {
      console.error('Google Places API error:', error);
      return null;
    }
  }

  // Nur echte PageSpeed Insights ohne Fallback
  static async getPageSpeedInsights(url: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.log('No API Key - no PageSpeed data');
      return null;
    }

    try {
      console.log('Analyzing real PageSpeed for:', url);
      
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&strategy=MOBILE`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (!data?.error) {
          console.log('Real PageSpeed data retrieved');
          return data;
        }
      }
      
      console.log('PageSpeed API failed for:', url);
      return null;
    } catch (error) {
      console.error('PageSpeed API error:', error);
      return null;
    }
  }

  // Nur echte Konkurrenten-Suche ohne Fallback
  static async getNearbyCompetitors(location: string, businessType: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.log('No API Key - no competitor search');
      return { results: [] };
    }

    try {
      console.log('Finding real competitors near:', location, 'for:', businessType);
      
      const query = `${businessType} ${this.extractCityFromLocation(location)}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=name,rating,user_ratings_total,formatted_address,place_id&key=${apiKey}`;
      
      const response = await fetch(searchUrl);
      if (response.ok) {
        const data = await response.json();
        if (data?.candidates?.length > 0) {
          console.log('Found real competitors:', data.candidates.length);
          return { results: data.candidates.slice(0, 5) };
        }
      }
      
      console.log('No real competitors found');
      return { results: [] };
    } catch (error) {
      console.error('Competitor search failed:', error);
      return { results: [] };
    }
  }

  private static extractCityFromLocation(location: string): string {
    if (location.toLowerCase().includes('stuttgart')) return 'Stuttgart';
    if (location.toLowerCase().includes('esslingen')) return 'Esslingen';
    if (location.toLowerCase().includes('karlsdorf')) return 'Karlsdorf-Neuthard';
    if (location.toLowerCase().includes('karlsruhe')) return 'Karlsruhe';
    
    const parts = location.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    
    return location;
  }

  // Website-Inhalt-Analyse nur bei verfügbarer API
  static async analyzeWebsiteContent(url: string): Promise<any> {
    try {
      console.log('Analyzing real website content for:', url);
      
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
      console.error('Website content analysis failed:', error);
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
