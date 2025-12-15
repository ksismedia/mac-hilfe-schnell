
export const getHTMLStyles = () => {
  console.log('CSS Styles being applied');
  return `
/* Navigation Links */
.nav-category-link {
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: block;
}
.nav-category-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}
.nav-category-link:hover h3 {
  color: #fbbf24 !important;
}
.back-to-nav-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.4);
  border-radius: 8px;
  color: #fbbf24;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 30px;
}
.back-to-nav-button:hover {
  background: rgba(251, 191, 36, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}
.category-anchor {
  scroll-margin-top: 20px;
}
html, body, * { margin: 0; padding: 0; box-sizing: border-box; max-width: 100%; overflow-x: hidden; }
.collapsible:not(.section-header) { 
  transition: all 0.3s ease; 
  user-select: none;
  border-radius: 8px;
  padding: 15px 20px;
}
.collapsible:not(.section-header):hover { 
  background: rgba(251, 191, 36, 0.1); 
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
  max-width: 1500px; 
  margin: 0 auto; 
  padding: 20px; 
  box-sizing: border-box; 
  width: calc(100% - 40px);
  overflow-x: hidden !important;
  position: relative;
}
.section { 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  margin-bottom: 30px; 
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.3); 
  overflow: hidden !important;
  border: 1px solid rgba(251, 191, 36, 0.3);
  page-break-inside: avoid;
  max-width: 100% !important;
  width: 100% !important;
  box-sizing: border-box !important;
  contain: layout style !important;
  position: relative;
}
/* CRITICAL: Force ALL sections to have consistent, limited width */
.section,
div[class*="section"]:not(.section-header),
section[class*="section"],
.metric-card,
.company-info,
.recommendations {
  width: 95% !important;
  max-width: 1400px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  box-sizing: border-box !important;
}
.section-content {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}
/* Preserve responsive grid for score cards */
.score-overview { 
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(200px, 200px)) !important;
  gap: 20px 20px !important;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  justify-content: flex-start !important;
}
.score-card {
  width: 200px !important;
  max-width: 200px !important;
  min-width: 200px !important;
  height: 180px !important;
  min-height: 180px !important;
  max-height: 180px !important;
  flex: none !important;
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 20px 15px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  overflow: hidden !important;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 200px)); 
  gap: 20px 20px; 
  margin-bottom: 40px; 
  max-width: 100%;
  overflow-x: hidden;
  justify-content: flex-start;
}
/* Executive Summary Category Headers */
.category-header-executive {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #000000;
  padding: 12px 20px;
  border-radius: 8px;
  margin: 25px auto 15px auto;
  font-weight: 600;
  font-size: 1.1em;
  box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3);
  border: none;
  width: 95% !important;
  max-width: 1400px !important;
  box-sizing: border-box !important;
}
.score-card { 
  padding: 20px 15px !important; 
  border-radius: 12px; 
  text-align: center !important;
  transition: transform 0.3s ease;
  border: 1px solid rgba(251, 191, 36, 0.3);
  width: 200px !important;
  max-width: 200px !important;
  min-width: 200px !important;
  height: 180px !important;
  min-height: 180px !important;
  max-height: 180px !important;
  overflow: hidden !important;
  margin: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  box-sizing: border-box !important;
}
.score-card:hover { transform: translateY(-5px); }
.score-big { 
  font-size: 3.2em; 
  font-weight: bold; 
  margin-bottom: 10px;
  width: 100% !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  flex-shrink: 0 !important;
}
/* Override for neutral tiles in score-big - reset font-size inheritance */
.score-big .score-tile.neutral { 
  font-size: 18px !important;
  line-height: 1.2 !important;
  white-space: normal !important;
  font-weight: 900 !important;
}
/* More specific override */
.score-card .score-big span.score-tile.neutral {
  font-size: 18px !important;
  line-height: 1.2 !important;
  white-space: normal !important;
  font-weight: 900 !important;
}
.score-big span { 
  /* Inline-Farben haben Vorrang */
}
.score-label { 
  color: #d1d5db; 
  font-weight: 600; 
  font-size: 1.0em; 
  width: 100% !important;
  text-align: center !important;
  flex-shrink: 0 !important;
}
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
/* ABSOLUTE SECTION-HEADER REGEL - EINHEITLICHER EINZUG VON 40PX */
.section-header,
.section-header.collapsible,
div.section-header,
.section > .section-header,
.section .section-header,
div[class="section-header"],
div[class*="section-header"],
.section-header[onclick],
.section-header[style] { 
  background: #fbbf24 !important;
  background-color: #fbbf24 !important;
  color: #000000 !important;
  font-size: 1.8em !important;
  font-weight: 700 !important;
  display: flex !important;
  align-items: center !important;
  gap: 15px !important;
  box-sizing: border-box !important;
  border-radius: 0 !important;
  position: relative !important;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 25px 40px !important;
}

/* NOCHMAL: Section-Header Farbe überschreiben */
.section-header.header-red,
.section-header.header-green,
.section-header.header-yellow,
.section-header.red,
.section-header.green,
.section-header.yellow,
.collapsible.section-header,
div.collapsible.section-header {
  background: #fbbf24 !important;
  background-color: #fbbf24 !important;
  color: #000000 !important;
}
.header-score-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  font-size: 0.7em;
  font-weight: 700;
  font-family: 'Arial', 'Helvetica', sans-serif;
  font-variant-numeric: tabular-nums;
  text-rendering: optimizeLegibility;
  margin-left: auto;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.header-score-circle.critical-border {
  border: 3px solid white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}
.header-score-circle.dark-red { background: #FF0000 !important; color: white !important; }  /* 0-60% */
.header-score-circle.red { background: #FF0000 !important; color: white !important; }      /* 0-60% */
.header-score-circle.orange { background: #FF0000 !important; color: white !important; }   /* 0-60% */
.header-score-circle.green { background: #22c55e !important; color: white !important; }    /* 61-80% */
.header-score-circle.yellow { background: #FFD700 !important; color: black !important; }   /* 81-100% */

/* Score Circle - kreisrunder Button in Detailansichten wie im Banner */
.score-circle {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 54px !important;
  height: 54px !important;
  min-width: 54px !important;
  max-width: 54px !important;
  min-height: 54px !important;
  max-height: 54px !important;
  border-radius: 50% !important;
  font-size: 0.9em !important;
  font-weight: 700 !important;
  font-family: 'Arial', 'Helvetica', sans-serif !important;
  font-variant-numeric: tabular-nums !important;
  text-rendering: optimizeLegibility !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
  margin-bottom: 15px !important;
  padding: 0 !important;
  box-sizing: border-box !important;
}
.score-circle.dark-red { background: #FF0000 !important; color: white !important; }  /* 0-60% */
.score-circle.red { background: #FF0000 !important; color: white !important; }      /* 0-60% */
.score-circle.orange { background: #FF0000 !important; color: white !important; }   /* 0-60% */
.score-circle.green { background: #22c55e !important; color: white !important; }    /* 61-89% */
.score-circle.yellow { background: #FFD700 !important; color: black !important; }   /* 90-100% */
.score-circle[data-score="0-60"] { background: #FF0000 !important; color: white !important; }
.score-circle[data-score="61-89"] { background: #22c55e !important; color: white !important; }
.score-circle[data-score="90-100"] { background: #FFD700 !important; color: black !important; }
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
.score-display { display: flex; flex-direction: column; align-items: flex-start; gap: 15px; margin-bottom: 20px; }

/* Score Tile - rechteckige Kachel für Executive Summary */
.score-tile { 
  min-width: 120px !important; 
  max-width: 160px !important;
  width: 140px !important;
  height: 80px !important;
  max-height: 80px !important;
  border-radius: 12px; 
  display: flex !important; 
  align-items: center !important; 
  justify-content: center !important; 
  font-weight: bold; 
  flex-shrink: 0 !important;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  border: 2px solid rgba(255,255,255,0.1);
  text-align: center !important;
  line-height: 1.1 !important;
  padding: 4px !important;
  word-wrap: break-word;
  hyphens: auto;
  box-sizing: border-box !important;
}

/* Überschreibe neutral tiles mit kleiner Schrift */
.score-big span.score-tile.neutral {
  font-size: 6px !important;
}

span[style*="font-size: 6px"] {
  font-size: 6px !important;
}

/* Spezielle Pricing Text Tile */
.score-tile.pricing-text { 
  font-size: 0.55em; 
  line-height: 1.0;
  padding: 8px 6px;
  word-wrap: break-word;
  hyphens: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  font-weight: bold;
}

.score-tile.pricing-text.ausbaufaehig {
  background-color: #ef4444; /* Rot */
}

.score-tile.pricing-text.sehr-wettbewerbsfaehig {
  background-color: #fbbf24; /* Gold */
}

.score-tile.pricing-text.wettbewerbsfaehig {
  background-color: #10b981; /* Grün */
}

.score-tile.pricing-text.marktgerecht {
  background-color: #10b981; /* Grün */
}

.score-tile.pricing-text.ueber-marktdurchschnitt {
  background-color: #ef4444; /* Rot */
}

/* Score-Tile Farben basierend auf einheitlichem Schema */
.score-tile.red { background: #FF0000 !important; color: white !important; }     /* 0-60% */
.score-tile.orange { background: #FF0000 !important; color: white !important; }  /* 0-60% */
.score-tile.dark-red { background: #FF0000 !important; color: white !important; } /* 0-60% */
.score-tile.green { background: #22c55e !important; color: white !important; }   /* 61-80% */
.score-tile.yellow { background: #FFD700 !important; color: black !important; }  /* 81-100% */
.score-details { width: 100%; }
.score-details p { margin-bottom: 8px; color: #e5e7eb; font-size: 0.95em; }
.score-details strong { color: #fbbf24; }

/* Progress-Balken mit einfarbigem Design basierend auf Score-Bereichen */
.progress-container { margin-top: 15px; }
.progress-bar { 
  background: #374151; 
  height: 24px; 
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
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Progress-Fill Farben basierend auf korrekten Wert-Bereichen */
.progress-fill[data-score="0-60"] { background: #FF0000 !important; } /* Rot 0-60% */
.progress-fill[data-score="60-80"] { background: #22c55e !important; } /* Grün 60-80% */
.progress-fill[data-score="80-100"] { background: #FFD700 !important; } /* Gelb 80-100% */
.progress-fill[data-score="61-89"] { background: #22c55e !important; } /* Grün 61-89% (fallback) */
.progress-fill[data-score="90-100"] { background: #FFD700 !important; } /* Gelb 90-100% (fallback) */

/* Progress-Fill CSS-Klassen für bessere Kontrolle */
.progress-red { background: #FF0000 !important; }
.progress-green { background: #22c55e !important; }
.progress-yellow { background: #FFD700 !important; }

/* Score Text Farben */
.score-text.red { color: #FF0000 !important; font-weight: bold; }
.score-text.green { color: #22c55e !important; font-weight: bold; }
.score-text.yellow { color: #FFD700 !important; font-weight: bold; }

/* Header-Klassen für verschiedene Bereiche - NUR für NICHT-.section-header Elemente */
.header-red:not(.section-header):not([class*="section-header"]) { background: #FF0000 !important; color: white !important; }
.header-green:not(.section-header):not([class*="section-header"]) { background: #22c55e !important; color: white !important; }
.header-yellow:not(.section-header):not([class*="section-header"]) { background: #FFD700 !important; color: black !important; }

/* Header score-circle overrides - Kreise in Headern behalten ihre eigene Farbe */
.header-yellow .score-circle.yellow { color: black !important; }
.header-yellow .score-circle.green { color: white !important; }
.header-yellow .score-circle.red { color: white !important; }
.header-yellow .score-circle.orange { color: white !important; }
.header-yellow .score-circle.dark-red { color: white !important; }
.header-green .score-circle.green { color: white !important; }
.header-green .score-circle.yellow { color: black !important; }
.header-green .score-circle.red { color: white !important; }
.header-green .score-circle.orange { color: white !important; }
.header-green .score-circle.dark-red { color: white !important; }
.header-red .score-circle.red { color: white !important; }
.header-red .score-circle.green { color: white !important; }
.header-red .score-circle.yellow { color: black !important; }
.header-red .score-circle.orange { color: white !important; }
.header-red .score-circle.dark-red { color: white !important; }
.header-yellow .header-score-circle.yellow { color: black !important; }
.header-yellow .header-score-circle.green { color: white !important; }
.header-yellow .header-score-circle.red { color: white !important; }
.header-yellow .header-score-circle.orange { color: white !important; }
.header-yellow .header-score-circle.dark-red { color: white !important; }
.header-green .header-score-circle.green { color: white !important; }
.header-green .header-score-circle.yellow { color: black !important; }
.header-green .header-score-circle.red { color: white !important; }
.header-green .header-score-circle.orange { color: white !important; }
.header-green .header-score-circle.dark-red { color: white !important; }
.header-red .header-score-circle.red { color: white !important; }
.header-red .header-score-circle.green { color: white !important; }
.header-red .header-score-circle.yellow { color: black !important; }
.header-red .header-score-circle.orange { color: white !important; }
.header-red .header-score-circle.dark-red { color: white !important; }

/* Spezielle Violations Klassen */
.violation-critical { background: rgba(239, 68, 68, 0.2) !important; }
.violation-serious { background: rgba(245, 158, 11, 0.2) !important; }
.violation-moderate { background: rgba(59, 130, 246, 0.2) !important; }
.violation-minor { background: rgba(107, 114, 128, 0.2) !important; }
/* Status-Badges für Verzeichnisse */
.status-vollständig { background: #FFD700 !important; color: black !important; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.status-unvollständig { background: #FF0000 !important; color: white !important; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
.status-nicht-gefunden { background: #FF0000 !important; color: white !important; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
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
}

.percentage-btn[data-score="0-60"] { background: #FF0000; color: white !important; }
.percentage-btn[data-score="60-80"] { background: #22c55e; color: white !important; }
.percentage-btn[data-score="80-100"] { background: #FFD700; color: black !important; }
.percentage-btn[data-score="61-89"] { background: #22c55e; color: white !important; }
.percentage-btn[data-score="90-100"] { background: #FFD700; color: black !important; }

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
  background: rgba(0, 0, 0, 0.7); 
  padding: 20px; 
  border-radius: 12px; 
  margin-top: 20px; 
  border: 1px solid rgba(251, 191, 36, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
.recommendations h4 { 
  color: #fbbf24; 
  margin-bottom: 15px; 
  font-size: 1.1em; 
  font-weight: 600;
}
.recommendations ul { 
  list-style: none; 
  padding-left: 0; 
  margin: 0;
}
.recommendations li { 
  margin-bottom: 8px; 
  padding-left: 25px; 
  position: relative; 
  color: #f5f5f5;
  line-height: 1.5;
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
  
  /* PRINT: Section-Header MÜSSEN gelb sein UND EINGERÜCKT */
  .section-header,
  .section-header.collapsible,
  div.section-header,
  .section > .section-header,
  .section .section-header,
  div[class="section-header"],
  .section-header[onclick],
  .section-header.header-red,
  .section-header.header-green,
  .section-header.header-yellow {
    background: #fbbf24 !important;
    background-color: #fbbf24 !important;
    color: #000000 !important;
    font-weight: 700 !important;
    font-size: 1.5em !important;
    border-radius: 0 !important;
    display: flex !important;
    align-items: center !important;
    position: relative !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 25px 40px !important;
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
  .progress-fill[data-score="61-89"] { background: #22c55e !important; }
  .progress-fill[data-score="90-100"] { background: #FFD700 !important; }
  
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

.score-badge[data-score="0-60"] {
  background-color: #dc2626 !important;
  color: #ffffff !important;
}

.score-badge[data-score="60-80"] {
  background-color: #16a34a !important;
  color: #ffffff !important;
}

.score-badge[data-score="80-100"] {
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
  
  /* Categorized Scores Styles */
  .categorized-scores {
    max-width: 1200px;
    margin: 0 auto;
  }

  .score-category {
    margin-bottom: 20px;
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
  }

  .category-header {
    padding: 15px 20px;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1));
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    border-bottom: 1px solid rgba(251, 191, 36, 0.2);
    user-select: none;
    width: 95% !important;
    max-width: 1400px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    box-sizing: border-box !important;
  }

  .category-header:hover {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(251, 191, 36, 0.2));
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
  }

  .category-header h3 {
    margin: 0;
    color: #fbbf24;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
  }

  .toggle-icon {
    color: #fbbf24;
    font-size: 1.2em;
    transition: transform 0.3s ease;
    user-select: none;
  }

  .category-header.collapsed .toggle-icon {
    transform: rotate(-90deg);
  }

  .category-content {
    overflow: hidden;
    transition: all 0.3s ease;
    padding: 0;
  }

  .category-content.collapsed {
    display: none !important;
  }

  .category-content .score-overview {
    padding: 20px;
    margin: 0;
    justify-content: center;
  }

  .category-content.collapsed .score-overview {
    display: none !important;
  }
  
  .category-content .score-card {
    width: 200px !important;
    max-width: 200px !important;
    min-width: 200px !important;
    margin: 0 auto !important;
  }

  /* Score Badge Farben für Wettbewerber */
  .score-badge.red { 
    background-color: #dc2626 !important; 
    color: #ffffff !important; 
    font-weight: bold !important; 
  }
  .score-badge.green { 
    background-color: #16a34a !important; 
    color: #ffffff !important; 
    font-weight: bold !important; 
  }
  .score-badge.yellow { 
    background-color: #eab308 !important; 
    color: #000000 !important; 
    font-weight: bold !important; 
  }
  
  /* Neutral styles for missing data display */
  .score-tile.neutral, .score-circle.neutral { 
    background: #e5e7eb !important; 
    color: #6b7280 !important; 
    font-size: 1.5em !important;
    font-weight: normal !important;
  }
  .header-score-circle.neutral {
    background: #e5e7eb !important;
    color: #6b7280 !important;
    font-size: 0.7em !important;
    font-weight: normal !important;
  }

  /* Disclaimer Styles - UNNA Style Design v2.0 */
  .disclaimer {
    background: linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%) !important;
    border: 1px solid rgba(251, 191, 36, 0.4);
    border-radius: 16px;
    padding: 0;
    margin: 60px 0 30px 0;
    font-size: 14px;
    line-height: 1.6;
    color: #d1d5db;
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    overflow: hidden;
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .disclaimer h4 {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
    color: #000000;
    margin: 0;
    padding: 25px 30px;
    font-size: 1.5em;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: none;
  }
  
  .disclaimer-content {
    padding: 30px;
  }
  
  .disclaimer p {
    margin: 18px 0;
    text-align: left;
    line-height: 1.8;
    color: #d1d5db;
    font-size: 0.95em;
  }
  
  .disclaimer strong {
    color: #fbbf24;
    font-weight: 600;
  }
  
  .disclaimer .disclaimer-date {
    text-align: right;
    font-size: 12px;
    color: #9ca3af;
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid rgba(251, 191, 36, 0.2);
    font-style: italic;
  }
}
`;
};