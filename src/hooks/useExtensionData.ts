
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

  // Check URL parameter for extension session
  useEffect(() => {
    const checkUrlParameter = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('extensionSession');
      
      if (sessionId) {
        console.log('🔗 Extension session ID found in URL:', sessionId);
        
        try {
          // Retrieve data from Edge Function
          const { data: result, error } = await supabase.functions.invoke('extension-data-bridge', {
            body: { action: 'retrieve', sessionId }
          });

          if (error) {
            console.error('❌ Error retrieving extension data:', error);
            return;
          }

          if (result?.success && result?.data) {
            console.log('✅ Extension data retrieved from Edge Function:', result.data);
            setExtensionData(result.data);
            setIsFromExtension(true);
            
            // Save to localStorage for persistence
            localStorage.setItem('extensionData', JSON.stringify({
              data: result.data,
              timestamp: Date.now()
            }));

            // Clean up URL parameter
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          }
        } catch (error) {
          console.error('❌ Exception retrieving extension data:', error);
        }
      }
      
      setIsInitialized(true);
    };

    checkUrlParameter();
  }, []);

  useEffect(() => {
    console.log('🚀 useExtensionData Hook initialized');
    
    // 1. Überprüfe localStorage sofort beim Laden
    const checkLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('seo_extension_data');
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
            localStorage.removeItem('seo_extension_data');
            return true;
          } else {
            console.log('⏰ Stored data too old, removing');
            localStorage.removeItem('seo_extension_data');
          }
        }
      } catch (error) {
        console.warn('❌ Error loading from localStorage:', error);
      }
      return false;
    };

    // 2. PostMessage-Listener für Extension-Kommunikation (OHNE Origin-Check)
    const handleExtensionMessage = (event: MessageEvent) => {
      // Check message structure, not origin (Extension can't match origin)
      if (event.data?.type === 'EXTENSION_WEBSITE_DATA' && 
          event.data?.source === 'seo-analyzer-extension' &&
          event.data?.data) {
        console.log('📨 PostMessage received from extension:', event.data.data.url);
        
        // Save to state
        setExtensionData(event.data.data);
        setIsFromExtension(true);
        
        // ALSO save to localStorage for persistence
        try {
          localStorage.setItem('seo_extension_data', JSON.stringify({
            data: event.data.data,
            timestamp: event.data.timestamp || Date.now()
          }));
          console.log('💾 Saved to localStorage');
        } catch (e) {
          console.warn('Could not save to localStorage:', e);
        }
      }
    };

    // 3. CustomEvent-Listener für sofortige Updates
    const handleExtensionEvent = (event: CustomEvent) => {
      if (event.detail?.type === 'EXTENSION_WEBSITE_DATA' && 
          event.detail?.source === 'seo-analyzer-extension' &&
          event.detail?.data) {
        console.log('🎉 CustomEvent received from extension:', event.detail.data.url);
        
        // Save to state
        setExtensionData(event.detail.data);
        setIsFromExtension(true);
        
        // ALSO save to localStorage for persistence
        try {
          localStorage.setItem('seo_extension_data', JSON.stringify({
            data: event.detail.data,
            timestamp: event.detail.timestamp || Date.now()
          }));
          console.log('💾 Saved to localStorage');
        } catch (e) {
          console.warn('Could not save to localStorage:', e);
        }
      }
    };

    // 4. Polling nur beim ersten Laden
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
    
    // Register event listeners (immer aktiv)
    console.log('👂 Registering event listeners...');
    window.addEventListener('message', handleExtensionMessage);
    window.addEventListener('extensionDataReceived', handleExtensionEvent as EventListener);
    
    // Polling für neue Daten auch nach Initialisierung
    const continuousCheckInterval = setInterval(() => {
      checkLocalStorage();
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleExtensionMessage);
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
    localStorage.removeItem('seo_extension_data');
  };

  return {
    extensionData,
    isFromExtension,
    clearExtensionData,
    hasExtensionData: extensionData !== null
  };
};
