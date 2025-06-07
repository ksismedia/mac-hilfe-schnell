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

  // Nearby Search mit nur echten lokalen Firmen - maximal 15km Radius
  static async getNearbyCompetitors(location: string, businessType: string): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('No API Key - cannot search for competitors');
      return { results: [] };
    }

    try {
      console.log('Finding real competitors near:', location, 'for business type:', businessType);
      
      // Geocoding für Koordinaten
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
      const geocodeResponse = await fetch(geocodeUrl);

      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        if (geocodeData?.results?.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry.location;
          
          // Spezifische Suchbegriffe je nach Branche
          const industryKeywords = {
            'shk': ['Sanitär', 'Heizung', 'Klima', 'Installateur', 'SHK'],
            'maler': ['Maler', 'Lackierer', 'Anstrich'],
            'elektriker': ['Elektriker', 'Elektro', 'Elektroinstallation'],
            'dachdecker': ['Dachdecker', 'Dach', 'Bedachung'],
            'stukateur': ['Stuckateur', 'Trockenbau', 'Putz'],
            'planungsbuero': ['Planungsbüro', 'Architekt', 'Ingenieurbüro']
          };
          
          const keywords = industryKeywords[businessType as keyof typeof industryKeywords] || [businessType];
          
          // Nearby Search mit reduziertem Radius (15km) und spezifischen Keywords
          for (const keyword of keywords) {
            const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=15000&keyword=${encodeURIComponent(keyword)}&type=establishment&key=${apiKey}`;
            
            const proxies = [
              `https://corsproxy.io/?${encodeURIComponent(nearbyUrl)}`,
              nearbyUrl
            ];

            for (const proxyUrl of proxies) {
              try {
                const nearbyResponse = await fetch(proxyUrl);
                if (nearbyResponse.ok) {
                  const nearbyData = await nearbyResponse.json();
                  if (nearbyData?.results?.length > 0) {
                    // Filtere nur Firmen mit Bewertungen (echte Geschäfte)
                    const realBusinesses = nearbyData.results.filter((place: any) => 
                      place.rating && 
                      place.user_ratings_total > 0 &&
                      place.business_status === 'OPERATIONAL'
                    );
                    
                    if (realBusinesses.length > 0) {
                      console.log(`Found ${realBusinesses.length} real competitors for keyword: ${keyword}`);
                      return { results: realBusinesses.slice(0, 5) }; // Maximal 5 Konkurrenten
                    }
                  }
                }
              } catch (error) {
                continue;
              }
            }
          }
        }
      }
      
      console.warn('No real competitors found');
      return { results: [] };
    } catch (error) {
      console.error('Nearby search API error:', error);
      return { results: [] };
    }
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
