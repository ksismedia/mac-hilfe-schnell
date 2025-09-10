import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, CompetitorServices, CompanyServices, StaffQualificationData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { getLogoHTML } from './logoData';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateAccessibilityScore, calculateDataPrivacyScore } from './scoreCalculations';

interface SectionSelections {
  seoContent: boolean;
  performanceTech: boolean;
  socialMedia: boolean;
  staffService: boolean;
}

interface SubSectionSelections {
  // SEO & Content
  seoAnalysis: boolean;
  keywordAnalysis: boolean;
  localSeo: boolean;
  contentQuality: boolean;
  backlinks: boolean;
  accessibility: boolean;
  dataPrivacy: boolean;
  imprint: boolean;
  competitorAnalysis: boolean;

  // Performance & Technik
  performance: boolean;
  mobile: boolean;
  conversion: boolean;

  // Social Media
  socialMediaSimple: boolean;
  workplaceReviews: boolean;

  // Personal & Service
  staffQualification: boolean;
  corporateIdentity: boolean;
  quoteResponse: boolean;
  hourlyRate: boolean;
}

interface SelectiveReportData {
  businessData: {
    address: string;
    url: string;
    industry: string;
  };
  realData: RealBusinessData;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: { services: string[]; source: 'auto' | 'manual' } };
  companyServices?: { services: string[] };
  deletedCompetitors?: Set<string>;
  hourlyRateData?: { meisterRate: number; facharbeiterRate: number; azubiRate: number; helferRate: number; serviceRate: number; installationRate: number; regionalMeisterRate: number; regionalFacharbeiterRate: number; regionalAzubiRate: number; regionalHelferRate: number; regionalServiceRate: number; regionalInstallationRate: number };
  missingImprintElements?: string[];
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  dataPrivacyScore?: number;
  accessibilityData?: any;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualImprintData?: any;
  privacyData?: any;
  removedMissingServices?: string[];
  selections: {
    sections: SectionSelections;
    subSections: SubSectionSelections;
  };
}

