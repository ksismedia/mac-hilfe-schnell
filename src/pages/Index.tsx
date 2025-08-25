import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { useToast } from '@/components/ui/use-toast';
import APIKeyManager from '@/components/APIKeyManager';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import SidebarAnalysisDashboard from '@/components/SidebarAnalysisDashboard';
import SimpleAnalysisDashboard from '@/components/SimpleAnalysisDashboard';
import ExtensionDataProcessor from '@/components/ExtensionDataProcessor';
import { useExtensionData } from '@/hooks/useExtensionData';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [businessData, setBusinessData] = useState(null);
  const { toast } = useToast();
  const { extensionData, clearExtensionData } = useExtensionData();
  
  // Get layout from URL params, default to 'sidebar'
  const layout = searchParams.get('layout') || 'sidebar';

  useEffect(() => {
    console.log('Checking for existing API key...');
    const existingKey = GoogleAPIService.getApiKey();
    console.log('Existing API key found:', !!existingKey);
    
    if (existingKey && existingKey.length >= 20) {
      console.log('Valid existing API key found, proceeding...');
      setHasApiKey(true);
    } else {
      console.log('No valid API key found, requesting API key input');
      setHasApiKey(false);
    }
  }, []);

  const handleApiKeySet = async () => {
    console.log('Validating API key...');
    setIsValidating(true);
    
    try {
      const apiKey = GoogleAPIService.getApiKey();
      
      // Gelockerte Validierung - nur Länge prüfen
      if (!apiKey || apiKey.length < 20) {
        throw new Error('API-Key zu kurz oder nicht vorhanden');
      }

      console.log('API key validation passed');
      setHasApiKey(true);
      
      toast({
        title: "API-Key akzeptiert",
        description: "Sie können nun mit der Live-Analyse beginnen.",
      });
    } catch (error) {
      console.error('API Key validation error:', error);
      
      toast({
        title: "Ungültiger API-Key",
        description: "Der API-Key konnte nicht validiert werden. Überprüfen Sie die Eingabe und Internetverbindung.",
        variant: "destructive",
      });
      
      setHasApiKey(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleLoadSavedAnalysis = (analysis: any) => {
    console.log('Loading saved analysis:', analysis);
    setHasApiKey(true);
  };

  const handleProcessExtensionData = (data: any) => {
    setBusinessData(data);
    setHasApiKey(true);
  };

  const handleDiscardExtensionData = () => {
    clearExtensionData();
  };

  const handleReset = () => {
    setBusinessData(null);
    setHasApiKey(false);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center mb-8">
            <img 
              src="/handwerk-stars-logo.png" 
              alt="HandwerkStars Logo" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              HandwerkStars SEO-Analyzer
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professionelle Website-Analyse für Handwerksbetriebe mit echten Google-Daten
            </p>
          </div>

          {extensionData && (
            <ExtensionDataProcessor 
              extensionData={extensionData}
              onProcessData={handleProcessExtensionData}
              onDiscard={handleDiscardExtensionData}
            />
          )}
          
          {!extensionData && (
            <APIKeyManager 
              onApiKeySet={handleApiKeySet}
              onLoadSavedAnalysis={handleLoadSavedAnalysis}
            />
          )}
        </div>
      </div>
    );
  }

  // If we have businessData, render the appropriate dashboard
  if (businessData) {
    if (layout === 'simple') {
      return <SimpleAnalysisDashboard businessData={businessData} onReset={handleReset} />;
    } else if (layout === 'classic') {
      return <AnalysisDashboard businessData={businessData} onReset={handleReset} />;
    } else {
      // Default to sidebar layout
      return <SidebarAnalysisDashboard businessData={businessData} onReset={handleReset} />;
    }
  }

  // If we have API key but no businessData, show the analysis dashboard with empty data
  // This will show the normal input form for website URL
  const defaultBusinessData = {
    address: '',
    url: '',
    industry: 'shk' as const
  };

  if (layout === 'simple') {
    return <SimpleAnalysisDashboard businessData={defaultBusinessData} onReset={handleReset} />;
  } else if (layout === 'classic') {
    return <AnalysisDashboard businessData={defaultBusinessData} onReset={handleReset} />;
  } else {
    // Default to sidebar layout
    return <SidebarAnalysisDashboard businessData={defaultBusinessData} onReset={handleReset} />;
  }
};

export default Index;
