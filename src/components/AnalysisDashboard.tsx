import React from 'react';
import SimpleAnalysisDashboard from './SimpleAnalysisDashboard';
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';

// Legacy Dashboard - jetzt nur noch Weiterleitung zur neuen stabilen Version
interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
}

interface AnalysisDashboardProps {
  businessData: BusinessData;
  onReset: () => void;
  onBusinessDataChange?: (data: BusinessData) => void;
  analysisData?: SavedAnalysis | null;  // Direct analysis data
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = (props) => {
  console.log('🔴 AnalysisDashboard geladen mit props:', props);
  // Weiterleitung zur neuen stabilen Version
  return (
    <div style={{ border: '5px solid blue', padding: '10px', margin: '10px' }}>
      <h1 style={{ color: 'blue', fontSize: '24px' }}>🔵 ANALYSIS DASHBOARD WRAPPER 🔵</h1>
      <SimpleAnalysisDashboard {...props} />
    </div>
  );
};

export default AnalysisDashboard;
