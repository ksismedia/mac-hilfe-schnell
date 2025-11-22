import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlacesRequest {
  query: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query }: PlacesRequest = await req.json();
    
    // Input validation
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (query.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Query exceeds maximum length of 500 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
    if (!GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    console.log('Fetching place details for:', query);

    // Step 1: Find the place and get place_id
    const findPlaceResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`
    );

    if (!findPlaceResponse.ok) {
      throw new Error(`Google API error: ${findPlaceResponse.status}`);
    }

    const findPlaceData = await findPlaceResponse.json();
    
    if (!findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      return new Response(
        JSON.stringify({ candidates: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const placeId = findPlaceData.candidates[0].place_id;
    console.log('Found place_id:', placeId);

    // Step 2: Get detailed place information including reviews
    const detailsResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,rating,user_ratings_total,opening_hours,website,formatted_phone_number,reviews,geometry&key=${GOOGLE_API_KEY}`
    );

    if (!detailsResponse.ok) {
      throw new Error(`Google API error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();
    
    // Format the response to match the expected structure
    const data = {
      candidates: detailsData.result ? [detailsData.result] : []
    };
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in google-places-proxy:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
