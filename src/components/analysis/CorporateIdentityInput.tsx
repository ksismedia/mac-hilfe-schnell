import { CorporateIdentityAnalysis } from './CorporateIdentityAnalysis';
import { ManualCorporateIdentityData } from '@/hooks/useManualData';

interface CorporateIdentityInputProps {
  businessData: {
    companyName: string;
    url: string;
  };
  manualCorporateIdentityData: ManualCorporateIdentityData | null;
  onUpdate: (data: ManualCorporateIdentityData | null) => void;
}

export function CorporateIdentityInput({ 
  businessData, 
  manualCorporateIdentityData, 
  onUpdate 
}: CorporateIdentityInputProps) {
  return (
    <CorporateIdentityAnalysis
      businessData={businessData}
      manualData={manualCorporateIdentityData}
      onUpdate={onUpdate}
    />
  );
}