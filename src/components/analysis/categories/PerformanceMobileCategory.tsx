import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceAnalysis from '../PerformanceAnalysis';
import MobileOptimization from '../MobileOptimization';
import ConversionOptimization from '../ConversionOptimization';
import ManualConversionInput from '../ManualConversionInput';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualConversionData } from '@/hooks/useManualData';

interface PerformanceMobileCategoryProps {
  realData: RealBusinessData;
  businessData: any;
  manualConversionData?: ManualConversionData | null;
  updateManualConversionData?: (data: ManualConversionData) => void;
}

const PerformanceMobileCategory: React.FC<PerformanceMobileCategoryProps> = ({
  realData,
  businessData,
  manualConversionData,
  updateManualConversionData
}) => {
  console.log('=== PerformanceMobileCategory Render ===');
  console.log('manualConversionData:', manualConversionData);
  console.log('updateManualConversionData exists:', !!updateManualConversionData);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Performance & Technik</h2>
        <p className="text-gray-300">Website-Performance, Mobile-Optimierung und Conversion</p>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="conversion-manual">Manuelle Eingabe</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceAnalysis realData={realData} url={businessData.url} />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileOptimization realData={realData} url={businessData.url} />
        </TabsContent>

        <TabsContent value="conversion">
          <ConversionOptimization 
            url={businessData.url} 
            industry={businessData.industry}
            manualConversionData={manualConversionData}
          />
        </TabsContent>

        <TabsContent value="conversion-manual">
          {updateManualConversionData ? (
            <ManualConversionInput
              onSave={updateManualConversionData}
              initialData={manualConversionData}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Manuelle Eingabe nicht verfügbar
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMobileCategory;