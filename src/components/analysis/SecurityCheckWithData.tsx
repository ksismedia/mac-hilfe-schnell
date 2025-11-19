import { useEffect } from 'react';
import { SecurityCheck } from './SecurityCheck';
import { SafeBrowsingService, SafeBrowsingResult } from '@/services/SafeBrowsingService';

interface SecurityCheckWithDataProps {
  url: string;
  securityData?: SafeBrowsingResult | null;
  onSecurityDataChange?: (data: SafeBrowsingResult) => void;
}

export const SecurityCheckWithData = ({ 
  url, 
  securityData, 
  onSecurityDataChange 
}: SecurityCheckWithDataProps) => {
  
  useEffect(() => {
    // Auto-load security data on mount if not already loaded
    const loadSecurityData = async () => {
      if (!securityData && url && onSecurityDataChange) {
        const result = await SafeBrowsingService.checkUrl(url);
        onSecurityDataChange(result);
      }
    };
    
    loadSecurityData();
  }, [url]);

  const handleSecurityCheck = async () => {
    if (onSecurityDataChange) {
      const result = await SafeBrowsingService.checkUrl(url);
      onSecurityDataChange(result);
    }
  };

  return <SecurityCheck url={url} onDataLoaded={handleSecurityCheck} />;
};
