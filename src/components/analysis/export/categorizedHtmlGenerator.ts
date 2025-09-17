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
    manualSocialData,
    manualWorkplaceData,
    manualCorporateIdentityData,
    manualKeywordData,
    keywordScore,
    manualImprintData,
    missingImprintElements = [],
    staffQualificationData,
    quoteResponseData,
    hourlyRateData,
    manualAccessibilityData,
    manualDataPrivacyData,
    privacyData,
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
  const contentQualityScore = calculateContentQualityScore(realData, manualKeywordData, businessData, data.manualContentData);
  const backlinksScore = calculateBacklinksScore(realData, data.manualBacklinkData);
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

  // Simple analysis function generators
  const createSimpleAnalysisCard = (title: string, score: number, emoji: string, description: string) => `
    <div class="metric-card ${getScoreColorClass(score)}">
      <h3>${emoji} ${title}</h3>
      <div class="score-display">
        <div class="score-tile ${getScoreColorClass(score)}">${score > 0 ? score + '%' : '–'}</div>
        <div class="score-details">
          <p>${description}</p>
          <p><strong>Empfehlung:</strong> ${score >= 80 ? 'Exzellent' : score >= 60 ? 'Gut, weitere Optimierung möglich' : 'Dringender Handlungsbedarf'}</p>
        </div>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill progress-${getScoreColorClass(score)}" style="width: ${score}%;"></div>
        </div>
      </div>
    </div>
  `;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Business Analysis Report - ${businessData.address}</title>
    <style>
        ${getHTMLStyles()}
        
        /* Category-specific styles */
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
        
        .overall-score-section {
            background: linear-gradient(135deg, #7c3aed, #5b21b6);
            border: 2px solid rgba(124, 58, 237, 0.3);
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            color: white;
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
            <div style="width: 120px; height: 120px; border-radius: 50%; background: white; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-size: 2.5em; font-weight: bold; margin: 20px auto; border: 4px solid rgba(255, 255, 255, 0.3);">
                ${overallScore}%
            </div>
        </div>

        <!-- Category 1: Online-Qualität · Relevanz · Autorität -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-1')">
                <span>🎯 Online-Qualität · Relevanz · Autorität</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-1" class="category-content">
                ${createSimpleAnalysisCard('SEO-Bestandsanalyse', realData.seo.score, '🔍', 'Suchmaschinenoptimierung und Online-Sichtbarkeit')}
                ${createSimpleAnalysisCard('Content-Qualität', contentQualityScore, '📝', 'Inhaltliche Relevanz und Keyword-Optimierung')}
                ${createSimpleAnalysisCard('Backlink-Profil', backlinksScore, '🔗', 'Externe Verlinkungen und Domain-Autorität')}
            </div>
        </div>

        <!-- Category 2: Performance & Technik -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-2')">
                <span>⚡ Performance & Technik</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-2" class="category-content">
                ${createSimpleAnalysisCard('Website Performance', realData.performance.score, '⚡', 'Ladezeiten und technische Optimierung')}
                ${createSimpleAnalysisCard('Mobile Optimierung', realData.mobile.overallScore, '📱', 'Mobile Nutzererfahrung und Responsive Design')}
            </div>
        </div>

        <!-- Category 3: Social Media & Online-Präsenz -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-3')">
                <span>📱 Social Media & Online-Präsenz</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-3" class="category-content">
                ${createSimpleAnalysisCard('Social Media Präsenz', socialMediaScore, '📱', 'Aktivität und Reichweite in sozialen Netzwerken')}
                ${createSimpleAnalysisCard('Google Reviews', Math.round(realData.reviews.google.rating * 20), '⭐', 'Kundenbewertungen und Online-Reputation')}
                ${createSimpleAnalysisCard('Arbeitsplatz-Bewertungen', workplaceScore, '🏢', 'Arbeitgeber-Image und Mitarbeiterzufriedenheit')}
            </div>
        </div>

        <!-- Category 4: Rechtssicherheit -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-4')">
                <span>⚖️ Rechtssicherheit</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-4" class="category-content">
                ${createSimpleAnalysisCard('Barrierefreiheit', accessibilityScore, '♿', 'WCAG-Konformität und Zugänglichkeit')}
                ${createSimpleAnalysisCard('Datenschutz', dataPrivacyScore, '🔒', 'DSGVO-Konformität und Datensicherheit')}
                ${createSimpleAnalysisCard('Impressum & Rechtliches', impressumScore, '⚖️', 'Rechtliche Vollständigkeit und Compliance')}
            </div>
        </div>

        <!-- Category 5: Unternehmensprofil -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-5')">
                <span>🏢 Unternehmensprofil</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-5" class="category-content">
                ${createSimpleAnalysisCard('Corporate Identity', corporateIdentityScore, '🎨', 'Markenkonsistenz und professionelles Design')}
                ${createSimpleAnalysisCard('Mitarbeiterqualifikation', staffQualificationScore, '👥', 'Qualifikationen und Team-Präsentation')}
                ${createSimpleAnalysisCard('Angebots-Kommunikation', quoteResponseScore, '💬', 'Reaktionszeiten und Kommunikationsqualität')}
                ${createSimpleAnalysisCard('Stundensatz-Positionierung', hourlyRateScore, '💰', 'Preisgestaltung und Marktposition')}
            </div>
        </div>

        <!-- Category 6: Marktpositionierung -->
        <div class="category-section">
            <div class="category-header" onclick="toggleCategory('category-6')">
                <span>📊 Marktpositionierung</span>
                <div class="toggle-arrow">▶</div>
            </div>
            <div id="category-6" class="category-content">
                ${createSimpleAnalysisCard('Wettbewerbsanalyse', calculatedOwnCompanyScore || 70, '🏆', 'Marktposition und Differenzierung')}
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export { generateCategorizedHTML };
export type { CategorizedReportData };