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
    const { hostname } = await req.json();
    
    // Input validation
    if (!hostname || typeof hostname !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Hostname is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate hostname format (allow domain names, not IPs or special chars)
    const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!hostnameRegex.test(hostname) || hostname.length > 253) {
      return new Response(
        JSON.stringify({ error: 'Invalid hostname format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking SSL for hostname:', hostname);

    // Start SSL Labs analysis
    const analyzeResponse = await fetch(
      `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(hostname)}&publish=off&startNew=on&all=done`,
      { headers: { 'User-Agent': 'Handwerk-Stars-Analyzer' } }
    );

    if (!analyzeResponse.ok) {
      throw new Error(`SSL Labs API error: ${analyzeResponse.status}`);
    }

    let result = await analyzeResponse.json();
    console.log('Initial SSL Labs response:', result);

    // Poll for results (SSL Labs takes time to analyze)
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (result.status !== 'READY' && result.status !== 'ERROR' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const pollResponse = await fetch(
        `https://api.ssllabs.com/api/v3/analyze?host=${encodeURIComponent(hostname)}&publish=off&all=done`,
        { headers: { 'User-Agent': 'Handwerk-Stars-Analyzer' } }
      );
      
      result = await pollResponse.json();
      console.log(`Poll attempt ${attempts + 1}:`, result.status);
      attempts++;
    }

    if (result.status === 'ERROR') {
      console.error('SSL Labs analysis error:', result);
      return new Response(
        JSON.stringify({ 
          error: 'SSL analysis failed',
          details: result.statusMessage || 'Unknown error'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract relevant data
    const endpoint = result.endpoints?.[0];
    const grade = endpoint?.grade || 'Unknown';
    const hasSSL = result.protocol === 'https' || result.endpoints?.length > 0;
    
    const details = {
      grade,
      hasSSL,
      protocol: result.protocol,
      hasCertificate: endpoint?.details?.cert !== undefined,
      certificateValid: endpoint?.details?.cert?.notAfter ? new Date(endpoint.details.cert.notAfter) > new Date() : false,
      supportsHTTPS: endpoint?.details?.protocols?.some((p: any) => p.name === 'TLS') || false,
      hasHSTS: endpoint?.details?.hstsPolicy?.status === 'present',
      vulnerabilities: endpoint?.details?.vulnBeast || endpoint?.details?.poodle || endpoint?.details?.heartbleed,
      chainIssues: endpoint?.details?.certChains?.[0]?.issues || 0,
    };

    console.log('SSL check completed:', details);

    return new Response(
      JSON.stringify({ success: true, data: details }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-ssl function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
