import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualImprintData, CompetitorServices, CompanyServices, ManualCorporateIdentityData, StaffQualificationData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateOverallScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore, calculateLocalSEOScore, calculateCorporateIdentityScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateDataPrivacyScore, calculateWorkplaceScore } from './scoreCalculations';
import { generateDataPrivacySection } from './reportSections';
import { getLogoHTML } from './logoData';

interface CategorizedReportData {
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
  removedMissingServices?: string[];
  hourlyRateData?: { meisterRate: number; facharbeiterRate: number; azubiRate: number; helferRate: number; serviceRate: number; installationRate: number; regionalMeisterRate: number; regionalFacharbeiterRate: number; regionalAzubiRate: number; regionalHelferRate: number; regionalServiceRate: number; regionalInstallationRate: number };
  missingImprintElements?: string[];
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualImprintData?: { elements: string[] } | null;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  privacyData?: any;
  calculatedOwnCompanyScore?: number;
}

// Function to get score range for data attribute
const getScoreRange = (score: number) => {
  if (score < 61) return "0-60";
  if (score < 90) return "61-89";
  return "90-100";
};

// Function to get score color class
const getScoreColorClass = (score: number) => {
  if (score < 61) return "red";       
  if (score < 90) return "green";     
  return "yellow";                    
};

// Function to get score color (hex value for inline styles)
const getScoreColor = (score: number) => {
  if (score <= 60) return '#FF0000';   
  if (score <= 89) return '#22c55e';   
  return '#FFD700';                    
};

