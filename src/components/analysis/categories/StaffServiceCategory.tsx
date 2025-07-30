import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StaffQualificationInput } from '../StaffQualificationInput';
import HourlyRateTab from '../HourlyRateTab';
import QuoteResponseInput from '../QuoteResponseInput';
import { CorporateIdentityAnalysis } from '../CorporateIdentityAnalysis';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { StaffQualificationData, ManualCorporateIdentityData, QuoteResponseData } from '@/hooks/useManualData';

interface StaffServiceCategoryProps {
  businessData: any;
  realData: RealBusinessData;
  staffQualificationData: StaffQualificationData | null;
  updateStaffQualificationData: (data: StaffQualificationData | null) => void;
  manualCorporateIdentityData: ManualCorporateIdentityData | null;
  updateCorporateIdentityData: (data: ManualCorporateIdentityData | null) => void;
  quoteResponseData: QuoteResponseData | null;
  updateQuoteResponseData: (data: QuoteResponseData | null) => void;
}

const StaffServiceCategory: React.FC<StaffServiceCategoryProps> = ({
  businessData,
  realData,
  staffQualificationData,
  updateStaffQualificationData,
  manualCorporateIdentityData,
  updateCorporateIdentityData,
  quoteResponseData,
  updateQuoteResponseData,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Personal & Kundenservice</h2>
        <p className="text-gray-300">Mitarbeiterqualifikationen, Unternehmensidentität und Kundenbetreuung</p>
      </div>
      
      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
          <TabsTrigger value="staff">Personal</TabsTrigger>
          <TabsTrigger value="hourly-rate">Stundensatz</TabsTrigger>
          <TabsTrigger value="corporate">Unternehmens-ID</TabsTrigger>
          <TabsTrigger value="service">Kundenservice</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <StaffQualificationInput 
            businessData={businessData}
            data={staffQualificationData}
            onUpdate={updateStaffQualificationData}
          />
        </TabsContent>

        <TabsContent value="hourly-rate">
          <HourlyRateTab />
        </TabsContent>

        <TabsContent value="corporate">
          <CorporateIdentityAnalysis 
            businessData={{
              companyName: realData.company.name,
              url: businessData.url
            }}
            manualData={manualCorporateIdentityData}
            onUpdate={updateCorporateIdentityData}
          />
        </TabsContent>

        <TabsContent value="service">
          <QuoteResponseInput 
            data={quoteResponseData}
            onDataChange={updateQuoteResponseData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffServiceCategory;