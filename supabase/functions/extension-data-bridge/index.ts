import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const body = await req.json();
  const { action, sessionId, data } = body;

    if (action === 'store') {
      // Store extension data with session ID
      const timestamp = Date.now();
      const storageKey = `extension_${sessionId}`;
      
      // Use Supabase to store data temporarily (will expire in 5 minutes)
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Store in a simple key-value table
      const { error } = await supabase
        .from('extension_data_temp')
        .upsert({
          session_id: sessionId,
          data: data,
          created_at: new Date().toISOString(),
          expires_at: new Date(timestamp + 5 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, sessionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'retrieve') {
      // Retrieve extension data by session ID
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: result, error } = await supabase
        .from('extension_data_temp')
        .select('data')
        .eq('session_id', sessionId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !result) {
        return new Response(
          JSON.stringify({ success: false, error: 'Data not found or expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Delete after retrieval
      await supabase
        .from('extension_data_temp')
        .delete()
        .eq('session_id', sessionId);

      return new Response(
        JSON.stringify({ success: true, data: result.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'retrieve-latest') {
      // Retrieve the latest extension data (within last 5 minutes)
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const { data: results, error } = await supabase
        .from('extension_data_temp')
        .select('*')
        .gte('created_at', fiveMinutesAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (!results || results.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Keine aktuellen Daten gefunden' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      const extensionData = results[0];

      // Delete after retrieval
      await supabase
        .from('extension_data_temp')
        .delete()
        .eq('id', extensionData.id);

      return new Response(
        JSON.stringify({ success: true, data: extensionData.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
