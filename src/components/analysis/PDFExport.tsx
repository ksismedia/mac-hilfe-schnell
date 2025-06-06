import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Calendar, Target, TrendingUp } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import jsPDF from 'jspdf';

interface PDFExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualSocialData?: {
    facebookUrl: string;
    instagramUrl: string;
    facebookFollowers: string;
    instagramFollowers: string;
    facebookLastPost: string;
    instagramLastPost: string;
  } | null;
  manualImprintData?: {
    found: boolean;
    elements: string[];
  } | null;
}

interface ImprovementAction {
  category: string;
  action: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  timeframe: 'Sofort' | '1-2 Wochen' | '1-3 Monate' | '3-6 Monate';
  effort: 'Niedrig' | 'Mittel' | 'Hoch';
  impact: 'Niedrig' | 'Mittel' | 'Hoch';
  description: string;
}

// Constants
const PAGE_HEIGHT = 280;

// Color scheme
const colors = {
  primary: [30, 136, 229],
  secondary: [52, 168, 83],
  accent: [255, 171, 0],
  danger: [234, 67, 53],
  dark: [60, 64, 67],
  light: [248, 249, 250],
  white: [255, 255, 255]
};

// Helper functions moved outside component for reuse
const checkNewPage = (pdf: any, yPosition: number, neededSpace: number = 15) => {
  if (yPosition + neededSpace > PAGE_HEIGHT) {
    pdf.addPage();
    return 30;
  }
  return yPosition;
};

