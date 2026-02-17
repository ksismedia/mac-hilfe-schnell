import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SocialMediaAnalysis from '../SocialMediaAnalysis';
import SocialMediaSimple from '../SocialMediaSimple';
import SocialProof from '../SocialProof';
import GoogleReviews from '../GoogleReviews';
import WorkplaceReviews from '../WorkplaceReviews';
import ReputationMonitoring from '../ReputationMonitoring';
import { ManualIndustryReviewInput } from '../ManualIndustryReviewInput';
import ManualOnlinePresenceInput from '../ManualOnlinePresenceInput';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualWorkplaceData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualReputationData } from '@/hooks/useManualData';

interface SocialMediaCategoryProps {
  realData: RealBusinessData;
  businessData: any;
  manualSocialData: ManualSocialData | null;
  updateSocialData: (data: ManualSocialData | null) => void;
  manualWorkplaceData: ManualWorkplaceData | null;
  updateWorkplaceData: (data: ManualWorkplaceData | null) => void;
  manualIndustryReviewData: ManualIndustryReviewData | null;
  updateIndustryReviewData: (data: ManualIndustryReviewData | null) => void;
  manualOnlinePresenceData: ManualOnlinePresenceData | null;
  updateOnlinePresenceData: (data: ManualOnlinePresenceData | null) => void;
  manualReputationData?: ManualReputationData | null;
  updateReputationData?: (data: ManualReputationData | null) => void;
  onReviewsUpdate?: (reviews: { rating: number; count: number; recent: any[] }) => void;
}

const SocialMediaCategory: React.FC<SocialMediaCategoryProps> = ({
  realData,
  businessData,
  manualSocialData,
  updateSocialData,
  manualWorkplaceData,
  updateWorkplaceData,
  manualIndustryReviewData,
  updateIndustryReviewData,
  manualOnlinePresenceData,
  updateOnlinePresenceData,
  manualReputationData,
  updateReputationData,
  onReviewsUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 border-b border-white pb-2 inline-block">Social Media & Online-Präsenz</h2>
        <p className="text-gray-300 mt-4">Social Media Kanäle, Bewertungen und Online-Reputation</p>
      </div>
      
      <Tabs defaultValue="social-simple" className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-8 mb-6">
          <TabsTrigger value="social-simple">Social Media</TabsTrigger>
          <TabsTrigger value="reputation">Reputation</TabsTrigger>
          <TabsTrigger value="social-proof">Social Proof</TabsTrigger>
          <TabsTrigger value="reviews">Google Reviews</TabsTrigger>
          <TabsTrigger value="workplace">Arbeitsplatz</TabsTrigger>
          <TabsTrigger value="industry-reviews">Branchenplattformen</TabsTrigger>
          <TabsTrigger value="online-presence">Online-Präsenz</TabsTrigger>
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

        <TabsContent value="reputation">
          <ReputationMonitoring 
            companyName={realData?.company?.name || businessData.address}
            url={businessData.url}
            industry={businessData.industry}
            manualReputationData={manualReputationData}
            updateReputationData={updateReputationData}
          />
        </TabsContent>

        <TabsContent value="social-proof">
          <SocialProof realData={realData} businessData={businessData} onSocialProofUpdate={(data) => {
            // Social Proof Daten werden lokal im Component verwaltet
            console.log('Social Proof aktualisiert:', data);
          }} />
        </TabsContent>

        <TabsContent value="reviews">
          <GoogleReviews 
            realData={realData} 
            address={businessData.address} 
            onReviewsUpdate={onReviewsUpdate}
          />
        </TabsContent>

        <TabsContent value="workplace">
          <WorkplaceReviews 
            businessData={businessData}
            realData={realData}
            manualData={manualWorkplaceData}
            onManualDataChange={updateWorkplaceData}
          />
        </TabsContent>

        <TabsContent value="industry-reviews">
          <ManualIndustryReviewInput 
            onUpdate={updateIndustryReviewData}
            initialData={manualIndustryReviewData || undefined}
          />
        </TabsContent>

        <TabsContent value="online-presence">
          <ManualOnlinePresenceInput 
            onUpdate={updateOnlinePresenceData}
            initialData={manualOnlinePresenceData || undefined}
          />
        </TabsContent>

        <TabsContent value="social-analysis">
          <SocialMediaAnalysis 
            realData={realData} 
            businessData={businessData}
            manualData={manualSocialData}
            onManualDataChange={updateSocialData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialMediaCategory;