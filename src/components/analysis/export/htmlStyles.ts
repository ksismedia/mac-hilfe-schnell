
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
  border: 1px solid rgba(251, 191, 36, 0.3);
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
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.score-card:hover { transform: translateY(-5px); }
.score-big { 
  font-size: 3.5em; 
  font-weight: bold; 
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
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
  border: 1px solid rgba(251, 191, 36, 0.3);
}
.section-header { 
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #000000; 
  padding: 25px 30px; 
  font-size: 1.5em; 
  font-weight: 700;
}
.section-content { padding: 30px; }
.metric-card { 
  background: rgba(17, 24, 39, 0.6); 
  padding: 25px; 
  border-radius: 12px; 
  border-left: 5px solid #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.2);
  margin-bottom: 20px;
}
.metric-card h3 { color: #fbbf24; margin-bottom: 15px; font-size: 1.2em; }
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
.score-details strong { color: #fbbf24; }
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
@media print {
  body { background: #1a1a1a; color: #f5f5f5; }
  .container { max-width: none; }
  .section { box-shadow: none; border: 1px solid rgba(251, 191, 36, 0.5); }
  .score-card { box-shadow: none; border: 1px solid rgba(251, 191, 36, 0.5); }
}
`;
