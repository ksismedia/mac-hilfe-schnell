import { calculateAccessibilityScore, calculateBacklinksScore, calculateCorporateIdentityScore, calculateDataPrivacyScore, calculateHourlyRateScore, calculateLocalSEOScore, calculateQuoteResponseScore, calculateSEOContentScore, calculateSocialMediaCategoryScore, calculateStaffQualificationScore, calculateWorkplaceScore } from './scoreCalculations';
import { ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, ManualContentData, ManualAccessibilityData, ManualBacklinkData } from '@/hooks/useManualData';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface CustomerHTMLData {
  businessData: {
    address: string;
    url: string;
    industry: string;
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualCompetitors?: any[];
  competitorServices?: any;
  companyServices?: any;
  deletedCompetitors?: Set<string>;
  removedMissingServices?: string[];
  hourlyRateData?: { ownRate: number; regionAverage: number };
  missingImprintElements: string[];
  staffQualificationData?: any;
  quoteResponseData?: any;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  dataPrivacyScore?: number;
  calculatedOwnCompanyScore: number;
}

export const generateCustomerHTML = (data: CustomerHTMLData): string => {
  const {
    businessData,
    realData,
    manualImprintData,
    manualSocialData,
    manualWorkplaceData,
    manualCorporateIdentityData,
    manualCompetitors,
    competitorServices,
    companyServices,
    deletedCompetitors,
    removedMissingServices,
    hourlyRateData,
    missingImprintElements,
    staffQualificationData,
    quoteResponseData,
    manualContentData,
    manualAccessibilityData,
    manualBacklinkData,
    manualKeywordData,
    keywordScore,
    dataPrivacyScore,
    calculatedOwnCompanyScore
  } = data;

  const seoScore = calculateSEOContentScore(realData, keywordScore, businessData, data.dataPrivacyScore, data.manualAccessibilityData);
  const performanceScore = realData ? Math.round(realData.performance.score) : 75;
  const mobileScore = realData ? Math.round(realData.mobile.overallScore) : 75;
  const localSeoScore = calculateLocalSEOScore(businessData, realData);
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  const onlineReputationScore = realData ? Math.round(realData.socialProof.overallScore) : 75;
  const legalComplianceScore = realData ? Math.round(realData.imprint.score) : 75;
  const accessibilityScore = calculateAccessibilityScore(realData, manualAccessibilityData);
  const dataPrivacyDisplayScore = calculateDataPrivacyScore(realData, data);
  const accessibilityDisplayScore = data.manualAccessibilityData ? calculateAccessibilityScore(realData, data.manualAccessibilityData) : null;

  const socialMediaScore = calculateSocialMediaCategoryScore(realData, manualSocialData, manualWorkplaceData);
  console.log('🔶 HTML Generator Social Media Debug:', { manualSocialData, socialMediaScore });
  const corporateIdentityScore = calculateCorporateIdentityScore(manualCorporateIdentityData);
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  
  // DEBUG: Check if customer service data exists
  console.log('🚨 CUSTOMER SERVICE DATA CHECK:', {
    quoteResponseData: data.quoteResponseData,
    hasQuoteResponseData: !!data.quoteResponseData,
    quoteResponseTime: data.quoteResponseData?.responseTime,
    staffQualificationData: data.staffQualificationData,
    hasStaffData: !!data.staffQualificationData,
    staffTotalEmployees: data.staffQualificationData?.totalEmployees
  });
  
  const quoteResponseScore = calculateQuoteResponseScore(data.quoteResponseData);
  const staffQualificationScore = calculateStaffQualificationScore(data.staffQualificationData);

  const localSEOPercentage = localSeoScore ? `${localSeoScore}%` : 'N/A';
  const accessibilityPercentage = accessibilityScore ? `${accessibilityScore}%` : 'N/A';
  const dataPrivacyPercentage = dataPrivacyScore ? `${dataPrivacyScore}%` : 'N/A';

  const missingElementsList = missingImprintElements.length > 0
    ? `<ul>${missingImprintElements.map(element => `<li>${element}</li>`).join('')}</ul>`
    : '<p>Keine fehlenden Elemente gefunden.</p>';

  const baseUrl = businessData.url.startsWith('https://') ? businessData.url : `https://${businessData.url}`;
  const domain = baseUrl.replace(/(^\w+:|^)\/\//, '').split('/')[0];

  // WICHTIG: Kundenservice-Kachel muss immer angezeigt werden
  const showCustomerService = true; // Immer anzeigen, auch wenn keine Daten vorhanden
  const customerServiceScore = data.quoteResponseData && data.quoteResponseData.responseTime ? 
    quoteResponseScore : null; // null = Strich anzeigen
  
  console.log('🎯 CUSTOMER SERVICE DISPLAY:', {
    showCustomerService,
    customerServiceScore,
    willShowDash: customerServiceScore === null
  });

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Social-Listening-Report - ${domain}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
          color: #333;
          line-height: 1.6;
        }
        .container {
          width: 90%;
          max-width: 1200px;
          margin: 20px auto;
          background-color: #fff;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
          text-align: center;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        .metric-card {
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .metric-value {
          font-size: 2em;
          font-weight: bold;
          color: #333;
        }
        .metric-label {
          font-size: 1em;
          color: #666;
        }
        .excellent {
          border-left: 5px solid #4CAF50; /* Green */
        }
        .good {
          border-left: 5px solid #2196F3; /* Blue */
        }
        .average {
          border-left: 5px solid #ff9800; /* Orange */
        }
        .poor {
          border-left: 5px solid #f44336; /* Red */
        }
        .imprint-warning {
          background-color: #ffcccc;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .imprint-warning h2 {
          color: #d32f2f;
        }
        /* Add more styles as needed */
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Social-Listening-Report - ${domain}</h1>
        <p>Dieser Report wurde automatisch generiert, um die Online-Präsenz und -Performance Ihres Unternehmens zu bewerten.</p>

        <div class="imprint-warning">
          <h2>Warnung: Unvollständiges Impressum</h2>
          <p>Die folgenden Elemente fehlen in Ihrem Impressum:</p>
          ${missingElementsList}
        </div>

        <h2>Metrikenübersicht</h2>
  `;

  const metricsHtml = `
    <div class="metrics-grid">
      <div class="metric-card excellent">
        <div class="metric-value">${Math.round(calculatedOwnCompanyScore)}%</div>
        <div class="metric-label">Gesamtscore</div>
      </div>
      
      <div class="metric-card ${seoScore >= 80 ? 'excellent' : seoScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${Math.round(seoScore)}%</div>
        <div class="metric-label">SEO-Bestandsanalyse</div>
      </div>
      
      <div class="metric-card ${performanceScore >= 80 ? 'excellent' : performanceScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${Math.round(performanceScore)}%</div>
        <div class="metric-label">Website Performance</div>
      </div>
      
      <div class="metric-card ${mobileScore >= 80 ? 'excellent' : mobileScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${Math.round(mobileScore)}%</div>
        <div class="metric-label">Mobile Optimierung</div>
      </div>
      
      <div class="metric-card ${localSeoScore >= 80 ? 'excellent' : localSeoScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${Math.round(localSeoScore)}%</div>
        <div class="metric-label">Lokal-SEO</div>
      </div>
      
      <div class="metric-card ${socialMediaScore >= 80 ? 'excellent' : socialMediaScore >= 60 ? 'good' : socialMediaScore < 40 ? 'poor' : 'average'}">
        <div class="metric-value">${Math.round(socialMediaScore)}%</div>
        <div class="metric-label">Social Media Präsenz</div>
      </div>
      
      <div class="metric-card ${onlineReputationScore >= 80 ? 'excellent' : onlineReputationScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${Math.round(onlineReputationScore)}%</div>
        <div class="metric-label">Online Reputation</div>
      </div>
      
      <div class="metric-card ${legalComplianceScore >= 80 ? 'excellent' : legalComplianceScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${Math.round(legalComplianceScore)}%</div>
        <div class="metric-label">Rechtssicherheit</div>
      </div>
      
      <div class="metric-card ${accessibilityDisplayScore >= 80 ? 'excellent' : accessibilityDisplayScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${accessibilityDisplayScore === null ? '–' : Math.round(accessibilityDisplayScore) + '%'}</div>
        <div class="metric-label">Barrierefreiheit</div>
      </div>
      
      <div class="metric-card ${dataPrivacyDisplayScore >= 80 ? 'excellent' : dataPrivacyDisplayScore >= 60 ? 'good' : 'poor'}">
        <div class="metric-value">${dataPrivacyDisplayScore === null ? '–' : Math.round(dataPrivacyDisplayScore) + '%'}</div>
        <div class="metric-label">Datenschutz</div>
      </div>
      
      <div class="metric-card ${corporateIdentityScore >= 80 ? 'excellent' : corporateIdentityScore >= 60 ? 'good' : corporateIdentityScore === 0 ? 'poor' : 'average'}">
        <div class="metric-value">${corporateIdentityScore === 0 ? '–' : Math.round(corporateIdentityScore) + '%'}</div>
        <div class="metric-label">Corporate Design</div>
      </div>
      
      <div class="metric-card ${staffQualificationScore >= 80 ? 'excellent' : staffQualificationScore >= 60 ? 'good' : staffQualificationScore === 0 ? 'poor' : 'average'}">
        <div class="metric-value">${staffQualificationScore === 0 ? '–' : Math.round(staffQualificationScore) + '%'}</div>
        <div class="metric-label">Mitarbeiterqualifizierung</div>
      </div>
      
      <div class="metric-card ${workplaceScore >= 80 ? 'excellent' : workplaceScore >= 60 ? 'good' : workplaceScore === 0 ? 'poor' : 'average'}">
        <div class="metric-value">${workplaceScore === 0 ? '–' : Math.round(workplaceScore) + '%'}</div>
        <div class="metric-label">Arbeitsplatz- und geber-Bewertung</div>
      </div>
      
      <div class="metric-card ${customerServiceScore >= 80 ? 'excellent' : customerServiceScore >= 60 ? 'good' : customerServiceScore === null ? 'poor' : 'average'}">
        <div class="metric-value">${customerServiceScore === null ? '–' : Math.round(customerServiceScore) + '%'}</div>
        <div class="metric-label">Kundenservice</div>
      </div>
    </div>
  `;

  const fullHtml = `
    ${htmlTemplate}
    ${metricsHtml}
        </div>
      </div>
    </body>
    </html>
  `;

  return fullHtml;
};
