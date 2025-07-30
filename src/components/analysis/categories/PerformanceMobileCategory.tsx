import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceAnalysis from '../PerformanceAnalysis';
import MobileOptimization from '../MobileOptimization';
import ConversionOptimization from '../ConversionOptimization';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface PerformanceMobileCategoryProps {
  realData: RealBusinessData;
  businessData: any;
}

const PerformanceMobileCategory: React.FC<PerformanceMobileCategoryProps> = ({
  realData,
  businessData,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Performance & Technik</h2>
        <p className="text-gray-300">Website-Performance, Mobile-Optimierung und Conversion</p>
      </div>
      
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="mobile">Mobile</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <PerformanceAnalysis realData={realData} url={businessData.url} />
        </TabsContent>

        <TabsContent value="mobile">
          <MobileOptimization realData={realData} url={businessData.url} />
        </TabsContent>

        <TabsContent value="conversion">
          <ConversionOptimization url={businessData.url} industry={businessData.industry} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMobileCategory;