import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { url } = await req.json();
    
    // Input validation
    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ error: 'URL is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure URL has protocol
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    console.log('Checking security headers for URL:', validUrl);

    // Fetch the URL to check headers
    const response = await fetch(validUrl, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'Handwerk-Stars-Security-Analyzer' },
      redirect: 'follow'
    });

    const headers = response.headers;
    
    const result = {
      score: 0,
      grade: 'F',
      url: validUrl,
      headers: {
        'Content-Security-Policy': { 
          present: headers.has('content-security-policy'),
          value: headers.get('content-security-policy') 
        },
        'X-Frame-Options': { 
          present: headers.has('x-frame-options'),
          value: headers.get('x-frame-options')
        },
        'X-Content-Type-Options': { 
          present: headers.has('x-content-type-options'),
          value: headers.get('x-content-type-options')
        },
        'Strict-Transport-Security': { 
          present: headers.has('strict-transport-security'),
          value: headers.get('strict-transport-security')
        },
        'Referrer-Policy': { 
          present: headers.has('referrer-policy'),
          value: headers.get('referrer-policy')
        }
      }
    };

    // Calculate score based on present headers
    const presentHeaders = Object.values(result.headers).filter(h => h.present).length;
    result.score = Math.round((presentHeaders / 5) * 100);
    
    if (result.score >= 90) result.grade = 'A';
    else if (result.score >= 70) result.grade = 'B';
    else if (result.score >= 50) result.grade = 'C';
    else if (result.score >= 30) result.grade = 'D';
    else result.grade = 'F';

    console.log('Security headers check completed:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-security-headers function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
