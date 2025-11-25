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

    // Prüfe URL Parameter beim Laden
    const urlParams = new URLSearchParams(window.location.search);
    const extData = urlParams.get('extData');
    
    if (extData) {
      try {
        console.log('📦 Extension-Daten in URL gefunden');
        const decodedData = JSON.parse(atob(extData));
        console.log('✅ Daten dekodiert:', decodedData.url);
        
        setExtensionData(decodedData);
        setIsFromExtension(true);
        
        // Speichere in localStorage
        localStorage.setItem('extensionWebsiteData', JSON.stringify({
          data: decodedData,
          timestamp: Date.now()
        }));
        
        // Entferne URL Parameter
        window.history.replaceState({}, '', window.location.pathname);
        
        console.log('✅ Extension-Daten erfolgreich geladen!');
      } catch (error) {
        console.error('❌ Fehler beim Dekodieren:', error);
      }
    } else {
      // Prüfe localStorage als Fallback
      const storedData = localStorage.getItem('extensionWebsiteData');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          if (parsed.timestamp > fiveMinutesAgo) {
            console.log('📦 Daten aus localStorage geladen');
            setExtensionData(parsed.data);
            setIsFromExtension(true);
          } else {
            localStorage.removeItem('extensionWebsiteData');
          }
        } catch (error) {
          console.error('❌ Fehler beim Laden aus localStorage:', error);
        }
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
