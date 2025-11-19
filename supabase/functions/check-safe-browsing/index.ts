import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SafeBrowsingRequest {
  url: string;
}

interface ThreatMatch {
  threatType: string;
  platformType: string;
  threat: { url: string };
  cacheDuration: string;
  threatEntryType: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url }: SafeBrowsingRequest = await req.json();
    
    // Input validation
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (url.length > 2048) {
      return new Response(
        JSON.stringify({ error: 'URL exceeds maximum length of 2048 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    console.log('Checking Safe Browsing status for:', url);

    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: {
            clientId: 'lovable-website-analyzer',
            clientVersion: '1.0.0',
          },
          threatInfo: {
            threatTypes: [
              'MALWARE',
              'SOCIAL_ENGINEERING',
              'UNWANTED_SOFTWARE',
              'POTENTIALLY_HARMFUL_APPLICATION',
            ],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url }],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Safe Browsing API error:', response.status, errorText);
      throw new Error(`Safe Browsing API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the response
    const result = {
      url,
      isSafe: !data.matches || data.matches.length === 0,
      threats: data.matches ? data.matches.map((match: ThreatMatch) => ({
        type: match.threatType,
        platform: match.platformType,
        description: getThreatDescription(match.threatType),
      })) : [],
      checkedAt: new Date().toISOString(),
    };
    
    console.log('Safe Browsing check result:', result.isSafe ? 'SAFE' : 'THREATS FOUND');
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in check-safe-browsing:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isSafe: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getThreatDescription(threatType: string): string {
  const descriptions: Record<string, string> = {
    'MALWARE': 'Die Website enthält oder verbreitet möglicherweise Schadsoftware',
    'SOCIAL_ENGINEERING': 'Die Website versucht möglicherweise, Besucher zu täuschen (Phishing)',
    'UNWANTED_SOFTWARE': 'Die Website bietet möglicherweise unerwünschte Software an',
    'POTENTIALLY_HARMFUL_APPLICATION': 'Die Website enthält potenziell schädliche Anwendungen',
  };
  return descriptions[threatType] || 'Unbekannte Bedrohung erkannt';
}
