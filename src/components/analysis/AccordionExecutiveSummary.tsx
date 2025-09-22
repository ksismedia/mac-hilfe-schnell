import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore, calculateHourlyRateScore } from './export/scoreCalculations';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';
import { Search, Zap, Share2, Users, Building2, HeartHandshake } from 'lucide-react';

interface AccordionExecutiveSummaryProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
  manualSocialData?: ManualSocialData | null;
  keywordsScore?: number | null;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  hourlyRateData?: HourlyRateData | null;
  manualWorkplaceData?: any;
  competitorScore?: number | null;
  privacyData?: any;
  accessibilityData?: any;
  manualCorporateIdentityData?: any;
}

const AccordionExecutiveSummary: React.FC<AccordionExecutiveSummaryProps> = ({
  businessData,
  realData,
  manualSocialData,
  keywordsScore,
  staffQualificationData,
  quoteResponseData,
  hourlyRateData,
  manualWorkplaceData,
  competitorScore,
  privacyData = null,
  accessibilityData = null,
  manualCorporateIdentityData = null
}) => {
  console.log('🔥 AccordionExecutiveSummary RENDERED!', { businessData: businessData?.url, realDataExists: !!realData });
  
  return (
    <div className="w-full">
      <div className="text-center mb-6 p-6 bg-gray-800 rounded-lg border border-yellow-400/30">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">🔥 TEST: Executive Summary</h2>
        <div className="text-white">
          URL: {businessData?.url || 'N/A'} | 
          RealData: {realData ? '✅' : '❌'} |
          Test erfolgreich!
        </div>
      </div>
    </div>
  );
};

export default AccordionExecutiveSummary;