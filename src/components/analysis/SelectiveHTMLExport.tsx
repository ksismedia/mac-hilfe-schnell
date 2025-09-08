import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, CompanyServices, CompetitorServices, StaffQualificationData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData } from '@/hooks/useManualData';
import { FileText, Download, Printer, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { generateSelectiveCustomerHTML, generateSelectiveCustomerHTMLForBrowser } from './export/selectiveHtmlGenerator';

interface SelectiveHTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: CompetitorServices;
  companyServices?: CompanyServices;
  deletedCompetitors?: Set<string>;
  hourlyRateData?: { ownRate: number; regionAverage: number };
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  privacyData?: any;
  accessibilityData?: any;
}

interface SectionSelections {
  seoContent: boolean;
  performanceTech: boolean;
  socialMedia: boolean;
  staffService: boolean;
}

interface SubSectionSelections {
  // SEO & Content
  seoAnalysis: boolean;
  keywordAnalysis: boolean;
  localSeo: boolean;
  contentQuality: boolean;
  backlinks: boolean;
  accessibility: boolean;
  dataPrivacy: boolean;
  imprint: boolean;
  competitorAnalysis: boolean;

  // Performance & Technik
  performance: boolean;
  mobile: boolean;
  conversion: boolean;

  // Social Media
  socialMediaSimple: boolean;
  workplaceReviews: boolean;

  // Personal & Service
  staffQualification: boolean;
  corporateIdentity: boolean;
  quoteResponse: boolean;
  hourlyRate: boolean;
}

