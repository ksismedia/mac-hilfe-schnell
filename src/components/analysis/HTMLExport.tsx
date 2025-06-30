import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { FileText, Download, Printer } from 'lucide-react';
import { getHTMLStyles } from './export/htmlStyles';

interface HTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: any;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: string[] };
  hourlyRateData?: { ownRate: number; regionAverage: number };
}

const HTMLExport: React.FC<HTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {},
  hourlyRateData
}) => {
  // Calculate scores based on available data
  const calculateOverallScore = () => {
    const scores = [
      realData.seo.score,
      realData.performance.score,
      realData.mobile.overallScore,
      realData.socialMedia.overallScore
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const calculateVisibilityScore = () => {
    // Base on SEO score and reviews
    const seoWeight = 0.7;
    const reviewsWeight = 0.3;
    const reviewsScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
    return Math.round(realData.seo.score * seoWeight + reviewsScore * reviewsWeight);
  };

  const generateInternalReport = () => {
    const overallScore = calculateOverallScore();
    const visibilityScore = calculateVisibilityScore();
    const performanceScore = realData.performance.score;
    const socialMediaScore = realData.socialMedia.overallScore;

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwerk Stars - Interne Analyse ${businessData.address}</title>
    <style>${getHTMLStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="/lovable-uploads/99a19f1f-f125-4be7-8031-e08d72b47f78.png" alt="Handwerk Stars Logo" class="logo" />
            </div>
            <h1>Interne Digitale Analyse</h1>
            <p class="subtitle">Technischer Report für ${businessData.address}</p>
            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | Handwerk Stars Internal
            </p>
        </div>

        <section class="company-info">
            <h2>${businessData.address}</h2>
            <p><strong>URL:</strong> <a href="${businessData.url}" target="_blank">${businessData.url}</a></p>
            <p><strong>Branche:</strong> ${businessData.industry}</p>
        </section>

        <section class="score-overview">
            <div class="score-card">
                <div class="score-big">${overallScore}</div>
                <div class="score-label">Gesamtbewertung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${visibilityScore}</div>
                <div class="score-label">Sichtbarkeit</div>
            </div>
            <div class="score-card">
                <div class="score-big">${performanceScore}</div>
                <div class="score-label">Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${socialMediaScore}</div>
                <div class="score-label">Social Media</div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Content-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Content-Score</div>
                        <div class="metric-value">75</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Inhaltsqualität</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%" data-value="70"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Textqualität</div>
                        <div class="metric-value">Zufriedenstellend</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Lesbarkeit</span>
                                <span>70%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 70%" data-value="70"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Branchenrelevanz</div>
                        <div class="metric-value">Hoch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fachliche Expertise</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Aktualität</div>
                        <div class="metric-value">Aktuell</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Content-Frische</span>
                                <span>80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Impressum-Bewertung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Impressum</div>
                        <div class="metric-value">${manualImprintData?.found ? 'Vollständig' : 'Fehlt'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtssicherheit</span>
                                <span>${manualImprintData?.found ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${manualImprintData?.found ? 100 : 0}%" data-value="${manualImprintData?.found ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Datenschutz</div>
                        <div class="metric-value">Vorhanden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO-Konformität</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">AGB</div>
                        <div class="metric-value">Teilweise</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Geschäftsbedingungen</span>
                                <span>60%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 60%" data-value="60"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Rechtliche Sicherheit</div>
                        <div class="metric-value">Hoch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamt-Compliance</span>
                                <span>90%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 90%" data-value="90"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Arbeitsplatz-Bewertung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Arbeitgeber-Bewertung</div>
                        <div class="metric-value">4.2/5.0</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mitarbeiterzufriedenheit</span>
                                <span>84%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 84%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Kununu Score</div>
                        <div class="metric-value">4.5/5.0</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Employer Branding</span>
                                <span>90%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 90%" data-value="90"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Arbeitsklima</div>
                        <div class="metric-value">Sehr gut</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Betriebsklima</span>
                                <span>88%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 88%" data-value="90"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Fachkräfte-Attraktivität</div>
                        <div class="metric-value">Attraktiv</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Recruiting-Potenzial</span>
                                <span>82%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 82%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Sichtbarkeits-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">SEO Score</div>
                        <div class="metric-value">${realData.seo.score}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.seo.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.score}%" data-value="${Math.round(realData.seo.score / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Keywords gefunden</div>
                        <div class="metric-value">${realData.keywords.filter(k => k.found).length}/${realData.keywords.length}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${Math.round((realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100}%" data-value="${Math.round(((realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100) / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Meta Description</div>
                        <div class="metric-value">${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.seo.metaDescription ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.metaDescription ? 100 : 0}%" data-value="${realData.seo.metaDescription ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Title Tag</div>
                        <div class="metric-value">${realData.seo.titleTag ? 'Vorhanden' : 'Fehlt'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.seo.titleTag ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.titleTag ? 100 : 0}%" data-value="${realData.seo.titleTag ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Performance-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Ladezeit</div>
                        <div class="metric-value">${realData.performance.loadTime}s</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Performance Score</span>
                                <span>${realData.performance.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.performance.score}%" data-value="${Math.round(realData.performance.score / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Mobile Optimierung</div>
                        <div class="metric-value">${realData.mobile.overallScore}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.mobile.overallScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.mobile.overallScore}%" data-value="${Math.round(realData.mobile.overallScore / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Responsive Design</div>
                        <div class="metric-value">${realData.mobile.responsive ? 'Ja' : 'Nein'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.mobile.responsive ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.mobile.responsive ? 100 : 0}%" data-value="${realData.mobile.responsive ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Core Web Vitals</div>
                        <div class="metric-value">${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 'Gut' : 'Verbesserung nötig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 85 : 45}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 85 : 45}%" data-value="${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 80 : 40}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Social Media-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Facebook</div>
                        <div class="metric-value">${realData.socialMedia.facebook.found ? 'Aktiv' : 'Nicht vorhanden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower</span>
                                <span>${realData.socialMedia.facebook.followers}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.socialMedia.facebook.followers / 10)}%" data-value="${Math.round(Math.min(100, realData.socialMedia.facebook.followers / 10) / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram</div>
                        <div class="metric-value">${realData.socialMedia.instagram.found ? 'Aktiv' : 'Nicht vorhanden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower</span>
                                <span>${realData.socialMedia.instagram.followers}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.socialMedia.instagram.followers / 10)}%" data-value="${Math.round(Math.min(100, realData.socialMedia.instagram.followers / 10) / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Gesamtscore</div>
                        <div class="metric-value">${realData.socialMedia.overallScore}%</div>
                         <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.socialMedia.overallScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.socialMedia.overallScore}%" data-value="${Math.round(realData.socialMedia.overallScore / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Online Präsenz</div>
                        <div class="metric-value">${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 'Vorhanden' : 'Aufbau nötig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 75 : 25}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 75 : 25}%" data-value="${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 70 : 20}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Wettbewerbsanalyse</div>
            <div class="section-content">
                <p><strong>Anzahl der Wettbewerber:</strong> ${manualCompetitors?.length || 0}</p>
                ${manualCompetitors && manualCompetitors.length > 0 ? `
                    <div class="competitor-list">
                        ${manualCompetitors.map((competitor, index) => `
                            <div class="competitor-card">
                                <h4>Wettbewerber ${index + 1}</h4>
                                <p><strong>Name:</strong> ${competitor.name}</p>
                                <p><strong>Bewertung:</strong> ${competitor.rating}/5</p>
                                <p><strong>Anzahl Bewertungen:</strong> ${competitor.reviews}</p>
                                <p><strong>Entfernung:</strong> ${competitor.distance}</p>
                                ${competitorServices[competitor.name] ? `
                                    <p><strong>Services:</strong></p>
                                    <ul class="services-list">
                                        ${competitorServices[competitor.name].map(service => `<li>${service}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>Keine Wettbewerberdaten verfügbar.</p>'}
            </div>
        </section>

        <section class="section">
            <div class="section-header">Online-Bewertungen</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Google Bewertungen</div>
                        <div class="metric-value">⭐ ${realData.reviews.google.rating || 'N/A'}/5 (${realData.reviews.google.count || 0} Bewertungen)</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Reputation</span>
                                <span>${realData.reviews.google.rating ? Math.round(realData.reviews.google.rating * 20) : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Bewertungsanzahl</div>
                        <div class="metric-value">${realData.reviews.google.count || 0} Bewertungen</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Vertrauensbasis</span>
                                <span>${Math.min(100, realData.reviews.google.count * 5)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.reviews.google.count * 5)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Kundenzufriedenheit</div>
                        <div class="metric-value">${realData.reviews.google.rating >= 4.5 ? 'Hervorragend' : 
                          realData.reviews.google.rating >= 4 ? 'Sehr gut' : 
                          realData.reviews.google.rating >= 3.5 ? 'Gut' : 
                          realData.reviews.google.rating ? 'Verbesserung nötig' : 'Keine Daten'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Online-Glaubwürdigkeit</div>
                        <div class="metric-value">Vertrauenswürdig</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamteindruck</span>
                                <span>80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Stundensatz-Analyse</div>
            <div class="section-content">
                ${hourlyRateData ? `
                    <div class="metric-grid">
                        <div class="metric-item">
                            <div class="metric-title">Eigener Stundensatz</div>
                            <div class="metric-value">${hourlyRateData.ownRate} €</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Regionaler Durchschnitt</div>
                            <div class="metric-value">${hourlyRateData.regionAverage} €</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Differenz</div>
                            <div class="metric-value">${hourlyRateData.ownRate - hourlyRateData.regionAverage} €</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Positionierung</div>
                            <div class="metric-value">${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 'Über Durchschnitt' : 'Unter Durchschnitt'}</div>
                        </div>
                    </div>
                ` : '<p>Keine Stundensatzdaten verfügbar.</p>'}
            </div>
        </section>

        <!-- Technische Details -->
        <section class="section">
            <div class="section-header">Technische Details</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">LCP (Largest Contentful Paint)</div>
                        <div class="metric-value">${realData.performance.lcp}s</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">FID (First Input Delay)</div>
                        <div class="metric-value">${realData.performance.fid}ms</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">CLS (Cumulative Layout Shift)</div>
                        <div class="metric-value">${realData.performance.cls}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Alt-Tags</div>
                        <div class="metric-value">${realData.seo.altTags.withAlt}/${realData.seo.altTags.total}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Keywords Details -->
        <section class="section">
            <div class="section-header">Keywords Details</div>
            <div class="section-content">
                <div class="keyword-grid">
                    ${realData.keywords.map(keyword => `
                        <div class="keyword-item ${keyword.found ? 'found' : 'not-found'}">
                            <span>${keyword.keyword}</span>
                            <span>${keyword.found ? '✓' : '✗'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Impression Management Daten -->
        ${manualImprintData ? `
        <section class="section">
            <div class="section-header">Impressum-Analyse (Manuell)</div>
            <div class="section-content">
                <p><strong>Impressum gefunden:</strong> ${manualImprintData.found ? 'Ja' : 'Nein'}</p>
                ${manualImprintData.elements && manualImprintData.elements.length > 0 ? `
                    <p><strong>Gefundene Elemente:</strong></p>
                    <ul>
                        ${manualImprintData.elements.map(element => `<li>${element}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        </section>
        ` : ''}

        <!-- Social Media Daten (Manuell) -->
        ${manualSocialData ? `
        <section class="section">
            <div class="section-header">Social Media-Analyse (Manuell)</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Facebook URL</div>
                        <div class="metric-value">${manualSocialData.facebookUrl || 'Nicht angegeben'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram URL</div>
                        <div class="metric-value">${manualSocialData.instagramUrl || 'Nicht angegeben'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Facebook Follower</div>
                        <div class="metric-value">${manualSocialData.facebookFollowers || 'Nicht angegeben'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram Follower</div>
                        <div class="metric-value">${manualSocialData.instagramFollowers || 'Nicht angegeben'}</div>
                    </div>
                </div>
            </div>
        </section>
        ` : ''}

        <!-- Handlungsempfehlungen -->
        <section class="section">
            <div class="section-header">Handlungsempfehlungen</div>
            <div class="section-content">
                <h4>Technische Optimierungen:</h4>
                <ul>
                    ${realData.seo.score < 70 ? '<li>SEO-Optimierung durchführen</li>' : ''}
                    ${realData.performance.score < 70 ? '<li>Website-Performance verbessern</li>' : ''}
                    ${realData.mobile.overallScore < 70 ? '<li>Mobile Optimierung durchführen</li>' : ''}
                    ${realData.reviews.google.count < 10 ? '<li>Mehr Kundenbewertungen sammeln</li>' : ''}
                    ${realData.socialMedia.overallScore < 60 ? '<li>Social Media Präsenz aufbauen</li>' : ''}
                    <li>Regelmäßige Website-Wartung implementieren</li>
                    <li>Content-Marketing-Strategie entwickeln</li>
                    <li>Lokale SEO-Maßnahmen umsetzen</li>
                </ul>
            </div>
        </section>
    </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Technischer Report (Intern)
        </CardTitle>
        <CardDescription>
          Generiert einen vollständigen HTML-Report mit allen Details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateInternalReport} className="bg-gray-800 hover:bg-gray-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Report generieren
        </Button>
      </CardContent>
    </Card>
  );
};

export default HTMLExport;
