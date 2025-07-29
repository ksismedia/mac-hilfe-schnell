
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

  useEffect(() => {
    console.log('useExtensionData: Hook initialisiert');

    // 1. Überprüfe localStorage sofort beim Laden
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('seo_extension_data');
        console.log('LocalStorage Check:', !!storedData);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          if (parsedData.timestamp > fiveMinutesAgo) {
            console.log('✓ Extension-Daten aus localStorage geladen:', parsedData.data);
            setExtensionData(parsedData.data);
            setIsFromExtension(true);
            localStorage.removeItem('seo_extension_data');
            return true;
          } else {
            console.log('Extension-Daten zu alt, lösche sie');
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
      console.log('PostMessage erhalten:', event.data);
      
      if (event.data?.type === 'EXTENSION_WEBSITE_DATA' && 
          event.data?.source === 'seo-analyzer-extension' &&
          event.data?.data) {
        console.log('✓ Extension-Website-Daten über PostMessage erhalten:', event.data.data);
        setExtensionData(event.data.data);
        setIsFromExtension(true);
      }
    };

    // 3. Polling für localStorage (falls die Daten erst später ankommen)
    let pollCount = 0;
    const maxPolls = 10; // Max 10 Sekunden warten
    let pollTimeout: NodeJS.Timeout;
    let pollingActive = false;
    
    const pollForData = () => {
      if (pollCount >= maxPolls || !pollingActive) {
        console.log('Polling beendet - keine Extension-Daten gefunden oder gestoppt');
        pollingActive = false;
        return;
      }
      
      if (checkLocalStorage()) {
        console.log('Extension-Daten via Polling gefunden');
        pollingActive = false;
        return;
      }
      
      pollCount++;
      if (pollingActive) {
        pollTimeout = setTimeout(pollForData, 1000);
      }
    };

    // Starte sofortigen Check
    const immediateSuccess = checkLocalStorage();
    
    // Event Listeners registrieren
    window.addEventListener('message', handleExtensionMessage);
    
    // Starte Polling nur wenn keine Daten sofort gefunden wurden
    if (!immediateSuccess) {
      console.log('Starte Polling für Extension-Daten...');
      pollingActive = true;
      pollTimeout = setTimeout(pollForData, 1000);
    }

    // Cleanup
    return () => {
      console.log('useExtensionData: Cleanup wird ausgeführt');
      pollingActive = false;
      window.removeEventListener('message', handleExtensionMessage);
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, []); // Keine Dependencies! Läuft nur einmal beim Mount

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
