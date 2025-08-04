import React from 'react';
import SimpleAnalysisDashboard from './SimpleAnalysisDashboard';

// Legacy Dashboard - jetzt nur noch Weiterleitung zur neuen stabilen Version
interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface AnalysisDashboardProps {
  businessData: BusinessData;
  onReset: () => void;
  onBusinessDataChange?: (data: BusinessData) => void;
  loadedAnalysisId?: string;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = (props) => {
  // Weiterleitung zur neuen stabilen Version
  return <SimpleAnalysisDashboard {...props} />;
};

export default AnalysisDashboard;
