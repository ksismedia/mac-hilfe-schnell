import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { privacyPolicyText } = await req.json();

    if (!privacyPolicyText || typeof privacyPolicyText !== 'string' || privacyPolicyText.trim().length < 50) {
      return new Response(JSON.stringify({ error: 'Bitte fügen Sie einen ausreichend langen Text der Datenschutzerklärung ein (mind. 50 Zeichen).' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Limit text length to avoid token overflow
    const truncatedText = privacyPolicyText.substring(0, 15000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du bist ein deutscher DSGVO-Experte. Analysiere die folgende Datenschutzerklärung und prüfe sie auf Vollständigkeit und DSGVO-Konformität.

Antworte NUR mit einem tool_call im vorgegebenen Schema. Bewerte jeden Punkt mit true (vorhanden/erfüllt) oder false (fehlt/mangelhaft).

Wichtige Prüfpunkte:
- Ist eine vollständige Datenschutzerklärung vorhanden?
- Wird eine Cookie-Richtlinie erwähnt?
- Ist ein Cookie-Consent-Mechanismus beschrieben?
- Werden Betroffenenrechte (Auskunft, Löschung, Widerspruch etc.) aufgeführt?
- Gibt es Hinweise auf Auftragsverarbeitung (AVV)?
- Wird ein Datenschutzbeauftragter benannt?
- Gibt es ein Verarbeitungsverzeichnis oder Hinweise darauf?
- Werden Drittland-Transfers (z.B. USA) erwähnt?
- Ist die Erklärung insgesamt DSGVO-konform?

Gib außerdem eine kurze Zusammenfassung der Stärken und Schwächen.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Hier ist die Datenschutzerklärung:\n\n${truncatedText}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "privacy_policy_analysis",
              description: "Ergebnis der DSGVO-Analyse einer Datenschutzerklärung",
              parameters: {
                type: "object",
                properties: {
                  privacyPolicy: {
                    type: "boolean",
                    description: "Datenschutzerklärung vorhanden und vollständig"
                  },
                  cookiePolicy: {
                    type: "boolean",
                    description: "Cookie-Richtlinie vorhanden"
                  },
                  cookieConsent: {
                    type: "boolean",
                    description: "Cookie-Consent-Mechanismus beschrieben"
                  },
                  gdprCompliant: {
                    type: "boolean",
                    description: "Insgesamt DSGVO-konform"
                  },
                  dataSubjectRights: {
                    type: "boolean",
                    description: "Betroffenenrechte aufgeführt"
                  },
                  dataProcessingAgreement: {
                    type: "boolean",
                    description: "Auftragsverarbeitung (AVV) erwähnt"
                  },
                  dataProtectionOfficer: {
                    type: "boolean",
                    description: "Datenschutzbeauftragter benannt"
                  },
                  processingRegister: {
                    type: "boolean",
                    description: "Verarbeitungsverzeichnis erwähnt oder Hinweise darauf"
                  },
                  thirdCountryTransfer: {
                    type: "boolean",
                    description: "Drittland-Transfers erwähnt"
                  },
                  thirdCountryTransferDetails: {
                    type: "string",
                    description: "Details zu Drittland-Transfers, z.B. welche Länder/Dienste"
                  },
                  detectedTrackingScripts: {
                    type: "array",
                    description: "Im Text erwähnte Tracking-Tools/Scripts",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string", enum: ["analytics", "marketing", "social", "other"] },
                        provider: { type: "string" }
                      },
                      required: ["name", "type"],
                      additionalProperties: false
                    }
                  },
                  detectedExternalServices: {
                    type: "array",
                    description: "Im Text erwähnte externe Dienste/Auftragsverarbeiter",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        purpose: { type: "string" },
                        thirdCountry: { type: "boolean" },
                        country: { type: "string" }
                      },
                      required: ["name", "purpose"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "Kurze Zusammenfassung der Stärken und Schwächen (max 300 Zeichen)"
                  },
                  strengths: {
                    type: "array",
                    description: "Liste der Stärken",
                    items: { type: "string" }
                  },
                  weaknesses: {
                    type: "array",
                    description: "Liste der Schwächen/fehlenden Elemente",
                    items: { type: "string" }
                  }
                },
                required: [
                  "privacyPolicy", "cookiePolicy", "cookieConsent", "gdprCompliant",
                  "dataSubjectRights", "dataProcessingAgreement", "dataProtectionOfficer",
                  "processingRegister", "thirdCountryTransfer", "summary", "strengths", "weaknesses"
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "privacy_policy_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate-Limit erreicht. Bitte versuchen Sie es in einer Minute erneut." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "KI-Kontingent erschöpft. Bitte laden Sie Credits nach." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "KI-Analyse fehlgeschlagen" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await response.json();
    console.log("AI response:", JSON.stringify(aiResult));

    // Extract tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "KI-Antwort konnte nicht verarbeitet werden" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let analysisResult;
    try {
      analysisResult = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments;
    } catch {
      return new Response(JSON.stringify({ error: "KI-Antwort konnte nicht geparst werden" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: analysisResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
