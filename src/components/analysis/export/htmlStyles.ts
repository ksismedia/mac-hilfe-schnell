
export const getHTMLStyles = () => `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white; 
            padding: 40px 30px; 
            border-radius: 20px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        }
        .header h1 { 
            color: #4a5568; 
            font-size: 2.8em; 
            margin-bottom: 15px; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .header .subtitle { color: #718096; font-size: 1.3em; font-weight: 300; }
        .score-overview { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 25px; 
            margin-bottom: 40px; 
        }
        .score-card { 
            background: white; 
            padding: 30px 25px; 
            border-radius: 16px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
            text-align: center;
            transition: transform 0.3s ease;
        }
        .score-card:hover { transform: translateY(-5px); }
        .score-big { 
            font-size: 3.5em; 
            font-weight: bold; 
            background: linear-gradient(135deg, #48bb78, #38a169);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .score-label { color: #4a5568; font-weight: 600; font-size: 1.1em; }
        .section { 
            background: white; 
            margin-bottom: 30px; 
            border-radius: 16px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
            overflow: hidden;
        }
        .section-header { 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; 
            padding: 25px 30px; 
            font-size: 1.5em; 
            font-weight: 600;
        }
        .section-content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
        .metric-item { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 5px solid #667eea;
        }
        .metric-title { font-weight: 600; color: #4a5568; margin-bottom: 12px; font-size: 1.1em; }
        .metric-value { font-size: 1.3em; color: #2d3748; font-weight: bold; margin-bottom: 15px; }
        .progress-container { margin-top: 15px; }
        .progress-label { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            font-size: 0.9em; 
            color: #718096; 
        }
        .progress-bar { 
            background: #e2e8f0; 
            height: 12px; 
            border-radius: 6px; 
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-fill { 
            height: 100%; 
            border-radius: 6px; 
            transition: width 0.8s ease;
            background: linear-gradient(90deg, #48bb78, #38a169);
        }
        .progress-fill.warning { background: linear-gradient(90deg, #ed8936, #dd6b20); }
        .progress-fill.danger { background: linear-gradient(90deg, #f56565, #e53e3e); }
        .excellent { color: #38a169; font-weight: bold; }
        .good { color: #3182ce; font-weight: bold; }
        .warning { color: #d69e2e; font-weight: bold; }
        .danger { color: #e53e3e; font-weight: bold; }
        .competitor-item { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 15px;
            border-left: 4px solid #cbd5e0;
        }
        .competitor-rank { 
            font-size: 1.2em; 
            font-weight: bold; 
            color: #4a5568; 
            margin-bottom: 8px; 
        }
        .recommendations { 
            background: linear-gradient(135deg, #fef5e7, #fed7aa); 
            padding: 25px; 
            border-radius: 12px; 
            margin-top: 25px; 
            border-left: 5px solid #f6ad55;
        }
        .recommendations h4 { color: #744210; margin-bottom: 15px; font-size: 1.2em; }
        .recommendations ul { list-style: none; }
        .recommendations li { 
            margin-bottom: 10px; 
            padding-left: 25px; 
            position: relative; 
            color: #744210;
        }
        .recommendations li:before { 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #d69e2e; 
            font-weight: bold; 
            font-size: 1.2em;
        }
        .highlight-box { 
            background: linear-gradient(135deg, #e6fffa, #b2f5ea); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0;
            border-left: 5px solid #38b2ac;
        }
        .chart-container { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            margin: 15px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .status-item {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
        
        @media print {
            body { background: white; }
            .container { max-width: none; }
            .section { box-shadow: none; border: 1px solid #e2e8f0; }
            .score-card { box-shadow: none; border: 1px solid #e2e8f0; }
        }
`;
