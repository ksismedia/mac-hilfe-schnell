
export const getHTMLStyles = () => {
  console.log('CSS Styles being applied');
  return `
html, body, * { margin: 0; padding: 0; box-sizing: border-box; max-width: 100%; overflow-x: hidden; }
.collapsible { 
  transition: all 0.3s ease; 
  user-select: none;
  border-radius: 8px;
  padding: 15px 20px !important;
}
.collapsible:hover { 
  background: rgba(251, 191, 36, 0.1) !important; 
  transform: translateY(-1px);
}
body { 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  line-height: 1.6; 
  color: #f5f5f5; 
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  min-height: 100vh;
  overflow-x: hidden !important;
  width: 100vw;
  max-width: 100vw;
}
.container { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 20px; 
  box-sizing: border-box; 
  width: calc(100% - 40px);
  overflow-x: hidden !important;
  position: relative;
}
.header { 
  text-align: center; 
  margin-bottom: 40px; 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  padding: 40px 30px; 
  border-radius: 20px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  border: 1px solid rgba(251, 191, 36, 0.3);
  max-width: 100%;
  overflow-x: hidden;
}
.header h1 { 
  color: #fbbf24; 
  font-size: 2.8em; 
  margin-bottom: 15px; 
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}
.header .subtitle { color: #d1d5db; font-size: 1.3em; font-weight: 300; }
.logo-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  margin-bottom: 20px; 
}
.logo { 
  max-width: 150px; 
  height: auto; 
  border-radius: 8px;
  filter: drop-shadow(0 4px 8px rgba(251, 191, 36, 0.3)); 
}
.score-overview { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 25px; 
  margin-bottom: 40px; 
  max-width: 100%;
  overflow-x: hidden;
}
.score-card { 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  padding: 20px 15px; 
  border-radius: 12px; 
  box-shadow: 0 6px 20px rgba(0,0,0,0.3); 
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(251, 191, 36, 0.3);
  max-width: 100%;
  overflow-x: hidden;
}
.score-card:hover { transform: translateY(-5px); }
.score-big { 
  font-size: 3.2em; 
  font-weight: bold; 
  margin-bottom: 10px;
}
.score-big span { 
  /* Inline-Farben haben Vorrang */
}
.score-label { color: #d1d5db; font-weight: 600; font-size: 1.0em; }
.section { 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  margin-bottom: 30px; 
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3); 
  overflow: hidden !important;
  border: 1px solid rgba(251, 191, 36, 0.3);
  page-break-inside: avoid;
  max-width: 100% !important;
  box-sizing: border-box !important;
  contain: layout style !important;
  position: relative;
}
.section-header { 
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #000000; 
  padding: 25px 30px; 
  font-size: 1.5em; 
  font-weight: 700;
  max-width: 100%;
  overflow-x: hidden;
}
.header-score-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  font-size: 1.2em;
  font-weight: 700;
  margin-left: auto;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
.header-score-circle.dark-red { background: #FF0000; color: white; }  /* 0-60% */
.header-score-circle.red { background: #FF0000; color: white; }      /* 0-60% */
.header-score-circle.orange { background: #FF0000; color: white; }   /* 0-60% */
.header-score-circle.green { background: #22c55e; color: white; }    /* 61-80% */
.header-score-circle.yellow { background: #FFD700; color: black; }   /* 81-100% */
.section-content { 
  padding: 30px; 
  max-width: 100% !important;
  overflow-x: hidden !important;
  word-wrap: break-word;
  box-sizing: border-box !important;
  contain: layout style !important;
  position: relative;
}
.metric-card { 
  background: rgba(17, 24, 39, 0.6); 
  padding: 25px; 
  border-radius: 12px; 
  border-left: 5px solid #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
  margin-bottom: 20px;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
  word-wrap: break-word;
  position: relative;
}
.metric-card h3 { color: #fbbf24; margin-bottom: 15px; font-size: 1.2em; }
.score-display { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.score-circle { 
  width: 100px; 
  height: 100px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.6em; 
  font-weight: bold; 
  flex-shrink: 0;
}
.score-circle.green { background: #22c55e; color: white; }
.score-circle.yellow { background: #FFD700; color: black !important; }
.score-circle.orange { background: #FF0000; color: white; }
.score-circle.red { background: #FF0000; color: white; }
.score-circle.dark-red { background: #FF0000; color: white; }
.score-details { flex: 1; }
.score-details p { margin-bottom: 8px; color: #d1d5db; }
.score-details strong { color: #fbbf24; }

/* Progress-Balken mit einfarbigem Design basierend auf Score-Bereichen */
.progress-container { margin-top: 15px; }
.progress-bar { 
  background: #374151; 
  height: 16px; 
  border-radius: 8px; 
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  position: relative;
}
.progress-fill { 
  height: 100%; 
  border-radius: 8px; 
  transition: width 0.8s ease;
  position: relative;
  overflow: hidden;
}

/* Progress-Fill Farben basierend auf korrekten Wert-Bereichen */
.progress-fill[data-score="0-60"] { background: #FF0000 !important; } /* Rot 0-60% */
.progress-fill[data-score="60-80"] { background: #22c55e !important; } /* Grün 60-80% */
.progress-fill[data-score="80-100"] { background: #FFD700 !important; } /* Gelb 80-100% */

/* Progress-Fill CSS-Klassen für bessere Kontrolle */
.progress-red { background: #FF0000 !important; }
.progress-green { background: #22c55e !important; }
.progress-yellow { background: #FFD700 !important; }

/* Score Text Farben */
.score-text.red { color: #FF0000 !important; font-weight: bold; }
.score-text.green { color: #22c55e !important; font-weight: bold; }
.score-text.yellow { color: #FFD700 !important; font-weight: bold; }

/* Header-Klassen für verschiedene Bereiche */
.header-red { background: #FF0000 !important; color: white !important; }
.header-green { background: #22c55e !important; color: white !important; }
.header-yellow { background: #FFD700 !important; color: black !important; }

/* Spezielle Violations Klassen */
.violation-critical { background: rgba(239, 68, 68, 0.2) !important; }
.violation-serious { background: rgba(245, 158, 11, 0.2) !important; }
.violation-moderate { background: rgba(59, 130, 246, 0.2) !important; }
.violation-minor { background: rgba(107, 114, 128, 0.2) !important; }

/* Ranking Position Farben */
.ranking-position { font-size: 18px; font-weight: bold; }
.ranking-position.red { color: #FF0000 !important; }
.ranking-position.green { color: #22c55e !important; }
.ranking-position.yellow { color: #FFD700 !important; }

/* Progress-Fill Punkt Indikator - Größer und deutlicher */
.progress-fill::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -6px;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #333;
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 6px rgba(0,0,0,0.4);
}

.percentage-btn {
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 50px;
  color: white;
}

.percentage-btn[data-score="0-60"] { background: #FF0000; color: white; }
.percentage-btn[data-score="60-80"] { background: #22c55e; color: white; }
.percentage-btn[data-score="80-100"] { background: #FFD700; color: black; }

.percentage-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.company-info { 
  background: rgba(17, 24, 39, 0.6); 
  padding: 25px; 
  border-radius: 12px; 
  border-left: 5px solid #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
  margin-bottom: 20px;
}
.company-info h3 { color: #fbbf24; margin-bottom: 15px; font-size: 1.3em; }
.company-info p { margin-bottom: 8px; color: #d1d5db; }
.company-info strong { color: #fbbf24; }

.keyword-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 10px; 
  margin-top: 15px;
}
.keyword-item { 
  padding: 8px 12px; 
  background: rgba(17, 24, 39, 0.6); 
  border-radius: 6px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border: 1px solid rgba(251, 191, 36, 0.2);
  color: #d1d5db;
}
.found { 
  background: rgba(34, 197, 94, 0.3); 
  border-color: rgba(34, 197, 94, 0.6); 
  color: #22c55e;
}
.not-found { 
  background: rgba(239, 68, 68, 0.3); 
  border-color: rgba(239, 68, 68, 0.6); 
  color: #ef4444;
}

.platform-details { margin: 20px 0; }
.platform-details h4 { color: #fbbf24; margin-bottom: 10px; }
.platform-details ul { list-style: none; padding-left: 0; }
.platform-details li { 
  margin-bottom: 8px; 
  padding: 8px 12px; 
  background: rgba(17, 24, 39, 0.6); 
  border-radius: 6px; 
  color: #d1d5db;
}

.competitor-item { 
  background: rgba(17, 24, 39, 0.6); 
  padding: 20px; 
  border-radius: 12px; 
  margin-bottom: 15px;
  border-left: 4px solid #6b7280;
  border: 1px solid rgba(251, 191, 36, 0.2);
}
.competitor-rank { 
  font-size: 1.2em; 
  font-weight: bold; 
  color: #fbbf24; 
  margin-bottom: 8px; 
}

.recommendations { 
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1)); 
  padding: 20px; 
  border-radius: 12px; 
  margin-top: 20px; 
  border-left: 5px solid #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.recommendations h4 { color: #fbbf24; margin-bottom: 15px; font-size: 1.1em; }
.recommendations ul { list-style: none; padding-left: 0; }
.recommendations li { 
  margin-bottom: 8px; 
  padding-left: 20px; 
  position: relative; 
  color: #d1d5db;
}
.recommendations li:before { 
  content: "⭐"; 
  position: absolute; 
  left: 0; 
  color: #fbbf24; 
  font-weight: bold;
}

/* Safari PDF-Optimierungen */
.score-overview {
  page-break-inside: avoid;
}

.metric-card {
  page-break-inside: avoid;
  overflow: visible;
}

.competitor-item {
  page-break-inside: avoid;
}

table {
  page-break-inside: auto;
  width: 100% !important;
  table-layout: fixed;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  word-wrap: break-word;
}

table tr {
  page-break-inside: avoid;
}

.header {
  page-break-after: avoid;
}

/* Print-spezifische Styles für bessere PDF-Darstellung */
@media print {
  * {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body { 
    background: #1a1a1a !important; 
    color: #f5f5f5 !important;
    font-size: 12pt;
    line-height: 1.4;
    overflow-x: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .container { 
    max-width: none !important; 
    margin: 0 !important;
    padding: 10px !important;
    width: 100% !important;
    overflow-x: hidden !important;
  }
  
  .section { 
    box-shadow: none !important; 
    border: 1px solid rgba(251, 191, 36, 0.8) !important;
    margin-bottom: 15px !important;
    page-break-inside: avoid !important;
    overflow: visible !important;
  }
  
  .score-card { 
    box-shadow: none !important; 
    border: 1px solid rgba(251, 191, 36, 0.8) !important;
    page-break-inside: avoid !important;
  }
  
  .section-header {
    background: #fbbf24 !important;
    color: #000000 !important;
    font-weight: bold !important;
  }
  
  .header h1 {
    -webkit-text-fill-color: #fbbf24 !important;
    background: none !important;
    color: #fbbf24 !important;
  }
  
  .score-big {
    background: none !important;
  }
  
  .score-big span {
    /* Inline-Farben bleiben bestehen */
  }
  
  table {
    width: 100% !important;
    table-layout: fixed !important;
    border-collapse: collapse !important;
  }
  
  table td, table th {
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    hyphens: auto !important;
    padding: 8px 6px !important;
    font-size: 10pt !important;
    line-height: 1.2 !important;
  }
  
  .progress-fill[data-score="0-60"] { background: #FF0000 !important; }
  .progress-fill[data-score="60-80"] { background: #22c55e !important; }
  .progress-fill[data-score="80-100"] { background: #FFD700 !important; }
  
  .recommendations {
    page-break-inside: avoid !important;
  }
  
  .score-display {
    display: block !important;
  }
  
  .score-circle {
    display: inline-block !important;
    margin-bottom: 10px !important;
  }
  
  .score-badge {
    padding: 2px 6px !important;
    border-radius: 12px !important;
    font-weight: bold !important;
  }
  
  .score-badge.red {
    background-color: #dc2626 !important;
    color: #ffffff !important;
  }
  
  .score-badge.green {
    background-color: #16a34a !important;
    color: #ffffff !important;
  }
  
  .score-badge.yellow {
    background-color: #eab308 !important;
    color: #000000 !important;
  }
  
  .error-text {
    color: #dc2626 !important;
  }
  
  .success-text {
    color: #16a34a !important;
  }
  
  .section-text {
    color: #1d4ed8 !important;
  }
  
  .warning-box {
    background: #fef2f2 !important;
    border: 2px solid #dc2626 !important;
  }
  
  .info-box {
    background: rgba(59, 130, 246, 0.1) !important;
    border: 1px solid rgba(59, 130, 246, 0.3) !important;
  }
  
  .success-box {
    background: rgba(34, 197, 94, 0.1) !important;
  }
  
  .violations-box {
    background: rgba(239, 68, 68, 0.1) !important;
  }
  
  .secondary-text {
    color: #666666 !important;
  }
  
  .keyword-found {
    background: #dcfce7 !important;
    color: #059669 !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
  }
  
  .keyword-missing {
    background: #fef2f2 !important;
    color: #dc2626 !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
  }
  
  .header-accessibility {
    background: #FFD700 !important;
    color: #000000 !important;
  }
  
  .header-seo {
    background: #16a34a !important;
    color: #000000 !important;
  }
  
  .header-local-seo {
    background: #10b981 !important;
    color: #000000 !important;
  }
  
  .progress-point {
    position: absolute !important;
    background: white !important;
    border: 3px solid #374151 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
    z-index: 10 !important;
  }
  
  .citation-total {
    font-size: 24px !important;
    font-weight: bold !important;
    color: #3b82f6 !important;
  }
  
  .citation-consistent {
    font-size: 24px !important;
    font-weight: bold !important;
    color: #16a34a !important;
  }
  
  .citation-inconsistent {
    font-size: 24px !important;
    font-weight: bold !important;
    color: #ef4444 !important;
  }
  
  .table-header {
    color: #fbbf24 !important;
  }
  
  .table-text {
    color: #d1d5db !important;
  }
  
  .primary-highlight {
    color: #fbbf24 !important;
    font-weight: bold !important;
  }
  
  .volume-high {
    background: #fbbf24 !important;
    color: #000000 !important;
    margin-left: 8px !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
  }
  
  .volume-medium {
    background: #22c55e !important;
    color: #ffffff !important;
    margin-left: 8px !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
  }
  
  .volume-low {
    background: #ef4444 !important;
    color: #ffffff !important;
    margin-left: 8px !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
  }
  
  .directory-complete {
    background: #fbbf24 !important;
    color: #000000 !important;
  }
  
  .directory-incomplete {
    background: #ef4444 !important;
    color: #ffffff !important;
  }
  
  .directory-missing {
    background: #ef4444 !important;
    color: #ffffff !important;
  }
  
  .gray-text {
    color: #9ca3af !important;
  }
  
  .light-gray-text {
    color: #d1d5db !important;
  }
}
`;
};
