
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
      // Zuerst Place ID finden
      const searchResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`,
        { method: 'GET' }
      );
      
      if (!searchResponse.ok) {
        console.warn('Places Search API failed, using fallback data');
        return null;
      }

      const searchData = await searchResponse.json();
      
      if (!searchData.candidates || searchData.candidates.length === 0) {
        return null;
      }

      const placeId = searchData.candidates[0].place_id;

      // Detaillierte Informationen abrufen
      const detailsResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number&key=${apiKey}`,
        { method: 'GET' }
      );

      if (!detailsResponse.ok) {
        return null;
      }

      const detailsData = await detailsResponse.json();
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
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=PERFORMANCE&category=SEO&strategy=MOBILE`
      );

      if (!response.ok) {
        console.warn('PageSpeed API failed, using fallback data');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('PageSpeed API error:', error);
      return null;
    }
  }

  // Nearby Search für Konkurrenten
  static async getNearbyCompetitors(location: string, businessType: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Google API Key required');

    try {
      // Geocoding für Koordinaten
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`
      );

      if (!geocodeResponse.ok) {
        return null;
      }

      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        return null;
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      // Nearby Search
      const nearbyResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=establishment&keyword=${encodeURIComponent(businessType)}&key=${apiKey}`
      );

      if (!nearbyResponse.ok) {
        return null;
      }

      return await nearbyResponse.json();
    } catch (error) {
      console.error('Nearby search API error:', error);
      return null;
    }
  }
}
