import { focusAreaKeywordMapping } from '@/data/focusAreaKeywordMapping';

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
  // Verbesserte Proxy-Service mit Fallback auf lokale Analyse
  private static async fetchWebsiteContent(url: string): Promise<string> {
    try {
      console.log(`Attempting to fetch content from: ${url}`);
      
      // Versuche direkte Anfrage (falls CORS erlaubt)
      try {
        const directResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)'
          },
          mode: 'cors'
        });
        
        if (directResponse.ok) {
          const content = await directResponse.text();
          console.log('Direct fetch successful, content length:', content.length);
          return content;
        }
      } catch (directError) {
        console.log('Direct fetch failed, trying proxies:', directError);
      }

      // Proxy-Services
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://thingproxy.freeboard.io/fetch/${url}`,
        `https://crossorigin.me/${url}`
      ];

      for (const proxyUrl of proxies) {
        try {
          console.log(`Trying proxy: ${proxyUrl}`);
          const response = await fetch(proxyUrl, {
            headers: {
              'Accept': 'application/json,text/html,*/*',
              'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const content = data.contents || data.body || data.data || '';
            if (content && content.length > 100) {
              console.log(`Proxy ${proxyUrl} successful, content length:`, content.length);
              return content;
            }
          }
        } catch (error) {
          console.warn(`Proxy ${proxyUrl} failed:`, error);
          continue;
        }
      }
      
      // Fallback: Generiere realistische Demo-Inhalte basierend auf URL
      console.log('All fetch methods failed, no fallback data');
      return '';
      
    } catch (error) {
      console.error('Failed to fetch website content:', error);
      return '';
    }
  }

  private static generateRealisticContent(url: string): string {
    const domain = new URL(url).hostname.replace('www.', '');
    const companyName = domain.split('.')[0];
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${companyName} - Sanitär Heizung Klima</title>
      <meta name="description" content="${companyName} - Ihr Experte für Sanitär, Heizung und Klima. Professionelle Installation, Wartung und Notdienst in der Region.">
    </head>
    <body>
      <h1>${companyName} - Sanitär Heizung Klima</h1>
      <h2>Unsere Leistungen</h2>
      <p>Wir sind Ihr zuverlässiger Partner für alle Arbeiten rund um Sanitär, Heizung und Klima. 
      Unser erfahrenes Team bietet Ihnen professionelle Installationen, regelmäßige Wartungen und 
      einen schnellen Notdienst.</p>
      
      <h3>Sanitärinstallation</h3>
      <p>Komplette Badezimmer-Sanierung, Rohrreinigung, WC-Installation, Dusche und Badewanne</p>
      
      <h3>Heizungstechnik</h3>
      <p>Heizungsinstallation, Wartung, Reparatur, Heizungsbau, moderne Heizsysteme</p>
      
      <h3>Klimatechnik</h3>
      <p>Klimaanlagen, Lüftungsanlagen, Installation und Service</p>
      
      <h2>Notdienst</h2>
      <p>24h Notdienst für Heizung und Sanitär. Schnelle Hilfe bei Wasserschäden und Heizungsausfällen.</p>
      
      <h2>Kontakt</h2>
      <p>Rufen Sie uns an oder schreiben Sie uns eine E-Mail. Wir beraten Sie gerne!</p>
      
      <img src="/images/team.jpg" alt="Unser Sanitär Team" />
      <img src="/images/badezimmer.jpg" alt="Moderne Badezimmer Sanierung" />
      <img src="/images/heizung.jpg" alt="Heizungsinstallation" />
    </body>
    </html>`;
  }

  static async analyzeWebsite(url: string): Promise<WebsiteContent> {
    try {
      console.log('Starting enhanced website analysis for:', url);
      
      const htmlContent = await this.fetchWebsiteContent(url);
      console.log('HTML content retrieved, length:', htmlContent.length);
      
      return this.parseHtmlContent(htmlContent, url);
    } catch (error) {
      console.error('Website analysis failed:', error);
      // No fallback - return empty result
      console.log('No content available, returning empty result');
      return this.parseHtmlContent('', url);
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
    
    console.log('Website analysis completed:', {
      title,
      contentLength: content.length,
      h1Count: h1Elements.length,
      h2Count: h2Elements.length,
      keywordCount: keywords.length
    });
    
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

  static analyzeKeywordsForIndustry(content: WebsiteContent, industry: string, focusAreas?: string[] | null): Array<{
    keyword: string;
    found: boolean;
    position: number;
    volume: number;
    density: number;
  }> {
    const industryKeywords = this.getIndustryKeywords(industry, focusAreas);
    
    // Bereite Text vor - verschiedene Bereiche getrennt für bessere Analyse
    const titleText = (content.title || '').toLowerCase();
    const metaText = (content.metaDescription || '').toLowerCase();
    const bodyText = (content.content || '').toLowerCase();
    
    console.log('=== BALANCED KEYWORD ANALYSIS ===');
    console.log('Content lengths:', { 
      title: titleText.length, 
      meta: metaText.length, 
      body: bodyText.length 
    });
    console.log('Industry:', industry);
    console.log('Checking keywords:', industryKeywords);
    
    return industryKeywords.map(keyword => {
      const keywordLower = keyword.toLowerCase().trim();
      let found = false;
      let position = 0;
      let confidence = 0; // Vertrauenswert 0-100
      const volume = this.getKeywordVolume(keyword, industry);
      
      console.log(`\n--- Analyzing: "${keyword}" ---`);
      
      if (keywordLower.length > 1) {
        // 1. Exakte Übereinstimmung (höchste Priorität)
        if (titleText.includes(keywordLower)) {
          found = true;
          confidence = 100;
          position = Math.floor(Math.random() * 3) + 1;
          console.log(`✓ TITLE EXACT: "${keyword}" (confidence: 100)`);
        }
        else if (metaText.includes(keywordLower)) {
          found = true;
          confidence = 90;
          position = Math.floor(Math.random() * 5) + 3;
          console.log(`✓ META EXACT: "${keyword}" (confidence: 90)`);
        }
        else if (bodyText.includes(keywordLower)) {
          found = true;
          confidence = 80;
          position = Math.floor(Math.random() * 10) + 5;
          console.log(`✓ BODY EXACT: "${keyword}" (confidence: 80)`);
        }
        
        // 2. Nur für längere Keywords: Wortteile-Suche
        if (!found && keywordLower.length >= 8) {
          const words = keywordLower.split(/[\s\-]+/).filter(w => w.length >= 4);
          if (words.length >= 2) {
            let foundWords = 0;
            let foundInTitle = false;
            
            for (const word of words) {
              if (titleText.includes(word) || metaText.includes(word)) {
                foundWords++;
                foundInTitle = true;
              } else if (bodyText.includes(word)) {
                foundWords++;
              }
            }
            
            // Mindestens 75% der Wortteile müssen gefunden werden
            if (foundWords >= Math.ceil(words.length * 0.75)) {
              found = true;
              confidence = foundInTitle ? 70 : 60;
              position = foundInTitle ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 8) + 8;
              console.log(`✓ PARTS MATCH: "${keyword}" (${foundWords}/${words.length} parts, confidence: ${confidence})`);
            }
          }
        }
        
        // 3. Nur für spezielle Fälle: Variationen
        if (!found && keywordLower.length >= 5) {
          const variations = this.getKeywordVariations(keywordLower);
          for (const variation of variations) {
            if (titleText.includes(variation) || metaText.includes(variation)) {
              found = true;
              confidence = 65;
              position = Math.floor(Math.random() * 7) + 4;
              console.log(`✓ VARIATION: "${keyword}" as "${variation}" (confidence: 65)`);
              break;
            }
          }
        }
        
        if (!found) {
          console.log(`✗ NOT FOUND: "${keyword}"`);
        }
      }
      
      // Berechne realistische Dichte
      let density = 0;
      if (found) {
        const allText = `${titleText} ${metaText} ${bodyText}`;
        const matches = (allText.match(new RegExp(keywordLower, 'g')) || []).length;
        const totalWords = allText.split(/\s+/).filter(w => w.length > 2).length;
        density = totalWords > 0 ? (matches / totalWords) * 100 : 0;
      }
      
      return {
        keyword,
        found,
        position,
        volume,
        density: Math.round(density * 100) / 100
      };
    });
  }

  private static getKeywordVolume(keyword: string, industry: string): number {
    // Realistische Suchvolumina basierend auf Keyword-Typ
    const highVolumeKeywords = ['sanitär', 'heizung', 'elektriker', 'maler', 'dachdecker'];
    const mediumVolumeKeywords = ['installation', 'wartung', 'reparatur', 'service', 'notdienst'];
    
    if (highVolumeKeywords.includes(keyword.toLowerCase())) {
      return Math.floor(Math.random() * 800) + 500; // 500-1300
    } else if (mediumVolumeKeywords.includes(keyword.toLowerCase())) {
      return Math.floor(Math.random() * 400) + 200; // 200-600
    } else {
      return Math.floor(Math.random() * 200) + 50; // 50-250
    }
  }

  static getIndustryKeywords(industry: string, focusAreas?: string[] | null): string[] {
    const keywords = {
      'shk': [
        // Grundbegriffe
        'sanitär', 'heizung', 'klima', 'installation', 'wartung', 'notdienst',
        'rohrreinigung', 'badezimmer', 'bad', 'dusche', 'wc', 'toilette',
        'heizungsbau', 'klimaanlage', 'lüftung', 'installateur', 'handwerker',
        
        // Erweiterte Bad-Keywords
        'badsanierung', 'badplanung', 'badumbau', 'badmodernisierung',
        'badausstattung', 'badrenovierung', 'badeinrichtung', 'badfliesen',
        'badkeramik', 'badmöbel', 'badewanne', 'badgarnitur', 'badezimmersanierung',
        
        // Heizung erweitert
        'heizungssanierung', 'heizungsoptimierung', 'heizkessel', 'brenner',
        'thermostat', 'heizkörper', 'fußbodenheizung', 'gasheizung', 'ölheizung',
        'wärmepumpe', 'solarthermie', 'fernwärme', 'heizungstechnik',
        
        // Sanitär erweitert
        'sanitärinstallation', 'wasserinstallation', 'abwasser', 'rohrleitungsbau',
        'sanitärtechnik', 'wassertechnik', 'rohrverlegung', 'sanitärkeramik',
        'armaturen', 'wasserhahn', 'spüle', 'waschbecken', 'bidet',
        
        // Klima/Lüftung erweitert
        'klimatechnik', 'lüftungstechnik', 'belüftung', 'entlüftung',
        'raumlufttechnik', 'luftqualität', 'wohnraumlüftung', 'klimaservice'
      ],
      
      'maler': [
        // Grundbegriffe
        'malerei', 'maler', 'lackierung', 'fassade', 'anstrich', 'renovierung',
        'innenausbau', 'tapezieren', 'streichen', 'lackierer', 'farbe', 'putz',
        'wandgestaltung', 'bodenbelag', 'malerarbeiten',
        
        // Fassade erweitert
        'fassadenanstrich', 'fassadensanierung', 'fassadenreinigung', 'fassadendämmung',
        'wärmedämmung', 'vollwärmeschutz', 'außenanstrich', 'fassadengestaltung',
        
        // Innenbereich erweitert
        'innenanstrich', 'raumgestaltung', 'wohnraumgestaltung', 'deckenanstrich',
        'wandanstrich', 'tapeten', 'vliestapete', 'rauhfaser', 'strukturputz',
        'dekorputz', 'spachteltechnik', 'lasurtechnik', 'wischtechnik',
        
        // Bodenbelag erweitert
        'laminat', 'parkett', 'vinyl', 'pvc', 'teppichboden', 'fliesen',
        'bodenbeschichtung', 'estrich', 'bodenverlegung', 'bodensanierung',
        
        // Lackierung erweitert
        'holzlackierung', 'metalllackierung', 'möbellackierung', 'türenlackierung',
        'fensterlackierung', 'heizkörperlackierung', 'korrosionsschutz', 'grundierung'
      ],
      
      'elektriker': [
        // Grundbegriffe
        'elektro', 'elektriker', 'installation', 'beleuchtung', 'smart home',
        'elektroinstallation', 'strom', 'kabel', 'sicherung', 'steckdose',
        'lichtschalter', 'elektrotechnik', 'photovoltaik', 'solar',
        
        // Installation erweitert
        'elektroplanung', 'hauselektrik', 'gebäudeelektrik', 'industrieelektrik',
        'kabelverlegung', 'leitungsverlegung', 'verteilerbau', 'schaltschrankbau',
        'sicherungskasten', 'fi-schutzschalter', 'überspannungsschutz',
        
        // Beleuchtung erweitert
        'led-beleuchtung', 'außenbeleuchtung', 'innenbeleuchtung', 'lichtplanung',
        'lichtsteuerung', 'dimmer', 'bewegungsmelder', 'zeitschaltuhr',
        'notbeleuchtung', 'sicherheitsbeleuchtung', 'gartenbeleuchtung',
        
        // Smart Home erweitert
        'hausautomation', 'gebäudeautomation', 'smarthome', 'iot', 'vernetzung',
        'smart-home-system', 'intelligente-steuerung', 'app-steuerung',
        'sprachsteuerung', 'sensortechnik', 'überwachungstechnik',
        
        // Energie erweitert
        'solaranlage', 'photovoltaikanlage', 'pv-anlage', 'solartechnik',
        'energiespeicher', 'batteriespeicher', 'wallbox', 'elektromobilität',
        'ladesäule', 'energiemanagement', 'netzeinspeisung'
      ],
      
      'dachdecker': [
        // Grundbegriffe
        'dach', 'dachdecker', 'dachdeckung', 'ziegel', 'abdichtung',
        'flachdach', 'steildach', 'dachrinne', 'schiefer', 'bedachung',
        'dachsanierung', 'dachaufbau', 'zimmerei',
        
        // Dacharten erweitert
        'satteldach', 'walmdach', 'pultdach', 'mansarddach', 'tonnendach',
        'sheddach', 'dachgaube', 'dachfenster', 'lichtkuppel', 'oberlicht',
        
        // Materialien erweitert
        'dachziegel', 'dachstein', 'tonziegel', 'betondachstein', 'metalldach',
        'blechdach', 'kupferdach', 'zinkdach', 'reet', 'stroh', 'holzschindel',
        'schieferplatte', 'eternit', 'wellblech', 'trapezblech',
        
        // Abdichtung erweitert
        'dachabdichtung', 'flachdachabdichtung', 'bitumen', 'schweißbahn',
        'kunststoffbahn', 'epdm', 'tpo', 'pvc-folie', 'dampfsperre',
        'dampfbremse', 'unterspannbahn', 'unterdeckbahn',
        
        // Dämmung & Energie
        'dachdämmung', 'zwischensparrendämmung', 'aufsparrendämmung',
        'untersparrendämmung', 'wärmedämmung', 'dachbegrünung', 'gründach',
        'extensivbegrünung', 'intensivbegrünung', 'solardach'
      ],
      
      'stukateur': [
        // Grundbegriffe
        'stuck', 'stuckateur', 'putz', 'fassade', 'innenausbau',
        'trockenbau', 'wärmedämmung', 'verputz', 'gipskarton',
        'dämmung', 'sanierung', 'renovierung',
        
        // Putzarten erweitert
        'innenputz', 'außenputz', 'grundputz', 'oberputz', 'edelputz',
        'strukturputz', 'reibeputz', 'kratzputz', 'scheibenputz',
        'mineralputz', 'silikatputz', 'silikonputz', 'kunstharzputz',
        'kalkputz', 'lehmputz', 'gipsputz', 'zementputz',
        
        // Stuck erweitert
        'stuckarbeiten', 'stuckrestaurierung', 'stuckprofile', 'stuckleisten',
        'stuckrosetten', 'stuck-ornamente', 'gipsstuck', 'kunststoffstuck',
        'styroporstuck', 'polyurethanstuck', 'profilleisten', 'zierleisten',
        
        // Trockenbau erweitert
        'trockenbauwand', 'vorsatzschale', 'ständerwand', 'metallständer',
        'gipskartonplatte', 'gipsfaserplatte', 'osb-platte', 'rigips',
        'knauf', 'abhangdecke', 'unterdecke', 'akustikdecke',
        
        // Dämmung erweitert
        'innendämmung', 'kerndämmung', 'perimeterdämmung', 'kellerdämmung',
        'bodendämmung', 'deckendämmung', 'wanddämmung', 'dämmstoff',
        'mineralwolle', 'steinwolle', 'glaswolle', 'polystyrol', 'polyurethan'
      ],
      
      'planungsbuero': [
        // Grundbegriffe
        'planung', 'planungsbüro', 'versorgungstechnik', 'beratung',
        'ingenieurbüro', 'haustechnik', 'gebäudetechnik', 'technikplanung',
        'anlagenbau', 'projektierung', 'consulting',
        
        // Planungsarten erweitert
        'ausführungsplanung', 'entwurfsplanung', 'genehmigungsplanung',
        'werkplanung', 'detailplanung', 'technische-planung', 'fachplanung',
        'objektplanung', 'tragwerksplanung', 'bauplanung', 'anlagenplanung',
        
        // Gebäudetechnik erweitert
        'heizungsplanung', 'lüftungsplanung', 'sanitärplanung', 'elektroplanung',
        'brandschutzplanung', 'sicherheitstechnik', 'msr-technik', 'automation',
        'gebäudeleittechnik', 'facility-management-planung',
        
        // Energie & Nachhaltigkeit
        'energieplanung', 'energiekonzept', 'energieberatung', 'energieausweis',
        'nachhaltigkeit', 'green-building', 'leed', 'breeam', 'dgnb',
        'passivhaus', 'nullenergiehaus', 'plusenergiehaus', 'kfw-standard',
        
        // Software & Methoden
        'cad-planung', 'bim', 'building-information-modeling', '3d-planung',
        'simulation', 'energiesimulation', 'strömungssimulation', 'fem-analyse'
      ],
      
      'facility-management': [
        // Kerndienste
        'facility management', 'facility', 'gebäudemanagement', 'hausmeisterdienst', 
        'hausmeister', 'gebäudedienste', 'objektbetreuung', 'liegenschaftsservice',
        'immobilienservice', 'property-management', 'objektservice',
        
        // Reinigungsdienste erweitert
        'reinigung', 'gebäudereinigung', 'büroreinigung', 'unterhaltsreinigung',
        'grundreinigung', 'glasreinigung', 'fensterreinigung', 'teppichreinigung',
        'industriereinigung', 'sonderreinigung', 'desinfektionsreinigung',
        'praxisreinigung', 'arztpraxisreinigung', 'kanzleireinigung',
        'einzelhandelsreinigung', 'ladenreinigung', 'verkaufsraumreinigung',
        'gastronomiereinigung', 'restaurantreinigung', 'hotelreinigung',
        
        // Technische Dienste erweitert
        'wartung', 'instandhaltung', 'technischer service', 'anlagenwartung',
        'haustechnik', 'gebäudetechnik', 'klimawartung', 'heizungswartung',
        'aufzugswartung', 'sicherheitstechnik', 'brandschutz', 'störungsdienst',
        'reparaturdienst', 'kleinreparaturen', 'handwerkerdienste',
        
        // Sicherheitsdienste erweitert
        'sicherheitsdienst', 'pförtnerdienst', 'empfangsdienst', 'kontrolldienst',
        'objektschutz', 'überwachung', 'zutrittskontrolle', 'werkschutz',
        'bewachung', 'sicherheitskonzept', 'alarmanlage', 'videoüberwachung',
        
        // Grünpflege & Außenbereich erweitert
        'grünpflege', 'gartenpflege', 'landschaftspflege', 'winterdienst',
        'schneeräumung', 'streudienst', 'außenanlagenpflege', 'rasenpflege',
        'heckenschnitt', 'baumschnitt', 'unkrautentfernung', 'bewässerung',
        'spielplatzwartung', 'parkplatzreinigung', 'gehwegreinigung',
        
        // Catering & Verpflegung erweitert
        'catering', 'kantinenbetrieb', 'verpflegung', 'betriebsgastronomie',
        'mensabetrieb', 'automatenbetrieb', 'getränkeservice', 'eventcatering',
        'businesscatering', 'meetingservice', 'konferenzservice',
        
        // Energiemanagement erweitert
        'energiemanagement', 'energieoptimierung', 'energieeffizienz',
        'verbrauchsmanagement', 'nachhaltigkeit', 'energiecontrolling',
        'energiemonitoring', 'stromablesung', 'wasserablesung', 'heizungsablesung',
        
        // Arbeitsplatzservice erweitert
        'arbeitsplatzservice', 'büroservice', 'postservice', 'reprographie',
        'dokumentenmanagement', 'archivierung', 'kurierdienst', 'botendienst',
        'telefondienst', 'rezeptionsdienst', 'besuchermanagement',
        
        // Spezialbereiche erweitert
        'krankenhaus', 'klinik', 'praxis', 'labor', 'pharma', 'produktion',
        'schulreinigung', 'universitätsreinigung', 'hotelreinigung', 'einzelhandel',
        'logistik', 'bankreinigung', 'versicherungsreinigung', 'behördenreinigung',
        'justizreinigung', 'flughafenreinigung', 'bahnhofsreinigung'
      ],
      
      'holzverarbeitung': [
        'schreiner', 'tischler', 'holz', 'möbel', 'küche',
        'einbauschrank', 'massivholz', 'furnierte', 'holzbearbeitung',
        'maßanfertigung', 'innenausbau', 'treppen', 'parkett',
        'fenster', 'türen', 'holzfenster', 'holztüren',
        'restaurierung', 'antike möbel', 'reparatur', 'oberflächenbehandlung',
        'lackierung', 'beizen', 'ölen', 'wachsen', 'hobeln',
        'sägen', 'fräsen', 'verbindungen', 'holzverbindungen',
        'schreinerei', 'tischlerei', 'handwerk', 'möbelbau'
      ]
    };
    
    const allKeywords = keywords[industry as keyof typeof keywords] || ['handwerk', 'service', 'betrieb'];
    
    // Filter by focus areas if provided
    if (focusAreas && focusAreas.length > 0) {
      const industryMapping = focusAreaKeywordMapping[industry];
      if (industryMapping) {
        // Collect all keyword patterns for selected focus areas
        const allowedPatterns = new Set<string>();
        for (const areaId of focusAreas) {
          const patterns = industryMapping[areaId];
          if (patterns) {
            patterns.forEach((p: string) => allowedPatterns.add(p.toLowerCase()));
          }
        }
        
        // Filter: keep keyword if it matches any allowed pattern
        if (allowedPatterns.size > 0) {
          const filtered = allKeywords.filter(kw => {
            const kwLower = kw.toLowerCase();
            for (const pattern of allowedPatterns) {
              if (kwLower.includes(pattern) || pattern.includes(kwLower)) {
                return true;
              }
            }
            return false;
          });
          // Return filtered if we got results, otherwise fall back to all
          return filtered.length > 0 ? filtered : allKeywords;
        }
      }
    }
    
    return allKeywords;
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
    const linkHrefs = content.links.map(link => link.href.toLowerCase()).join(' ');
    
    // Prüfe auf Impressum-Link
    const imprintKeywords = ['impressum', 'imprint', 'rechtlich', 'legal'];
    const hasImprintLink = imprintKeywords.some(keyword => 
      linkTexts.includes(keyword) || linkHrefs.includes(keyword)
    );
    
    // Prüfe auf rechtliche Elemente im Inhalt
    const legalElements = {
      'Geschäftsführer/Inhaber': /geschäftsführer|inhaber|geschäftsleitung|chef|direktor|geschäftsführerin/i,
      'Firmenanschrift': /adresse|anschrift|sitz|straße|str\.|platz|weg|address/i,
      'Kontaktdaten': /telefon|phone|tel\.|email|mail|kontakt|fax|@/i,
      'Handelsregister': /handelsregister|hrb|hra|hr\s*[ab]|registergericht/i,
      'USt-IdNr.': /ust[\-\s]*id|umsatzsteuer[\-\s]*id|vat[\-\s]*id|de\d{9}/i,
      'Datenschutzerklärung': /datenschutz|privacy|gdpr|dsgvo|datenschutzerkl/i
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
    
    // Verbesserte Score-Berechnung
    let score = 0;
    if (found) {
      score = Math.max(25, completeness);
      if (hasImprintLink) score += 15; // Bonus für separaten Impressum-Link
      if (foundElements.includes('Datenschutzerklärung')) score += 10; // DSGVO-Bonus
    }
    
    return {
      found,
      completeness,
      foundElements,
      missingElements,
      score: Math.min(100, score)
    };
  }

  private static getKeywordVariations(keyword: string): string[] {
    const variations: string[] = [keyword];
    
    // Deutsche Plural-Endungen
    if (!keyword.endsWith('s')) variations.push(keyword + 's');
    if (!keyword.endsWith('e')) variations.push(keyword + 'e');
    if (!keyword.endsWith('en')) variations.push(keyword + 'en');
    if (!keyword.endsWith('er')) variations.push(keyword + 'er');
    
    // Umlaute-Variationen
    const umlautMap: { [key: string]: string[] } = {
      'ä': ['ae', 'a'],
      'ö': ['oe', 'o'],
      'ü': ['ue', 'u'],
      'ß': ['ss']
    };
    
    Object.entries(umlautMap).forEach(([umlaut, replacements]) => {
      if (keyword.includes(umlaut)) {
        replacements.forEach(replacement => {
          variations.push(keyword.replace(umlaut, replacement));
        });
      }
    });
    
    // Spezielle Handwerks-Variationen für alle Branchen
    const specialVariations: { [key: string]: string[] } = {
      // SHK
      'sanitär': ['sanitaer', 'sanitar', 'sanitaertechnik', 'sanitärinstallation', 'sanitärservice'],
      'heizung': ['heizungstechnik', 'heizungsbau', 'heizungsinstallation', 'heizungsservice', 'heizungsreparatur'],
      
      // Elektriker
      'elektriker': ['elektro', 'elektrotechnik', 'elektroinstallation', 'elektroservice', 'elektrofachbetrieb'],
      'installation': ['installationstechnik', 'installateur', 'installationsservice'],
      'beleuchtung': ['licht', 'lichttechnik', 'lichtplanung', 'beleuchtungstechnik'],
      
      // Maler
      'malerei': ['maler', 'malerarbeiten', 'malerservice', 'malerbetrieb', 'malerfachbetrieb'],
      'lackierung': ['lackierer', 'lackierarbeiten', 'lackierservice', 'autolackierung'],
      'fassade': ['fassadenarbeiten', 'fassadentechnik', 'fassadengestaltung', 'fassadensanierung'],
      
      // Dachdecker
      'dach': ['dacharbeiten', 'dachservice', 'dachbau', 'dachsystem'],
      'dachdecker': ['dachdeckerei', 'dachdeckerbetrieb', 'dachdeckermeister'],
      'bedachung': ['dachdeckung', 'dacheindeckung', 'dachbedachung'],
      
      // Stuckateur
      'stuckateur': ['stuck', 'stuckarbeiten', 'stuckservice', 'stuckbetrieb'],
      'putz': ['verputz', 'putzarbeiten', 'putztechnik', 'putzservice'],
      'trockenbau': ['trockenbauwand', 'trockenbauarbeiten', 'trockenbauwände'],
      
      // Facility Management
      'facility': ['facilities', 'facility-management', 'facilitymanagement'],
      'gebäudereinigung': ['reinigung', 'reinigungsservice', 'reinigungsdienst', 'gebäudereiniger'],
      'hausmeister': ['hausmeisterdienst', 'hausmeisterservice', 'haustechnik'],
      'wartung': ['instandhaltung', 'service', 'wartungsservice', 'wartungsdienst'],
      'sicherheit': ['sicherheitsdienst', 'objektschutz', 'bewachung', 'security'],
      
      // Planungsbüro
      'planung': ['planungsservice', 'planungsleistung', 'fachplanung', 'projektplanung'],
      'beratung': ['consulting', 'beratungsservice', 'ingenieursberatung', 'fachberatung']
    };
    
    if (specialVariations[keyword]) {
      variations.push(...specialVariations[keyword]);
    }
    
    return [...new Set(variations)]; // Duplikate entfernen
  }

  private static calculateKeywordPosition(keyword: string, content: WebsiteContent, matchType: string): number {
    const keywordLower = keyword.toLowerCase();
    const titleMatch = content.title.toLowerCase().includes(keywordLower);
    const metaMatch = content.metaDescription.toLowerCase().includes(keywordLower);
    const h1Match = content.headings.h1.some(h => h.toLowerCase().includes(keywordLower));
    const h2Match = content.headings.h2.some(h => h.toLowerCase().includes(keywordLower));
    
    // Bonus für exakte Treffer
    const exactBonus = matchType === 'exact' ? 5 : 0;
    
    if (titleMatch) {
      return Math.max(1, Math.floor(Math.random() * 5) + 1 - exactBonus); // Top 5 für Titel
    } else if (metaMatch) {
      return Math.max(1, Math.floor(Math.random() * 10) + 6 - exactBonus); // Position 6-15 für Meta
    } else if (h1Match) {
      return Math.max(1, Math.floor(Math.random() * 10) + 4 - exactBonus); // Position 4-13 für H1
    } else if (h2Match) {
      return Math.max(1, Math.floor(Math.random() * 15) + 8 - exactBonus); // Position 8-22 für H2
    } else {
      // Standard Content-Position
      return Math.max(1, Math.floor(Math.random() * 30) + 15 - exactBonus); // Position 15-44
    }
  }
}
