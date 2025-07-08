
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices } from '@/hooks/useManualData';

export const loadCompetitorServices = (
  competitorServices: CompetitorServices,
  updateCompetitorServices: (competitorName: string, services: string[], source: 'auto' | 'manual') => void
) => {
  Object.entries(competitorServices).forEach(([competitorName, serviceData]) => {
    updateCompetitorServices(competitorName, serviceData.services, serviceData.source);
  });
};

export const loadSavedAnalysisData = (
  savedAnalysis: SavedAnalysis,
  updateImprintData: (data: ManualImprintData | null) => void,
  updateSocialData: (data: ManualSocialData | null) => void,
  updateWorkplaceData: (data: ManualWorkplaceData | null) => void,
  updateCompetitors: (competitors: ManualCompetitor[]) => void,
  updateCompetitorServices: (competitorName: string, services: string[], source: 'auto' | 'manual') => void,
  updateCompanyServices?: (services: string[]) => void
) => {
  // Load manual data
  if (savedAnalysis.manualData.imprint) {
    updateImprintData(savedAnalysis.manualData.imprint);
  }
  if (savedAnalysis.manualData.social) {
    updateSocialData(savedAnalysis.manualData.social);
  }
  if (savedAnalysis.manualData.workplace) {
    updateWorkplaceData(savedAnalysis.manualData.workplace);
  }
  if (savedAnalysis.manualData.competitors && savedAnalysis.manualData.competitors.length > 0) {
    updateCompetitors(savedAnalysis.manualData.competitors);
  }
  if (savedAnalysis.manualData.competitorServices) {
    loadCompetitorServices(savedAnalysis.manualData.competitorServices, updateCompetitorServices);
  }
  
  // Load company services if available
  if (savedAnalysis.manualData.companyServices && updateCompanyServices) {
    updateCompanyServices(savedAnalysis.manualData.companyServices.services || []);
  }
};
