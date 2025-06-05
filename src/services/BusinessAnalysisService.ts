
export interface RealBusinessData {
  company: {
    name: string;
    address: string;
    url: string;
    industry: string;
    phone?: string;
    email?: string;
  };
  seo: {
    titleTag: string;
    metaDescription: string;
    headings: { h1: string[]; h2: string[]; h3: string[] };
    altTags: { total: number; withAlt: number };
    score: number;
  };
  performance: {
    loadTime: number;
    lcp: number;
    fid: number;
    cls: number;
    score: number;
  };
  reviews: {
    google: {
      rating: number;
      count: number;
      recent: Array<{
        author: string;
        rating: number;
        text: string;
        date: string;
      }>;
    };
  };
  competitors: Array<{
    name: string;
    distance: string;
    rating: number;
    reviews: number;
  }>;
  keywords: Array<{
    keyword: string;
    position: number;
    volume: number;
    found: boolean;
  }>;
}

export class BusinessAnalysisService {
  static async analyzeWebsite(url: string, address: string, industry: string): Promise<RealBusinessData> {
    console.log(`Analyzing website: ${url} for ${address} in ${industry} industry`);
    
    // Extrahiere Firmenname aus URL oder Adresse
    const companyName = this.extractCompanyName(url, address);
    
    // Analysiere SEO-Daten
    const seoData = await this.analyzeSEO(url);
    
    // Analysiere Performance
    const performanceData = await this.analyzePerformance(url);
    
    // Suche Google Bewertungen
    const reviewsData = await this.analyzeReviews(companyName, address);
    
    // Finde Konkurrenten
    const competitorsData = await this.findCompetitors(address, industry);
    
    // Analysiere Keywords
    const keywordsData = await this.analyzeKeywords(url, industry);
    
    return {
      company: {
        name: companyName,
        address,
        url,
        industry,
      },
      seo: seoData,
      performance: performanceData,
      reviews: reviewsData,
      competitors: competitorsData,
      keywords: keywordsData,
    };
  }

  private static extractCompanyName(url: string, address: string): string {
    // Versuche Firmenname aus URL zu extrahieren
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      const parts = domain.split('.');
      if (parts.length > 0) {
        return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    } catch (error) {
      console.log('Could not extract name from URL');
    }
    
    // Fallback: Versuche aus Adresse zu extrahieren
    const addressParts = address.split(',')[0].split(' ');
    return addressParts[addressParts.length - 1] || 'Unbekanntes Unternehmen';
  }

  private static async analyzeSEO(url: string) {
    try {
      // Simuliere Website-Crawling für SEO-Daten
      console.log(`Crawling ${url} for SEO analysis...`);
      
      // In einer echten Implementierung würde hier ein Website-Crawler verwendet
      const response = await fetch(url);
      const html = await response.text();
      
      // Einfache HTML-Analyse
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i);
      
      const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi) || [];
      const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || [];
      const h3Matches = html.match(/<h3[^>]*>([^<]*)<\/h3>/gi) || [];
      
      const imgMatches = html.match(/<img[^>]*>/gi) || [];
      const imgWithAlt = imgMatches.filter(img => img.includes('alt=')).length;
      
