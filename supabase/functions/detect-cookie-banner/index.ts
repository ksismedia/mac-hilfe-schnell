import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Checking cookie banner for:', url);

    // Fetch the webpage HTML
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const htmlLower = html.toLowerCase();

    // Common cookie banner patterns to search for
    const patterns = {
      // CSS classes and IDs
      classIds: [
        'cookie-banner', 'cookie-consent', 'cookie-notice', 'cookie-bar',
        'gdpr-banner', 'gdpr-consent', 'gdpr-notice',
        'consent-banner', 'consent-manager', 'consent-modal',
        'cookiealert', 'cookiebar', 'cookienotice',
        'cc-window', 'cc-banner', // CookieConsent by Osano
        'optanon', 'onetrust', // OneTrust
        'cookiebot', // Cookiebot
        'usercentrics', // Usercentrics
        'borlabs-cookie', // Borlabs Cookie
        'cmplz', 'complianz', // Complianz
        'cookie_consent', 'cookie-consent-banner',
        'privacy-banner', 'privacy-consent'
      ],
      
      // JavaScript libraries and platforms
      scripts: [
        'cookiebot', 'onetrust', 'usercentrics', 'iubenda',
        'quantcast', 'evidon', 'trustarc', 'cookiepro',
        'cookie-script', 'cookieconsent', 'klaro',
        'termly', 'osano', 'axeptio', 'didomi'
      ],
      
      // Text patterns (multilingual)
      textPatterns: [
        // German
        'cookie', 'cookies akzeptieren', 'cookies zulassen',
        'einwilligung', 'datenschutzeinstellungen', 'cookie-einstellungen',
        'diese website verwendet cookies', 'wir verwenden cookies',
        'cookie-richtlinie', 'zustimmen', 'ablehnen',
        // English
        'accept cookies', 'cookie consent', 'cookie settings',
        'this website uses cookies', 'we use cookies',
        'cookie policy', 'accept all', 'reject all',
        'manage cookies', 'privacy preferences'
      ]
    };

    let hasConsentBanner = false;
    let detectionMethod = '';
    let detectedPlatform = '';

    // Method 1: Check for common CSS classes and IDs
    for (const pattern of patterns.classIds) {
      const regex = new RegExp(`(class|id)=["'][^"']*${pattern}[^"']*["']`, 'i');
      if (regex.test(html)) {
        hasConsentBanner = true;
        detectionMethod = 'CSS class/ID';
        detectedPlatform = pattern;
        break;
      }
    }

    // Method 2: Check for known cookie consent scripts
    if (!hasConsentBanner) {
      for (const script of patterns.scripts) {
        if (htmlLower.includes(script)) {
          hasConsentBanner = true;
          detectionMethod = 'JavaScript library';
          detectedPlatform = script;
          break;
        }
      }
    }

    // Method 3: Check for cookie-related text patterns
    if (!hasConsentBanner) {
      let textMatches = 0;
      for (const textPattern of patterns.textPatterns) {
        if (htmlLower.includes(textPattern)) {
          textMatches++;
          if (textMatches >= 2) { // Require at least 2 matches to reduce false positives
            hasConsentBanner = true;
            detectionMethod = 'Text content';
            detectedPlatform = 'Generic cookie text detected';
            break;
          }
        }
      }
    }

    // Method 4: Check for data attributes commonly used by consent managers
    const dataAttributes = [
      'data-cookieconsent', 'data-cookie-consent', 'data-gdpr',
      'data-consent', 'data-privacy'
    ];
    if (!hasConsentBanner) {
      for (const attr of dataAttributes) {
        if (htmlLower.includes(attr)) {
          hasConsentBanner = true;
          detectionMethod = 'Data attribute';
          detectedPlatform = attr;
          break;
        }
      }
    }

    console.log(`Cookie banner detection result: ${hasConsentBanner}`);
    if (hasConsentBanner) {
      console.log(`Detection method: ${detectionMethod}, Platform: ${detectedPlatform}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          hasConsentBanner,
          detectionMethod: hasConsentBanner ? detectionMethod : null,
          detectedPlatform: hasConsentBanner ? detectedPlatform : null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error detecting cookie banner:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: {
          hasConsentBanner: false,
          detectionMethod: null,
          detectedPlatform: null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
