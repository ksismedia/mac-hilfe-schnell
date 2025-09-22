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
  console.log('🔥 AnalysisDashboard: Weiterleitung zu SimpleAnalysisDashboard');
  // Weiterleitung zur neuen stabilen Version
  return <SimpleAnalysisDashboard {...props} />;
};

export default AnalysisDashboard;
