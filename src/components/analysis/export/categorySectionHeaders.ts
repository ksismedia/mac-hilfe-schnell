import { getScoreHexColor } from '@/utils/categoryScoreUtils';

/**
 * Generate a category section header with a score badge
 */
export const generateCategorySectionHeader = (
  title: string,
  subtitle: string,
  score: number,
  emoji: string = ''
): string => {
  const scoreColor = getScoreHexColor(score);
  const bgColor = score >= 90 ? 'rgba(250, 204, 21, 0.1)' : 
                   score >= 61 ? 'rgba(74, 222, 128, 0.1)' : 
                   'rgba(248, 113, 113, 0.1)';
  
  return `
    <div class="section" style="margin-bottom: 30px;">
      <div class="section-header collapsible" onclick="toggleSection('${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-content')" 
           style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
        <span>${emoji} ${title}</span>
        <div class="header-score-circle" style="
          min-width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: ${scoreColor};
          background-color: ${bgColor};
          border: 3px solid ${scoreColor};
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">${score}%</div>
      </div>
      <div id="${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-content" class="section-content" style="display: none;">
        <p style="color: #9ca3af; margin-bottom: 20px;">${subtitle}</p>
`;
};

/**
 * Close a category section
 */
export const closeCategorySection = (): string => {
  return `
      </div>
    </div>
  `;
};

/**
 * Generate all 6 main category section headers for the HTML export
 */
export const generateCategoryHeaders = (scores: {
  onlineQuality: number;
  performance: number;
  socialMedia: number;
  market: number;
  corporate: number;
  service: number;
}) => {
  return {
    onlineQuality: generateCategorySectionHeader(
      'Online-Qualität · Relevanz · Autorität',
      'Suchmaschinenoptimierung, Keywords, Content-Qualität und Compliance',
      scores.onlineQuality,
      '🔍'
    ),
    performance: generateCategorySectionHeader(
      'Webseiten-Performance & Technik',
      'Ladegeschwindigkeit, Mobile-Optimierung und technische Umsetzung',
      scores.performance,
      '⚡'
    ),
    socialMedia: generateCategorySectionHeader(
      'Online-/Web-/Social-Media Performance',
      'Social Media Präsenz, Bewertungen und Online-Reputation',
      scores.socialMedia,
      '📱'
    ),
    market: generateCategorySectionHeader(
      'Markt & Marktumfeld',
      'Preisstrategie, Personalqualifikation und Wettbewerbsposition',
      scores.market,
      '📊'
    ),
    corporate: generateCategorySectionHeader(
      'Außendarstellung & Erscheinungsbild',
      'Corporate Identity und professionelle Darstellung',
      scores.corporate,
      '🎨'
    ),
    service: generateCategorySectionHeader(
      'Qualität · Service · Kundenorientierung',
      'Reaktionszeit und Kundenservice-Qualität',
      scores.service,
      '⭐'
    ),
  };
};