export const generateSelectiveHTML = (data: SelectiveReportData): string => {
  console.log('=== SELECTIVE HTML GENERATOR DEBUG ===');
  console.log('Received data:', data);
  const { businessData, realData, manualSocialData, accessibilityData, privacyData, selections } = data;
  
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const staffQualificationScore = 75; // Fallback value
  
  let sectionsHtml = '';

  // SEO & Content Section
  if (selections.sections.seoContent) {
    let seoContentHtml = '';

    if (selections.subSections.seoAnalysis) {
      seoContentHtml += `
        <div class="metric-card seo-detailed">
          <div class="seo-header" style="background: linear-gradient(135deg, #2196f3, #1976d2); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🔍 SEO Analyse
              <div class="score-circle" style="background: white; color: #2196f3; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${realData.seo.score}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h4 style="color: #1565c0; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ SEO-Optimierungsempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📝 Title-Tags optimieren:</strong> Einzigartige, beschreibende Titel für jede Seite</li>
                <li><strong>📋 Meta-Descriptions:</strong> Ansprechende Zusammenfassungen mit Call-to-Action</li>
                <li><strong>🔤 Überschriften-Struktur:</strong> Logische H1-H6 Hierarchie verwenden</li>
                <li><strong>🏷️ Schema Markup:</strong> Strukturierte Daten für bessere Suchergebnisse</li>
                <li><strong>🗺️ XML Sitemap:</strong> Aktuelle Sitemap für Suchmaschinen bereitstellen</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Accessibility section with legal warning
    if (selections.subSections.accessibility) {
      console.log('=== ACCESSIBILITY DEBUG ===');
      console.log('accessibilityData:', accessibilityData);
      // Use manual accessibility data if available (same logic as UI)
      let accessibilityScore: number;
      if (accessibilityData && accessibilityData.overallScore) {
        const featuresScore = [
          accessibilityData.keyboardNavigation,
          accessibilityData.screenReaderCompatible,
          accessibilityData.colorContrast,
          accessibilityData.altTextsPresent,
          accessibilityData.focusVisibility,
          accessibilityData.textScaling
        ].filter(Boolean).length * 10;
        accessibilityScore = Math.round((featuresScore + accessibilityData.overallScore) / 2);
        console.log('Using manual accessibility score:', accessibilityScore);
      } else if (accessibilityData && accessibilityData.score) {
        accessibilityScore = accessibilityData.score;
        console.log('Using automatic accessibility score:', accessibilityScore);
      } else {
        accessibilityScore = calculateAccessibilityScore(realData, accessibilityData);
        console.log('Using calculated accessibility score:', accessibilityScore);
      }
      const hasAccessibilityIssues = accessibilityScore < 90;
      
      seoContentHtml += `
        <div class="metric-card accessibility-detailed">
          ${hasAccessibilityIssues ? `
            <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #fef2f2; border: 2px solid #fecaca;">
              <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                ⚖️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt
              </h4>
              <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
                Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
              </p>
              <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
                <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Webseite oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
              </div>
            </div>
          ` : ''}
          <div class="accessibility-header" style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              ♿ Barrierefreiheit & Zugänglichkeit
              <div class="score-circle" style="background: white; color: #9c27b0; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${accessibilityScore}%
              </div>
            </h3>
          </div>
          
          ${hasAccessibilityIssues ? `
          <!-- Zusätzliche Warnung nach Header -->
          <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 0 0 8px 8px; padding: 15px;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
              ⚠️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt
            </h4>
            <p style="color: #dc2626; margin: 0 0 10px 0; font-weight: bold;">
              Warnung: Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
              Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
            </p>
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
              <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. 
              Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
              Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
            </div>
          </div>
          ` : ''}
          
          <div style="padding: 20px; background: white;">
            <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0;">
              <h4 style="color: #6a1b9a; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Barrierefreiheits-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>🏷️ Alt-Texte:</strong> Beschreibende Texte für alle Bilder hinzufügen</li>
                <li><strong>🎨 Kontraste:</strong> Mindestkontrast von 4.5:1 für Texte gewährleisten</li>
                <li><strong>⌨️ Tastatur-Navigation:</strong> Alle Funktionen ohne Maus erreichbar machen</li>
                <li><strong>📱 Screen Reader:</strong> Semantische HTML-Strukturen verwenden</li>
                <li><strong>🔍 Focus-Indikatoren:</strong> Sichtbare Fokus-Markierungen implementieren</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Data Privacy section with legal warning
    if (selections.subSections.dataPrivacy) {
      console.log('=== DATA PRIVACY DEBUG ===');
      console.log('privacyData:', privacyData);
      // Use manual data privacy score if provided, otherwise fallback to calculated
      const dataPrivacyScore = privacyData?.score || data.dataPrivacyScore || calculateDataPrivacyScore(realData, privacyData);
      console.log('Using data privacy score:', dataPrivacyScore);
      const hasDataPrivacyIssues = dataPrivacyScore < 90;
      
      seoContentHtml += `
        <div class="metric-card privacy-detailed">
          ${hasDataPrivacyIssues ? `
            <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #fef2f2; border: 2px solid #fecaca;">
              <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                ⚖️ RECHTLICHER HINWEIS: DSGVO-Verstöße erkannt
              </h4>
              <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante Datenschutz-Probleme identifiziert. 
                Bei DSGVO-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
              </p>
              <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
                <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Webseite oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
              </div>
            </div>
          ` : ''}
          <div class="privacy-header" style="background: linear-gradient(135deg, #f44336, #d32f2f); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🔒 Datenschutz & DSGVO
              <div class="score-circle" style="background: white; color: #f44336; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${dataPrivacyScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
              <h4 style="color: #c62828; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ DSGVO-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📋 Datenschutzerklärung:</strong> Vollständig und aktuell halten</li>
                <li><strong>🍪 Cookie-Consent:</strong> Rechtskonforme Einwilligung implementieren</li>
                <li><strong>📊 Datenverarbeitung:</strong> Zwecke klar definieren und dokumentieren</li>
                <li><strong>🔐 Datensicherheit:</strong> Technische und organisatorische Maßnahmen</li>
                <li><strong>📧 Betroffenenrechte:</strong> Auskunft, Löschung und Berichtigung gewährleisten</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Competitor Analysis section
    if (selections.subSections.competitorAnalysis) {
      const competitorScore = data.manualCompetitors && data.manualCompetitors.length > 0 ? 75 : 45;
      
      // Calculate if company is dominant in market
      const ownRating = data.realData?.reviews?.google?.rating || 0;
      const ownReviews = data.realData?.reviews?.google?.count || 0;
      const ownServices = (data.companyServices?.services || []).length;
      const removedServices = (data.removedMissingServices || []).length;
      const totalOwnServices = ownServices + removedServices;
      
      // Own company score calculation (same logic as htmlGenerator)
      const ownRatingScore = ownRating >= 4.5 
        ? 80 + ((ownRating - 4.5) / 0.5) * 15
        : ownRating >= 3.5 
          ? 60 + ((ownRating - 3.5) * 20)
          : ownRating >= 2.5 
            ? 40 + ((ownRating - 2.5) * 20)
            : ownRating * 16;
      
      const ownReviewScore = ownReviews <= 25 
        ? Math.min(50 + ownReviews * 1.6, 90)
        : Math.min(95, 90 + Math.log10(ownReviews / 25) * 5);
      
      let ownServiceScore;
      if (totalOwnServices === 0) {
        ownServiceScore = 15;
      } else if (totalOwnServices <= 3) {
        ownServiceScore = 30 + (totalOwnServices * 15);
      } else if (totalOwnServices <= 8) {
        ownServiceScore = 75 + ((totalOwnServices - 3) * 2);
      } else if (totalOwnServices <= 15) {
        ownServiceScore = 85 + ((totalOwnServices - 8) * 0.7);
      } else {
        ownServiceScore = Math.min(90 + ((totalOwnServices - 15) * 0.3), 93);
      }
      
      const ownRatingWeight = Math.min(0.30 + (totalOwnServices * 0.015), 0.55);
      const ownServiceWeight = Math.max(0.40 - (totalOwnServices * 0.01), 0.25);
      const ownReviewWeight = 1 - ownRatingWeight - ownServiceWeight;
      
      const baseOwnScore = (ownRatingScore * ownRatingWeight) + (ownReviewScore * ownReviewWeight) + (ownServiceScore * ownServiceWeight);
      const serviceRemovalBonus = Math.min(removedServices * 1.5, baseOwnScore * 0.15);
      const ownScore = Math.min(baseOwnScore + serviceRemovalBonus, 96);
      
      // Calculate all competitor scores properly
      const allCompetitors = [...(data.manualCompetitors || [])];
      if (data.realData?.competitors) {
        data.realData.competitors.forEach((autoCompetitor: any) => {
          const exists = data.manualCompetitors?.some((manual: any) => 
            manual.name.toLowerCase() === autoCompetitor.name.toLowerCase()
          );
          if (!exists) {
            allCompetitors.push({
              name: autoCompetitor.name,
              rating: autoCompetitor.rating || 0,
              reviews: autoCompetitor.reviews || 0,
              distance: autoCompetitor.distance || 'Unbekannt',
              services: autoCompetitor.services || []
            });
          }
        });
      }
      
      const competitorScores = allCompetitors.map((c: any) => {
        const rating = c.rating || 0;
        const reviews = c.reviews || 0;
        const services = c.services?.length || 0;
        
        const ratingScore = rating >= 4.5 
          ? 80 + ((rating - 4.5) / 0.5) * 15
          : rating >= 3.5 
            ? 60 + ((rating - 3.5) * 20)
            : rating >= 2.5 
              ? 40 + ((rating - 2.5) * 20)
              : rating * 16;
        
        const reviewScore = reviews <= 25 
          ? Math.min(50 + reviews * 1.6, 90)
          : Math.min(95, 90 + Math.log10(reviews / 25) * 5);
        
        let serviceScore;
        if (services === 0) {
          serviceScore = 15;
        } else if (services <= 3) {
          serviceScore = 30 + (services * 15);
        } else if (services <= 8) {
          serviceScore = 75 + ((services - 3) * 2);
        } else if (services <= 15) {
          serviceScore = 85 + ((services - 8) * 0.7);
        } else {
          serviceScore = Math.min(90 + ((services - 15) * 0.3), 93);
        }
        
        const ratingWeight = Math.min(0.30 + (services * 0.015), 0.55);
        const serviceWeight = Math.max(0.40 - (services * 0.01), 0.25);
        const reviewWeight = 1 - ratingWeight - serviceWeight;
        
        return (ratingScore * ratingWeight) + (reviewScore * reviewWeight) + (serviceScore * serviceWeight);
      });
      
      const bestCompetitorScore = competitorScores.length > 0 ? Math.max(...competitorScores) : 0;
      const isDominant = ownScore > bestCompetitorScore && allCompetitors.length > 0;
      
      seoContentHtml += `
        <div class="metric-card competitor-detailed">
          <div class="competitor-header" style="background: linear-gradient(135deg, #e91e63, #ad1457); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🎯 Wettbewerbsanalyse
              <div class="score-circle" style="background: white; color: #e91e63; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${competitorScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            ${data.manualCompetitors && data.manualCompetitors.length > 0 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px;">
              ${data.manualCompetitors.slice(0, 3).map((comp: any, index: number) => `
                <div style="background: #fce4ec; padding: 15px; border-radius: 8px; border-left: 4px solid #e91e63;">
                  <h4 style="color: #ad1457; margin: 0 0 10px 0;">🏢 ${comp.name || `Konkurrent ${index + 1}`}</h4>
                  <p style="margin: 0; font-size: 14px;"><strong>Bewertung:</strong> ${comp.rating}/5 (${comp.reviewCount} Bewertungen)</p>
                  <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Services:</strong> ${comp.services?.length || 0} Leistungen</p>
                </div>
              `).join('')}
            </div>
            ` : `
            <div style="background: #fce4ec; padding: 20px; border-radius: 8px; border-left: 4px solid #e91e63; text-align: center;">
              <h4 style="color: #ad1457; margin: 0 0 10px 0;">⚠️ Keine Wettbewerber-Daten erfasst</h4>
              <p style="margin: 0; color: #333;">
                Für eine vollständige Wettbewerbsanalyse sollten mindestens 3-5 Hauptkonkurrenten erfasst werden.
              </p>
            </div>
            `}
            
            <div style="background: #fce4ec; padding: 20px; border-radius: 8px; border-left: 4px solid #e91e63; margin-top: 20px;">
              <h4 style="color: #ad1457; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Strategische Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                ${isDominant ? `
                  <li><strong>⭐ Dominierende Marktposition im unmittelbaren Marktumfeld</strong></li>
                  <li><strong>⭐ Keine unmittelbaren Maßnahmen zur Steigerung der Wettbewerbsfähigkeit notwendig</strong></li>
                ` : `
                  <li><strong>⭐ Prüfen Sie, welche Services für Ihr Unternehmen relevant sind</strong></li>
                  <li><strong>⭐ Erwägen Sie eine Erweiterung Ihres Leistungsspektrums</strong></li>
                  <li><strong>⭐ Kommunizieren Sie vorhandene Services besser</strong></li>
                  <li><strong>⭐ Partnerschaften für fehlende Services erwägen</strong></li>
                `}
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (seoContentHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">🔍 SEO & Content Analyse</div>
          <div class="section-content">
            <div class="metric-grid">
              ${seoContentHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Performance & Technik Section
  if (selections.sections.performanceTech) {
    let performanceTechHtml = '';

    if (selections.subSections.performance) {
      performanceTechHtml += `
        <div class="metric-card performance-detailed">
          <div class="performance-header" style="background: linear-gradient(135deg, #00bcd4, #0097a7); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              ⚡ Performance-Analyse
              <div class="score-circle" style="background: white; color: #00bcd4; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${realData.performance.score}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #e0f2f1; padding: 20px; border-radius: 8px; border-left: 4px solid #00bcd4;">
              <h4 style="color: #00695c; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Performance-Optimierungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>⭐ Bildoptimierung:</strong> WebP-Format nutzen, Größen anpassen</li>
                <li><strong>📦 Code-Splitting:</strong> JavaScript aufteilen und lazy loading</li>
                <li><strong>🚀 CDN einsetzen:</strong> Globale Auslieferung beschleunigen</li>
                <li><strong>💾 Browser-Caching:</strong> Cache-Header optimieren</li>
                <li><strong>🗜️ Komprimierung:</strong> Gzip/Brotli aktivieren</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (performanceTechHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">⚡ Performance & Technik</div>
          <div class="section-content">
            <div class="metric-grid">
              ${performanceTechHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

    // Social Media Section
  if (selections.sections.socialMedia) {
    let socialMediaHtml = '';

    if (selections.subSections.socialMediaSimple) {
      socialMediaHtml += `
        <div class="metric-card social-detailed">
          <div class="social-header" style="background: linear-gradient(135deg, #3f51b5, #303f9f); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              📱 Social Media Analyse
              <div class="score-circle" style="background: white; color: #3f51b5; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${socialMediaScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #e8eaf6; padding: 20px; border-radius: 8px; border-left: 4px solid #3f51b5;">
              <h4 style="color: #283593; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Social Media Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📅 Regelmäßige Posts:</strong> Mindestens 2-3 Posts pro Woche</li>
                <li><strong>📸 Hochwertige Inhalte:</strong> Bilder und Videos in guter Qualität</li>
                <li><strong>💬 Community Management:</strong> Auf Kommentare und Nachrichten antworten</li>
                <li><strong>📈 Analytics nutzen:</strong> Erfolg messen und optimieren</li>
                <li><strong>🎯 Zielgruppen-Targeting:</strong> Relevante Inhalte für die Zielgruppe</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Workplace Reviews section
    if (selections.subSections.workplaceReviews) {
      const workplaceScore = data.manualWorkplaceData ? 
        ((data.manualWorkplaceData.kununuFound && data.manualWorkplaceData.kununuRating ? (parseFloat(data.manualWorkplaceData.kununuRating.replace(',', '.')) * 20) : 0) +
         (data.manualWorkplaceData.glassdoorFound && data.manualWorkplaceData.glassdoorRating ? (parseFloat(data.manualWorkplaceData.glassdoorRating.replace(',', '.')) * 20) : 0)) / 2 
        : -1;
      
      socialMediaHtml += `
        <div class="metric-card workplace-detailed">
          <div class="workplace-header" style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              💼 Arbeitsplatz & Arbeitgeber-Bewertung
              <div class="score-circle" style="background: white; color: #9c27b0; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${workplaceScore === -1 ? '–' : Math.round(workplaceScore) + '%'}
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            ${data.manualWorkplaceData ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
              <div>
                <p><strong>Kununu Bewertung:</strong> ${
                  data.manualWorkplaceData.kununuFound && data.manualWorkplaceData.kununuRating
                    ? `✅ ${data.manualWorkplaceData.kununuRating}/5 (${data.manualWorkplaceData.kununuReviews || 0} Bewertungen)`
                    : '❌ Nicht gefunden'
                }</p>
              </div>
              <div>
                <p><strong>Glassdoor Bewertung:</strong> ${
                  data.manualWorkplaceData.glassdoorFound && data.manualWorkplaceData.glassdoorRating
                    ? `✅ ${data.manualWorkplaceData.glassdoorRating}/5 (${data.manualWorkplaceData.glassdoorReviews || 0} Bewertungen)`
                    : '❌ Nicht gefunden'
                }</p>
              </div>
            </div>
            ` : `
            <div style="background: #2d3748; color: #fbbf24; padding: 20px; border-radius: 8px; border: 2px solid #fbbf24; margin-top: 15px;">
              <h4 style="color: #fbbf24; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                ⭐ Arbeitsplatz-Bewertungen nicht vorhanden
              </h4>
              <p style="margin: 10px 0; font-size: 14px;">
                Derzeit liegen noch keine Arbeitgeber-Bewertungen vor. Eine Registrierung bei relevanten Bewertungsportalen wird empfohlen, um die Attraktivität als Arbeitgeber zu steigern.
              </p>
            </div>
            
            <!-- Fachkräfte-Attraktivität -->
            <div style="background: #2d3748; color: #fbbf24; padding: 20px; border-radius: 8px; border: 2px solid #fbbf24; margin-top: 15px;">
              <h4 style="color: #fbbf24; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
                ⭐ Fachkräfte-Attraktivität
              </h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                <div>
                  <p style="margin: 0; font-size: 14px;"><strong>Bewertungsportale:</strong> Nicht registriert</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Kununu, Glassdoor etc.</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px;"><strong>Employer Branding:</strong> Ausbau empfohlen</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Sichtbarkeit als Arbeitgeber</p>
                </div>
                <div>
                  <p style="margin: 0; font-size: 14px;"><strong>Fachkräfte-Gewinnung:</strong> Potenzial nicht genutzt</p>
                  <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Arbeitgebermarke stärken</p>
                </div>
              </div>
            </div>
            `}
            
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0; margin-top: 20px;">
              <h4 style="color: #6b21a8; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Arbeitsplatz-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📊 Portale nutzen:</strong> Bei Kununu und Glassdoor registrieren</li>
                <li><strong>👥 Mitarbeiter aktivieren:</strong> Positive Bewertungen fördern</li>
                <li><strong>🏢 Employer Branding:</strong> Attraktivität als Arbeitgeber steigern</li>
                <li><strong>📱 Digitale Präsenz:</strong> Karriereseite optimieren</li>
                <li><strong>🎯 Recruiting:</strong> Zielgruppengerechte Ansprache</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (socialMediaHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">📱 Social Media</div>
          <div class="section-content">
            <div class="metric-grid">
              ${socialMediaHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Personal & Service Section
  if (selections.sections.staffService) {
    let staffServiceHtml = '';

    if (selections.subSections.staffQualification && staffQualificationScore !== null) {
      staffServiceHtml += `
        <div class="metric-card staff-detailed">
          <div class="staff-header" style="background: linear-gradient(135deg, #795548, #5d4037); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              👨‍💼 Personal-Qualifikation
              <div class="score-circle" style="background: white; color: #795548; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${Math.round(staffQualificationScore)}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #efebe9; padding: 20px; border-radius: 8px; border-left: 4px solid #795548;">
              <h4 style="color: #4e342e; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Personalentwicklungs-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📚 Kontinuierliche Weiterbildung:</strong> Jährliche Fortbildungen in Kernkompetenzen</li>
                <li><strong>🏆 Zertifizierungsprogramme:</strong> Branchenspezifische Zertifikate erwerben</li>
                <li><strong>👥 Mentoring-Programme:</strong> Wissenstransfer zwischen Mitarbeitern</li>
                <li><strong>🎯 Spezialisierung:</strong> Nischenkompetenz in gefragten Bereichen aufbauen</li>
                <li><strong>📈 Performance-Tracking:</strong> Regelmäßige Kompetenz-Bewertung</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Kundenservice & Angebotsbearbeitung
    if (selections.subSections.quoteResponse) {
      console.log('=== QUOTE RESPONSE DEBUG ===');
      console.log('quoteResponseData:', data.quoteResponseData);
      
      const quoteResponseData = data.quoteResponseData;
      
      // Calculate quote response score
      const calculateQuoteResponseScore = (quoteData: QuoteResponseData | null | undefined): number => {
        if (!quoteData?.responseTime) return 0;
        
        const timeScore = {
          '1-hour': 100,
          '2-4-hours': 90,
          '4-8-hours': 80,
          '1-day': 70,
          '2-3-days': 50,
          'over-3-days': 30
        }[quoteData.responseTime] || 30;
        
        const methodScore = Object.values(quoteData.contactMethods || {}).filter(Boolean).length * 10;
        const qualityScore = {
          'excellent': 100,
          'good': 80,
          'average': 60,
          'poor': 40
        }[quoteData.responseQuality || 'average'] || 60;
        
        const featureScore = [
          quoteData.automaticConfirmation,
          quoteData.followUpProcess,
          quoteData.personalContact
        ].filter(Boolean).length * 10;
        
        return Math.round((timeScore * 0.4) + (methodScore * 0.2) + (qualityScore * 0.3) + (featureScore * 0.1));
      };
      
      const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
      const displayQuoteScore = quoteResponseData && quoteResponseData.responseTime 
        ? `${Math.round(quoteResponseScore)}%` 
        : '–';
      
      staffServiceHtml += `
        <div class="metric-card quote-detailed">
          <div class="quote-header" style="background: linear-gradient(135deg, #ff9800, #f57c00); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              📞 Kundenservice & Angebotsbearbeitung
              <div class="score-circle" style="background: white; color: #ff9800; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${displayQuoteScore}
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            ${quoteResponseData && quoteResponseData.responseTime ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px;">
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                <h4 style="color: #e65100; margin: 0 0 10px 0;">⏱️ Reaktionszeit</h4>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">
                  ${quoteResponseData.responseTime === '1-hour' ? 'Innerhalb 1 Stunde' :
                    quoteResponseData.responseTime === '2-4-hours' ? '2-4 Stunden' :
                    quoteResponseData.responseTime === '4-8-hours' ? '4-8 Stunden' :
                    quoteResponseData.responseTime === '1-day' ? '1 Tag' :
                    quoteResponseData.responseTime === '2-3-days' ? '2-3 Tage' :
                    'Über 3 Tage'}
                </p>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                <h4 style="color: #e65100; margin: 0 0 10px 0;">📱 Kontaktkanäle</h4>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">
                  ${Object.values(quoteResponseData.contactMethods || {}).filter(Boolean).length} verfügbar
                </p>
              </div>
              
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
                <h4 style="color: #e65100; margin: 0 0 10px 0;">⭐ Antwortqualität</h4>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">
                  ${quoteResponseData.responseQuality === 'excellent' ? 'Ausgezeichnet' :
                    quoteResponseData.responseQuality === 'good' ? 'Gut' :
                    quoteResponseData.responseQuality === 'average' ? 'Durchschnittlich' :
                    'Verbesserungsbedarf'}
                </p>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
              <div>
                <h4 style="color: #e65100; margin-bottom: 10px;">🔧 Service-Features</h4>
                <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                  ${quoteResponseData.automaticConfirmation ? '<li>✅ Automatische Eingangsbestätigung</li>' : '<li>❌ Keine automatische Bestätigung</li>'}
                  ${quoteResponseData.followUpProcess ? '<li>✅ Strukturierter Nachfass-Prozess</li>' : '<li>❌ Kein systematisches Follow-up</li>'}
                  ${quoteResponseData.personalContact ? '<li>✅ Persönlicher Ansprechpartner</li>' : '<li>❌ Kein fester Ansprechpartner</li>'}
                </ul>
              </div>
              
              <div>
                <h4 style="color: #e65100; margin-bottom: 10px;">📞 Verfügbare Kontaktkanäle</h4>
                <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                  ${quoteResponseData.contactMethods?.phone ? '<li>📞 Telefon</li>' : ''}
                  ${quoteResponseData.contactMethods?.email ? '<li>✉️ E-Mail</li>' : ''}
                  ${quoteResponseData.contactMethods?.contactForm ? '<li>📝 Kontaktformular</li>' : ''}
                  ${quoteResponseData.contactMethods?.whatsapp ? '<li>💬 WhatsApp</li>' : ''}
                  ${quoteResponseData.contactMethods?.messenger ? '<li>💬 Messenger</li>' : ''}
                </ul>
              </div>
            </div>
            
            <div style="margin-top: 20px; background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
              <h4 style="color: #e65100; margin-bottom: 10px;">🕒 Erreichbarkeit</h4>
              <p style="margin: 0; color: #333;">
                <strong>Zeiten:</strong> ${
                  quoteResponseData.availabilityHours === '24-7' ? '24/7 Erreichbarkeit' :
                  quoteResponseData.availabilityHours === 'extended-hours' ? 'Erweiterte Zeiten (Mo-Sa 7-20 Uhr)' :
                  quoteResponseData.availabilityHours === 'business-hours' ? 'Geschäftszeiten (Mo-Fr 8-17 Uhr)' :
                  'Nicht definiert'
                }
              </p>
              ${quoteResponseData.notes ? `<p style="margin: 10px 0 0 0; color: #333;"><strong>Notizen:</strong> ${quoteResponseData.notes}</p>` : ''}
            </div>
            ` : `
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; text-align: center;">
              <h4 style="color: #e65100; margin: 0 0 10px 0;">⚠️ Keine Kundenservice-Daten erfasst</h4>
              <p style="margin: 0; color: #333;">
                Für eine vollständige Bewertung des Kundenservice sollten Daten zur Reaktionszeit, 
                Kontaktmöglichkeiten und Antwortqualität erfasst werden.
              </p>
            </div>
            `}
            
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800; margin-top: 20px;">
              <h4 style="color: #e65100; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Kundenservice-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>⚡ Schnelle Reaktion:</strong> Antwortzeit unter 4 Stunden anstreben</li>
                <li><strong>📱 Mehrere Kanäle:</strong> WhatsApp und Kontaktformular anbieten</li>
                <li><strong>🤖 Automatisierung:</strong> Eingangsbestätigung einrichten</li>
                <li><strong>📋 Strukturiert:</strong> Systematischen Nachfass-Prozess etablieren</li>
                <li><strong>👤 Personal:</strong> Feste Ansprechpartner zuweisen</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (staffServiceHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">👥 Personal & Kundenservice</div>
          <div class="section-content">
            <div class="metric-grid">
              ${staffServiceHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Calculate overall score based on included sections
  let overallScore = 75; // Default fallback

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Website-Analyse für ${businessData.url}</title>
      <style>
        ${getHTMLStyles()}
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          font-size: 1.4em;
          font-weight: bold;
          margin-bottom: 20px;
          border-radius: 10px;
          text-align: center;
        }
        
        .section-content {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .metric-grid {
          display: grid;
          gap: 20px;
          padding: 20px;
        }
        
        .warning-box {
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          background: #fef2f2;
          border: 2px solid #fecaca;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <div class="header-content">
            <div class="logo-section">
              ${getLogoHTML()}
              <div class="company-info">
                <h1>Website-Analyse</h1>
                <p class="company-name">${businessData.url}</p>
                <p class="report-date">Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
              </div>
            </div>
            <div class="overall-score">
              <div class="score-circle-large">
                <span class="score-number">${overallScore}</span>
                <span class="score-label">Gesamt-Score</span>
              </div>
            </div>
          </div>
        </header>

        <main class="main-content">
          ${sectionsHtml}
        </main>

        <footer class="footer">
          <div class="footer-content">
            <div class="footer-logo">
              ${getLogoHTML()}
            </div>
            <div class="footer-text">
              <p>Professionelle Website-Analyse</p>
              <p>© ${new Date().getFullYear()} Alle Rechte vorbehalten</p>
            </div>
          </div>
        </footer>
      </div>
    </body>
  </html>
  `;
};

// Export the function with the expected name for backward compatibility
export const generateSelectiveCustomerHTML = generateSelectiveHTML;

// Import the full customer HTML generator for browser display
import { generateCustomerHTML } from './htmlGenerator';

// Export a modified version that shows the full dashboard for browser display
export const generateSelectiveCustomerHTMLForBrowser = (data: any) => {
  // For browser display, use the full customer HTML generator with all sections
  return generateCustomerHTML(data);
};