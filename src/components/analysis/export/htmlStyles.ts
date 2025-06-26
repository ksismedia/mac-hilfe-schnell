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
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
        .metric-item { 
            background: rgba(17, 24, 39, 0.6); 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 5px solid #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .metric-title { font-weight: 600; color: #d1d5db; margin-bottom: 12px; font-size: 1.1em; }
        .metric-value { font-size: 1.3em; color: #fbbf24; font-weight: bold; margin-bottom: 15px; }
        .progress-container { margin-top: 15px; }
        .progress-label { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            font-size: 0.9em; 
            color: #9ca3af; 
        }
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
        }
        
        /* Dynamisches Progress-Gradient basierend auf Wert */
        .progress-fill[data-value="0"] { background: #dc2626; }
        .progress-fill[data-value="10"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 90%, #f59e0b 100%); }
        .progress-fill[data-value="20"] { background: linear-gradient(90deg, #dc2626 0%, #dc2626 80%, #f59e0b 100%); }
        .progress-fill[data-value="30"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 100%); }
        .progress-fill[data-value="40"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 70%, #eab308 100%); }
        .progress-fill[data-value="50"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #eab308 100%); }
        .progress-fill[data-value="60"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 40%, #eab308 80%, #fbbf24 100%); }
        .progress-fill[data-value="70"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 30%, #eab308 70%, #fbbf24 100%); }
        .progress-fill[data-value="80"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 25%, #eab308 50%, #fbbf24 100%); }
        .progress-fill[data-value="90"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 20%, #eab308 40%, #fbbf24 100%); }
        .progress-fill[data-value="100"] { background: linear-gradient(90deg, #dc2626 0%, #f59e0b 25%, #eab308 50%, #fbbf24 100%); }

        /* Fallback für Zwischenwerte */
        .progress-fill:not([data-value]) { 
            background: linear-gradient(90deg, #dc2626 0%, #f59e0b 25%, #eab308 50%, #fbbf24 100%);
        }

        .excellent { color: #fbbf24; font-weight: bold; }
        .good { color: #60a5fa; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
        .danger { color: #ef4444; font-weight: bold; }
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
            padding: 25px; 
            border-radius: 12px; 
            margin-top: 25px; 
            border-left: 5px solid #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .recommendations h4 { color: #fbbf24; margin-bottom: 15px; font-size: 1.2em; font-weight: 600; }
        .recommendations ul { list-style: none; }
        .recommendations li { 
            margin-bottom: 10px; 
            padding-left: 25px; 
            position: relative; 
            color: #d1d5db;
        }
        .recommendations li:before { 
            content: "⭐"; 
            position: absolute; 
            left: 0; 
            color: #fbbf24; 
            font-weight: bold; 
            font-size: 1.2em;
        }
        .highlight-box { 
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1)); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0;
            border-left: 5px solid #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .chart-container { 
            background: rgba(17, 24, 39, 0.6); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 15px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .status-item {
            background: rgba(17, 24, 39, 0.6);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #fbbf24;
            border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .company-info { 
            background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); 
            padding: 25px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .company-info h2 { color: #fbbf24; margin-bottom: 15px; }
        .company-info p { color: #d1d5db; margin-bottom: 8px; }
        .company-info strong { color: #fbbf24; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .swot-section { padding: 15px; border-radius: 8px; }
        .strengths { 
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.1)); 
            border-left: 4px solid #22c55e; 
            border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .weaknesses { 
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(185, 28, 28, 0.1)); 
            border-left: 4px solid #ef4444; 
            border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .opportunities { 
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(29, 78, 216, 0.1)); 
            border-left: 4px solid #3b82f6; 
            border: 1px solid rgba(59, 130, 246, 0.3);
        }
        .threats { 
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1)); 
            border-left: 4px solid #fbbf24; 
            border: 1px solid rgba(251, 191, 36, 0.3);
        }
        .swot-section h4 { margin-bottom: 10px; font-weight: 600; }
        .strengths h4 { color: #22c55e; }
        .weaknesses h4 { color: #ef4444; }
        .opportunities h4 { color: #3b82f6; }
        .threats h4 { color: #fbbf24; }
        .swot-section ul { list-style-type: disc; padding-left: 20px; color: #d1d5db; }
        .keyword-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
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
        .found { background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.5); }
        .not-found { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5); }
        .competitor-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .competitor-card { 
            background: rgba(17, 24, 39, 0.6); 
            padding: 15px; 
            border-radius: 8px; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.2); 
            border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .competitor-strong { border-left: 4px solid #ef4444; }
        .competitor-weak { border-left: 4px solid #22c55e; }
        .competitor-card h4 { color: #fbbf24; margin-bottom: 10px; }
        .competitor-card p { color: #d1d5db; margin-bottom: 5px; }
        .competitor-card strong { color: #fbbf24; }
        .services-list { margin-top: 10px; }
        .badge-success { background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
        .badge-warning { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
        .badge-error { background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
        .badge-service { background: #fbbf24; color: #000000; padding: 2px 8px; border-radius: 12px; font-size: 0.75em; margin: 2px; display: inline-block; font-weight: 600; }
        
        @media print {
            body { background: #1a1a1a; color: #f5f5f5; }
            .container { max-width: none; }
            .section { box-shadow: none; border: 1px solid rgba(251, 191, 36, 0.5); }
            .score-card { box-shadow: none; border: 1px solid rgba(251, 191, 36, 0.5); }
        }
`;
