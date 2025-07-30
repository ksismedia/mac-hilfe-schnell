
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

interface ExtensionMessage {
  type: string;
  source: string;
  data: ExtensionWebsiteData;
}

export const useExtensionData = () => {
  const [extensionData, setExtensionData] = useState<ExtensionWebsiteData | null>(null);
  const [isFromExtension, setIsFromExtension] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    // 1. Überprüfe localStorage sofort beim Laden
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('seo_extension_data');
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          if (parsedData.timestamp > fiveMinutesAgo) {
            setExtensionData(parsedData.data);
            setIsFromExtension(true);
            localStorage.removeItem('seo_extension_data');
            return true;
          } else {
            localStorage.removeItem('seo_extension_data');
          }
        }
      } catch (error) {
        console.warn('Fehler beim Laden aus localStorage:', error);
      }
      return false;
    };

    // 2. PostMessage-Listener für Extension-Kommunikation
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data?.type === 'EXTENSION_WEBSITE_DATA' && 
          event.data?.source === 'seo-analyzer-extension' &&
          event.data?.data) {
        setExtensionData(event.data.data);
        setIsFromExtension(true);
      }
    };

    // 3. Optimized polling with less console noise
    let pollCount = 0;
    const maxPolls = 10;
    let pollTimeout: NodeJS.Timeout;
    
    const pollForData = () => {
      if (pollCount >= maxPolls) {
        setIsInitialized(true);
        return;
      }
      
      if (checkLocalStorage()) {
        setIsInitialized(true);
        return;
      }
      
      pollCount++;
      pollTimeout = setTimeout(pollForData, 1000);
    };

    // Immediate check
    const immediateSuccess = checkLocalStorage();
    
    // Register event listeners
    window.addEventListener('message', handleExtensionMessage);
    
    // Start polling only if no immediate success
    if (!immediateSuccess) {
      pollTimeout = setTimeout(pollForData, 1000);
    } else {
      setIsInitialized(true);
    }

    // Cleanup
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [isInitialized]);

  const clearExtensionData = () => {
    setExtensionData(null);
    setIsFromExtension(false);
    localStorage.removeItem('seo_extension_data');
  };

  return {
    extensionData,
    isFromExtension,
    clearExtensionData,
    hasExtensionData: extensionData !== null
  };
};
