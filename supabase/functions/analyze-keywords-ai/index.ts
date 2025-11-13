import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KeywordRequest {
  websiteContent: string;
  industry: string;
  url: string;
}

interface Keyword {
  keyword: string;
  found: boolean;
  volume: number;
  position: number;
  relevance: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteContent, industry, url }: KeywordRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing keywords for industry:", industry);

    // Branchenspezifische Kontext-Informationen
    const industryContext: { [key: string]: string } = {
      shk: "Sanitär, Heizung, Klima - Handwerksbetrieb für Installation, Wartung und Reparatur von Heizungs-, Sanitär- und Klimaanlagen",
      maler: "Maler & Lackierer - Handwerksbetrieb für Innen- und Außenanstriche, Fassadengestaltung, Lackierarbeiten",
      elektriker: "Elektroinstallation - Handwerksbetrieb für Elektroinstallationen, Elektronik, Smart Home",
      dachdecker: "Dachdeckerei - Handwerksbetrieb für Dacheindeckung, Dachsanierung, Flachdach",
      stukateur: "Stuckateur & Trockenbau - Handwerksbetrieb für Innenausbau, Trockenbau, Stuck",
      planungsbuero: "Planungsbüro - Dienstleistung für Architektur, Planung, Bauleitung",
      "facility-management": "Facility-Management - Dienstleistung für Gebäudeverwaltung, Reinigung, Wartung",
      holzverarbeitung: "Holzverarbeitung - Handwerksbetrieb für Schreinerei, Zimmerei, Möbelbau",
    };

    const systemPrompt = `Du bist ein SEO-Experte für Handwerksbetriebe. Analysiere den Website-Inhalt und identifiziere die wichtigsten Keywords für die Branche: ${industryContext[industry] || industry}.

WICHTIG:
- Prüfe NUR Keywords, die TATSÄCHLICH im Website-Content vorkommen
- Bewerte die Relevanz jedes Keywords für die Branche (1-100)
- Schätze das monatliche Suchvolumen realistisch
- Gib auch die Position/Häufigkeit des Keywords auf der Seite an (1-100, wobei 1 = sehr prominent)

Analysiere diese Kategorien:
1. Hauptdienstleistungen (z.B. "Heizungsinstallation", "Badezimmer", "Notdienst")
2. Standort-Keywords (z.B. Stadtname + Dienstleistung)
3. Produktmarken/Technologien (falls erwähnt)
4. Qualifikationen (z.B. "Meisterbetrieb", "Fachbetrieb")

Antworte NUR mit einem JSON-Array von maximal 15 Keywords im Format:
{
  "keywords": [
    {
      "keyword": "exaktes Keyword",
      "found": true/false,
      "volume": geschätztes monatliches Suchvolumen,
      "position": 1-100 (Prominenz),
      "relevance": 1-100 (Branchenrelevanz)
    }
  ]
}`;

    const userPrompt = `Website: ${url}

Website-Inhalt (erste 3000 Zeichen):
${websiteContent.substring(0, 3000)}

Analysiere diesen Inhalt und identifiziere die wichtigsten Keywords für einen ${industryContext[industry] || industry} Betrieb.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Niedrigere Temperatur für konsistentere Ergebnisse
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;
    
    console.log("AI Response:", aiResponse);
    
    // Remove markdown code block wrapper if present
    if (aiResponse.includes('```json')) {
      aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      console.log("Cleaned AI Response:", aiResponse);
    }
    
    let keywords: Keyword[];
    try {
      const parsed = JSON.parse(aiResponse);
      keywords = parsed.keywords || [];
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Problematic response:", aiResponse);
      throw new Error("Invalid AI response format");
    }

    // Validierung und Normalisierung
    keywords = keywords
      .filter((kw) => kw.keyword && typeof kw.keyword === "string")
      .map((kw) => ({
        keyword: kw.keyword.trim(),
        found: Boolean(kw.found),
        volume: Math.max(0, Math.min(10000, Number(kw.volume) || 100)),
        position: Math.max(1, Math.min(100, Number(kw.position) || 50)),
        relevance: Math.max(1, Math.min(100, Number(kw.relevance) || 50)),
      }))
      .slice(0, 15); // Maximal 15 Keywords

    console.log("Processed keywords:", keywords.length);

    return new Response(
      JSON.stringify({ keywords }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-keywords-ai function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        keywords: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
