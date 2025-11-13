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
    const { url, apiKey } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    console.log('Checking accessibility for URL:', url, apiKey ? '(with API key)' : '(without API key)');

    // Use Google PageSpeed Insights API - with optional API key
    let apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=accessibility`;
    
    // Add API key if provided by client
    if (apiKey) {
      apiUrl += `&key=${apiKey}`;
      console.log('Using API key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));
    } else {
      console.log('No API key provided - using free tier');
    }
    
    console.log('Fetching from PageSpeed API...');
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PageSpeed API error:', response.status, errorText);
      console.error('API URL used:', apiUrl.replace(/key=[^&]+/, 'key=***')); // Log URL without exposing key
      
      if (response.status === 403) {
        let errorMessage = 'Google PageSpeed Insights API Fehler (403): ';
        
        // Try to parse the error response for more details
        try {
          const errorData = JSON.parse(errorText);
          console.error('Error details:', errorData);
          
          if (errorData.error?.message) {
            errorMessage += errorData.error.message;
          } else {
            errorMessage += 'API nicht aktiviert oder ungültiger Key.';
          }
        } catch {
          errorMessage += 'API nicht aktiviert oder ungültiger Key.';
        }
        
        errorMessage += '\n\nBitte überprüfen Sie:\n';
        errorMessage += '1. PageSpeed Insights API ist aktiviert: https://console.developers.google.com/apis/api/pagespeedonline.googleapis.com\n';
        errorMessage += '2. Billing-Konto ist verknüpft: https://console.cloud.google.com/billing\n';
        errorMessage += '3. API-Key hat die richtigen Berechtigungen\n';
        errorMessage += '4. API-Key-Einschränkungen (IP, Referrer) sind korrekt konfiguriert';
        
        throw new Error(errorMessage);
      }
      
      if (response.status === 429) {
        throw new Error('PageSpeed API Rate Limit erreicht. Bitte warten Sie einige Minuten oder erhöhen Sie Ihr Quota in der Google Cloud Console.');
      }
      
      throw new Error(`PageSpeed API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('PageSpeed Insights response received');

    // Extract Lighthouse accessibility data
    const lighthouseResult = result.lighthouseResult;
    const accessibilityScore = lighthouseResult?.categories?.accessibility?.score || 0;
    const audits = lighthouseResult?.audits || {};

    // Extract violations from failed audits
    const violations = [];
    const passes = [];
    
    for (const [auditId, audit] of Object.entries(audits)) {
      const auditData = audit as any;
      
      // Skip non-accessibility audits
      if (!auditData.score && auditData.score !== 0) continue;
      
      if (auditData.score < 1) {
        // Failed audit = violation
        violations.push({
          id: auditId,
          impact: auditData.scoreDisplayMode === 'binary' ? 'serious' : 'moderate',
          description: auditData.title || 'Unknown issue',
          help: auditData.description || '',
          helpUrl: auditData.helpUrl || `https://web.dev/${auditId}`,
          wcagLevel: 'AA', // Most Lighthouse checks are AA
          wcagCriterion: auditId,
          legalRelevance: auditData.scoreDisplayMode === 'binary' ? 'high' : 'medium',
          nodes: auditData.details?.items?.slice(0, 3).map((item: any) => ({
            html: item.node?.snippet || item.snippet || '',
            target: [item.node?.selector || auditId],
            failureSummary: item.node?.explanation || auditData.title || ''
          })) || []
        });
      } else {
        // Passed audit
        passes.push({
          id: auditId,
          description: auditData.title || '',
          wcagLevel: 'AA'
        });
      }
    }

    // Calculate final score (Lighthouse gives 0-1, we want 0-100)
    const score = Math.round(accessibilityScore * 100);

    // Determine WCAG level
    let wcagLevel: 'A' | 'AA' | 'AAA' | 'partial' | 'failing';
    if (score >= 95) wcagLevel = 'AA';
    else if (score >= 80) wcagLevel = 'A';
    else if (score >= 50) wcagLevel = 'partial';
    else wcagLevel = 'failing';

    const data = {
      score,
      wcagLevel,
      violations,
      passes,
      incomplete: [], // Lighthouse doesn't provide incomplete items
      lighthouseVersion: lighthouseResult?.lighthouseVersion,
      fetchTime: lighthouseResult?.fetchTime,
      checkedWithRealAPI: true
    };

    console.log('Accessibility check completed:', {
      score,
      violationsCount: violations.length,
      passesCount: passes.length
    });

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-accessibility function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