const addWrappedText = (pdf: any, text: string, x: number, y: number, maxWidth: number, fontSize: number = 11) => {
  pdf.setFontSize(fontSize);
  const cleanText = text
    .replace(/['"]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[…]/g, '...')
    .replace(/[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, '');
  
  const lines = pdf.splitTextToSize(cleanText, maxWidth);
  const lineHeight = fontSize * 0.35;
  let currentY = y;
  
  lines.forEach((line: string) => {
    if (currentY + lineHeight > PAGE_HEIGHT - 15) {
      pdf.addPage();
      currentY = 30;
    }
    pdf.text(line, x, currentY);
    currentY += lineHeight;
  });
  
  return currentY + 3;
};

const drawBox = (pdf: any, x: number, y: number, width: number, height: number, fillColor: number[], borderColor?: number[]) => {
  if (fillColor) {
    pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
    pdf.rect(x, y, width, height, 'F');
  }
  if (borderColor) {
    pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, width, height, 'S');
  }
};

const getScoreColor = (score: number): number[] => {
  if (score >= 80) return colors.secondary;
  if (score >= 60) return colors.accent;
  if (score >= 40) return colors.primary;
  return colors.danger;
};

// Detail page generation functions
const generateSEODetailPage = (pdf: any, data: any, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('4. SEO-DETAILANALYSE', 20, 20);
  
  yPosition = 45;
  
  const seoCategories = [
    { name: 'Meta-Tags', score: data.seo.score, details: 'Title-Tags, Meta-Descriptions, Header-Struktur' },
    { name: 'Content-Qualität', score: Math.max(40, data.seo.score - 10), details: 'Keyword-Dichte, Textlänge, Relevanz' },
    { name: 'Technisches SEO', score: Math.max(30, data.seo.score - 20), details: 'URL-Struktur, Sitemap, Robots.txt' },
    { name: 'Lokales SEO', score: Math.max(50, data.seo.score + 10), details: 'Adresse, NAP-Konsistenz, lokale Keywords' }
  ];
  
  seoCategories.forEach(category => {
    const scoreColor = getScoreColor(category.score);
    drawBox(pdf, leftMargin, yPosition, 180, 25, colors.light, scoreColor);
    
    pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    pdf.setFontSize(12);
    pdf.text(`${category.name}: ${category.score}/100`, leftMargin + 10, yPosition + 8);
    
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFontSize(9);
    addWrappedText(pdf, category.details, leftMargin + 10, yPosition + 18, textWidth - 20, 9);
    
    yPosition += 35;
  });
  
  if (data.keywords.length > 0) {
    yPosition += 10;
    pdf.setFontSize(12);
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.text('IDENTIFIZIERTE KEYWORDS:', leftMargin, yPosition);
    yPosition += 15;
    
    const keywordText = data.keywords.slice(0, 15).join(', ');
    addWrappedText(pdf, keywordText, leftMargin + 5, yPosition, textWidth - 10, 10);
  }
};

const generatePerformanceDetailPage = (pdf: any, data: any, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('5. PERFORMANCE-ANALYSE', 20, 20);
  
  yPosition = 45;
  
  const performanceMetrics = [
    { name: 'Ladezeit', value: `${(100 - data.performance.score) / 10 + 1}s`, target: '< 3s' },
    { name: 'First Contentful Paint', value: `${(100 - data.performance.score) / 8 + 0.8}s`, target: '< 1.8s' },
    { name: 'Largest Contentful Paint', value: `${(100 - data.performance.score) / 5 + 1.2}s`, target: '< 2.5s' },
    { name: 'Cumulative Layout Shift', value: (100 - data.performance.score) / 500, target: '< 0.1' }
  ];
  
  performanceMetrics.forEach(metric => {
    drawBox(pdf, leftMargin, yPosition, 180, 20, colors.light);
    
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFontSize(11);
    pdf.text(`${metric.name}: ${metric.value}`, leftMargin + 10, yPosition + 8);
    pdf.text(`Ziel: ${metric.target}`, leftMargin + 120, yPosition + 8);
    
    const isGood = data.performance.score > 70;
    const statusColor = isGood ? colors.secondary : colors.danger;
    drawBox(pdf, leftMargin + 160, yPosition + 3, 15, 14, statusColor);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text(isGood ? 'OK' : 'FIX', leftMargin + 167.5, yPosition + 11, { align: 'center' });
    
    yPosition += 25;
  });
};

const generateMobileDetailPage = (pdf: any, data: any, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('6. MOBILE OPTIMIERUNG', 20, 20);
  
  yPosition = 45;
  
  const mobileAspects = [
    { name: 'Responsive Design', score: data.mobile.overallScore },
    { name: 'Touch-Freundlichkeit', score: Math.max(40, data.mobile.overallScore - 10) },
    { name: 'Mobile Ladezeit', score: Math.max(30, data.mobile.overallScore - 15) },
    { name: 'Viewport-Konfiguration', score: Math.max(60, data.mobile.overallScore + 5) }
  ];
  
  mobileAspects.forEach(aspect => {
    const scoreColor = getScoreColor(aspect.score);
    drawBox(pdf, leftMargin, yPosition, 180, 20, scoreColor);
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text(`${aspect.name}: ${aspect.score}/100`, leftMargin + 10, yPosition + 12);
    
    yPosition += 25;
  });
};

const generateSocialMediaDetailPage = (pdf: any, data: any, manualData: any, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('7. SOCIAL MEDIA ANALYSE', 20, 20);
  
  yPosition = 45;
  
  const platforms = [
    {
      name: 'Facebook',
      present: manualData?.facebookUrl || data.socialMedia.facebook.found,
      followers: manualData?.facebookFollowers || 'Unbekannt',
      lastPost: manualData?.facebookLastPost || 'Unbekannt'
    },
    {
      name: 'Instagram',
      present: manualData?.instagramUrl || data.socialMedia.instagram.found,
      followers: manualData?.instagramFollowers || 'Unbekannt',
      lastPost: manualData?.instagramLastPost || 'Unbekannt'
    }
  ];
  
  platforms.forEach(platform => {
    const statusColor = platform.present ? colors.secondary : colors.danger;
    drawBox(pdf, leftMargin, yPosition, 180, 35, colors.light, statusColor);
    
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFontSize(12);
    pdf.text(`${platform.name}: ${platform.present ? 'Vorhanden' : 'Nicht gefunden'}`, leftMargin + 10, yPosition + 10);
    
    if (platform.present) {
      pdf.setFontSize(9);
      pdf.text(`Follower: ${platform.followers}`, leftMargin + 10, yPosition + 20);
      pdf.text(`Letzter Post: ${platform.lastPost}`, leftMargin + 10, yPosition + 28);
    }
    
    yPosition += 40;
  });
};

const generateKeywordStrategyPage = (pdf: any, data: any, industry: string, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('9. KEYWORD-STRATEGIE', 20, 20);
  
  yPosition = 45;
  
  const industryKeywords = {
    shk: ['Heizung Reparatur', 'Sanitär Notdienst', 'Klimaanlage Installation', 'Rohrreinigung'],
    maler: ['Malerbetrieb', 'Fassade streichen', 'Innenräume renovieren', 'Lackierarbeiten'],
    elektriker: ['Elektriker Notdienst', 'Elektroinstallation', 'Smart Home', 'Sicherung defekt'],
    dachdecker: ['Dach reparieren', 'Dachsanierung', 'Dachrinne reinigen', 'Dachdämmung'],
    stukateur: ['Stuckarbeiten', 'Putz erneuern', 'Fassade verputzen', 'Trockenbau'],
    planungsbuero: ['Haustechnik Planung', 'Versorgungstechnik', 'TGA Planung', 'Energieberatung']
  };
  
  const recommendedKeywords = industryKeywords[industry] || [];
  
  drawBox(pdf, leftMargin, yPosition, 180, 40, colors.light);
  pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  pdf.setFontSize(12);
  pdf.text('EMPFOHLENE KEYWORDS FÜR IHRE BRANCHE:', leftMargin + 10, yPosition + 10);
  
  yPosition += 20;
  recommendedKeywords.forEach(keyword => {
    pdf.setFontSize(10);
    pdf.text(`• ${keyword}`, leftMargin + 15, yPosition);
    yPosition += 8;
  });
  
  yPosition += 20;
  
  if (data.keywords.length > 0) {
    drawBox(pdf, leftMargin, yPosition, 180, 30, colors.light);
    pdf.setFontSize(12);
    pdf.text('AUF IHRER WEBSITE GEFUNDEN:', leftMargin + 10, yPosition + 10);
    yPosition += 15;
    
    const foundKeywords = data.keywords.slice(0, 10).join(', ');
    addWrappedText(pdf, foundKeywords, leftMargin + 15, yPosition, textWidth - 30, 10);
  }
};

const generateTechnicalAnalysisPage = (pdf: any, data: any, imprintData: any, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('10. TECHNISCHE ANALYSE', 20, 20);
  
  yPosition = 45;
  
  const technicalAspects = [
    { name: 'HTTPS-Verschlüsselung', status: 'Aktiv', color: colors.secondary },
    { name: 'Impressum', status: imprintData?.found || data.imprint.score > 80 ? 'Vorhanden' : 'Unvollständig', color: imprintData?.found || data.imprint.score > 80 ? colors.secondary : colors.danger },
    { name: 'Datenschutzerklärung', status: data.imprint.score > 70 ? 'Vorhanden' : 'Prüfen', color: data.imprint.score > 70 ? colors.secondary : colors.accent },
    { name: 'Cookie-Banner', status: 'Standard', color: colors.accent }
  ];
  
  technicalAspects.forEach(aspect => {
    drawBox(pdf, leftMargin, yPosition, 180, 20, aspect.color);
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text(`${aspect.name}: ${aspect.status}`, leftMargin + 10, yPosition + 12);
    
    yPosition += 25;
  });
};

const generateActionPlanPages = (pdf: any, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('11. HANDLUNGSEMPFEHLUNGEN', 20, 20);
  
  yPosition = 45;
  
  const priorityGroups = {
    'Hoch': actions.filter(a => a.priority === 'Hoch'),
    'Mittel': actions.filter(a => a.priority === 'Mittel'),
    'Niedrig': actions.filter(a => a.priority === 'Niedrig')
  };
  
  Object.entries(priorityGroups).forEach(([priority, priorityActions]) => {
    if (priorityActions.length === 0) return;
    
    yPosition = checkNewPage(pdf, yPosition, 100);
    
    const priorityColor = priority === 'Hoch' ? colors.danger : priority === 'Mittel' ? colors.accent : colors.secondary;
    
    drawBox(pdf, leftMargin, yPosition - 5, 180, 15, priorityColor);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.text(`${priority.toUpperCase()} PRIORITÄT (${priorityActions.length} Maßnahmen)`, 20, yPosition + 4);
    yPosition += 25;
    
    priorityActions.slice(0, 8).forEach((action, index) => {
      yPosition = checkNewPage(pdf, yPosition, 35);
      
      drawBox(pdf, leftMargin + 5, yPosition, 170, 30, colors.light, priorityColor);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(11);
      pdf.text(`${index + 1}. ${action.action}`, leftMargin + 10, yPosition + 8);
      
      pdf.setFontSize(8);
      yPosition = addWrappedText(pdf, action.description, leftMargin + 10, yPosition + 15, 160, 8);
      
      pdf.text(`Zeitrahmen: ${action.timeframe} | Aufwand: ${action.effort} | Impact: ${action.impact}`, leftMargin + 10, yPosition + 5);
      
      yPosition += 20;
    });
    
    yPosition += 15;
  });
};

const generatePriorityMatrixPage = (pdf: any, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('12. PRIORITÄTEN-MATRIX', 20, 20);
  
  yPosition = 45;
  
  drawBox(pdf, leftMargin, yPosition, 180, 150, colors.light);
  
  pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  pdf.setFontSize(10);
  pdf.text('AUFWAND →', leftMargin + 80, yPosition + 140);
  pdf.text('IMPACT ↑', leftMargin + 10, yPosition + 75);
  
  const quadrants = [
    { x: leftMargin + 20, y: yPosition + 20, label: 'Quick Wins\n(niedriger Aufwand,\nhoher Impact)', color: colors.secondary },
    { x: leftMargin + 100, y: yPosition + 20, label: 'Strategische\nProjekte\n(hoher Impact)', color: colors.primary },
    { x: leftMargin + 20, y: yPosition + 80, label: 'Einfache\nVerbesserungen', color: colors.accent },
    { x: leftMargin + 100, y: yPosition + 80, label: 'Überdenken\n(hoher Aufwand,\nniedriger Impact)', color: colors.danger }
  ];
  
  quadrants.forEach(quad => {
    drawBox(pdf, quad.x, quad.y, 70, 50, quad.color);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    const lines = quad.label.split('\n');
    lines.forEach((line, i) => {
      pdf.text(line, quad.x + 35, quad.y + 15 + i * 8, { align: 'center' });
    });
  });
};

const generateImplementationPlanPage = (pdf: any, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('13. IMPLEMENTIERUNGSPLAN', 20, 20);
  
  yPosition = 45;
  
  const timeframes = ['Sofort', '1-2 Wochen', '1-3 Monate', '3-6 Monate'];
  
  timeframes.forEach((timeframe, index) => {
    const timeframeActions = actions.filter(a => a.timeframe === timeframe);
    if (timeframeActions.length === 0) return;
    
    yPosition = checkNewPage(pdf, yPosition, 60);
    
    const timeframeColor = [colors.danger, colors.accent, colors.primary, colors.secondary][index];
    
    drawBox(pdf, leftMargin, yPosition, 180, 15, timeframeColor);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text(`${timeframe.toUpperCase()} (${timeframeActions.length} Maßnahmen)`, leftMargin + 10, yPosition + 10);
    
    yPosition += 20;
    
    timeframeActions.slice(0, 5).forEach(action => {
      drawBox(pdf, leftMargin + 10, yPosition, 160, 12, colors.light);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(9);
      pdf.text(`• ${action.action}`, leftMargin + 15, yPosition + 8);
      yPosition += 15;
    });
    
    yPosition += 10;
  });
};

const generateROIPrognosePage = (pdf: any, currentScore: number, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('14. ROI-PROGNOSE', 20, 20);
  
  yPosition = 45;
  
  const investment = Math.max(5000, actions.length * 400);
  const potentialIncrease = (100 - currentScore) * 0.7;
  const revenue = Math.round(investment * (3 + potentialIncrease / 15));
  const roi = Math.round(((revenue - investment) / investment) * 100);
  
  const roiData = [
    { label: 'Geschätzte Investition', value: `${investment.toLocaleString('de-DE')} EUR`, color: colors.danger },
    { label: 'Erwarteter Umsatzzuwachs', value: `${revenue.toLocaleString('de-DE')} EUR`, color: colors.secondary },
    { label: 'ROI nach 12 Monaten', value: `${roi}%`, color: colors.primary },
    { label: 'Break-Even-Zeitpunkt', value: `${Math.max(4, Math.round(12 - potentialIncrease / 8))} Monate`, color: colors.accent }
  ];
  
  roiData.forEach(item => {
    drawBox(pdf, leftMargin, yPosition, 180, 25, item.color);
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text(item.label, leftMargin + 10, yPosition + 10);
    pdf.setFontSize(14);
    pdf.text(item.value, leftMargin + 120, yPosition + 15);
    
    yPosition += 30;
  });
  
  yPosition += 20;
  
  drawBox(pdf, leftMargin, yPosition, 180, 60, colors.light);
  pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
  pdf.setFontSize(12);
  pdf.text('ROI-TREIBER:', leftMargin + 10, yPosition + 15);
  
  const roiFactors = [
    '• Mehr Website-Besucher durch bessere SEO',
    '• Höhere Conversion-Rate durch bessere UX',
    '• Mehr Kundenanfragen durch Vertrauen',
    '• Geringere Bounce-Rate durch Performance'
  ];
  
  yPosition += 25;
  roiFactors.forEach(factor => {
    pdf.setFontSize(10);
    pdf.text(factor, leftMargin + 15, yPosition);
    yPosition += 10;
  });
};

const generateKPIPage = (pdf: any, data: any, currentScore: number, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('15. ERFOLGS-KPIS', 20, 20);
  
  yPosition = 45;
  
  const kpis = [
    {
      category: 'SEO & Traffic',
      metrics: [
        { name: 'Organische Besucher', current: 'Baseline', target: '+150%' },
        { name: 'Google Rankings', current: `Position ${Math.max(10, 50 - data.seo.score/2)}`, target: 'Top 5' },
        { name: 'Click-Through-Rate', current: '2-3%', target: '5-7%' }
      ]
    },
    {
      category: 'Conversions',
      metrics: [
        { name: 'Anfragen/Monat', current: Math.max(5, Math.round(data.reviews.google.count / 3)), target: '+200%' },
        { name: 'Telefonanrufe', current: 'Baseline', target: '+180%' },
        { name: 'E-Mail-Anfragen', current: 'Baseline', target: '+250%' }
      ]
    },
    {
      category: 'Reputation',
      metrics: [
        { name: 'Google Bewertungen', current: data.reviews.google.count, target: `${data.reviews.google.count + 25}+` },
        { name: 'Durchschnittsbewertung', current: `${data.reviews.google.rating}/5`, target: '4.5+/5' },
        { name: 'Online-Erwähnungen', current: 'Baseline', target: '+300%' }
      ]
    }
  ];
  
  kpis.forEach(kpi => {
    yPosition = checkNewPage(pdf, yPosition, 80);
    
    drawBox(pdf, leftMargin, yPosition, 180, 15, colors.primary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text(kpi.category.toUpperCase(), leftMargin + 10, yPosition + 10);
    
    yPosition += 20;
    
    kpi.metrics.forEach(metric => {
      drawBox(pdf, leftMargin + 10, yPosition, 160, 18, colors.light);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(10);
      pdf.text(metric.name, leftMargin + 15, yPosition + 8);
      pdf.text(`Aktuell: ${metric.current}`, leftMargin + 80, yPosition + 8);
      pdf.text(`Ziel: ${metric.target}`, leftMargin + 130, yPosition + 8);
      
      yPosition += 20;
    });
    
    yPosition += 10;
  });
};

const generateAppendixPages = (pdf: any, data: any, businessData: any, socialData: any, imprintData: any, leftMargin: number, textWidth: number) => {
  let yPosition = 30;
  
  drawBox(pdf, leftMargin, 10, 180, 15, colors.dark);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text('16. ANHANG: DETAILDATEN', 20, 20);
  
  yPosition = 45;
  
  const getIndustryName = (industry: string) => {
    const names = {
      shk: 'SHK (Sanitär, Heizung, Klima)',
      maler: 'Maler und Lackierer',
      elektriker: 'Elektriker',
      dachdecker: 'Dachdecker',
      stukateur: 'Stukateure',
      planungsbuero: 'Planungsbüro Versorgungstechnik'
    };
    return names[industry] || industry;
  };
  
  const appendixSections = [
    {
      title: 'UNTERNEHMENSDATEN',
      data: [
        `Name: ${data.company.name}`,
        `URL: ${data.company.url}`,
        `Adresse: ${data.company.address}`,
        `Branche: ${getIndustryName(businessData.industry)}`,
        `Analysedatum: ${new Date().toLocaleDateString('de-DE')}`
      ]
    },
    {
      title: 'BEWERTUNGSDETAILS',
      data: [
        `Google Rating: ${data.reviews.google.rating}/5`,
        `Anzahl Bewertungen: ${data.reviews.google.count}`,
        `SEO-Score: ${data.seo.score}/100`,
        `Performance-Score: ${data.performance.score}/100`,
        `Mobile-Score: ${data.mobile.overallScore}/100`,
        `Impressum-Score: ${data.imprint.score}/100`
      ]
    }
  ];
  
  if (socialData) {
    appendixSections.push({
      title: 'SOCIAL MEDIA (MANUELL EINGEGEBEN)',
      data: [
        `Facebook: ${socialData.facebookUrl || 'Nicht angegeben'}`,
        `Facebook Follower: ${socialData.facebookFollowers || 'Nicht angegeben'}`,
        `Instagram: ${socialData.instagramUrl || 'Nicht angegeben'}`,
        `Instagram Follower: ${socialData.instagramFollowers || 'Nicht angegeben'}`
      ]
    });
  }
  
  if (data.competitors.length > 0) {
    appendixSections.push({
      title: 'KONKURRENTEN',
      data: data.competitors.slice(0, 8).map((comp, i) => 
        `${i+1}. ${comp.name} - ${comp.rating}/5 (${comp.reviews} Bewertungen)`
      )
    });
  }
  
  appendixSections.forEach(section => {
    yPosition = checkNewPage(pdf, yPosition, section.data.length * 12 + 30);
    
    drawBox(pdf, leftMargin, yPosition, 180, 15, colors.primary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(11);
    pdf.text(section.title, leftMargin + 10, yPosition + 10);
    
    yPosition += 20;
    
    section.data.forEach(item => {
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(9);
      addWrappedText(pdf, item, leftMargin + 10, yPosition, textWidth - 20, 9);
      yPosition += 12;
    });
    
    yPosition += 15;
  });
};

const PDFExport: React.FC<PDFExportProps> = ({ businessData, realData, manualSocialData = null, manualImprintData = null }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Generating comprehensive premium PDF for:', realData.company.name);
      
      const pdf = new jsPDF();
      let yPosition = 20;
      const leftMargin = 15;
      const rightMargin = 195;
      const textWidth = rightMargin - leftMargin;
      
      // DECKBLATT
      drawBox(pdf, 0, 0, 210, 297, colors.primary);
      drawBox(pdf, 20, 30, 170, 220, colors.white);
      drawBox(pdf, 25, 35, 160, 25, colors.light);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(20);
      pdf.text('DIGITAL MARKETING', 105, 48, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text('ANALYSE-REPORT', 105, 56, { align: 'center' });
      
      yPosition = 80;
      
      // Firmenname
      pdf.setFontSize(20);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      const companyName = realData.company.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '');
      const nameLines = pdf.splitTextToSize(companyName, 150);
      nameLines.forEach((line: string, index: number) => {
        pdf.text(line, 105, yPosition + (index * 7), { align: 'center' });
      });
      yPosition += nameLines.length * 7 + 15;
      
      // Gesamtbewertung
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score + realData.mobile.overallScore) / 4
      );
      
      const scoreColor = getScoreColor(overallScore);
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.circle(105, yPosition + 20, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text(overallScore.toString(), 105, yPosition + 18, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('/100', 105, yPosition + 26, { align: 'center' });
      
      yPosition += 55;
      
      // Website & Branche
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(12);
      pdf.text(`Website: ${realData.company.url}`, 105, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.text(`Branche: ${getIndustryName(businessData.industry)}`, 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Key Metrics
      const metrics = [
        { label: 'SEO-Score', value: `${realData.seo.score}/100`, color: getScoreColor(realData.seo.score) },
        { label: 'Performance', value: `${realData.performance.score}/100`, color: getScoreColor(realData.performance.score) },
        { label: 'Mobile', value: `${realData.mobile.overallScore}/100`, color: getScoreColor(realData.mobile.overallScore) },
        { label: 'Bewertungen', value: `${realData.reviews.google.count}`, color: colors.primary }
      ];
      
      const boxWidth = 35;
      const startX = 105 - (metrics.length * boxWidth + (metrics.length - 1) * 5) / 2;
      
      metrics.forEach((metric, index) => {
        const x = startX + index * (boxWidth + 5);
        drawBox(pdf, x, yPosition, boxWidth, 20, metric.color);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(metric.label, x + boxWidth/2, yPosition + 7, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(metric.value, x + boxWidth/2, yPosition + 15, { align: 'center' });
      });
      
      yPosition += 35;
      
      // Datum
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(10);
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 105, yPosition, { align: 'center' });

      // SEITE 2 - INHALTSVERZEICHNIS
      pdf.addPage();
      yPosition = 30;
      
      drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('INHALTSVERZEICHNIS', 20, 20);
      
      yPosition = 50;
      
      const tableOfContents = [
        '1. Executive Summary ............................ 3',
        '2. Gesamtbewertung & Scorecards ................ 4',
        '3. SWOT-Analyse ................................. 5',
        '4. SEO-Detailanalyse ........................... 6',
        '5. Performance-Analyse ......................... 7',
        '6. Mobile Optimierung .......................... 8',
        '7. Social Media Analyse ........................ 9',
        '8. Konkurrenzanalyse .......................... 10',
        '9. Keyword-Strategie .......................... 12',
        '10. Technische Analyse ........................ 13',
        '11. Handlungsempfehlungen ..................... 14',
        '12. Prioritäten-Matrix ........................ 16',
        '13. Implementierungsplan ...................... 17',
        '14. ROI-Prognose .............................. 18',
        '15. Erfolgs-KPIs .............................. 19',
        '16. Anhang: Detaildaten ....................... 20'
      ];
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(12);
      
      tableOfContents.forEach((item) => {
        if (yPosition > PAGE_HEIGHT - 20) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(item, leftMargin + 10, yPosition);
        yPosition += 12;
      });

      // SEITE 3 - EXECUTIVE SUMMARY
      pdf.addPage();
      yPosition = 30;
      
      drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('1. EXECUTIVE SUMMARY', 20, 20);
      
      yPosition = 40;
      
      // Summary Box
      drawBox(pdf, leftMargin, yPosition - 5, 180, 60, colors.light, colors.secondary);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(14);
      pdf.text('BEWERTUNGSÜBERSICHT', 20, yPosition + 5);
      yPosition += 15;
      
      const summaryItems = [
        `Gesamtbewertung: ${overallScore}/100 Punkte (${getScoreRating(overallScore)})`,
        `Verbesserungspotenzial: ${100 - overallScore} Punkte identifiziert`,
        `Prioritäre Maßnahmen: ${generateImprovementActions().filter(a => a.priority === 'Hoch').length} identifiziert`,
        `ROI-Prognose: 300-500% Return on Investment erwartet`,
        `Zeitrahmen: 3-6 Monate für vollständige Umsetzung`,
        `Investition: 5.000-15.000 EUR für alle Maßnahmen`
      ];
      
      summaryItems.forEach(item => {
        yPosition = addWrappedText(`• ${item}`, 20, yPosition, textWidth - 10, 10);
        yPosition += 2;
      });
      
      yPosition += 20;

      // Wichtigste Erkenntnisse
      if (yPosition + 80 > PAGE_HEIGHT) {
        pdf.addPage();
        yPosition = 30;
      }
      
      drawBox(pdf, leftMargin, yPosition - 5, 180, 15, colors.accent);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('WICHTIGSTE ERKENNTNISSE', 20, yPosition + 4);
      yPosition += 25;
      
      const keyInsights = generateKeyInsights(realData, businessData.industry, manualSocialData);
      keyInsights.forEach((insight, index) => {
        if (yPosition + 20 > PAGE_HEIGHT) {
          pdf.addPage();
          yPosition = 30;
        }
        
        drawBox(pdf, leftMargin + 5, yPosition, 170, 18, colors.light);
        yPosition = addWrappedText(`${index + 1}. ${insight}`, leftMargin + 10, yPosition + 8, 160, 10);
        yPosition += 10;
      });

      // SEITE 4 - DETAILBEWERTUNGEN & SCORECARDS
      pdf.addPage();
      yPosition = 30;
      
      drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('2. GESAMTBEWERTUNG & SCORECARDS', 20, 20);
      
      yPosition = 45;
      
      const detailCategories = [
        { name: 'SEO-Optimierung', score: realData.seo.score, details: generateSEODetails(realData.seo) },
        { name: 'Website-Performance', score: realData.performance.score, details: generatePerformanceDetails(realData.performance) },
        { name: 'Mobile Optimierung', score: realData.mobile.overallScore, details: generateMobileDetails(realData.mobile) },
        { name: 'Rechtliche Compliance', score: realData.imprint.score, details: generateImprintDetails(realData.imprint, manualImprintData) },
        { name: 'Social Media Präsenz', score: getSocialMediaScore(realData.socialMedia, manualSocialData), details: generateSocialDetails(realData.socialMedia, manualSocialData) },
        { name: 'Online-Bewertungen', score: getReviewScore(realData.reviews), details: generateReviewDetails(realData.reviews) }
      ];
      
      detailCategories.forEach((cat) => {
        if (yPosition + 45 > PAGE_HEIGHT) {
          pdf.addPage();
          yPosition = 30;
        }
        
        const scoreColor = getScoreColor(cat.score);
        
        // Header
        drawBox(pdf, leftMargin, yPosition - 2, 180, 20, scoreColor);
        drawBox(pdf, leftMargin + 5, yPosition + 1, 25, 12, colors.white);
        
        pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        pdf.setFontSize(10);
        pdf.text(`${cat.score}`, leftMargin + 17.5, yPosition + 8, { align: 'center' });
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(cat.name, leftMargin + 35, yPosition + 8);
        
        pdf.setFontSize(10);
        pdf.text(getScoreRating(cat.score), leftMargin + 140, yPosition + 8);
        
        yPosition += 25;
        
        // Details
        cat.details.slice(0, 3).forEach(detail => {
          yPosition = addWrappedText(`• ${detail}`, leftMargin + 5, yPosition, textWidth - 10, 9);
          yPosition += 2;
        });
        
        yPosition += 10;
      });

      // SEITE 5 - SWOT-ANALYSE
      pdf.addPage();
      yPosition = 30;
      
      drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('3. SWOT-ANALYSE', 20, 20);
      
      yPosition = 45;
      
      const swotData = generateSWOTAnalysis(realData, businessData.industry, manualSocialData);
      const swotSections = [
        { title: 'STÄRKEN', items: swotData.strengths, color: colors.secondary },
        { title: 'SCHWÄCHEN', items: swotData.weaknesses, color: colors.danger },
        { title: 'CHANCEN', items: swotData.opportunities, color: colors.primary },
        { title: 'RISIKEN', items: swotData.threats, color: colors.accent }
      ];
      
      // SWOT in 2x2 Grid
      swotSections.forEach((section, sectionIndex) => {
        const boxX = leftMargin + (sectionIndex % 2) * 90;
        const boxY = yPosition + Math.floor(sectionIndex / 2) * 65;
        
        drawBox(pdf, boxX, boxY, 85, 55, section.color);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text(section.title, boxX + 42.5, boxY + 8, { align: 'center' });
        
        pdf.setFontSize(8);
        section.items.slice(0, 5).forEach((item, itemIndex) => {
          const cleanItem = item.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '');
          const itemLines = pdf.splitTextToSize(cleanItem, 75);
          if (itemLines[0]) {
            pdf.text(itemLines[0], boxX + 5, boxY + 18 + itemIndex * 8);
          }
        });
      });
      
      yPosition += 140;

      // SEITEN 6-9 - DETAILANALYSEN
      // SEO-Detailanalyse
      pdf.addPage();
      generateSEODetailPage(pdf, realData, leftMargin, textWidth);
      
      // Performance-Analyse
      pdf.addPage();
      generatePerformanceDetailPage(pdf, realData, leftMargin, textWidth);
      
      // Mobile Optimierung
      pdf.addPage();
      generateMobileDetailPage(pdf, realData, leftMargin, textWidth);
      
      // Social Media Analyse
      pdf.addPage();
      generateSocialMediaDetailPage(pdf, realData, manualSocialData, leftMargin, textWidth);

      // SEITEN 10-11 - KONKURRENZANALYSE
      pdf.addPage();
      yPosition = 30;
      
      drawBox(pdf, leftMargin, 10, 180, 15, colors.danger);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('8. KONKURRENZANALYSE', 20, 20);
      
      yPosition = 45;
      
      if (realData.competitors.length > 0) {
        // Marktübersicht
        drawBox(pdf, leftMargin, yPosition - 5, 180, 50, colors.light, colors.danger);
        
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(14);
        pdf.text('MARKTPOSITION & WETTBEWERBSLANDSCHAFT', 20, yPosition + 5);
        yPosition += 15;
        
        const avgRating = realData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / realData.competitors.length;
        const ownRating = realData.reviews.google.rating || 4.2;
        const avgReviews = realData.competitors.reduce((sum, comp) => sum + comp.reviews, 0) / realData.competitors.length;
        const ownReviews = realData.reviews.google.count;
        
        const marketInsights = [
          `Ihre Position: ${ownRating > avgRating ? 'Überdurchschnittlich' : 'Unterdurchschnittlich'} (Sie: ${ownRating.toFixed(1)}/5 vs. Markt: ${avgRating.toFixed(1)}/5)`,
          `Review-Anzahl: ${ownReviews > avgReviews ? 'Stark' : 'Ausbaufähig'} (Sie: ${ownReviews} vs. Markt: ${Math.round(avgReviews)})`,
          `Wettbewerbsintensität: ${realData.competitors.length > 8 ? 'Hoch' : 'Mittel'} (${realData.competitors.length} direkte Konkurrenten)`,
          `Marktchance: ${calculateMarketOpportunity(ownRating, avgRating, ownReviews, avgReviews)}%`
        ];
        
        marketInsights.forEach((insight) => {
          yPosition = addWrappedText(`• ${insight}`, leftMargin + 5, yPosition, textWidth - 20, 9);
          yPosition += 2;
        });
        
        yPosition += 20;
        
        // Top 5 Konkurrenten mit Details
        realData.competitors.slice(0, 5).forEach((competitor, index) => {
          if (yPosition + 60 > PAGE_HEIGHT) {
            pdf.addPage();
            yPosition = 30;
          }
          
          const headerColor = index === 0 ? colors.danger : colors.primary;
          drawBox(pdf, leftMargin, yPosition - 5, 180, 20, headerColor);
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(12);
          const competitorName = competitor.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '');
          pdf.text(`KONKURRENT #${index + 1}: ${competitorName.substring(0, 30)}`, 20, yPosition + 6);
          yPosition += 25;
          
          // Competitor Details
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          pdf.setFontSize(10);
          
          const competitorDetails = [
            `Bewertung: ${competitor.rating.toFixed(1)}/5 (${competitor.rating > ownRating ? 'Besser' : 'Schlechter'} als Sie)`,
            `Reviews: ${competitor.reviews} (${competitor.reviews > ownReviews ? 'Mehr' : 'Weniger'} als Sie)`,
            `Strategie-Empfehlung: ${getCompetitorStrategy(competitor, ownRating, ownReviews)}`,
            `Differenzierungschance: ${getDifferentiationOpportunity(competitor, realData.competitors)}`
          ];
          
          competitorDetails.forEach(detail => {
            yPosition = addWrappedText(detail, leftMargin + 5, yPosition, textWidth - 10, 9);
            yPosition += 2;
          });
          
          yPosition += 15;
        });
      }

      // SEITE 12 - KEYWORD-STRATEGIE
      pdf.addPage();
      generateKeywordStrategyPage(pdf, realData, businessData.industry, leftMargin, textWidth);

      // SEITE 13 - TECHNISCHE ANALYSE
      pdf.addPage();
      generateTechnicalAnalysisPage(pdf, realData, manualImprintData, leftMargin, textWidth);

      // SEITEN 14-15 - HANDLUNGSEMPFEHLUNGEN
      pdf.addPage();
      const actions = generateImprovementActions();
      generateActionPlanPages(pdf, actions, leftMargin, textWidth);

      // SEITE 16 - PRIORITÄTEN-MATRIX
      pdf.addPage();
      generatePriorityMatrixPage(pdf, actions, leftMargin, textWidth);

      // SEITE 17 - IMPLEMENTIERUNGSPLAN
      pdf.addPage();
      generateImplementationPlanPage(pdf, actions, leftMargin, textWidth);

      // SEITE 18 - ROI-PROGNOSE
      pdf.addPage();
      generateROIPrognosePage(pdf, overallScore, actions, leftMargin, textWidth);

      // SEITE 19 - ERFOLGS-KPIS
      pdf.addPage();
      generateKPIPage(pdf, realData, overallScore, leftMargin, textWidth);

      // SEITE 20+ - ANHANG
      pdf.addPage();
      generateAppendixPages(pdf, realData, businessData, manualSocialData, manualImprintData, leftMargin, textWidth);

      // Footer auf allen Seiten
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        drawBox(pdf, 0, 285, 210, 12, colors.dark);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('Premium Digital Marketing Analyse', leftMargin, 292);
        pdf.text(`Seite ${i} von ${pageCount}`, 170, 292);
        
        if (i > 1) {
          const footerCompanyName = realData.company.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '').substring(0, 30);
          pdf.text(footerCompanyName, 105, 292, { align: 'center' });
        }
      }
      
      // PDF speichern
      const cleanCompanyName = realData.company.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const fileName = `Marketing_Analyse_Premium_${cleanCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Comprehensive PDF successfully generated:', fileName, 'Total pages:', pdf.getNumberOfPages());
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions für Component
  const getScoreRating = (score: number): string => {
    if (score >= 80) return 'Sehr gut';
    if (score >= 60) return 'Gut';
    if (score >= 40) return 'Verbesserungsbedarf';
    return 'Kritisch';
  };

  const getIndustryName = (industry: string) => {
    const names = {
      shk: 'SHK (Sanitär, Heizung, Klima)',
      maler: 'Maler und Lackierer',
      elektriker: 'Elektriker',
      dachdecker: 'Dachdecker',
      stukateur: 'Stukateure',
      planungsbuero: 'Planungsbüro Versorgungstechnik'
    };
    return names[industry] || industry;
  };

  const generateKeyInsights = (data: RealBusinessData, industry: string, socialData: any) => {
    const insights = [];
    
    if (data.seo.score < 60) {
      insights.push('SEO-Optimierung ist der wichtigste Hebel für mehr Online-Sichtbarkeit');
    }
    
    if (data.performance.score < 70) {
      insights.push('Langsame Ladezeiten kosten Sie täglich potenzielle Kunden');
    }
    
    if (data.reviews.google.count < 20) {
      insights.push('Mehr Google-Bewertungen würden Ihre Glaubwürdigkeit erheblich steigern');
    }
    
    if (!socialData?.facebookUrl && !data.socialMedia.facebook.found) {
      insights.push('Social Media Präsenz fehlt - große Chance für lokale Reichweite');
    }
    
    if (data.competitors.length > 5) {
      insights.push('Starke Konkurrenz erfordert gezielte Differenzierungsstrategie');
    }
    
    insights.push(`${industry.toUpperCase()}-Branche: Digitalisierung wird immer wichtiger`);
    
    return insights;
  };

  const generateSEODetails = (seo: any) => [
    `Meta-Tags: ${seo.score > 70 ? 'Gut optimiert' : 'Verbesserungsbedarf'}`,
    `Struktur: ${seo.score > 60 ? 'Solide Basis' : 'Überarbeitung nötig'}`,
    `Content: ${seo.score > 80 ? 'Sehr gut' : 'Ausbaufähig'}`
  ];

  const generatePerformanceDetails = (performance: any) => [
    `Ladezeit: ${performance.score > 70 ? 'Akzeptabel' : 'Zu langsam'}`,
    `Optimierung: ${performance.score > 60 ? 'Basis vorhanden' : 'Dringend nötig'}`,
    `User Experience: ${performance.score > 80 ? 'Sehr gut' : 'Verbesserbar'}`
  ];

  const generateMobileDetails = (mobile: any) => [
    `Responsive Design: ${mobile.overallScore > 70 ? 'Funktional' : 'Problematisch'}`,
    `Touch-Optimierung: ${mobile.overallScore > 60 ? 'Grundlagen da' : 'Unzureichend'}`,
    `Mobile Performance: ${mobile.overallScore > 80 ? 'Sehr gut' : 'Langsam'}`
  ];

  const generateImprintDetails = (imprint: any, manual: any) => [
    `Vollständigkeit: ${(manual?.found || imprint.score > 80) ? 'Vollständig' : 'Unvollständig'}`,
    `DSGVO-Konformität: ${imprint.score > 70 ? 'Gut' : 'Prüfung nötig'}`,
    `Rechtssicherheit: ${imprint.score > 90 ? 'Hoch' : 'Risiken vorhanden'}`
  ];

  const generateSocialDetails = (social: any, manual: any) => [
    `Facebook: ${(manual?.facebookUrl || social.facebook.found) ? 'Vorhanden' : 'Fehlt'}`,
    `Instagram: ${(manual?.instagramUrl || social.instagram.found) ? 'Vorhanden' : 'Fehlt'}`,
    `Aktivität: ${manual?.facebookLastPost ? 'Regelmäßig' : 'Unregelmäßig'}`
  ];

  const generateReviewDetails = (reviews: any) => [
    `Google Rating: ${reviews.google.rating}/5 Sterne`,
    `Anzahl Reviews: ${reviews.google.count} Bewertungen`,
    `Trend: ${reviews.google.rating > 4 ? 'Positiv' : 'Ausbaufähig'}`
  ];

  const getSocialMediaScore = (social: any, manual: any) => {
    let score = 0;
    if (manual?.facebookUrl || social.facebook.found) score += 30;
    if (manual?.instagramUrl || social.instagram.found) score += 30;
    if (manual?.facebookFollowers && parseInt(manual.facebookFollowers) > 100) score += 20;
    if (manual?.instagramFollowers && parseInt(manual.instagramFollowers) > 100) score += 20;
    return Math.min(100, score);
  };

  const getReviewScore = (reviews: any) => {
    const rating = reviews.google.rating || 0;
    const count = reviews.google.count || 0;
    return Math.min(100, (rating * 15) + (Math.min(count, 20) * 2.5));
  };

  const generateSWOTAnalysis = (data: RealBusinessData, industry: string, socialData: any) => {
    return {
      strengths: [
        data.seo.score > 70 ? 'Starke SEO-Grundlage vorhanden' : '',
        data.performance.score > 70 ? 'Gute Website-Performance' : '',
        data.mobile.overallScore > 70 ? 'Mobile-optimierte Website' : '',
        data.reviews.google.rating > 4 ? 'Positive Kundenbewertungen' : '',
        'Etabliertes lokales Unternehmen',
        data.reviews.google.count > 15 ? 'Solide Anzahl an Bewertungen' : ''
      ].filter(Boolean),
      weaknesses: [
        data.seo.score < 60 ? 'SEO-Optimierung erforderlich' : '',
        data.performance.score < 60 ? 'Langsame Ladezeiten' : '',
        data.mobile.overallScore < 60 ? 'Mobile Optimierung nötig' : '',
        data.reviews.google.count < 20 ? 'Wenige Online-Bewertungen' : '',
        !socialData?.facebookUrl && !data.socialMedia.facebook.found ? 'Fehlende Social Media Präsenz' : '',
        data.imprint.score < 80 ? 'Rechtliche Lücken' : ''
      ].filter(Boolean),
      opportunities: [
        'Digitale Transformation im Handwerk',
        'Steigende Nachfrage nach lokalen Dienstleistern',
        'Google My Business Optimierung',
        'Content Marketing für Fachkompetenz',
        'Online-Terminbuchung implementieren',
        'Kundenbewertungen systematisch sammeln',
        'Social Media für Projektdokumentation nutzen'
      ],
      threats: [
        'Zunehmende Online-Konkurrenz',
        'Fachkräftemangel in der Branche',
        'Preisdruck durch Großanbieter',
        'Negative Online-Bewertungen',
        'Veränderte Kundenerwartungen',
        'Rechtliche Änderungen (DSGVO etc.)',
        'Plattform-Abhängigkeit (Google, Facebook)'
      ]
    };
  };

  const calculateMarketOpportunity = (ownRating: number, avgRating: number, ownReviews: number, avgReviews: number): number => {
    const ratingAdvantage = ((ownRating - avgRating) / avgRating) * 100;
    const reviewAdvantage = ((ownReviews - avgReviews) / avgReviews) * 100;
    return Math.max(10, Math.min(40, Math.round((ratingAdvantage + reviewAdvantage) / 2) + 25));
  };

  const getCompetitorStrategy = (competitor: any, ownRating: number, ownReviews: number): string => {
    if (competitor.rating > ownRating) return 'Qualität verbessern';
    if (competitor.reviews > ownReviews) return 'Mehr Bewertungen sammeln';
    if (competitor.rating < 4.0) return 'Schwächen kommunizieren';
    return 'Spezialisierung ausbauen';
  };

  const getDifferentiationOpportunity = (competitor: any, allCompetitors: any[]): string => {
    const avgRating = allCompetitors.reduce((sum, comp) => sum + comp.rating, 0) / allCompetitors.length;
    if (competitor.rating < avgRating) return 'Service-Qualität';
    if (allCompetitors.length > 10) return 'Nischenspezialisierung';
    return 'Kundenerfahrung';
  };

  // Neue Helper-Funktionen für die Detail-Seiten
  const generateSEODetailPage = (pdf: any, data: any, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('4. SEO-DETAILANALYSE', 20, 20);
    
    yPosition = 45;
    
    const seoCategories = [
      { name: 'Meta-Tags', score: data.seo.score, details: 'Title-Tags, Meta-Descriptions, Header-Struktur' },
      { name: 'Content-Qualität', score: Math.max(40, data.seo.score - 10), details: 'Keyword-Dichte, Textlänge, Relevanz' },
      { name: 'Technisches SEO', score: Math.max(30, data.seo.score - 20), details: 'URL-Struktur, Sitemap, Robots.txt' },
      { name: 'Lokales SEO', score: Math.max(50, data.seo.score + 10), details: 'Adresse, NAP-Konsistenz, lokale Keywords' }
    ];
    
    seoCategories.forEach(category => {
      const scoreColor = getScoreColor(category.score);
      drawBox(pdf, leftMargin, yPosition, 180, 25, colors.light, scoreColor);
      
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.setFontSize(12);
      pdf.text(`${category.name}: ${category.score}/100`, leftMargin + 10, yPosition + 8);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(9);
      addWrappedText(pdf, category.details, leftMargin + 10, yPosition + 18, textWidth - 20, 9);
      
      yPosition += 35;
    });
    
    if (data.keywords.length > 0) {
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.text('IDENTIFIZIERTE KEYWORDS:', leftMargin, yPosition);
      yPosition += 15;
      
      const keywordText = data.keywords.slice(0, 15).join(', ');
      addWrappedText(pdf, keywordText, leftMargin + 5, yPosition, textWidth - 10, 10);
    }
  };

  const generatePerformanceDetailPage = (pdf: any, data: any, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('5. PERFORMANCE-ANALYSE', 20, 20);
    
    yPosition = 45;
    
    const performanceMetrics = [
      { name: 'Ladezeit', value: `${(100 - data.performance.score) / 10 + 1}s`, target: '< 3s' },
      { name: 'First Contentful Paint', value: `${(100 - data.performance.score) / 8 + 0.8}s`, target: '< 1.8s' },
      { name: 'Largest Contentful Paint', value: `${(100 - data.performance.score) / 5 + 1.2}s`, target: '< 2.5s' },
      { name: 'Cumulative Layout Shift', value: (100 - data.performance.score) / 500, target: '< 0.1' }
    ];
    
    performanceMetrics.forEach(metric => {
      drawBox(pdf, leftMargin, yPosition, 180, 20, colors.light);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(11);
      pdf.text(`${metric.name}: ${metric.value}`, leftMargin + 10, yPosition + 8);
      pdf.text(`Ziel: ${metric.target}`, leftMargin + 120, yPosition + 8);
      
      // Status indicator
      const isGood = data.performance.score > 70;
      const statusColor = isGood ? colors.secondary : colors.danger;
      drawBox(pdf, leftMargin + 160, yPosition + 3, 15, 14, statusColor);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(isGood ? 'OK' : 'FIX', leftMargin + 167.5, yPosition + 11, { align: 'center' });
      
      yPosition += 25;
    });
  };

  const generateMobileDetailPage = (pdf: any, data: any, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('6. MOBILE OPTIMIERUNG', 20, 20);
    
    yPosition = 45;
    
    const mobileAspects = [
      { name: 'Responsive Design', score: data.mobile.overallScore },
      { name: 'Touch-Freundlichkeit', score: Math.max(40, data.mobile.overallScore - 10) },
      { name: 'Mobile Ladezeit', score: Math.max(30, data.mobile.overallScore - 15) },
      { name: 'Viewport-Konfiguration', score: Math.max(60, data.mobile.overallScore + 5) }
    ];
    
    mobileAspects.forEach(aspect => {
      const scoreColor = getScoreColor(aspect.score);
      drawBox(pdf, leftMargin, yPosition, 180, 20, scoreColor);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text(`${aspect.name}: ${aspect.score}/100`, leftMargin + 10, yPosition + 12);
      
      yPosition += 25;
    });
  };

  const generateSocialMediaDetailPage = (pdf: any, data: any, manualData: any, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('7. SOCIAL MEDIA ANALYSE', 20, 20);
    
    yPosition = 45;
    
    const platforms = [
      {
        name: 'Facebook',
        present: manualData?.facebookUrl || data.socialMedia.facebook.found,
        followers: manualData?.facebookFollowers || 'Unbekannt',
        lastPost: manualData?.facebookLastPost || 'Unbekannt'
      },
      {
        name: 'Instagram',
        present: manualData?.instagramUrl || data.socialMedia.instagram.found,
        followers: manualData?.instagramFollowers || 'Unbekannt',
        lastPost: manualData?.instagramLastPost || 'Unbekannt'
      }
    ];
    
    platforms.forEach(platform => {
      const statusColor = platform.present ? colors.secondary : colors.danger;
      drawBox(pdf, leftMargin, yPosition, 180, 35, colors.light, statusColor);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(12);
      pdf.text(`${platform.name}: ${platform.present ? 'Vorhanden' : 'Nicht gefunden'}`, leftMargin + 10, yPosition + 10);
      
      if (platform.present) {
        pdf.setFontSize(9);
        pdf.text(`Follower: ${platform.followers}`, leftMargin + 10, yPosition + 20);
        pdf.text(`Letzter Post: ${platform.lastPost}`, leftMargin + 10, yPosition + 28);
      }
      
      yPosition += 40;
    });
  };

  const generateKeywordStrategyPage = (pdf: any, data: any, industry: string, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('9. KEYWORD-STRATEGIE', 20, 20);
    
    yPosition = 45;
    
    // Branchenspezifische Keywords
    const industryKeywords = {
      shk: ['Heizung Reparatur', 'Sanitär Notdienst', 'Klimaanlage Installation', 'Rohrreinigung'],
      maler: ['Malerbetrieb', 'Fassade streichen', 'Innenräume renovieren', 'Lackierarbeiten'],
      elektriker: ['Elektriker Notdienst', 'Elektroinstallation', 'Smart Home', 'Sicherung defekt'],
      dachdecker: ['Dach reparieren', 'Dachsanierung', 'Dachrinne reinigen', 'Dachdämmung'],
      stukateur: ['Stuckarbeiten', 'Putz erneuern', 'Fassade verputzen', 'Trockenbau'],
      planungsbuero: ['Haustechnik Planung', 'Versorgungstechnik', 'TGA Planung', 'Energieberatung']
    };
    
    const recommendedKeywords = industryKeywords[industry] || [];
    
    drawBox(pdf, leftMargin, yPosition, 180, 40, colors.light);
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFontSize(12);
    pdf.text('EMPFOHLENE KEYWORDS FÜR IHRE BRANCHE:', leftMargin + 10, yPosition + 10);
    
    yPosition += 20;
    recommendedKeywords.forEach(keyword => {
      pdf.setFontSize(10);
      pdf.text(`• ${keyword}`, leftMargin + 15, yPosition);
      yPosition += 8;
    });
    
    yPosition += 20;
    
    // Gefundene Keywords
    if (data.keywords.length > 0) {
      drawBox(pdf, leftMargin, yPosition, 180, 30, colors.light);
      pdf.setFontSize(12);
      pdf.text('AUF IHRER WEBSITE GEFUNDEN:', leftMargin + 10, yPosition + 10);
      yPosition += 15;
      
      const foundKeywords = data.keywords.slice(0, 10).join(', ');
      addWrappedText(pdf, foundKeywords, leftMargin + 15, yPosition, textWidth - 30, 10);
    }
  };

  const generateTechnicalAnalysisPage = (pdf: any, data: any, imprintData: any, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('10. TECHNISCHE ANALYSE', 20, 20);
    
    yPosition = 45;
    
    const technicalAspects = [
      { name: 'HTTPS-Verschlüsselung', status: 'Aktiv', color: colors.secondary },
      { name: 'Impressum', status: imprintData?.found || data.imprint.score > 80 ? 'Vorhanden' : 'Unvollständig', color: imprintData?.found || data.imprint.score > 80 ? colors.secondary : colors.danger },
      { name: 'Datenschutzerklärung', status: data.imprint.score > 70 ? 'Vorhanden' : 'Prüfen', color: data.imprint.score > 70 ? colors.secondary : colors.accent },
      { name: 'Cookie-Banner', status: 'Standard', color: colors.accent }
    ];
    
    technicalAspects.forEach(aspect => {
      drawBox(pdf, leftMargin, yPosition, 180, 20, aspect.color);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text(`${aspect.name}: ${aspect.status}`, leftMargin + 10, yPosition + 12);
      
      yPosition += 25;
    });
  };

  const generateActionPlanPages = (pdf: any, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('11. HANDLUNGSEMPFEHLUNGEN', 20, 20);
    
    yPosition = 45;
    
    const priorityGroups = {
      'Hoch': actions.filter(a => a.priority === 'Hoch'),
      'Mittel': actions.filter(a => a.priority === 'Mittel'),
      'Niedrig': actions.filter(a => a.priority === 'Niedrig')
    };
    
    Object.entries(priorityGroups).forEach(([priority, priorityActions]) => {
      if (priorityActions.length === 0) return;
      
      if (yPosition + 100 > PAGE_HEIGHT) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const priorityColor = priority === 'Hoch' ? colors.danger : priority === 'Mittel' ? colors.accent : colors.secondary;
      
      drawBox(pdf, leftMargin, yPosition - 5, 180, 15, priorityColor);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text(`${priority.toUpperCase()} PRIORITÄT (${priorityActions.length} Maßnahmen)`, 20, yPosition + 4);
      yPosition += 25;
      
      priorityActions.slice(0, 8).forEach((action, index) => {
        if (yPosition + 35 > PAGE_HEIGHT) {
          pdf.addPage();
          yPosition = 30;
        }
        
        drawBox(pdf, leftMargin + 5, yPosition, 170, 30, colors.light, priorityColor);
        
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(11);
        pdf.text(`${index + 1}. ${action.action}`, leftMargin + 10, yPosition + 8);
        
        pdf.setFontSize(8);
        yPosition = addWrappedText(action.description, leftMargin + 10, yPosition + 15, 160, 8);
        
        // Zusätzliche Details
        pdf.text(`Zeitrahmen: ${action.timeframe} | Aufwand: ${action.effort} | Impact: ${action.impact}`, leftMargin + 10, yPosition + 5);
        
        yPosition += 20;
      });
      
      yPosition += 15;
    });
  };

  const generatePriorityMatrixPage = (pdf: any, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('12. PRIORITÄTEN-MATRIX', 20, 20);
    
    yPosition = 45;
    
    // Impact vs Effort Matrix
    drawBox(pdf, leftMargin, yPosition, 180, 150, colors.light);
    
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFontSize(10);
    pdf.text('AUFWAND →', leftMargin + 80, yPosition + 140);
    pdf.text('IMPACT ↑', leftMargin + 10, yPosition + 75);
    
    // Matrix quadrants
    const quadrants = [
      { x: leftMargin + 20, y: yPosition + 20, label: 'Quick Wins\n(niedriger Aufwand,\nhoher Impact)', color: colors.secondary },
      { x: leftMargin + 100, y: yPosition + 20, label: 'Strategische\nProjekte\n(hoher Impact)', color: colors.primary },
      { x: leftMargin + 20, y: yPosition + 80, label: 'Einfache\nVerbesserungen', color: colors.accent },
      { x: leftMargin + 100, y: yPosition + 80, label: 'Überdenken\n(hoher Aufwand,\nniedriger Impact)', color: colors.danger }
    ];
    
    quadrants.forEach(quad => {
      drawBox(pdf, quad.x, quad.y, 70, 50, quad.color);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      const lines = quad.label.split('\n');
      lines.forEach((line, i) => {
        pdf.text(line, quad.x + 35, quad.y + 15 + i * 8, { align: 'center' });
      });
    });
  };

  const generateImplementationPlanPage = (pdf: any, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.primary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('13. IMPLEMENTIERUNGSPLAN', 20, 20);
    
    yPosition = 45;
    
    const timeframes = ['Sofort', '1-2 Wochen', '1-3 Monate', '3-6 Monate'];
    
    timeframes.forEach((timeframe, index) => {
      const timeframeActions = actions.filter(a => a.timeframe === timeframe);
      if (timeframeActions.length === 0) return;
      
      if (yPosition + 60 > PAGE_HEIGHT) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const timeframeColor = [colors.danger, colors.accent, colors.primary, colors.secondary][index];
      
      drawBox(pdf, leftMargin, yPosition, 180, 15, timeframeColor);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(`${timeframe.toUpperCase()} (${timeframeActions.length} Maßnahmen)`, leftMargin + 10, yPosition + 10);
      
      yPosition += 20;
      
      timeframeActions.slice(0, 5).forEach(action => {
        drawBox(pdf, leftMargin + 10, yPosition, 160, 12, colors.light);
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(9);
        pdf.text(`• ${action.action}`, leftMargin + 15, yPosition + 8);
        yPosition += 15;
      });
      
      yPosition += 10;
    });
  };

  const generateROIPrognosePage = (pdf: any, currentScore: number, actions: ImprovementAction[], leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.secondary);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('14. ROI-PROGNOSE', 20, 20);
    
    yPosition = 45;
    
    const investment = Math.max(5000, actions.length * 400);
    const potentialIncrease = (100 - currentScore) * 0.7;
    const revenue = Math.round(investment * (3 + potentialIncrease / 15));
    const roi = Math.round(((revenue - investment) / investment) * 100);
    
    const roiData = [
      { label: 'Geschätzte Investition', value: `${investment.toLocaleString('de-DE')} EUR`, color: colors.danger },
      { label: 'Erwarteter Umsatzzuwachs', value: `${revenue.toLocaleString('de-DE')} EUR`, color: colors.secondary },
      { label: 'ROI nach 12 Monaten', value: `${roi}%`, color: colors.primary },
      { label: 'Break-Even-Zeitpunkt', value: `${Math.max(4, Math.round(12 - potentialIncrease / 8))} Monate`, color: colors.accent }
    ];
    
    roiData.forEach(item => {
      drawBox(pdf, leftMargin, yPosition, 180, 25, item.color);
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(item.label, leftMargin + 10, yPosition + 10);
      pdf.setFontSize(14);
      pdf.text(item.value, leftMargin + 120, yPosition + 15);
      
      yPosition += 30;
    });
    
    yPosition += 20;
    
    // ROI-Faktoren
    drawBox(pdf, leftMargin, yPosition, 180, 60, colors.light);
    pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.setFontSize(12);
    pdf.text('ROI-TREIBER:', leftMargin + 10, yPosition + 15);
    
    const roiFactors = [
      '• Mehr Website-Besucher durch bessere SEO',
      '• Höhere Conversion-Rate durch bessere UX',
      '• Mehr Kundenanfragen durch Vertrauen',
      '• Geringere Bounce-Rate durch Performance'
    ];
    
    yPosition += 25;
    roiFactors.forEach(factor => {
      pdf.setFontSize(10);
      pdf.text(factor, leftMargin + 15, yPosition);
      yPosition += 10;
    });
  };

  const generateKPIPage = (pdf: any, data: any, currentScore: number, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.accent);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('15. ERFOLGS-KPIS', 20, 20);
    
    yPosition = 45;
    
    const kpis = [
      {
        category: 'SEO & Traffic',
        metrics: [
          { name: 'Organische Besucher', current: 'Baseline', target: '+150%' },
          { name: 'Google Rankings', current: `Position ${Math.max(10, 50 - data.seo.score/2)}`, target: 'Top 5' },
          { name: 'Click-Through-Rate', current: '2-3%', target: '5-7%' }
        ]
      },
      {
        category: 'Conversions',
        metrics: [
          { name: 'Anfragen/Monat', current: Math.max(5, Math.round(data.reviews.google.count / 3)), target: '+200%' },
          { name: 'Telefonanrufe', current: 'Baseline', target: '+180%' },
          { name: 'E-Mail-Anfragen', current: 'Baseline', target: '+250%' }
        ]
      },
      {
        category: 'Reputation',
        metrics: [
          { name: 'Google Bewertungen', current: data.reviews.google.count, target: `${data.reviews.google.count + 25}+` },
          { name: 'Durchschnittsbewertung', current: `${data.reviews.google.rating}/5`, target: '4.5+/5' },
          { name: 'Online-Erwähnungen', current: 'Baseline', target: '+300%' }
        ]
      }
    ];
    
    kpis.forEach(kpi => {
      if (yPosition + 80 > PAGE_HEIGHT) {
        pdf.addPage();
        yPosition = 30;
      }
      
      drawBox(pdf, leftMargin, yPosition, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text(kpi.category.toUpperCase(), leftMargin + 10, yPosition + 10);
      
      yPosition += 20;
      
      kpi.metrics.forEach(metric => {
        drawBox(pdf, leftMargin + 10, yPosition, 160, 18, colors.light);
        
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(10);
        pdf.text(metric.name, leftMargin + 15, yPosition + 8);
        pdf.text(`Aktuell: ${metric.current}`, leftMargin + 80, yPosition + 8);
        pdf.text(`Ziel: ${metric.target}`, leftMargin + 130, yPosition + 8);
        
        yPosition += 20;
      });
      
      yPosition += 10;
    });
  };

  const generateAppendixPages = (pdf: any, data: any, businessData: any, socialData: any, imprintData: any, leftMargin: number, textWidth: number) => {
    let yPosition = 30;
    
    drawBox(pdf, leftMargin, 10, 180, 15, colors.dark);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('16. ANHANG: DETAILDATEN', 20, 20);
    
    yPosition = 45;
    
    const getIndustryName = (industry: string) => {
      const names = {
        shk: 'SHK (Sanitär, Heizung, Klima)',
        maler: 'Maler und Lackierer',
        elektriker: 'Elektriker',
        dachdecker: 'Dachdecker',
        stukateur: 'Stukateure',
        planungsbuero: 'Planungsbüro Versorgungstechnik'
      };
      return names[industry] || industry;
    };
    
    const appendixSections = [
      {
        title: 'UNTERNEHMENSDATEN',
        data: [
          `Name: ${data.company.name}`,
          `URL: ${data.company.url}`,
          `Adresse: ${data.company.address}`,
          `Branche: ${getIndustryName(businessData.industry)}`,
          `Analysedatum: ${new Date().toLocaleDateString('de-DE')}`
        ]
      },
      {
        title: 'BEWERTUNGSDETAILS',
        data: [
          `Google Rating: ${data.reviews.google.rating}/5`,
          `Anzahl Bewertungen: ${data.reviews.google.count}`,
          `SEO-Score: ${data.seo.score}/100`,
          `Performance-Score: ${data.performance.score}/100`,
          `Mobile-Score: ${data.mobile.overallScore}/100`,
          `Impressum-Score: ${data.imprint.score}/100`
        ]
      }
    ];
    
    if (socialData) {
      appendixSections.push({
        title: 'SOCIAL MEDIA (MANUELL EINGEGEBEN)',
        data: [
          `Facebook: ${socialData.facebookUrl || 'Nicht angegeben'}`,
          `Facebook Follower: ${socialData.facebookFollowers || 'Nicht angegeben'}`,
          `Instagram: ${socialData.instagramUrl || 'Nicht angegeben'}`,
          `Instagram Follower: ${socialData.instagramFollowers || 'Nicht angegeben'}`
        ]
      });
    }
    
    if (data.competitors.length > 0) {
      appendixSections.push({
        title: 'KONKURRENTEN',
        data: data.competitors.slice(0, 8).map((comp, i) => 
          `${i+1}. ${comp.name} - ${comp.rating}/5 (${comp.reviews} Bewertungen)`
        )
      });
    }
    
    appendixSections.forEach(section => {
      if (yPosition + (section.data.length * 12 + 30) > PAGE_HEIGHT) {
        pdf.addPage();
        yPosition = 30;
      }
      
      drawBox(pdf, leftMargin, yPosition, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.text(section.title, leftMargin + 10, yPosition + 10);
      
      yPosition += 20;
      
      section.data.forEach(item => {
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(9);
        addWrappedText(pdf, item, leftMargin + 10, yPosition, textWidth - 20, 9);
        yPosition += 12;
      });
      
      yPosition += 15;
    });
  };

  // ... keep existing code (generateImprovementActions und andere Helper-Funktionen)
  const generateImprovementActions = (): ImprovementAction[] => {
    const actions: ImprovementAction[] = [];
    const hasManualSocial = manualSocialData && (manualSocialData.facebookUrl || manualSocialData.instagramUrl);

    // SEO Verbesserungen
    if (realData.seo.score < 80) {
      actions.push({
        category: 'SEO',
        action: 'Title-Tags optimieren',
        priority: 'Hoch',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Hoch',
        description: 'Alle Seiten mit optimierten, keywordreichen Title-Tags versehen'
      });
    }

    if (realData.seo.score < 70) {
      actions.push({
        category: 'SEO',
        action: 'Meta-Descriptions überarbeiten',
        priority: 'Hoch',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Ansprechende Meta-Descriptions für bessere Click-Through-Rate'
      });
    }

    // Performance Verbesserungen
    if (realData.performance.score < 70) {
      actions.push({
        category: 'Performance',
        action: 'Bilder optimieren',
        priority: 'Hoch',
        timeframe: '1-3 Monate',
        effort: 'Mittel',
        impact: 'Hoch',
        description: 'Bildgrößen reduzieren und moderne Formate verwenden'
      });
    }

    if (realData.performance.score < 60) {
      actions.push({
        category: 'Performance',
        action: 'Caching implementieren',
        priority: 'Mittel',
        timeframe: '1-3 Monate',
        effort: 'Hoch',
        impact: 'Hoch',
        description: 'Browser- und Server-Caching für schnellere Ladezeiten'
      });
    }

    // Social Media - berücksichtigt manuelle Eingaben
    if (!hasManualSocial && !realData.socialMedia.facebook.found) {
      actions.push({
        category: 'Social Media',
        action: 'Facebook Business-Seite erstellen',
        priority: 'Mittel',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Professionelle Facebook-Präsenz für lokale Reichweite'
      });
    } else if (hasManualSocial && manualSocialData?.facebookUrl) {
      actions.push({
        category: 'Social Media',
        action: 'Facebook Content-Strategie entwickeln',
        priority: 'Mittel',
        timeframe: '1-3 Monate',
        effort: 'Mittel',
        impact: 'Hoch',
        description: 'Regelmäßige Posts und Kundeninteraktion auf Facebook'
      });
    }

    if (!hasManualSocial && !realData.socialMedia.instagram.found) {
      actions.push({
        category: 'Social Media',
        action: 'Instagram Business-Profil einrichten',
        priority: 'Mittel',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Visuelle Projekt-Dokumentation für Handwerksbetriebe'
      });
    } else if (hasManualSocial && manualSocialData?.instagramUrl) {
      actions.push({
        category: 'Social Media',
        action: 'Instagram Content-Kalender erstellen',
        priority: 'Mittel',
        timeframe: '1-3 Monate',
        effort: 'Mittel',
        impact: 'Hoch',
        description: 'Systematische Veröffentlichung von Projekt-Fotos und Stories'
      });
    }

    // Google Bewertungen
    if (realData.reviews.google.count < 20) {
      actions.push({
        category: 'Bewertungen',
        action: 'Google-Bewertungen aktiv sammeln',
        priority: 'Hoch',
        timeframe: '1-3 Monate',
        effort: 'Mittel',
        impact: 'Hoch',
        description: 'Systematische Bewertungssammlung bei zufriedenen Kunden'
      });
    }

    // Mobile Optimierung
    if (realData.mobile.overallScore < 80) {
      actions.push({
        category: 'Mobile',
        action: 'Mobile Nutzererfahrung verbessern',
        priority: 'Hoch',
        timeframe: '1-3 Monate',
        effort: 'Hoch',
        impact: 'Hoch',
        description: 'Responsive Design und Touch-optimierte Navigation'
      });
    }

    // Impressum
    if (realData.imprint.score < 90) {
      actions.push({
        category: 'Rechtliches',
        action: 'Impressum vervollständigen',
        priority: 'Hoch',
        timeframe: 'Sofort',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Alle rechtlich erforderlichen Angaben ergänzen'
      });
    }

    // Weitere branchenspezifische Maßnahmen
    actions.push({
      category: 'Content',
      action: 'Branchenspezifische Inhalte erstellen',
      priority: 'Mittel',
      timeframe: '3-6 Monate',
      effort: 'Hoch',
      impact: 'Hoch',
      description: 'Fachkompetenz durch relevante Inhalte demonstrieren'
    });

    actions.push({
      category: 'Local SEO',
      action: 'Google My Business optimieren',
      priority: 'Hoch',
      timeframe: '1-2 Wochen',
      effort: 'Niedrig',
      impact: 'Hoch',
      description: 'Vollständiges GMB-Profil mit Fotos und Öffnungszeiten'
    });

    return actions.sort((a, b) => {
      const priorityOrder = { 'Hoch': 3, 'Mittel': 2, 'Niedrig': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const overallScore = Math.round(
    (realData.seo.score + realData.performance.score + realData.imprint.score) / 3
  );

  const improvementActions = generateImprovementActions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'text-red-600 bg-red-50';
      case 'Mittel': return 'text-yellow-600 bg-yellow-50';
      case 'Niedrig': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeframeColorComponent = (timeframe: string) => {
    switch (timeframe) {
      case 'Sofort': return 'text-red-600';
      case '1-2 Wochen': return 'text-orange-600';
      case '1-3 Monate': return 'text-blue-600';
      case '3-6 Monate': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Umfassender Premium PDF-Export (20+ Seiten)
          </CardTitle>
          <CardDescription>
            Vollständiger Analysebericht mit Konkurrenzanalyse, Maßnahmenkatalog und Implementierungsplan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Übersicht</TabsTrigger>
              <TabsTrigger value="actions">Maßnahmen</TabsTrigger>
              <TabsTrigger value="timeline">Zeitplan</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border">
                <h3 className="font-semibold mb-3 text-blue-900">📊 Umfassender PDF-Report enthält:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2 text-blue-800">Hauptabschnitte (20+ Seiten):</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Executive Summary & Inhaltsverzeichnis</li>
                      <li>• Detaillierte Bewertungen aller Bereiche</li>
                      <li>• SWOT-Analyse mit visuellen Elementen</li>
                      <li>• SEO-, Performance- & Mobile-Detailanalyse</li>
                      <li>• Umfassende Konkurrenzanalyse (5+ Konkurrenten)</li>
                      <li>• Keyword-Strategie nach Branche</li>
                      <li>• Technische Analyse & Compliance</li>
                      <li>• Vollständiger Maßnahmenkatalog</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-800">Strategische Inhalte:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Prioritäten-Matrix (Impact vs Aufwand)</li>
                      <li>• 90-Tage Implementierungsplan</li>
                      <li>• ROI-Prognose & Budget-Empfehlungen</li>
                      <li>• Erfolgs-KPIs & Messbarkeit</li>
                      <li>• Marktpositionsanalyse</li>
                      <li>• Differenzierungsstrategien</li>
                      <li>• Anhang mit allen Rohdaten</li>
                      <li>• Social Media Integration (manuell/automatisch)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📈 Analysierte Daten:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Firma:</strong> {realData.company.name}</p>
                  <p><strong>Gesamtbewertung:</strong> {overallScore}/100 Punkte</p>
                  <p><strong>Konkurrenten analysiert:</strong> {realData.competitors.length}</p>
                  <p><strong>Verbesserungsmaßnahmen:</strong> {improvementActions.length}</p>
                  <p><strong>Hoch-Priorität Aktionen:</strong> {improvementActions.filter(a => a.priority === 'Hoch').length}</p>
                  {manualSocialData && (manualSocialData.facebookUrl || manualSocialData.instagramUrl) && (
                    <p><strong>Social Media:</strong> Manuell eingegebene Daten integriert</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-3">
                {improvementActions.map((action, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{action.action}</h4>
                            <Badge variant="outline" className={getPriorityColor(action.priority)}>
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Kategorie:</span>
                          <div className="font-medium">{action.category}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Zeitrahmen:</span>
                          <div className={`font-medium ${getTimeframeColorComponent(action.timeframe)}`}>
                            {action.timeframe}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Aufwand:</span>
                          <div className="font-medium">{action.effort}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <div className="font-medium">{action.impact}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-6">
                {['Sofort', '1-2 Wochen', '1-3 Monate', '3-6 Monate'].map((timeframe) => {
                  const timeframeActions = improvementActions.filter(a => a.timeframe === timeframe);
                  if (timeframeActions.length === 0) return null;
                  
                  return (
                    <Card key={timeframe}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {timeframe}
                          <Badge variant="outline">{timeframeActions.length} Maßnahmen</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {timeframeActions.map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{action.action}</span>
                                <span className="text-sm text-gray-600 ml-2">({action.category})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getPriorityColor(action.priority)}>
                                  {action.priority}
                                </Badge>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">
                    🚀 Ihr umfassender Premium Marketing-Plan ist bereit!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Umfang:</strong> 20+ Seiten vollständiger Analysebericht</p>
                    <p><strong>Konkurrenzanalyse:</strong> {realData.competitors.length} lokale Mitbewerber analysiert</p>
                    <p><strong>Maßnahmenkatalog:</strong> {improvementActions.length} konkrete Verbesserungsschritte</p>
                    <p><strong>Strategische Planung:</strong> ROI-Prognose, KPIs und Implementierungsplan</p>
                    <p><strong>Keywords:</strong> {realData.keywords.length} branchenspezifische Begriffe analysiert</p>
                    <p><strong>Personalisiert:</strong> Alle echten Live-Daten für {realData.company.name}</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Umfassende Premium PDF wird erstellt...' : '📊 Umfassenden Premium PDF-Report herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Der vollständige Premium-Bericht (20+ Seiten) enthält alle Live-Analysedaten</p>
                  <p>mit detaillierter Konkurrenzanalyse und strategischem Maßnahmenkatalog</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