const generateCategorizedHTML = (data: CategorizedReportData): string => {
  const {
    businessData,
    realData,
    manualCompetitors,
    competitorServices,
    companyServices,
    deletedCompetitors = new Set(),
    removedMissingServices = [],
    hourlyRateData,
    missingImprintElements = [],
    manualSocialData,
    manualWorkplaceData,
    manualCorporateIdentityData,
    manualKeywordData,
    keywordScore,
    manualImprintData,
    manualDataPrivacyData,
    privacyData,
    staffQualificationData,
    quoteResponseData,
    manualContentData,
    manualAccessibilityData,
    manualBacklinkData,
    calculatedOwnCompanyScore
  } = data;

  // Calculate all scores
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const corporateIdentityScore = calculateCorporateIdentityScore(manualCorporateIdentityData);
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const accessibilityScore = calculateAccessibilityScore(realData, manualAccessibilityData);
  const dataPrivacyScore = calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData);
  const contentQualityScore = calculateContentQualityScore(realData, manualKeywordData, businessData, manualContentData);
  const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData);
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  
  // Impressum Analysis
  const requiredElements = [
    'Firmenname', 'Rechtsform', 'Geschäftsführer/Inhaber', 'Adresse', 
    'Telefonnummer', 'E-Mail-Adresse', 'Handelsregisternummer', 'Steuernummer', 
    'USt-IdNr.', 'Kammerzugehörigkeit', 'Berufsbezeichnung', 'Aufsichtsbehörde'
  ];
  
  const finalMissingImprintElements = manualImprintData 
    ? requiredElements.filter(e => !manualImprintData.elements.includes(e))
    : missingImprintElements;
    
  const foundImprintElements = manualImprintData 
    ? manualImprintData.elements
    : requiredElements.filter(e => !missingImprintElements.includes(e));
    
  const impressumScore = Math.round((foundImprintElements.length / requiredElements.length) * 100);
  
  // Calculate overall score
  const overallScore = Math.round((
    realData.seo.score * 0.2 + 
    realData.performance.score * 0.15 + 
    realData.mobile.overallScore * 0.15 +
    socialMediaScore * 0.15 +
    (realData.reviews.google.rating * 20) * 0.15 +
    impressumScore * 0.1 +
    accessibilityScore * 0.1
  ));

  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Analysis Report - ${businessData.address}</title>
    <style>
        ${getHTMLStyles()}
        
        /* Dropdown-spezifische Styles */
        .category-section {
            margin-bottom: 30px;
            border: 2px solid rgba(251, 191, 36, 0.3);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .category-header {
            background: linear-gradient(135deg, #1f2937, #111827);
            color: #fbbf24;
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            font-size: 1.2em;
            transition: background 0.3s ease;
        }
        
        .category-header:hover {
            background: linear-gradient(135deg, #374151, #1f2937);
        }
        
        .category-header .toggle-arrow {
            transition: transform 0.3s ease;
            font-size: 1.5em;
        }
        
        .category-header.active .toggle-arrow {
            transform: rotate(90deg);
        }
        
        .category-content {
            background: rgba(17, 24, 39, 0.4);
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .category-content.active {
            max-height: none;
            padding: 20px;
        }
        
        .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        
        .executive-summary {
            background: linear-gradient(135deg, #1f2937, #111827);
            border: 2px solid rgba(251, 191, 36, 0.5);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            color: white;
        }
        
        .overall-score-section {
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            border: 2px solid rgba(124, 58, 237, 0.3);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            color: white;
            text-align: center;
        }
        
        .overall-score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: white;
            color: #7c3aed;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5em;
            font-weight: bold;
            margin: 20px auto;
            border: 4px solid rgba(255, 255, 255, 0.3);
        }
        
        .score-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .score-summary-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
    </style>
    <script>
        function toggleCategory(categoryId) {
            const header = document.querySelector(\`[onclick="toggleCategory('\${categoryId}')"]\`);
            const content = document.getElementById(categoryId);
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                header.classList.remove('active');
                content.style.maxHeight = '0px';
            } else {
                content.classList.add('active');
                header.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        }
        
        // Auto-expand first category on load
        window.addEventListener('load', function() {
            toggleCategory('category-1');
        });
    </script>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="report-header">
            ${getLogoHTML()}
            <div class="header-content">
                <h1>Digitale Business-Analyse</h1>
                <h2>Kategorisierter Analysebericht</h2>
                <div class="business-info">
                    <p><strong>Unternehmen:</strong> ${businessData.address}</p>
                    <p><strong>Website:</strong> ${businessData.url}</p>
                    <p><strong>Erstellt am:</strong> ${new Date().toLocaleDateString('de-DE')}</p>
                </div>
            </div>
        </div>

        <!-- Overall Score Section -->
        <div class="overall-score-section">
            <h2>🎯 Gesamtbewertung</h2>
            <div class="overall-score-circle ${getScoreColorClass(overallScore)}">
                ${overallScore}%
            </div>
            <p style="font-size: 1.2em; margin: 20px 0;">
                ${overallScore >= 90 ? 'Exzellente digitale Präsenz' : 
                  overallScore >= 75 ? 'Sehr gute digitale Präsenz' :
                  overallScore >= 60 ? 'Gute Basis mit Optimierungspotential' :
                  'Deutlicher Handlungsbedarf'}
            </p>
            
            <div class="score-summary-grid">
                <div class="score-summary-item">
                    <h4>SEO Score</h4>
                    <div style="font-size: 1.5em; color: ${getScoreColor(realData.seo.score)};">${realData.seo.score}%</div>
                </div>
                <div class="score-summary-item">
                    <h4>Performance</h4>
                    <div style="font-size: 1.5em; color: ${getScoreColor(realData.performance.score)};">${realData.performance.score}%</div>
                </div>
                <div class="score-summary-item">
                    <h4>Mobile</h4>
                    <div style="font-size: 1.5em; color: ${getScoreColor(realData.mobile.overallScore)};">${realData.mobile.overallScore}%</div>
                </div>
                <div class="score-summary-item">
                    <h4>Social Media</h4>
                    <div style="font-size: 1.5em; color: ${getScoreColor(socialMediaScore)};">${socialMediaScore > 0 ? socialMediaScore + '%' : '–'}</div>
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="executive-summary">
            <h2>📋 Executive Summary</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                <div>
                    <h3 style="color: #fbbf24;">Stärken</h3>
                    <ul style="line-height: 1.6;">
                        ${realData.seo.score >= 80 ? '<li>Starke SEO-Optimierung</li>' : ''}
                        ${realData.performance.score >= 80 ? '<li>Exzellente Website-Performance</li>' : ''}
                        ${realData.mobile.overallScore >= 80 ? '<li>Optimale mobile Nutzererfahrung</li>' : ''}
                        ${socialMediaScore >= 80 ? '<li>Aktive Social Media Präsenz</li>' : ''}
                        ${realData.reviews.google.rating >= 4.5 ? '<li>Hervorragende Kundenbewertungen</li>' : ''}
                        ${impressumScore >= 90 ? '<li>Vollständige rechtliche Angaben</li>' : ''}
                        ${accessibilityScore >= 80 ? '<li>Gute Barrierefreiheit</li>' : ''}
                    </ul>
                </div>
                <div>
                    <h3 style="color: #f87171;">Verbesserungsbereiche</h3>
                    <ul style="line-height: 1.6;">
                        ${realData.seo.score < 60 ? '<li>SEO-Optimierung erforderlich</li>' : ''}
                        ${realData.performance.score < 60 ? '<li>Website-Performance verbessern</li>' : ''}
                        ${realData.mobile.overallScore < 60 ? '<li>Mobile Optimierung notwendig</li>' : ''}
                        ${socialMediaScore < 40 ? '<li>Social Media Präsenz aufbauen</li>' : ''}
                        ${realData.reviews.google.count < 10 ? '<li>Mehr Kundenbewertungen sammeln</li>' : ''}
                        ${impressumScore < 70 ? '<li>Impressum vervollständigen</li>' : ''}
                        ${accessibilityScore < 60 ? '<li>Barrierefreiheit dringend verbessern</li>' : ''}
                    </ul>
                </div>
            </div>
        </div>

        <!-- Category 1: Online-Qualität · Relevanz · Autorität -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-1')">
                <span>🎯 Online-Qualität · Relevanz · Autorität</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-1" class="category-content">
                <div class="category-grid">
                    <!-- SEO Analysis -->
                    <div class="metric-card ${getScoreColorClass(realData.seo.score)}">
                        <h3>🔍 SEO-Analyse</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(realData.seo.score)}">${realData.seo.score}%</div>
                            <div class="score-details">
                                <p><strong>Meta-Tags:</strong> ${realData.seo.titleTag ? 'Optimiert' : 'Verbesserungsbedarf'}</p>
                                <p><strong>Struktur:</strong> ${realData.seo.headings.h1.length > 0 ? 'Korrekt' : 'Fehlerhaft'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(realData.seo.score)}" style="width: ${realData.seo.score}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Content Quality -->
                    <div class="metric-card ${getScoreColorClass(contentQualityScore)}">
                        <h3>📝 Content-Qualität</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(contentQualityScore)}">${contentQualityScore}%</div>
                            <div class="score-details">
                                <p><strong>Keyword-Relevanz:</strong> ${keywordScore ? Math.round(keywordScore) + '%' : 'Nicht erfasst'}</p>
                                <p><strong>Inhaltliche Tiefe:</strong> ${contentQualityScore >= 70 ? 'Gut' : 'Ausbaufähig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(contentQualityScore)}" style="width: ${contentQualityScore}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Backlinks -->
                    <div class="metric-card ${getScoreColorClass(backlinksScore)}">
                        <h3>🔗 Backlink-Profil</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(backlinksScore)}">${backlinksScore}%</div>
                            <div class="score-details">
                                <p><strong>Link-Qualität:</strong> ${backlinksScore >= 70 ? 'Hoch' : backlinksScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
                                <p><strong>Autorität:</strong> ${backlinksScore >= 60 ? 'Etabliert' : 'Aufbau erforderlich'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(backlinksScore)}" style="width: ${backlinksScore}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Local SEO -->
                    <div class="metric-card ${getScoreColorClass(realData.seo.score)}">
                        <h3>📍 Lokale SEO</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(realData.seo.score)}">${realData.seo.score}%</div>
                            <div class="score-details">
                                <p><strong>Google My Business:</strong> ${realData.seo.score >= 70 ? 'Optimiert' : 'Verbesserung nötig'}</p>
                                <p><strong>Lokale Sichtbarkeit:</strong> ${realData.seo.score >= 60 ? 'Gut' : 'Ausbaufähig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(realData.seo.score)}" style="width: ${realData.seo.score}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category 2: Webseiten-Performance & Technik -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-2')">
                <span>⚡ Webseiten-Performance & Technik</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-2" class="category-content">
                <div class="category-grid">
                    <!-- Performance -->
                    <div class="metric-card ${getScoreColorClass(realData.performance.score)}">
                        <h3>🚀 Performance</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(realData.performance.score)}">${realData.performance.score}%</div>
                            <div class="score-details">
                                <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
                                <p><strong>Optimierung:</strong> ${realData.performance.score >= 70 ? 'Sehr gut' : 'Verbesserung nötig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(realData.performance.score)}" style="width: ${realData.performance.score}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Mobile Optimization -->
                    <div class="metric-card ${getScoreColorClass(realData.mobile.overallScore)}">
                        <h3>📱 Mobile Optimierung</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(realData.mobile.overallScore)}">${realData.mobile.overallScore}%</div>
                            <div class="score-details">
                                <p><strong>Responsive:</strong> ${realData.mobile.overallScore >= 70 ? 'Ja' : 'Eingeschränkt'}</p>
                                <p><strong>Nutzererfahrung:</strong> ${realData.mobile.overallScore >= 60 ? 'Gut' : 'Verbesserung nötig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(realData.mobile.overallScore)}" style="width: ${realData.mobile.overallScore}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Accessibility -->
                    <div class="metric-card ${getScoreColorClass(accessibilityScore)}">
                        <h3>♿ Barrierefreiheit</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(accessibilityScore)}">${accessibilityScore > 0 ? accessibilityScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>WCAG-Konformität:</strong> ${accessibilityScore >= 80 ? 'Hoch' : accessibilityScore >= 50 ? 'Mittel' : 'Niedrig'}</p>
                                <p><strong>Zugänglichkeit:</strong> ${accessibilityScore >= 60 ? 'Gut' : 'Verbesserung nötig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(accessibilityScore)}" style="width: ${accessibilityScore}%;"></div>
                            </div>
                        </div>
                        ${accessibilityScore < 90 ? `
                        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 15px;">
                            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Rechtlicher Hinweis</h4>
                            <p style="color: #dc2626; margin: 0; font-size: 14px;">
                                Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro. 
                                Wir empfehlen dringend die Konsultation einer spezialisierten Rechtsberatung.
                            </p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Data Privacy -->
                    <div class="metric-card ${getScoreColorClass(dataPrivacyScore)}">
                        <h3>🔒 Datenschutz</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(dataPrivacyScore)}">${dataPrivacyScore > 0 ? dataPrivacyScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>DSGVO-Konformität:</strong> ${dataPrivacyScore >= 80 ? 'Hoch' : dataPrivacyScore >= 50 ? 'Mittel' : 'Niedrig'}</p>
                                <p><strong>Cookie-Management:</strong> ${dataPrivacyScore >= 60 ? 'Implementiert' : 'Fehlend'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(dataPrivacyScore)}" style="width: ${dataPrivacyScore}%;"></div>
                            </div>
                        </div>
                        ${dataPrivacyScore < 90 ? `
                        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 15px;">
                            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Rechtlicher Hinweis</h4>
                            <p style="color: #dc2626; margin: 0; font-size: 14px;">
                                Bei DSGVO-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes. 
                                Wir empfehlen dringend die Konsultation einer spezialisierten Rechtsberatung.
                            </p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>

        <!-- Category 3: Online-/Web-/Social-Media Performance -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-3')">
                <span>📱 Online-/Web-/Social-Media Performance</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-3" class="category-content">
                <div class="category-grid">
                    <!-- Social Media -->
                    <div class="metric-card ${getScoreColorClass(socialMediaScore)}">
                        <h3>📱 Social Media</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(socialMediaScore)}">${socialMediaScore > 0 ? socialMediaScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>Plattformen:</strong> ${manualSocialData ? Object.values(manualSocialData).filter(Boolean).length : 0} aktiv</p>
                                <p><strong>Engagement:</strong> ${socialMediaScore >= 60 ? 'Hoch' : socialMediaScore >= 30 ? 'Mittel' : 'Niedrig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(socialMediaScore)}" style="width: ${socialMediaScore}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Google Reviews -->
                    <div class="metric-card ${getScoreColorClass(Math.min(100, realData.reviews.google.rating * 20))}">
                        <h3>⭐ Google Bewertungen</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(Math.min(100, realData.reviews.google.rating * 20))}">${realData.reviews.google.rating}/5</div>
                            <div class="score-details">
                                <p><strong>Anzahl:</strong> ${realData.reviews.google.count} Bewertungen</p>
                                <p><strong>Reputation:</strong> ${realData.reviews.google.rating >= 4.5 ? 'Exzellent' : realData.reviews.google.rating >= 4.0 ? 'Sehr gut' : realData.reviews.google.rating >= 3.5 ? 'Gut' : 'Verbesserung nötig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(Math.min(100, realData.reviews.google.rating * 20))}" style="width: ${Math.min(100, realData.reviews.google.rating * 20)}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Workplace Reviews -->
                    <div class="metric-card ${getScoreColorClass(workplaceScore)}">
                        <h3>💼 Arbeitgeber-Bewertungen</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(workplaceScore)}">${workplaceScore > 0 ? workplaceScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>Kununu:</strong> ${manualWorkplaceData?.kununuFound ? 'Gefunden' : 'Nicht gefunden'}</p>
                                <p><strong>Glassdoor:</strong> ${manualWorkplaceData?.glassdoorFound ? 'Gefunden' : 'Nicht gefunden'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(workplaceScore)}" style="width: ${workplaceScore}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category 4: Markt & Marktumfeld -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-4')">
                <span>🏢 Markt & Marktumfeld</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-4" class="category-content">
                <div class="category-grid">
                    <!-- Competitor Analysis -->
                    <div class="metric-card ${getScoreColorClass(calculatedOwnCompanyScore || 75)}">
                        <h3>🎯 Wettbewerbsanalyse</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(calculatedOwnCompanyScore || 75)}">${calculatedOwnCompanyScore || 75}%</div>
                            <div class="score-details">
                                <p><strong>Marktposition:</strong> ${(calculatedOwnCompanyScore || 75) >= 80 ? 'Führend' : (calculatedOwnCompanyScore || 75) >= 60 ? 'Stark' : 'Ausbaufähig'}</p>
                                <p><strong>Konkurrenten:</strong> ${manualCompetitors?.length || 0} analysiert</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(calculatedOwnCompanyScore || 75)}" style="width: ${calculatedOwnCompanyScore || 75}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Pricing Analysis -->
                    <div class="metric-card ${getScoreColorClass(hourlyRateScore)}">
                        <h3>💰 Preispositionierung</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(hourlyRateScore)}">${hourlyRateScore > 0 ? hourlyRateScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>Wettbewerbsfähigkeit:</strong> ${
                                  hourlyRateScore === 100 ? 'Sehr wettbewerbsfähig' : 
                                  hourlyRateScore === 85 ? 'Wettbewerbsfähig' : 
                                  hourlyRateScore === 70 ? 'Marktgerecht' : 
                                  hourlyRateScore === 50 ? 'Über Marktdurchschnitt' : 'Nicht erfasst'
                                }</p>
                                <p><strong>Marktposition:</strong> ${hourlyRateScore >= 85 ? 'Optimal' : hourlyRateScore >= 70 ? 'Gut' : 'Anpassung prüfen'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(hourlyRateScore)}" style="width: ${hourlyRateScore}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category 5: Außendarstellung & Erscheinungsbild -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-5')">
                <span>🎨 Außendarstellung & Erscheinungsbild</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-5" class="category-content">
                <div class="category-grid">
                    <!-- Corporate Identity -->
                    <div class="metric-card ${getScoreColorClass(corporateIdentityScore)}">
                        <h3>🎨 Corporate Identity</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(corporateIdentityScore)}">${corporateIdentityScore > 0 ? corporateIdentityScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>Design-Konsistenz:</strong> ${corporateIdentityScore >= 70 ? 'Hoch' : corporateIdentityScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
                                <p><strong>Markenidentität:</strong> ${corporateIdentityScore >= 60 ? 'Etabliert' : 'Entwicklung nötig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(corporateIdentityScore)}" style="width: ${corporateIdentityScore}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Legal Compliance (Impressum) -->
                    <div class="metric-card ${getScoreColorClass(impressumScore)}">
                        <h3>⚖️ Impressum & Rechtliches</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(impressumScore)}">${impressumScore}%</div>
                            <div class="score-details">
                                <p><strong>Vollständigkeit:</strong> ${impressumScore >= 90 ? 'Vollständig' : impressumScore >= 70 ? 'Größtenteils' : 'Unvollständig'}</p>
                                <p><strong>Rechtssicherheit:</strong> ${impressumScore >= 80 ? 'Hoch' : impressumScore >= 60 ? 'Mittel' : 'Niedrig'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(impressumScore)}" style="width: ${impressumScore}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Category 6: Qualität · Service · Kundenorientierung -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-6')">
                <span>👥 Qualität · Service · Kundenorientierung</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-6" class="category-content">
                <div class="category-grid">
                    <!-- Staff Qualification -->
                    <div class="metric-card ${getScoreColorClass(staffQualificationScore)}">
                        <h3>🎓 Mitarbeiterqualifikation</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(staffQualificationScore)}">${staffQualificationScore > 0 ? staffQualificationScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>Qualifikationsniveau:</strong> ${staffQualificationScore >= 80 ? 'Sehr hoch' : staffQualificationScore >= 60 ? 'Hoch' : staffQualificationScore > 0 ? 'Mittel' : 'Nicht erfasst'}</p>
                                <p><strong>Mitarbeiteranzahl:</strong> ${staffQualificationData?.totalEmployees || 0}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(staffQualificationScore)}" style="width: ${staffQualificationScore}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Quote Response -->
                    <div class="metric-card ${getScoreColorClass(quoteResponseScore)}">
                        <h3>💬 Anfragebearbeitung</h3>
                        <div class="score-display">
                            <div class="score-tile ${getScoreColorClass(quoteResponseScore)}">${quoteResponseScore > 0 ? quoteResponseScore + '%' : '–'}</div>
                            <div class="score-details">
                                <p><strong>Reaktionszeit:</strong> ${quoteResponseData?.responseTime ? 
                                  quoteResponseData.responseTime === '1-hour' ? '< 1h' :
                                  quoteResponseData.responseTime === '2-4-hours' ? '2-4h' :
                                  quoteResponseData.responseTime === '4-8-hours' ? '4-8h' :
                                  quoteResponseData.responseTime === '1-day' ? '1 Tag' :
                                  quoteResponseData.responseTime === '2-3-days' ? '2-3 Tage' :
                                  '> 3 Tage' : 'Nicht erfasst'}</p>
                                <p><strong>Service-Qualität:</strong> ${quoteResponseScore >= 80 ? 'Exzellent' : quoteResponseScore >= 60 ? 'Gut' : quoteResponseScore > 0 ? 'Verbesserungsbedarf' : 'Nicht bewertet'}</p>
                            </div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill progress-${getScoreColorClass(quoteResponseScore)}" style="width: ${quoteResponseScore}%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(17, 24, 39, 0.6); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3);">
            <h3 style="color: #fbbf24; margin: 15px 0; font-size: 1.2em;">UNNA - Kategorisierter Business-Analyse Report</h3>
            <div style="color: #9ca3af; font-size: 0.9em;">
                <p style="margin: 0;">Erstellt am ${new Date().toLocaleDateString('de-DE')} | Strukturierte Analyse in 6 Hauptkategorien</p>
                <p style="margin: 10px 0 0 0; font-size: 0.8em;">Alle Daten basieren auf automatischer Analyse und manueller Datenerfassung</p>
                <p style="margin: 5px 0 0 0; font-size: 0.8em;">Diese Analyse dient zur Orientierung und ersetzt keine rechtliche Beratung.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export { generateCategorizedHTML };