
export interface WebsiteContent {
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  images: Array<{
    src: string;
    alt: string;
    hasAlt: boolean;
  }>;
  links: Array<{
    href: string;
    text: string;
    isInternal: boolean;
  }>;
  keywords: string[];
  rawHtml: string;
}

export class WebsiteAnalysisService {
  // Proxy service to bypass CORS restrictions
  private static async fetchWebsiteContent(url: string): Promise<string> {
    try {
      // Try multiple CORS proxy services
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://thingproxy.freeboard.io/fetch/${url}`
      ];

      for (const proxyUrl of proxies) {
        try {
          console.log(`Trying to fetch ${url} via proxy: ${proxyUrl}`);
          const response = await fetch(proxyUrl, {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            return data.contents || data.body || '';
          }
        } catch (error) {
          console.warn(`Proxy ${proxyUrl} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All proxy services failed');
    } catch (error) {
      console.error('Failed to fetch website content:', error);
      throw error;
    }
  }

  static async analyzeWebsite(url: string): Promise<WebsiteContent> {
    try {
      console.log('Starting real website analysis for:', url);
      
      const htmlContent = await this.fetchWebsiteContent(url);
      console.log('Successfully fetched HTML content, length:', htmlContent.length);
      
      return this.parseHtmlContent(htmlContent, url);
    } catch (error) {
      console.error('Website analysis failed:', error);
      // Return minimal data if analysis fails
      return {
        title: 'Konnte nicht geladen werden',
        metaDescription: 'Website-Inhalte konnten nicht abgerufen werden',
        headings: { h1: [], h2: [], h3: [] },
        content: '',
        images: [],
        links: [],
        keywords: [],
        rawHtml: ''
      };
    }
  }

  private static parseHtmlContent(html: string, baseUrl: string): WebsiteContent {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract title
    const title = doc.querySelector('title')?.textContent?.trim() || 'Kein Title gefunden';
    
    // Extract meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || 
                     'Keine Meta-Description gefunden';
    
    // Extract headings
    const h1Elements = Array.from(doc.querySelectorAll('h1')).map(el => el.textContent?.trim() || '');
    const h2Elements = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent?.trim() || '');
    const h3Elements = Array.from(doc.querySelectorAll('h3')).map(el => el.textContent?.trim() || '');
    
    // Extract body text content
    const bodyElement = doc.querySelector('body');
    const content = bodyElement?.textContent?.trim() || '';
    
    // Extract images with alt text analysis
    const images = Array.from(doc.querySelectorAll('img')).map(img => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      return {
        src,
        alt,
        hasAlt: alt.length > 0
      };
    });
    
    // Extract links
    const links = Array.from(doc.querySelectorAll('a[href]')).map(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.trim() || '';
      const isInternal = href.startsWith('/') || href.includes(new URL(baseUrl).hostname);
      return {
        href,
        text,
        isInternal
      };
    });
    
    // Extract keywords from content
    const keywords = this.extractKeywords(content, title, metaDesc);
    
    return {
      title,
      metaDescription: metaDesc,
      headings: {
        h1: h1Elements.filter(h => h.length > 0),
        h2: h2Elements.filter(h => h.length > 0),
        h3: h3Elements.filter(h => h.length > 0)
      },
      content,
      images,
      links,
      keywords,
      rawHtml: html
    };
  }

  private static extractKeywords(content: string, title: string, metaDesc: string): string[] {
    // Combine all text for keyword analysis
    const allText = `${title} ${metaDesc} ${content}`.toLowerCase();
    
    // Common German stopwords to filter out
    const stopwords = new Set([
      'der', 'die', 'das', 'und', 'oder', 'aber', 'mit', 'bei', 'von', 'zu', 'in', 'an', 'auf',
      'für', 'ist', 'sind', 'war', 'waren', 'hat', 'haben', 'wird', 'werden', 'kann', 'können',
      'sich', 'nicht', 'nur', 'auch', 'wenn', 'wie', 'was', 'wer', 'wo', 'wann', 'warum',
      'ihr', 'ihre', 'unser', 'unsere', 'diese', 'dieser', 'dieses', 'alle', 'alles', 'mehr'
    ]);
    
    // Extract words (minimum 3 characters)
    const words = allText
      .replace(/[^\w\säöüß]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopwords.has(word))
      .filter(word => /[a-zA-ZäöüßÄÖÜ]/.test(word)); // Contains at least one letter
    
    // Count word frequencies
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Return top keywords sorted by frequency
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20 keywords
      .map(([word]) => word);
  }

  static analyzeKeywordsForIndustry(content: WebsiteContent, industry: string): Array<{
    keyword: string;
    found: boolean;
    position: number;
    volume: number;
    density: number;
  }> {
    const industryKeywords = this.getIndustryKeywords(industry);
    const allText = `${content.title} ${content.metaDescription} ${content.content}`.toLowerCase();
    
    return industryKeywords.map(keyword => {
      const found = allText.includes(keyword.toLowerCase());
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      const matches = allText.match(regex) || [];
      const density = allText.length > 0 ? (matches.length / allText.split(/\s+/).length) * 100 : 0;
      
      // Simulate search position (would need real SEO tools for actual positions)
      const position = found ? Math.floor(Math.random() * 20) + 1 : 0;
      const volume = Math.floor(Math.random() * 1000) + 100;
      
      return {
        keyword,
        found,
        position,
        volume,
        density: Math.round(density * 100) / 100
      };
    });
  }

  private static getIndustryKeywords(industry: string): string[] {
    const keywords = {
      'shk': [
        'sanitär', 'heizung', 'klima', 'installation', 'wartung', 'notdienst',
        'rohrreinigung', 'badezimmer', 'bad', 'dusche', 'wc', 'toilette',
        'heizungsbau', 'klimaanlage', 'lüftung', 'installateur', 'handwerker'
      ],
      'maler': [
        'malerei', 'maler', 'lackierung', 'fassade', 'anstrich', 'renovierung',
        'innenausbau', 'tapezieren', 'streichen', 'lackierer', 'farbe', 'putz',
        'wandgestaltung', 'bodenbelag', 'malerarbeiten'
      ],
      'elektriker': [
        'elektro', 'elektriker', 'installation', 'beleuchtung', 'smart home',
        'elektroinstallation', 'strom', 'kabel', 'sicherung', 'steckdose',
        'lichtschalter', 'elektrotechnik', 'photovoltaik', 'solar'
      ],
      'dachdecker': [
        'dach', 'dachdecker', 'dachdeckung', 'ziegel', 'abdichtung',
        'flachdach', 'steildach', 'dachrinne', 'schiefer', 'bedachung',
        'dachsanierung', 'dachaufbau', 'zimmerei'
      ],
      'stukateur': [
        'stuck', 'stuckateur', 'putz', 'fassade', 'innenausbau',
        'trockenbau', 'wärmedämmung', 'verputz', 'gipskarton',
        'dämmung', 'sanierung', 'renovierung'
      ],
      'planungsbuero': [
        'planung', 'planungsbüro', 'versorgungstechnik', 'beratung',
        'ingenieurbüro', 'haustechnik', 'gebäudetechnik', 'technikplanung',
        'anlagenbau', 'projektierung', 'consulting'
      ]
    };
    
    return keywords[industry as keyof typeof keywords] || ['handwerk', 'service', 'betrieb'];
  }

  static detectImprintFromContent(content: WebsiteContent): {
    found: boolean;
    completeness: number;
    foundElements: string[];
    missingElements: string[];
    score: number;
  } {
    const allText = `${content.title} ${content.content}`.toLowerCase();
    const linkTexts = content.links.map(link => link.text.toLowerCase()).join(' ');
    
    // Check for Impressum page link
    const imprintKeywords = ['impressum', 'imprint', 'rechtlich', 'legal', 'datenschutz'];
    const hasImprintLink = imprintKeywords.some(keyword => 
      linkTexts.includes(keyword) || 
      content.links.some(link => link.href.toLowerCase().includes(keyword))
    );
    
    // Check for required legal elements in content
    const legalElements = {
      'Geschäftsführer/Inhaber': /geschäftsführer|inhaber|geschäftsleitung|chef|direktor/i,
      'Firmenanschrift': /adresse|anschrift|sitz|straße|plz|ort|address/i,
      'Kontaktdaten': /telefon|phone|tel|email|mail|kontakt|fax/i,
      'Handelsregister': /handelsregister|hrb|hra|hr\s*[ab]/i,
      'USt-IdNr.': /ust[\-\s]*id|umsatzsteuer[\-\s]*id|vat[\-\s]*id|steuer/i,
      'Datenschutzerklärung': /datenschutz|privacy|gdpr|dsgvo/i
    };
    
    const foundElements: string[] = [];
    const missingElements: string[] = [];
    
    Object.entries(legalElements).forEach(([element, regex]) => {
      if (regex.test(allText) || regex.test(linkTexts)) {
        foundElements.push(element);
      } else {
        missingElements.push(element);
      }
    });
    
    const completeness = Math.round((foundElements.length / Object.keys(legalElements).length) * 100);
    const found = hasImprintLink || foundElements.length >= 3;
    const score = found ? Math.max(30, completeness) : 0;
    
    return {
      found,
      completeness,
      foundElements,
      missingElements,
      score
    };
  }
}
