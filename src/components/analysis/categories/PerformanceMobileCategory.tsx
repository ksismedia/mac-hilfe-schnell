import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceAnalysis from '../PerformanceAnalysis';
import MobileOptimization from '../MobileOptimization';
import ConversionOptimization from '../ConversionOptimization';
import ManualConversionInput from '../ManualConversionInput';
import ManualMobileInput from '../ManualMobileInput';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualConversionData, ManualMobileData } from '@/hooks/useManualData';

interface PerformanceMobileCategoryProps {
  realData: RealBusinessData;
  businessData: any;
  manualConversionData?: ManualConversionData | null;
  updateManualConversionData?: (data: ManualConversionData) => void;
  manualMobileData?: ManualMobileData | null;
  updateManualMobileData?: (data: ManualMobileData) => void;
}

const PerformanceMobileCategory: React.FC<PerformanceMobileCategoryProps> = ({
  realData,
  businessData,
  manualConversionData,
  updateManualConversionData,
  manualMobileData,
  updateManualMobileData
}) => {
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 border-b border-white pb-2 inline-block">Performance & Technik</h2>
        <p className="text-gray-300 mt-4">Website-Performance, Mobile-Optimierung und Conversion</p>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="conversion-manual">Manuelle Daten</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceAnalysis realData={realData} url={businessData.url} />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileOptimization 
            realData={realData} 
            url={businessData.url}
            manualMobileData={manualMobileData}
          />
        </TabsContent>

        <TabsContent value="conversion">
          <ConversionOptimization 
            url={businessData.url} 
            industry={businessData.industry}
            manualConversionData={manualConversionData}
          />
        </TabsContent>

        <TabsContent value="conversion-manual">
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Manuelle Dateneingabe</h3>
            <p className="text-muted-foreground">
              Erfassen Sie hier zusätzliche Daten für Mobile-Optimierung und Conversion, die automatisch mit den erfassten Daten kombiniert werden.
            </p>
            
            {/* Mobile Manual Input */}
            {updateManualMobileData ? (
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">Mobile-Optimierung</h4>
                <ManualMobileInput
                  onDataChange={updateManualMobileData}
                  initialData={manualMobileData}
                />
              </div>
            ) : null}
            
            {/* Conversion Manual Input */}
            {updateManualConversionData ? (
              <div>
                <h4 className="text-lg font-semibold mb-4">Conversion-Optimierung</h4>
                <ManualConversionInput
                  onSave={updateManualConversionData}
                  initialData={manualConversionData}
                />
              </div>
            ) : null}
            
            {!updateManualMobileData && !updateManualConversionData && (
              <div className="text-center py-8 text-muted-foreground">
                Manuelle Eingabe nicht verfügbar
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMobileCategory;