import { RealBusinessData } from './BusinessAnalysisService';

export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagCriterion: string;
  legalRelevance: 'low' | 'medium' | 'high' | 'critical';
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

export interface AccessibilityResult {
  score: number;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'partial' | 'failing';
  violations: AccessibilityViolation[];
  passes: Array<{
    id: string;
    description: string;
    wcagLevel: 'A' | 'AA' | 'AAA';
  }>;
  incomplete: Array<{
    id: string;
    description: string;
    help: string;
    wcagLevel: 'A' | 'AA' | 'AAA';
  }>;
  legalRisk: {
    level: 'very-low' | 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
    recommendations: string[];
  };
  checkedWithRealAPI?: boolean;
  lighthouseVersion?: string;
  fetchTime?: string;
}

/**
 * WCAG 2.1 konformer Accessibility-Service
 * Basiert auf axe-core Regeln und deutschen Rechtsnormen
 */
export class AccessibilityService {
  
  /**
   * Führt eine echte Barrierefreiheitsprüfung mit Google Lighthouse durch
   * Nutzt Caching um API-Calls zu reduzieren und Rate-Limiting zu vermeiden
   */
  static async analyzeAccessibility(url: string, realData?: RealBusinessData): Promise<AccessibilityResult> {
    console.log('Starting accessibility analysis with cache check for:', url);
    
    try {
      // 1. Check cache first
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: cachedData, error: cacheError } = await supabase
        .from('accessibility_cache')
        .select('result, expires_at')
        .eq('url', url)
        .maybeSingle();

      if (!cacheError && cachedData) {
        const expiresAt = new Date(cachedData.expires_at);
        if (expiresAt > new Date()) {
          console.log('✅ Using cached accessibility data (expires:', expiresAt.toISOString(), ')');
          return cachedData.result as unknown as AccessibilityResult;
        } else {
          console.log('⏰ Cache expired, fetching fresh data');
        }
      }

      // 2. No valid cache, call edge function for real Lighthouse check
      console.log('🔍 Fetching fresh accessibility data from API');
      const response = await fetch(
        `https://dfzuijskqjbtpckzzemh.supabase.co/functions/v1/check-accessibility`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        }
      );

      if (!response.ok) {
        console.error('Accessibility check failed:', response.status);
        return null;
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        console.error('Invalid accessibility check response');
        return null;
      }

      console.log('Real accessibility data received:', result.data);

      // Calculate legal risk based on real violations
      const legalRisk = this.assessLegalRisk(result.data.violations, result.data.score);

      const finalResult: AccessibilityResult = {
        ...result.data,
        legalRisk,
        checkedWithRealAPI: true
      };

      // 3. Store in cache (upsert to handle duplicates)
      try {
        await supabase
          .from('accessibility_cache')
          .upsert([{
            url,
            result: finalResult as any,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h from now
          }], {
            onConflict: 'url'
          });
        console.log('💾 Cached accessibility data for 24 hours');
      } catch (cacheWriteError) {
        console.warn('Failed to cache result:', cacheWriteError);
        // Continue even if caching fails
      }

      return finalResult;
    } catch (error) {
      console.error('Error during accessibility check:', error);
      return null;
    }
  }

  /**
   * Fallback: Simulierte Accessibility-Daten wenn API nicht verfügbar
   */
  static async generateFallbackAccessibilityData(url: string, realData?: RealBusinessData): Promise<AccessibilityResult> {
    console.log('Using fallback simulated accessibility data');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Extrahiere verfügbare Daten aus realData - verwende korrekte Properties
    const hasMetaDescription = realData?.seo?.metaDescription && realData.seo.metaDescription.length > 0;
    const hasHeadings = realData?.seo?.headings && Object.keys(realData.seo.headings).length > 0;
    const hasImages = realData?.seo?.altTags !== undefined;
    const imageCount = realData?.seo?.altTags?.total || 0;
    
    // Erstelle realistische Violations basierend auf häufigen Problemen
    const violations: AccessibilityViolation[] = [];
    const passes: Array<{ id: string; description: string; wcagLevel: 'A' | 'AA' | 'AAA' }> = [];
    const incomplete: Array<{ id: string; description: string; help: string; wcagLevel: 'A' | 'AA' | 'AAA' }> = [];
    
    // Häufige kritische Probleme
    if (imageCount > 0) {
      violations.push({
        id: 'image-alt',
        impact: 'critical',
        description: 'Bilder ohne Alternativtext gefunden',
        help: 'Alle informativen Bilder müssen aussagekräftige Alt-Texte haben',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
        wcagLevel: 'A',
        wcagCriterion: '1.1.1 Non-text Content',
        legalRelevance: 'critical',
        nodes: [
          {
            html: '<img src="service-image.jpg" />',
            target: ['img:nth-child(1)'],
            failureSummary: 'Element hat kein alt-Attribut'
          }
        ]
      });
    }
    
    // Color contrast ist ein sehr häufiges Problem
    violations.push({
      id: 'color-contrast',
      impact: 'serious',
      description: 'Unzureichender Farbkontrast erkannt',
      help: 'Text muss ein Kontrastverhältnis von mindestens 4.5:1 haben',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
      wcagLevel: 'AA',
      wcagCriterion: '1.4.3 Contrast (Minimum)',
      legalRelevance: 'high',
      nodes: [
        {
          html: '<button class="btn-primary">Kontakt</button>',
          target: ['.btn-primary'],
          failureSummary: 'Kontrastverhältnis 3.2:1 (erforderlich: 4.5:1)'
        }
      ]
    });
    
    // Heading structure problems
    if (hasHeadings) {
      violations.push({
        id: 'heading-order',
        impact: 'moderate',
        description: 'Unlogische Überschriftenstruktur',
        help: 'Überschriften sollten hierarchisch geordnet sein (H1, H2, H3...)',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
        wcagLevel: 'AA',
        wcagCriterion: '2.4.6 Headings and Labels',
        legalRelevance: 'medium',
        nodes: [
          {
            html: '<h3>Unsere Services</h3>',
            target: ['h3:first-of-type'],
            failureSummary: 'H3 nach H1 ohne H2 dazwischen'
          }
        ]
      });
    }
    
    // Form labels - sehr häufiges Problem
    violations.push({
      id: 'label',
      impact: 'critical',
      description: 'Formularfelder ohne korrekte Beschriftung',
      help: 'Alle Eingabefelder müssen eindeutige Labels haben',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
      wcagLevel: 'A',
      wcagCriterion: '3.3.2 Labels or Instructions',
      legalRelevance: 'critical',
      nodes: [
        {
          html: '<input type="email" placeholder="E-Mail" />',
          target: ['input[type="email"]'],
          failureSummary: 'Eingabefeld hat kein label-Element oder aria-label'
        }
      ]
    });
    
    // Focus management
    violations.push({
      id: 'focus-order-semantics',
      impact: 'serious',
      description: 'Problematische Fokusreihenfolge',
      help: 'Interaktive Elemente müssen in logischer Reihenfolge fokussierbar sein',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
      wcagLevel: 'A',
      wcagCriterion: '2.4.3 Focus Order',
      legalRelevance: 'high',
      nodes: [
        {
          html: '<div tabindex="5">Navigation</div>',
          target: ['[tabindex="5"]'],
          failureSummary: 'Tabindex-Werte sollten 0 oder -1 sein'
        }
      ]
    });
    
    // Skip links missing
    violations.push({
      id: 'bypass',
      impact: 'serious',
      description: 'Fehlende Skip-Links',
      help: 'Nutzer müssen wiederholte Inhalte überspringen können',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html',
      wcagLevel: 'A',
      wcagCriterion: '2.4.1 Bypass Blocks',
      legalRelevance: 'high',
      nodes: [
        {
          html: '<nav>...</nav>',
          target: ['nav'],
          failureSummary: 'Kein "Skip to main content" Link vorhanden'
        }
      ]
    });
    
    // Positive Aspekte (Passes)
    passes.push(
      {
        id: 'document-title',
        description: 'Seite hat einen aussagekräftigen Titel',
        wcagLevel: 'A'
      },
      {
        id: 'html-has-lang',
        description: 'HTML-Element hat lang-Attribut',
        wcagLevel: 'A'
      },
      {
        id: 'landmark-one-main',
        description: 'Seite hat ein main-Element',
        wcagLevel: 'A'
      },
      {
        id: 'meta-viewport',
        description: 'Viewport Meta-Tag ist korrekt',
        wcagLevel: 'AA'
      }
    );
    
    // Manuelle Prüfungen erforderlich
    incomplete.push(
      {
        id: 'keyboard-navigation',
        description: 'Vollständige Tastaturnavigation prüfen',
        help: 'Alle Funktionen müssen ohne Maus erreichbar sein',
        wcagLevel: 'A'
      },
      {
        id: 'screen-reader-testing',
        description: 'Screen Reader Kompatibilität testen',
        help: 'Test mit NVDA, JAWS oder VoiceOver empfohlen',
        wcagLevel: 'A'
      },
      {
        id: 'motion-reduced',
        description: 'Animationen bei prefers-reduced-motion prüfen',
        help: 'Nutzer müssen Animationen deaktivieren können',
        wcagLevel: 'AAA'
      }
    );
    
    // Score berechnen mit neuer Logik: Bei Problemen sofort 59% oder weniger
    const totalChecks = violations.length + passes.length;
    const baseScore = Math.round((passes.length / totalChecks) * 100);
    const score = violations.length > 0 ? Math.min(59, baseScore) : baseScore;
    
    // WCAG Level bestimmen
    const criticalViolations = violations.filter(v => v.impact === 'critical' || v.wcagLevel === 'A').length;
    const wcagLevel = criticalViolations === 0 ? 'A' : criticalViolations <= 2 ? 'partial' : 'failing';
    
    // Rechtliches Risiko bewerten
    const legalRisk = this.assessLegalRisk(violations, score);
    
    return {
      score,
      wcagLevel,
      violations,
      passes,
      incomplete,
      legalRisk,
      checkedWithRealAPI: false
    };
  }
  
  /**
   * Bewertet das rechtliche Risiko basierend auf deutschen Gesetzen
   */
  private static assessLegalRisk(violations: AccessibilityViolation[], score: number) {
    const criticalCount = violations.filter(v => v.legalRelevance === 'critical').length;
    const highCount = violations.filter(v => v.legalRelevance === 'high').length;
    
    let level: 'very-low' | 'low' | 'medium' | 'high' | 'critical';
    let riskScore: number;
    let factors: string[] = [];
    let recommendations: string[] = [];
    
    // Realistische, praxisnahe Bewertung
    if (criticalCount >= 5 || score < 25) {
      level = 'high';
      riskScore = 70;
      factors = [
        'Viele kritische WCAG-Verstöße erkannt',
        'Deutliche Barrieren für Nutzer mit Behinderungen',
        'Erhöhtes Risiko für Beschwerden'
      ];
      recommendations = [
        'Alt-Texte und Formular-Labels ergänzen',
        'Farbkontraste überprüfen und anpassen',
        'Grundlegende Barrierefreiheit umsetzen'
      ];
    } else if (criticalCount >= 3 || highCount >= 4 || score < 45) {
      level = 'medium';
      riskScore = 50;
      factors = [
        'Mehrere Barrierefreiheitsprobleme vorhanden',
        'Verbesserungsbedarf bei WCAG-Konformität',
        'Einige Nutzer könnten Schwierigkeiten haben'
      ];
      recommendations = [
        'Schrittweise Behebung der kritischen Punkte',
        'Farbkontraste und Navigation verbessern',
        'Accessibility-Grundlagen implementieren'
      ];
    } else if (score < 65) {
      level = 'low';
      riskScore = 30;
      factors = [
        'Barrierefreiheit teilweise umgesetzt',
        'Kleinere Optimierungen erforderlich',
        'Gute Basis für weitere Verbesserungen'
      ];
      recommendations = [
        'Verbleibende Probleme systematisch angehen',
        'Regelmäßige Überprüfung etablieren',
        'Best Practices weiter ausbauen'
      ];
    } else {
      level = 'very-low';
      riskScore = 15;
      factors = [
        'Solide Barrierefreiheit implementiert',
        'WCAG-Grundlagen größtenteils erfüllt',
        'Nutzerfreundlich für verschiedene Bedürfnisse'
      ];
      recommendations = [
        'Aktuelle Standards beibehalten',
        'Kontinuierliche Verbesserung fortsetzen',
        'Neue Features barrierefrei gestalten'
      ];
    }
    
    return {
      level,
      score: riskScore,
      factors,
      recommendations
    };
  }
}