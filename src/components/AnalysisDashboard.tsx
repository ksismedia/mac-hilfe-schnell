import React from 'react';
import SidebarAnalysisDashboard from './SidebarAnalysisDashboard';

// Legacy Dashboard - jetzt nur noch Weiterleitung zur neuen Sidebar-Version
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
  // Weiterleitung zur neuen Sidebar-Version
  return <SidebarAnalysisDashboard {...props} />;
};

export default AnalysisDashboard;
