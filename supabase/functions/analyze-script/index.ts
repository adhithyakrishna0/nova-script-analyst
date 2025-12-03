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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;
    
    // Limit script to first 30000 characters to avoid token limits
    const limitedScript = scriptText.substring(0, 30000);

    const prompt = `CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON - no explanations, no markdown, no code blocks
2. Keep ALL field values SHORT (max 80 characters each)
3. Replace double quotes in content with single quotes
4. Be concise and direct

SCRIPT TO ANALYZE:
${limitedScript}

Return a JSON array with these fields for each scene (keep brief):
- scene_number: number
- heading: brief scene heading
- location_type: INT or EXT
- specific_location: location name
- time_of_day: DAY/NIGHT/EVENING/etc
- characters_present: character names only
- speaking_roles: speaking character names
- extras: extras description
- functional_props: key props list
- decorative_props: decorative items
- camera_movement: camera description
- framing: shot framing
- lighting: lighting description
- lighting_mood: lighting mood
- diegetic_sounds: sounds in scene
- scene_mood: emotional mood
- emotional_arc: emotion progression
- primary_action: main action
- pacing: scene pacing
- shoot_type: interior/exterior/etc
- content: scene dialogue and action (use single quotes only)`;

    console.log('Calling Gemini API for script analysis...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service request failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    let rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) {
      console.error('No content returned from Gemini AI');
      return new Response(
        JSON.stringify({ error: 'No content returned from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clean up response
    rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    
    const scenes = JSON.parse(rawText);
    
    if (!Array.isArray(scenes)) {
      console.error('Invalid response format from AI');
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