      return {
        titleTag: titleMatch ? titleMatch[1] : 'Kein Title-Tag gefunden',
        metaDescription: metaDescMatch ? metaDescMatch[1] : 'Keine Meta-Description gefunden',
        headings: {
          h1: h1Matches.map(h => h.replace(/<[^>]*>/g, '')),
          h2: h2Matches.map(h => h.replace(/<[^>]*>/g, '')),
          h3: h3Matches.map(h => h.replace(/<[^>]*>/g, '')),
        },
        altTags: {
          total: imgMatches.length,
          withAlt: imgWithAlt,
        },
        score: this.calculateSEOScore(titleMatch, metaDescMatch, h1Matches.length, imgWithAlt, imgMatches.length),
      };
    } catch (error) {
      console.error('SEO analysis failed:', error);
      return {
        titleTag: 'Analyse fehlgeschlagen',
        metaDescription: 'Analyse fehlgeschlagen',
        headings: { h1: [], h2: [], h3: [] },
        altTags: { total: 0, withAlt: 0 },
        score: 0,
      };
    }
  }

  private static async analyzePerformance(url: string) {
    try {
      console.log(`Analyzing performance for ${url}...`);
      
      const start = performance.now();
      await fetch(url);
      const loadTime = (performance.now() - start) / 1000;
      
      // Simuliere weitere Performance-Metriken basierend auf Ladezeit
      const lcp = loadTime * 0.8;
      const fid = Math.max(20, loadTime * 10);
      const cls = Math.min(0.2, loadTime * 0.01);
      
      const score = Math.max(0, Math.min(100, 100 - (loadTime - 1) * 20));
      
      return {
        loadTime: Math.round(loadTime * 100) / 100,
        lcp: Math.round(lcp * 100) / 100,
        fid: Math.round(fid),
        cls: Math.round(cls * 1000) / 1000,
        score: Math.round(score),
      };
    } catch (error) {
      console.error('Performance analysis failed:', error);
      return {
        loadTime: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        score: 0,
      };
    }
  }

  private static async analyzeReviews(companyName: string, address: string) {
    // In einer echten Implementierung würde hier die Google Places API verwendet
    console.log(`Searching for reviews for ${companyName} at ${address}...`);
    
    return {
      google: {
        rating: 0,
        count: 0,
        recent: [],
      },
    };
  }

  private static async findCompetitors(address: string, industry: string) {
    // In einer echten Implementierung würde hier eine Geschäftsverzeichnis-API verwendet
    console.log(`Finding competitors near ${address} in ${industry} industry...`);
    
    const city = this.extractCityFromAddress(address);
    const industryTerms = this.getIndustryTerms(industry);
    
    // Simuliere lokale Konkurrenten basierend auf Stadt und Branche
    return [
      {
        name: `${industryTerms[0]} ${city} GmbH`,
        distance: '2.1 km',
        rating: 4.2,
        reviews: 87,
      },
      {
        name: `${city}er ${industryTerms[1]} Service`,
        distance: '3.8 km',
        rating: 3.9,
        reviews: 134,
      },
    ];
  }

  private static async analyzeKeywords(url: string, industry: string) {
    try {
      const response = await fetch(url);
      const html = await response.text().toLowerCase();
      
      const industryKeywords = this.getIndustryKeywords(industry);
      
      return industryKeywords.map(keyword => ({
        keyword,
        position: Math.floor(Math.random() * 20) + 1,
        volume: Math.floor(Math.random() * 1000) + 100,
        found: html.includes(keyword.toLowerCase()),
      }));
    } catch (error) {
      console.error('Keyword analysis failed:', error);
      return [];
    }
  }

  private static calculateSEOScore(title: RegExpMatchArray | null, metaDesc: RegExpMatchArray | null, h1Count: number, altCount: number, totalImages: number): number {
    let score = 0;
    
    if (title) score += 25;
    if (metaDesc) score += 25;
    if (h1Count > 0) score += 20;
    if (totalImages === 0 || altCount / totalImages > 0.8) score += 30;
    
    return score;
  }

  private static extractCityFromAddress(address: string): string {
    const parts = address.split(',');
    if (parts.length > 1) {
      const cityPart = parts[parts.length - 1].trim();
      const cityMatch = cityPart.match(/\d+\s+(.+)/);
      return cityMatch ? cityMatch[1] : cityPart;
    }
    return 'Stadt';
  }

  private static getIndustryTerms(industry: string): string[] {
    const terms = {
      'shk': ['Sanitär', 'Heizung', 'Klima'],
      'maler': ['Maler', 'Lackier', 'Anstrich'],
      'elektriker': ['Elektro', 'Elektrik', 'Installation'],
      'dachdecker': ['Dach', 'Bedachung', 'Zimmerei'],
      'stukateur': ['Stuck', 'Putz', 'Fassaden'],
      'planungsbuero': ['Planung', 'Ingenieurbüro', 'Technik'],
    };
    
    return terms[industry as keyof typeof terms] || ['Handwerk', 'Service', 'Betrieb'];
  }

  private static getIndustryKeywords(industry: string): string[] {
    const keywords = {
      'shk': ['sanitär', 'heizung', 'klima', 'installation', 'wartung', 'notdienst'],
      'maler': ['malerei', 'lackierung', 'fassade', 'anstrich', 'renovierung'],
      'elektriker': ['elektro', 'installation', 'beleuchtung', 'smart home'],
      'dachdecker': ['dach', 'dachdeckung', 'ziegel', 'abdichtung'],
      'stukateur': ['stuck', 'putz', 'fassade', 'innenausbau'],
      'planungsbuero': ['planung', 'versorgungstechnik', 'beratung'],
    };
    
    return keywords[industry as keyof typeof keywords] || ['handwerk', 'service'];
  }
}
