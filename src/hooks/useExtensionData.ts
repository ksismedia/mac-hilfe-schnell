import { useState, useEffect } from 'react';

interface ExtensionWebsiteData {
  url: string;
  domain: string;
  title: string;
  seo: {
    titleTag: string;
    metaDescription: string;
    metaKeywords: string;
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
    };
    altTags: {
      total: number;
      withAlt: number;
      images: Array<{
        src: string;
        alt: string;
        hasAlt: boolean;
      }>;
    };
  };
  content: {
    fullText: string;
    wordCount: number;
    links: {
      internal: Array<{ href: string; text: string; title: string }>;
      external: Array<{ href: string; text: string; title: string }>;
    };
  };
  technical: {
    hasImprint: boolean;
    hasPrivacyPolicy: boolean;
    hasContactForm: boolean;
    structuredData: any[];
  };
  performance: {
    imageCount: number;
    scriptCount: number;
    cssCount: number;
    resourcesWithoutAlt: number;
  };
  contact: {
    phone: string[];
    email: string[];
    address: string[];
  };
  extractedAt: string;
}

export const useExtensionData = () => {
  const [extensionData, setExtensionData] = useState<ExtensionWebsiteData | null>(null);
  const [isFromExtension, setIsFromExtension] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🚀 Extension Hook gestartet');

    // 1. Prüfe URL Parameter (Meta-Daten)
    const urlParams = new URLSearchParams(window.location.search);
    const extData = urlParams.get('extData');
    
    if (extData) {
      try {
        console.log('📦 Extension-Daten in URL gefunden');
        const metaData = JSON.parse(decodeURIComponent(escape(atob(extData))));
        console.log('✅ Meta-Daten dekodiert:', metaData.url);
        
        // 2. Prüfe ob komplette Daten im localStorage sind
        const fullDataStr = localStorage.getItem('fullExtensionData');
        if (fullDataStr) {
          try {
            const fullDataObj = JSON.parse(fullDataStr);
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            
            if (fullDataObj.timestamp > fiveMinutesAgo) {
              console.log('✅ Komplette Daten aus localStorage geladen');
              setExtensionData(fullDataObj.data);
              setIsFromExtension(true);
              localStorage.removeItem('fullExtensionData');
              window.history.replaceState({}, '', window.location.pathname);
              setIsInitialized(true);
              return;
            }
          } catch (e) {
            console.log('⚠️ Kein vollständiger Datensatz verfügbar');
          }
        }
        
        // 3. Falls nur Meta-Daten: Verwende diese
        setExtensionData(metaData);
        setIsFromExtension(true);
        window.history.replaceState({}, '', window.location.pathname);
        console.log('✅ Extension-Daten geladen (Meta-Daten only)');
        
      } catch (error) {
        console.error('❌ Fehler beim Dekodieren:', error);
      }
    }
    
    setIsInitialized(true);
  }, []);

  const clearExtensionData = () => {
    setExtensionData(null);
    setIsFromExtension(false);
    localStorage.removeItem('extensionWebsiteData');
  };

  return {
    extensionData,
    isFromExtension,
    clearExtensionData,
    hasExtensionData: extensionData !== null
  };
};
