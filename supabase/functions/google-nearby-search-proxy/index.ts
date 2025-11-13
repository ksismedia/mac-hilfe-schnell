import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radius, businessType, userApiKey } = await req.json();
    const apiKey = userApiKey || Deno.env.get('GOOGLE_API_KEY');

    if (!apiKey) {
      console.error('No API key available');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lat || !lng || !radius || !businessType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: lat, lng, radius, businessType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching nearby businesses:', { lat, lng, radius, businessType }, '(using', userApiKey ? 'user' : 'server', 'API key)');

    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(businessType)}&key=${apiKey}`;
    
    const response = await fetch(nearbyUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nearby Search API failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Nearby Search API failed' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (data?.status !== 'OK' && data?.status !== 'ZERO_RESULTS') {
      console.error('Nearby Search API error status:', data.status);
      return new Response(
        JSON.stringify({ error: `API returned status: ${data.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Nearby search completed, found:', data.results?.length || 0, 'places');

    return new Response(
      JSON.stringify({ results: data.results || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-nearby-search-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