const SelectiveHTMLExport: React.FC<SelectiveHTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualWorkplaceData,
  manualCorporateIdentityData,
  manualCompetitors = [],
  competitorServices = {},
  companyServices,
  deletedCompetitors = new Set(),
  hourlyRateData,
  staffQualificationData,
  quoteResponseData,
  manualContentData,
  manualAccessibilityData,
  manualBacklinkData,
  manualKeywordData,
  keywordScore,
  privacyData,
  accessibilityData
}) => {
  const [showSelections, setShowSelections] = useState(false);
  
  // Collapsible states - alle sections standardmäßig offen
  const [sectionStates, setSectionStates] = useState({
    seoContent: true,
    performanceTech: true,
    socialMedia: true,
    staffService: true
  });
  
  // Main sections selections
  const [sectionSelections, setSectionSelections] = useState<SectionSelections>({
    seoContent: true,
    performanceTech: true,
    socialMedia: true,
    staffService: true
  });

  // Sub-sections selections
  const [subSectionSelections, setSubSectionSelections] = useState<SubSectionSelections>({
    // SEO & Content
    seoAnalysis: true,
    keywordAnalysis: true,
    localSeo: true,
    contentQuality: true,
    backlinks: true,
    accessibility: true,
    dataPrivacy: true,
    imprint: true,
    competitorAnalysis: true,

    // Performance & Technik
    performance: true,
    mobile: true,
    conversion: true,

    // Social Media
    socialMediaSimple: true,
    workplaceReviews: true,

    // Personal & Service
    staffQualification: true,
    corporateIdentity: true,
    quoteResponse: true,
    hourlyRate: true
  });

  const handleSectionChange = (section: keyof SectionSelections, checked: boolean) => {
    setSectionSelections(prev => ({ ...prev, [section]: checked }));
    
    // Auto-update sub-sections based on main section
    if (section === 'seoContent') {
      setSubSectionSelections(prev => ({
        ...prev,
        seoAnalysis: checked,
        keywordAnalysis: checked,
        localSeo: checked,
        contentQuality: checked,
        backlinks: checked,
        accessibility: checked,
        dataPrivacy: checked,
        imprint: checked,
        competitorAnalysis: checked
      }));
    } else if (section === 'performanceTech') {
      setSubSectionSelections(prev => ({
        ...prev,
        performance: checked,
        mobile: checked,
        conversion: checked
      }));
    } else if (section === 'socialMedia') {
      setSubSectionSelections(prev => ({
        ...prev,
        socialMediaSimple: checked,
        workplaceReviews: checked
      }));
    } else if (section === 'staffService') {
      setSubSectionSelections(prev => ({
        ...prev,
        staffQualification: checked,
        corporateIdentity: checked,
        quoteResponse: checked,
        hourlyRate: checked
      }));
    }
  };

  const handleSubSectionChange = (subSection: keyof SubSectionSelections, checked: boolean) => {
    setSubSectionSelections(prev => ({ ...prev, [subSection]: checked }));
  };

  const generateSelectiveReport = () => {
    // For browser display, use the full customer HTML with dashboard that includes all score tiles
    const htmlContent = generateSelectiveCustomerHTMLForBrowser({
      businessData,
      realData,
      manualCompetitors,
      competitorServices: competitorServices || {},
      companyServices,
      deletedCompetitors,
      hourlyRateData,
      missingImprintElements: [],
      manualSocialData,
      manualWorkplaceData,
      manualCorporateIdentityData,
      manualContentData,
      manualAccessibilityData,
      manualBacklinkData,
      manualKeywordData,
      keywordScore,
      manualImprintData,
      staffQualificationData,
      quoteResponseData,
      dataPrivacyScore: privacyData?.score || 75,
      calculatedOwnCompanyScore: undefined
    });

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const downloadSelectiveReport = () => {
    const htmlContent = generateSelectiveCustomerHTML({
      businessData,
      realData,
      manualCompetitors,
      competitorServices: competitorServices || {},
      companyServices,
      deletedCompetitors,
      hourlyRateData,
      missingImprintElements: [],
      manualSocialData,
      manualWorkplaceData,
      manualCorporateIdentityData,
      manualContentData,
      manualAccessibilityData,
      manualBacklinkData,
      manualKeywordData,
      keywordScore,
      manualImprintData,
      staffQualificationData,
      quoteResponseData,
      privacyData,
      accessibilityData,
      dataPrivacyScore: privacyData?.score || 75,
      selections: {
        sections: sectionSelections,
        subSections: subSectionSelections
      }
    });

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `Selektiver-Report-${businessData.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const selectAllSections = () => {
    setSectionSelections({
      seoContent: true,
      performanceTech: true,
      socialMedia: true,
      staffService: true
    });
    setSubSectionSelections({
      // SEO & Content
      seoAnalysis: true,
      keywordAnalysis: true,
      localSeo: true,
      contentQuality: true,
      backlinks: true,
      accessibility: true,
      dataPrivacy: true,
      imprint: true,
      competitorAnalysis: true,

      // Performance & Technik
      performance: true,
      mobile: true,
      conversion: true,

      // Social Media
      socialMediaSimple: true,
      workplaceReviews: true,

      // Personal & Service
      staffQualification: true,
      corporateIdentity: true,
      quoteResponse: true,
      hourlyRate: true
    });
  };

  const deselectAllSections = () => {
    setSectionSelections({
      seoContent: false,
      performanceTech: false,
      socialMedia: false,
      staffService: false
    });
    setSubSectionSelections({
      // SEO & Content
      seoAnalysis: false,
      keywordAnalysis: false,
      localSeo: false,
      contentQuality: false,
      backlinks: false,
      accessibility: false,
      dataPrivacy: false,
      imprint: false,
      competitorAnalysis: false,

      // Performance & Technik
      performance: false,
      mobile: false,
      conversion: false,

      // Social Media
      socialMediaSimple: false,
      workplaceReviews: false,

      // Personal & Service
      staffQualification: false,
      corporateIdentity: false,
      quoteResponse: false,
      hourlyRate: false
    });
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Selektiver HTML-Export
          </CardTitle>
          <CardDescription className="text-center">
            Wählen Sie gezielt die Bereiche aus, die im Export enthalten sein sollen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 mb-4">
            <Button 
              onClick={() => setShowSelections(!showSelections)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showSelections ? 'Auswahl ausblenden' : 'Bereiche auswählen'}
            </Button>
            {showSelections && (
              <>
                <Button 
                  onClick={selectAllSections}
                  variant="outline"
                  size="sm"
                >
                  Alle auswählen
                </Button>
                <Button 
                  onClick={deselectAllSections}
                  variant="outline"
                  size="sm"
                >
                  Alle abwählen
                </Button>
              </>
            )}
          </div>

          {showSelections && (
            <div className="grid gap-4 max-w-4xl">
              <h4 className="font-semibold text-foreground mb-4">Hauptbereiche auswählen:</h4>
              
              {/* SEO & Content Section */}
              <Card className="border border-border">
                <Collapsible 
                  open={sectionStates.seoContent} 
                  onOpenChange={(open) => setSectionStates(prev => ({ ...prev, seoContent: open }))}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="seo-content"
                          checked={sectionSelections.seoContent}
                          onCheckedChange={(checked) => handleSectionChange('seoContent', !!checked)}
                        />
                        <label htmlFor="seo-content" className="text-sm font-medium text-primary cursor-pointer">
                          🔍 SEO & Content Analyse
                        </label>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          {sectionStates.seoContent ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  
                    <CollapsibleContent className="space-y-2 mt-4">
                      <div className="ml-8 space-y-3 border-l-2 border-primary/20 pl-4">
                        {[
                          { id: 'seoAnalysis', label: 'SEO-Analyse', key: 'seoAnalysis' as keyof SubSectionSelections },
                          { id: 'keywordAnalysis', label: 'Keyword-Analyse', key: 'keywordAnalysis' as keyof SubSectionSelections },
                          { id: 'localSeo', label: 'Lokales SEO', key: 'localSeo' as keyof SubSectionSelections },
                          { id: 'contentQuality', label: 'Content-Qualität', key: 'contentQuality' as keyof SubSectionSelections },
                          { id: 'backlinks', label: 'Backlink-Analyse', key: 'backlinks' as keyof SubSectionSelections },
                          { id: 'accessibility', label: 'Barrierefreiheit', key: 'accessibility' as keyof SubSectionSelections },
                          { id: 'dataPrivacy', label: 'Datenschutz', key: 'dataPrivacy' as keyof SubSectionSelections },
                          { id: 'imprint', label: 'Impressum', key: 'imprint' as keyof SubSectionSelections },
                          { id: 'competitorAnalysis', label: 'Konkurrenz-Analyse', key: 'competitorAnalysis' as keyof SubSectionSelections }
                        ].map(({ id, label, key }) => (
                          <div key={id} className="flex items-center space-x-2">
                            <Checkbox
                              id={id}
                              checked={subSectionSelections[key]}
                              onCheckedChange={(checked) => handleSubSectionChange(key, !!checked)}
                            />
                            <label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer">{label}</label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </Card>

              {/* Performance & Technik Section */}
              <Card className="border border-border">
                <Collapsible 
                  open={sectionStates.performanceTech} 
                  onOpenChange={(open) => setSectionStates(prev => ({ ...prev, performanceTech: open }))}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="performance-tech"
                          checked={sectionSelections.performanceTech}
                          onCheckedChange={(checked) => handleSectionChange('performanceTech', !!checked)}
                        />
                        <label htmlFor="performance-tech" className="text-sm font-medium text-primary cursor-pointer">
                          ⚡ Performance & Technik
                        </label>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          {sectionStates.performanceTech ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  
                    <CollapsibleContent className="space-y-2 mt-4">
                      <div className="ml-8 space-y-3 border-l-2 border-primary/20 pl-4">
                        {[
                          { id: 'performance', label: 'Performance-Analyse', key: 'performance' as keyof SubSectionSelections },
                          { id: 'mobile', label: 'Mobile Optimierung', key: 'mobile' as keyof SubSectionSelections },
                          { id: 'conversion', label: 'Conversion-Optimierung', key: 'conversion' as keyof SubSectionSelections }
                        ].map(({ id, label, key }) => (
                          <div key={id} className="flex items-center space-x-2">
                            <Checkbox
                              id={id}
                              checked={subSectionSelections[key]}
                              onCheckedChange={(checked) => handleSubSectionChange(key, !!checked)}
                            />
                            <label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer">{label}</label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </Card>

              {/* Social Media Section */}
              <Card className="border border-border">
                <Collapsible 
                  open={sectionStates.socialMedia} 
                  onOpenChange={(open) => setSectionStates(prev => ({ ...prev, socialMedia: open }))}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="social-media"
                          checked={sectionSelections.socialMedia}
                          onCheckedChange={(checked) => handleSectionChange('socialMedia', !!checked)}
                        />
                        <label htmlFor="social-media" className="text-sm font-medium text-primary cursor-pointer">
                          📱 Social Media & Online-Präsenz
                        </label>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          {sectionStates.socialMedia ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  
                    <CollapsibleContent className="space-y-2 mt-4">
                      <div className="ml-8 space-y-3 border-l-2 border-primary/20 pl-4">
                        {[
                          { id: 'socialMediaSimple', label: 'Social Media Analyse', key: 'socialMediaSimple' as keyof SubSectionSelections },
                          { id: 'workplaceReviews', label: 'Arbeitsplatz-Bewertungen', key: 'workplaceReviews' as keyof SubSectionSelections }
                        ].map(({ id, label, key }) => (
                          <div key={id} className="flex items-center space-x-2">
                            <Checkbox
                              id={id}
                              checked={subSectionSelections[key]}
                              onCheckedChange={(checked) => handleSubSectionChange(key, !!checked)}
                            />
                            <label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer">{label}</label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </Card>

              {/* Personal & Service Section */}
              <Card className="border border-border">
                <Collapsible 
                  open={sectionStates.staffService} 
                  onOpenChange={(open) => setSectionStates(prev => ({ ...prev, staffService: open }))}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="staff-service"
                          checked={sectionSelections.staffService}
                          onCheckedChange={(checked) => handleSectionChange('staffService', !!checked)}
                        />
                        <label htmlFor="staff-service" className="text-sm font-medium text-primary cursor-pointer">
                          👥 Personal & Kundenservice
                        </label>
                      </div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          {sectionStates.staffService ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  
                    <CollapsibleContent className="space-y-2 mt-4">
                      <div className="ml-8 space-y-3 border-l-2 border-primary/20 pl-4">
                        {[
                          { id: 'staffQualification', label: 'Personal-Qualifikation', key: 'staffQualification' as keyof SubSectionSelections },
                          { id: 'corporateIdentity', label: 'Corporate Design', key: 'corporateIdentity' as keyof SubSectionSelections },
                          { id: 'quoteResponse', label: 'Angebots-Reaktion', key: 'quoteResponse' as keyof SubSectionSelections },
                          { id: 'hourlyRate', label: 'Stundensatz-Analyse', key: 'hourlyRate' as keyof SubSectionSelections }
                        ].map(({ id, label, key }) => (
                          <div key={id} className="flex items-center space-x-2">
                            <Checkbox
                              id={id}
                              checked={subSectionSelections[key]}
                              onCheckedChange={(checked) => handleSubSectionChange(key, !!checked)}
                            />
                            <label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer">{label}</label>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </Card>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={generateSelectiveReport}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="h-4 w-4" />
              Selektiven Report öffnen
            </Button>
            <Button 
              onClick={downloadSelectiveReport}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              Als HTML herunterladen
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                generateSelectiveReport();
                setTimeout(() => {
                  window.print();
                }, 1000);
              }}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Report erstellen & drucken
            </Button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">✨ Selektiver Export:</h4>
            <div className="text-sm text-purple-700 space-y-1">
              <p>• <strong>Hauptbereiche:</strong> Wählen Sie ganze Kategorien aus oder ab</p>
              <p>• <strong>Einzelne Punkte:</strong> Granulare Kontrolle über jeden Unterpunkt</p>
              <p>• <strong>Flexibel:</strong> Nur die gewünschten Inhalte im Export</p>
              <p>• <strong>Professionell:</strong> Automatische Anpassung des Layouts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectiveHTMLExport;