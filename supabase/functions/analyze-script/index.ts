import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scriptText } = await req.json();
    
    if (!scriptText) {
      return new Response(
        JSON.stringify({ error: 'Script text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit script to first 30000 characters to avoid token limits
    const limitedScript = scriptText.substring(0, 30000);

    const systemPrompt = `You are a professional film script analyst. Analyze screenplays and extract detailed scene breakdowns. Return ONLY valid JSON arrays with no additional text, explanations, or markdown formatting.`;

    const userPrompt = `Analyze this screenplay and extract each scene with the following structure. Return a JSON array of scene objects.

SCRIPT:
${limitedScript}

For each scene, extract:
- scene_number (number, starting from 1)
- heading (brief scene heading, max 80 chars)
- location_type (INT or EXT)
- specific_location (location name, max 50 chars)
- time_of_day (DAY/NIGHT/EVENING/MORNING/etc)
- characters_present (comma-separated character names)
- speaking_roles (comma-separated speaking character names)
- extras (brief extras description)
- functional_props (key props list)
- decorative_props (decorative items)
- camera_movement (camera description)
- framing (shot framing)
- lighting (lighting description)
- lighting_mood (lighting mood)
- diegetic_sounds (sounds in scene)
- scene_mood (emotional mood)
- emotional_arc (emotion progression)
- primary_action (main action, max 100 chars)
- pacing (scene pacing)
- shoot_type (interior/exterior/mixed)
- content (scene dialogue and action summary, max 500 chars)

Return ONLY the JSON array, no explanations.`;

    console.log('Calling Lovable AI Gateway for script analysis...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI service request failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    let rawText = result?.choices?.[0]?.message?.content;
    
    if (!rawText) {
      console.error('No content returned from AI');
      return new Response(
        JSON.stringify({ error: 'No content returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up response - remove markdown code blocks if present
    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    rawText = rawText.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    
    let scenes;
    try {
      scenes = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', rawText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!Array.isArray(scenes)) {
      console.error('Invalid response format from AI - not an array');
      return new Response(
        JSON.stringify({ error: 'Invalid response format from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully analyzed script, found ${scenes.length} scenes`);
    
    return new Response(
      JSON.stringify({ scenes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-script function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});