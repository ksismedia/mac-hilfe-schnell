
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Initialisierung
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    console.log('🚀 useExtensionData Hook initialized');
    
    // 1. Überprüfe localStorage sofort beim Laden
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('extensionWebsiteData');
        console.log('🔍 Checking localStorage for extension data:', !!storedData);
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
          
          console.log('📦 Found stored data:', {
            url: parsedData.data?.url,
            timestamp: parsedData.timestamp,
            isRecent: parsedData.timestamp > fiveMinutesAgo
          });
          
          if (parsedData.timestamp > fiveMinutesAgo) {
            console.log('✅ Loading fresh extension data from localStorage');
            setExtensionData(parsedData.data);
            setIsFromExtension(true);
            return true;
          } else {
            console.log('⏰ Stored data too old, removing');
            localStorage.removeItem('extensionWebsiteData');
          }
        }
      } catch (error) {
        console.warn('❌ Error loading from localStorage:', error);
      }
      return false;
    };

    // 2. CustomEvent-Listener für Extension-Daten
    const handleExtensionEvent = (event: CustomEvent) => {
      if (event.detail?.data) {
        console.log('🎉 Extension data received:', event.detail.data.url);
        
        // Save to state
        setExtensionData(event.detail.data);
        setIsFromExtension(true);
        
        console.log('✅ Extension data loaded successfully');
      }
    };

    // 3. Polling nur beim ersten Laden
    let pollCount = 0;
    const maxPolls = 10;
    let pollTimeout: NodeJS.Timeout;
    
    const pollForData = () => {
      if (pollCount >= maxPolls || isInitialized) {
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

    // Immediate check nur beim ersten Laden
    if (!isInitialized) {
      console.log('🔎 Initial check for stored data...');
      const immediateSuccess = checkLocalStorage();
      if (immediateSuccess) {
        console.log('✅ Found data immediately');
        setIsInitialized(true);
      } else {
        console.log('⏳ Starting polling for data...');
        pollTimeout = setTimeout(pollForData, 1000);
      }
    }
    
    // Register event listener
    console.log('👂 Registering event listener...');
    window.addEventListener('extensionDataReceived', handleExtensionEvent as EventListener);
    
    // Polling für neue Daten auch nach Initialisierung
    const continuousCheckInterval = setInterval(() => {
      checkLocalStorage();
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('extensionDataReceived', handleExtensionEvent as EventListener);
      clearInterval(continuousCheckInterval);
      if (pollTimeout) {
        clearTimeout(pollTimeout);
      }
    };
  }, [isInitialized]);

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
