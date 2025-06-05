
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
    // 1. Verbesserte URL-Parameter-Prüfung
    const checkUrlParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const extensionDataParam = urlParams.get('extensionData');
      
      if (extensionDataParam) {
        try {
          const parsedPayload = JSON.parse(decodeURIComponent(extensionDataParam));
          console.log('Extension-Payload aus URL empfangen:', parsedPayload);
          
          if (parsedPayload.type === 'EXTENSION_WEBSITE_DATA' && 
              parsedPayload.source === 'seo-analyzer-extension' && 
              parsedPayload.data) {
            console.log('✓ Gültige Extension-Daten geladen:', parsedPayload.data);
            setExtensionData(parsedPayload.data);
            setIsFromExtension(true);
            
            // Säubere URL nach dem Laden
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
          }
        } catch (error) {
          console.error('Fehler beim Parsen der Extension-URL-Daten:', error);
        }
      }
      return false;
    };

    // 2. Verbesserte Message-Listener für Extension-Kommunikation
    const handleExtensionMessage = (event: MessageEvent) => {
      console.log('PostMessage erhalten:', event.data);
      
      if (event.data?.type === 'EXTENSION_WEBSITE_DATA' && 
          event.data?.source === 'seo-analyzer-extension' &&
          event.data?.data) {
        console.log('✓ Extension-Website-Daten über PostMessage erhalten:', event.data.data);
        setExtensionData(event.data.data);
        setIsFromExtension(true);
      }
    };

    // 3. Chrome Extension Message-Listener
    const handleChromeMessage = (message: any, sender: any, sendResponse: any) => {
      console.log('Chrome Extension Message erhalten:', message);
      
      if (message?.type === 'EXTENSION_WEBSITE_DATA' && 
          message?.source === 'seo-analyzer-extension' &&
          message?.data) {
        console.log('✓ Extension-Daten über Chrome Message API erhalten:', message.data);
        setExtensionData(message.data);
        setIsFromExtension(true);
        
        if (sendResponse) {
          sendResponse({ received: true, success: true });
        }
      }
    };

    // 4. Überprüfe auch localStorage für persistente Daten
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('seo_extension_data');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Nur verwenden wenn weniger als 5 Minuten alt
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          if (parsedData.timestamp > fiveMinutesAgo) {
            console.log('✓ Extension-Daten aus localStorage geladen:', parsedData.data);
            setExtensionData(parsedData.data);
            setIsFromExtension(true);
            // Lösche alte Daten
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

    // Führe alle Checks durch
    const urlSuccess = checkUrlParams();
    if (!urlSuccess) {
      checkLocalStorage();
    }
    
    // Event Listeners registrieren
    window.addEventListener('message', handleExtensionMessage);
    
    // Chrome Extension API (falls verfügbar)
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
    localStorage.removeItem('seo_extension_data');
  };

  return {
    extensionData,
    isFromExtension,
    clearExtensionData,
    hasExtensionData: extensionData !== null
  };
};
