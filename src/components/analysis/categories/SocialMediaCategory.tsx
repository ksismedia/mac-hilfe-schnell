import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SocialMediaAnalysis from '../SocialMediaAnalysis';
import SocialMediaSimple from '../SocialMediaSimple';
import SocialProof from '../SocialProof';
import GoogleReviews from '../GoogleReviews';
import WorkplaceReviews from '../WorkplaceReviews';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualWorkplaceData } from '@/hooks/useManualData';

interface SocialMediaCategoryProps {
  realData: RealBusinessData;
  businessData: any;
  manualSocialData: ManualSocialData | null;
  updateSocialData: (data: ManualSocialData | null) => void;
  manualWorkplaceData: ManualWorkplaceData | null;
  updateWorkplaceData: (data: ManualWorkplaceData | null) => void;
}

const SocialMediaCategory: React.FC<SocialMediaCategoryProps> = ({
  realData,
  businessData,
  manualSocialData,
  updateSocialData,
  manualWorkplaceData,
  updateWorkplaceData,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Social Media & Online-Präsenz</h2>
        <p className="text-gray-300">Social Media Kanäle, Bewertungen und Online-Reputation</p>
      </div>
      
      <Tabs defaultValue="social-simple" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 mb-6">
          <TabsTrigger value="social-simple">Social Media</TabsTrigger>
          <TabsTrigger value="social-proof">Social Proof</TabsTrigger>
          <TabsTrigger value="reviews">Google Reviews</TabsTrigger>
          <TabsTrigger value="workplace">Arbeitsplatz</TabsTrigger>
          <TabsTrigger value="social-analysis">Detailanalyse</TabsTrigger>
        </TabsList>

        <TabsContent value="social-simple">
          <SocialMediaSimple 
            businessData={businessData}
            realData={realData}
            manualData={manualSocialData}
            onManualDataChange={updateSocialData}
          />
        </TabsContent>

        <TabsContent value="social-proof">
          <SocialProof realData={realData} businessData={businessData} />
        </TabsContent>

        <TabsContent value="reviews">
          <GoogleReviews realData={realData} address={businessData.address} />
        </TabsContent>

        <TabsContent value="workplace">
          <WorkplaceReviews 
            businessData={businessData}
            realData={realData}
            manualData={manualWorkplaceData}
            onManualDataChange={updateWorkplaceData}
          />
        </TabsContent>

        <TabsContent value="social-analysis">
          <SocialMediaAnalysis realData={realData} businessData={businessData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaCategory;