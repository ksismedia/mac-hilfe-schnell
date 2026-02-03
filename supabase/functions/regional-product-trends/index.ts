import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrendRequest {
  industry: string;
  region: string;
  companyName?: string;
}

interface ProductTrend {
  trend: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
  source?: string;
}

interface TrendResponse {
  trends: ProductTrend[];
  summary: string;
  generatedAt: string;
  region: string;
  industry: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!PERPLEXITY_API_KEY) {
      console.error('PERPLEXITY_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Perplexity API-Key nicht konfiguriert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, region, companyName }: TrendRequest = await req.json();
    
    console.log(`Fetching regional product trends for industry: ${industry}, region: ${region}`);

    if (!industry || !region) {
      return new Response(
        JSON.stringify({ error: 'Branche und Region sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the search query for regional product trends
    const searchQuery = buildSearchQuery(industry, region);
    console.log('Search query:', searchQuery);

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `Du bist ein Marktanalyst für die ${industry}-Branche in Deutschland. Analysiere aktuelle Produkttrends und Marktentwicklungen speziell für die Region ${region}. Antworte auf Deutsch und strukturiert.`
          },
          {
            role: 'user',
            content: searchQuery
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      
      if (perplexityResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate-Limit erreicht. Bitte später erneut versuchen.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Fehler bei der Perplexity API-Anfrage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await perplexityResponse.json();
    console.log('Perplexity response received');

    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Parse the response into structured trends
    const trends = parseTrendsFromResponse(content, citations);
    
    const response: TrendResponse = {
      trends,
      summary: extractSummary(content),
      generatedAt: new Date().toISOString(),
      region,
      industry,
    };

    console.log(`Successfully parsed ${trends.length} trends`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in regional-product-trends function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildSearchQuery(industry: string, region: string): string {
  // Map industry to more specific search terms
  const industryTerms: Record<string, string> = {
    'SHK': 'Sanitär Heizung Klima SHK-Branche Wärmepumpen Photovoltaik Badezimmer',
    'Elektro': 'Elektrotechnik Elektroinstallation Smart Home E-Mobilität Ladeinfrastruktur',
    'Handwerk': 'Handwerk Baugewerbe Renovierung Sanierung Modernisierung',
    'Bau': 'Baubranche Hochbau Tiefbau Bauwirtschaft Bautrends',
    'Maler': 'Malerhandwerk Farbgestaltung Wärmedämmung WDVS Fassadensanierung',
    'Dachdecker': 'Dachdeckerhandwerk Dachsanierung Solardach Flachdach Steildach',
    'Tischler': 'Tischlerhandwerk Möbelbau Innenausbau Holzverarbeitung',
    'Metallbau': 'Metallbau Stahlbau Schweißtechnik Schlosser',
    'KFZ': 'KFZ-Werkstatt Autoservice E-Mobilität Fahrzeugtechnik',
  };

  const searchTerms = industryTerms[industry] || industry;

  return `Was sind die aktuellen Produkttrends und Marktentwicklungen in der ${searchTerms} Branche speziell für die Region ${region} in Deutschland? 

Berücksichtige:
1. Aktuelle Nachfrage-Trends (z.B. Wärmepumpen, Photovoltaik, Smart Home)
2. Regionale Besonderheiten und Förderprogramme
3. Neue Technologien und Produkte
4. Kundenpräferenzen in der Region
5. Wettbewerbssituation

Strukturiere die Antwort mit konkreten Trends, ihrer Relevanz (hoch/mittel/niedrig) und kurzen Beschreibungen.`;
}

function parseTrendsFromResponse(content: string, citations: string[]): ProductTrend[] {
  const trends: ProductTrend[] = [];
  
  // Split by common delimiters that might indicate separate trends
  const lines = content.split(/\n/);
  let currentTrend: Partial<ProductTrend> | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check if this is a new trend (starts with number, bullet, or bold marker)
    const trendMatch = trimmedLine.match(/^(?:\d+[\.\)]|\*|•|-|#{1,3})\s*\**(.+?)\**(?::|$)/);
    
    if (trendMatch) {
      // Save previous trend if exists
      if (currentTrend && currentTrend.trend) {
        trends.push({
          trend: currentTrend.trend,
          description: currentTrend.description || '',
          relevance: determineRelevance(currentTrend.description || ''),
          source: citations[0] || undefined,
        });
      }
      
      // Start new trend
      currentTrend = {
        trend: trendMatch[1].replace(/\*\*/g, '').trim(),
        description: '',
      };
    } else if (currentTrend) {
      // Add to current trend description
      currentTrend.description = (currentTrend.description || '') + ' ' + trimmedLine;
    }
  }
  
  // Don't forget the last trend
  if (currentTrend && currentTrend.trend) {
    trends.push({
      trend: currentTrend.trend,
      description: (currentTrend.description || '').trim(),
      relevance: determineRelevance(currentTrend.description || ''),
      source: citations[0] || undefined,
    });
  }
  
  // If no structured trends found, create a single trend from the content
  if (trends.length === 0 && content.length > 50) {
    trends.push({
      trend: 'Marktübersicht',
      description: content.substring(0, 500),
      relevance: 'medium',
    });
  }
  
  return trends.slice(0, 8); // Limit to 8 trends
}

function determineRelevance(text: string): 'high' | 'medium' | 'low' {
  const highKeywords = ['stark', 'hoch', 'wächst', 'trend', 'nachfrage', 'boom', 'förderung', 'wärmepumpe', 'photovoltaik', 'solar'];
  const lowKeywords = ['rückläufig', 'sinkt', 'weniger', 'stagniert', 'gering'];
  
  const lowerText = text.toLowerCase();
  
  if (highKeywords.some(kw => lowerText.includes(kw))) {
    return 'high';
  }
  if (lowKeywords.some(kw => lowerText.includes(kw))) {
    return 'low';
  }
  return 'medium';
}

function extractSummary(content: string): string {
  // Extract first 2-3 sentences as summary
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 2).join('. ').trim() + '.';
}
