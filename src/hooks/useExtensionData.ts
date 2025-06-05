
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

// Chrome API Typen für TypeScript
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        onMessage?: {
          addListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
          removeListener: (callback: (message: any, sender: any, sendResponse: any) => void) => void;
        };
      };
    };
  }
}

export const useExtensionData = () => {
  const [extensionData, setExtensionData] = useState<ExtensionWebsiteData | null>(null);
  const [isFromExtension, setIsFromExtension] = useState(false);

  useEffect(() => {
    // 1. Prüfe URL-Parameter für Extension-Daten
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      
      if (dataParam) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(dataParam));
          if (parsedData.source === 'extension' && parsedData.data) {
            console.log('Extension-Daten aus URL geladen:', parsedData.data);
            setExtensionData(parsedData.data);
            setIsFromExtension(true);
            
            // Säubere URL nach dem Laden
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Fehler beim Parsen der Extension-URL-Daten:', error);
        }
      }
    };

    // 2. Message-Listener für direkte Extension-Kommunikation
    const handleExtensionMessage = (event: MessageEvent) => {
      console.log('Message erhalten:', event.data);
      
      if (event.data?.type === 'EXTENSION_WEBSITE_DATA' && 
          event.data?.source === 'seo-analyzer-extension') {
        console.log('Extension-Website-Daten erhalten:', event.data.data);
        setExtensionData(event.data.data);
        setIsFromExtension(true);
      }
    };

    // 3. Chrome Extension Message-Listener (falls im Extension-Kontext)
    const handleChromeMessage = (message: any, sender: any, sendResponse: any) => {
      if (message?.type === 'EXTENSION_WEBSITE_DATA') {
        console.log('Chrome Extension Message erhalten:', message.data);
        setExtensionData(message.data);
        setIsFromExtension(true);
        sendResponse({ received: true });
      }
    };

    // Event Listeners registrieren
    checkUrlParams();
    window.addEventListener('message', handleExtensionMessage);
    
    // Chrome Extension API (falls verfügbar) - mit korrekter Typisierung
    if (typeof window !== 'undefined' && 
        window.chrome && 
        window.chrome.runtime && 
        window.chrome.runtime.onMessage) {
      window.chrome.runtime.onMessage.addListener(handleChromeMessage);
    }

    // Cleanup
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
      if (typeof window !== 'undefined' && 
          window.chrome && 
          window.chrome.runtime && 
          window.chrome.runtime.onMessage) {
        window.chrome.runtime.onMessage.removeListener(handleChromeMessage);
      }
    };
  }, []);

  const clearExtensionData = () => {
    setExtensionData(null);
    setIsFromExtension(false);
  };

  return {
    extensionData,
    isFromExtension,
    clearExtensionData,
    hasExtensionData: extensionData !== null
  };
};
