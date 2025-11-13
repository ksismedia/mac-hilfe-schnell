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
    const { url, userApiKey } = await req.json();
    
    if (!url) {
      throw new Error('URL is required');
    }

    // Use user's API key if provided, otherwise use server key
    const apiKey = userApiKey || Deno.env.get('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('No API key available');
    }

    console.log('Checking accessibility for URL:', url, '(using', userApiKey ? 'user' : 'server', 'API key)');

    // Use Google PageSpeed Insights API (free, includes Lighthouse accessibility audit)
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=accessibility&key=${apiKey}`;
    
    // Retry logic for rate limiting with longer delays
    let response;
    let retries = 3;
    let delay = 5000; // Start with 5 seconds

    for (let i = 0; i < retries; i++) {
      response = await fetch(apiUrl);
      
      if (response.ok) {
        break;
      }
      
      if (response.status === 429 && i < retries - 1) {
        console.log(`Rate limited, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 3; // Triple the delay each time (5s, 15s, 45s)
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`PageSpeed API error: ${response.status}`);
      }
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
