import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StaffQualificationInput } from '../StaffQualificationInput';
import HourlyRateTab from '../HourlyRateTab';
import QuoteResponseInput from '../QuoteResponseInput';
import { CorporateIdentityAnalysis } from '../CorporateIdentityAnalysis';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { StaffQualificationData, ManualCorporateIdentityData, QuoteResponseData, HourlyRateData, ManualCompetitor } from '@/hooks/useManualData';

interface StaffServiceCategoryProps {
  businessData: any;
  realData: RealBusinessData;
  staffQualificationData: StaffQualificationData | null;
  updateStaffQualificationData: (data: StaffQualificationData | null) => void;
  manualCorporateIdentityData: ManualCorporateIdentityData | null;
  updateCorporateIdentityData: (data: ManualCorporateIdentityData | null) => void;
  quoteResponseData: QuoteResponseData | null;
  updateQuoteResponseData: (data: QuoteResponseData | null) => void;
  hourlyRateData: HourlyRateData | null;
  updateHourlyRateData: (data: HourlyRateData | null) => void;
  manualCompetitors?: ManualCompetitor[];
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
  hourlyRateData,
  updateHourlyRateData,
  manualCompetitors = [],
}) => {
  // Berechne Wettbewerber-Durchschnitt
  const calculateCompetitorAnalysis = () => {
    const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
    const ownScore = (window as any).globalOwnCompanyScore || 75;
    
    if (allCompetitors.length === 0) {
      return null;
    }
    
    const avgCompetitorScore = allCompetitors.reduce((acc: number, comp: any) => {
      const rating = typeof comp.rating === 'number' && !isNaN(comp.rating) ? comp.rating : 0;
      const reviews = typeof comp.reviews === 'number' && !isNaN(comp.reviews) ? comp.reviews : 0;
      
      const ratingScore = rating >= 4.5 
        ? 80 + ((rating - 4.5) / 0.5) * 15
        : rating >= 3.5 
          ? 60 + ((rating - 3.5) * 20)
          : rating >= 2.5 
            ? 40 + ((rating - 2.5) * 20)
            : rating * 16;
      
      const positiveReviewsRatio = rating > 0 ? Math.min((rating - 1) / 4, 1) : 0;
      const estimatedPositiveReviews = Math.round(reviews * positiveReviewsRatio);
      
      const reviewScore = reviews <= 25 
        ? Math.min(50 + estimatedPositiveReviews * 1.6, 90)
        : Math.min(95, 90 + Math.log10(estimatedPositiveReviews / 25) * 5);
      
      const compServices = Array.isArray(comp.services) ? comp.services : [];
      const serviceCount = compServices.length;
      let serviceScore;
      if (serviceCount === 0) {
        serviceScore = 15;
      } else if (serviceCount <= 3) {
        serviceScore = 30 + (serviceCount * 15);
      } else if (serviceCount <= 8) {
        serviceScore = 75 + ((serviceCount - 3) * 2);
      } else if (serviceCount <= 15) {
        serviceScore = 85 + ((serviceCount - 8) * 0.7);
      } else {
        serviceScore = Math.min(90 + ((serviceCount - 15) * 0.3), 93);
      }
      
      const ratingWeight = Math.min(0.40 + (serviceCount * 0.020), 0.65);
      const serviceWeight = Math.max(0.30 - (serviceCount * 0.015), 0.15);
      const reviewWeight = 1 - ratingWeight - serviceWeight;
      
      const totalScore = Math.min((ratingScore * ratingWeight) + (reviewScore * reviewWeight) + (serviceScore * serviceWeight), 96);
      
      return acc + totalScore;
    }, 0) / allCompetitors.length;
    
    return { ownScore, avgCompetitorScore, competitorCount: allCompetitors.length };
  };

  const getCompetitorAnalysisVariant = (ownScore: number, avgCompetitorScore: number): "default" | "secondary" | "destructive" => {
    const difference = ownScore - avgCompetitorScore;
    if (difference <= -5) return "destructive"; // 5 Punkte unter Durchschnitt: rot
    if (difference <= 1) return "default";      // 4 Punkte unter bis 1 Punkt über Durchschnitt: grün
    return "secondary";                         // Mehr als 1 Punkt über Durchschnitt: gold
  };

  const competitorAnalysis = calculateCompetitorAnalysis();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Personal & Kundenservice</h2>
        <p className="text-gray-300">Mitarbeiterqualifikationen, Unternehmensidentität und Kundenbetreuung</p>
      </div>
      
      {/* Wettbewerbsanalyse Metrikkachel */}
      {competitorAnalysis && (
        <Card className="bg-gray-800 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              ⚔️ Wettbewerbsanalyse & Marktumfeld
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {Math.round(competitorAnalysis.ownScore)}%
                </div>
                <div className="text-sm text-gray-400">Eigener Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-300 mb-1">
                  {Math.round(competitorAnalysis.avgCompetitorScore)}%
                </div>
                <div className="text-sm text-gray-400">Ø Wettbewerber</div>
              </div>
              <div className="text-center">
                <Badge 
                  variant={getCompetitorAnalysisVariant(competitorAnalysis.ownScore, competitorAnalysis.avgCompetitorScore)}
                  className="text-sm px-3 py-1"
                >
                  {(() => {
                    const diff = competitorAnalysis.ownScore - competitorAnalysis.avgCompetitorScore;
                    if (diff <= -5) return "Unterdurchschnittlich";
                    if (diff <= 1) return "Wettbewerbsfähig"; 
                    return "Überdurchschnittlich";
                  })()}
                </Badge>
                <div className="text-xs text-gray-400 mt-1">
                  {competitorAnalysis.competitorCount} Wettbewerber
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
          <HourlyRateTab 
            hourlyRateData={hourlyRateData}
            updateHourlyRateData={updateHourlyRateData}
          />
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