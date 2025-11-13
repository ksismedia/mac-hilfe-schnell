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
    const { query } = await req.json();
    const apiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!apiKey) {
      console.error('GOOGLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for place:', query);

    // Step 1: Find Place from Text
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Google Places search failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Google Places search failed' }),
        { status: searchResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    
    if (!searchData?.candidates?.length) {
      console.log('No place found for query:', query);
      return new Response(
        JSON.stringify({ result: null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placeId = searchData.candidates[0].place_id;
    console.log('Found place_id:', placeId);

    // Step 2: Get Place Details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,formatted_address,website,formatted_phone_number,types,business_status&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('Google Places details failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Google Places details failed' }),
        { status: detailsResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const detailsData = await detailsResponse.json();
    console.log('Place details retrieved successfully');

    return new Response(
      JSON.stringify(detailsData.result || null),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-places-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
