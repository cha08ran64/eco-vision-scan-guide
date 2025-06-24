
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert environmental scientist and waste management specialist. Analyze the image and provide detailed eco-friendly information about the object. 

Return your response as a JSON object with this exact structure:
{
  "objectName": "string - name of the object",
  "classification": "string - must be one of: reusable, recyclable, non-recyclable",
  "confidence": number - confidence percentage (0-100),
  "materials": ["array of material types"],
  "environmentalImpact": {
    "carbonFootprint": "string - Low/Medium/High",
    "recyclability": "string - Very Low/Low/Medium/High/Very High",
    "biodegradability": "string - Never/Very Low/Low/Medium/High/Very High"
  },
  "disposalTips": ["array of disposal instructions"],
  "reuseSuggestions": ["array of reuse ideas"],
  "educationalFacts": ["array of environmental facts about this item"]
}

Focus on accuracy and provide practical, actionable advice.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for waste classification and environmental impact. Provide detailed eco-friendly information.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      const content = data.choices[0].message.content;
      analysisResult = {
        objectName: 'Detected Object',
        classification: 'non-recyclable',
        confidence: 75,
        materials: ['Unknown Material'],
        environmentalImpact: {
          carbonFootprint: 'Medium',
          recyclability: 'Medium',
          biodegradability: 'Low'
        },
        disposalTips: ['Check local disposal guidelines'],
        reuseSuggestions: ['Consider creative repurposing'],
        educationalFacts: [content.substring(0, 200) + '...']
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-image function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze image', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
