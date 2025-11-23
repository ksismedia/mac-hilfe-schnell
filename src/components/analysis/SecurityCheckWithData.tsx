import { SafeBrowsingResult } from '@/services/SafeBrowsingService';
import { SecurityCheck } from './SecurityCheck';

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

  const handleSecurityCheck = (result: SafeBrowsingResult) => {
    if (onSecurityDataChange) {
      onSecurityDataChange(result);
    }
  };

  return (
    <SecurityCheck 
      url={url} 
      onDataLoaded={handleSecurityCheck}
      existingData={securityData}
    />
  );
};
