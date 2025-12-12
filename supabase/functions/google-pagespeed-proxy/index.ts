import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PageSpeedRequest {
  url: string;
  strategy?: 'mobile' | 'desktop';
  timeout?: number;
}

// Simple in-memory cache for PageSpeed results (lasts until function cold start)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, strategy = 'mobile', timeout = 30000 }: PageSpeedRequest = await req.json();
    
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

    // Check cache first
    const cacheKey = `${url}_${strategy}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log('Returning cached PageSpeed result for:', url);
      return new Response(
        JSON.stringify({ ...cached.data, _cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching PageSpeed Insights for:', url, '(timeout:', timeout, 'ms)');

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Request only essential categories to speed up response
      const response = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&category=performance&key=${GOOGLE_API_KEY}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google API error:', response.status, errorText);
        throw new Error(`Google API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store in cache
      cache.set(cacheKey, { data, timestamp: Date.now() });
      console.log('PageSpeed data cached for:', url);
      
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('PageSpeed request timed out for:', url);
        return new Response(
          JSON.stringify({ 
            error: 'Request timed out - PageSpeed analysis takes too long',
            timeout: true,
            lighthouseResult: {
              categories: {
                performance: { score: null }
              },
              audits: {}
            }
          }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error in google-pagespeed-proxy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
