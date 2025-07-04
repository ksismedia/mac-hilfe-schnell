export const getHTMLStyles = () => `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { 
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
  line-height: 1.6; 
  color: #f5f5f5; 
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  min-height: 100vh;
}
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { 
  text-align: center; 
  margin-bottom: 40px; 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  padding: 40px 30px; 
  border-radius: 20px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  border: 1px solid rgba(220, 38, 38, 0.3);
}
.header h1 { 
  color: #dc2626; 
  font-size: 2.8em; 
  margin-bottom: 15px; 
  background: linear-gradient(135deg, #dc2626, #b91c1c);
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
  filter: drop-shadow(0 4px 8px rgba(220, 38, 38, 0.3)); 
}
.score-overview { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: 25px; 
  margin-bottom: 40px; 
}
.score-card { 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  padding: 30px 25px; 
  border-radius: 16px; 
  box-shadow: 0 8px 25px rgba(0,0,0,0.3); 
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(220, 38, 38, 0.3);
}
.score-card:hover { transform: translateY(-5px); }
.score-big { 
  font-size: 3.5em; 
  font-weight: bold; 
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}
.score-label { color: #d1d5db; font-weight: 600; font-size: 1.1em; }
.section { 
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
  margin-bottom: 30px; 
  border-radius: 16px; 
  box-shadow: 0 8px 25px rgba(0,0,0,0.3); 
  overflow: hidden;
  border: 1px solid rgba(220, 38, 38, 0.3);
}
.section-header { 
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: #ffffff; 
  padding: 25px 30px; 
  font-size: 1.5em; 
  font-weight: 700;
}
.section-content { padding: 30px; }
.metric-card { 
  background: rgba(17, 24, 39, 0.6); 
  padding: 25px; 
  border-radius: 12px; 
  border-left: 5px solid #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  margin-bottom: 20px;
}
.metric-card h3 { color: #dc2626; margin-bottom: 15px; font-size: 1.2em; }
.score-display { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
.score-circle { 
  width: 80px; 
  height: 80px; 
  border-radius: 50%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.2em; 
  font-weight: bold; 
  flex-shrink: 0;
}
.score-circle.green { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; }
.score-circle.yellow { background: linear-gradient(135deg, #eab308, #ca8a04); color: white; }
.score-circle.orange { background: linear-gradient(135deg, #f97316, #ea580c); color: white; }
.score-circle.red { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
.score-details { flex: 1; }
.score-details p { margin-bottom: 8px; color: #d1d5db; }
.score-details strong { color: #dc2626; }

/* Progress-Balken mit vereinfachtem Farbschema */
.progress-container { margin-top: 15px; }
.progress-bar { 
  background: #374151; 
  height: 12px; 
  border-radius: 6px; 
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
  position: relative;
}
.progress-fill { 
  height: 100%; 
  border-radius: 6px; 
  transition: width 0.8s ease;
  position: relative;
  overflow: hidden;
  /* Vereinfachtes Farbschema: */
  /* 0-50% = Rot */
  /* 50-80% = Rot nach Grün Verlauf */
  /* 80-100% = Grün nach Hellgelb Verlauf */
  background: linear-gradient(90deg, 
    #dc2626 0%,     /* Rot (0%) */
    #dc2626 50%,    /* Rot bis 50% */
    #dc2626 50%,    /* Übergang bei 50% */
    #22c55e 80%,    /* Grün bei 80% */
    #22c55e 80%,    /* Grün ab 80% */
    #fbbf24 100%    /* Hellgelb bei 100% */
  );
}

/* Spezifische Progress-Fill Farben basierend auf Wert */
.progress-fill[style*="width: 0%"],
.progress-fill[style*="width: 1%"],
.progress-fill[style*="width: 2%"],
.progress-fill[style*="width: 3%"],
.progress-fill[style*="width: 4%"] { background: #dc2626; }

.progress-fill[style*="width: 5%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 10%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 15%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 20%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 25%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 30%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 35%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 40%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 45%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }
.progress-fill[style*="width: 50%"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 100%); }

.progress-fill[style*="width: 55%"] { background: linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f97316 100%); }
.progress-fill[style*="width: 60%"] { background: linear-gradient(90deg, #dc2626 0%, #ef4444 33%, #f97316 66%, #eab308 100%); }
.progress-fill[style*="width: 65%"] { background: linear-gradient(90deg, #dc2626 0%, #f97316 33%, #eab308 66%, #84cc16 100%); }
.progress-fill[style*="width: 70%"] { background: linear-gradient(90deg, #dc2626 0%, #f97316 25%, #eab308 50%, #84cc16 75%, #22c55e 100%); }
.progress-fill[style*="width: 75%"] { background: linear-gradient(90deg, #dc2626 0%, #eab308 33%, #84cc16 66%, #22c55e 100%); }
.progress-fill[style*="width: 80%"] { background: linear-gradient(90deg, #dc2626 0%, #84cc16 50%, #22c55e 100%); }

.progress-fill[style*="width: 85%"] { background: linear-gradient(90deg, #dc2626 0%, #84cc16 40%, #22c55e 80%, #10b981 90%, #fbbf24 100%); }
.progress-fill[style*="width: 90%"] { background: linear-gradient(90deg, #dc2626 0%, #22c55e 70%, #10b981 85%, #fbbf24 100%); }
.progress-fill[style*="width: 95%"] { background: linear-gradient(90deg, #dc2626 0%, #22c55e 60%, #10b981 80%, #fbbf24 100%); }
.progress-fill[style*="width: 100%"] { background: linear-gradient(90deg, #dc2626 0%, #22c55e 50%, #10b981 75%, #fbbf24 100%); }

.company-info { 
  background: rgba(17, 24, 39, 0.6); 
  padding: 25px; 
  border-radius: 12px; 
  border-left: 5px solid #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
  margin-bottom: 20px;
}
.company-info h3 { color: #dc2626; margin-bottom: 15px; font-size: 1.3em; }
.company-info p { margin-bottom: 8px; color: #d1d5db; }
.company-info strong { color: #dc2626; }

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
  border: 1px solid rgba(220, 38, 38, 0.2);
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
.platform-details h4 { color: #dc2626; margin-bottom: 10px; }
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
  border: 1px solid rgba(220, 38, 38, 0.2);
}
.competitor-rank { 
  font-size: 1.2em; 
  font-weight: bold; 
  color: #dc2626; 
  margin-bottom: 8px; 
}

.recommendations { 
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.1)); 
  padding: 20px; 
  border-radius: 12px; 
  margin-top: 20px; 
  border-left: 5px solid #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.3);
}
.recommendations h4 { color: #dc2626; margin-bottom: 15px; font-size: 1.1em; }
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
  color: #dc2626; 
  font-weight: bold;
}

@media print {
  body { background: #1a1a1a; color: #f5f5f5; }
  .container { max-width: none; }
  .section { box-shadow: none; border: 1px solid rgba(220, 38, 38, 0.5); }
  .score-card { box-shadow: none; border: 1px solid rgba(220, 38, 38, 0.5); }
}
`;