
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

    console.log('Starting AI analysis...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Faster model for quicker responses
        messages: [
          {
            role: 'system',
            content: `You are an expert environmental scientist and waste management specialist. Analyze the image quickly and provide comprehensive eco-friendly information about the object.

IMPORTANT: Return your response as a JSON object with this EXACT structure:
{
  "objectName": "string - specific name of the object (e.g., 'Plastic Water Bottle', 'Glass Mason Jar')",
  "classification": "string - must be exactly one of: reusable, recyclable, non-recyclable",
  "confidence": number - confidence percentage (0-100),
  "materials": ["array of specific material types with recycling codes if applicable"],
  "environmentalImpact": {
    "carbonFootprint": "string - exactly one of: Very Low, Low, Medium, High, Very High",
    "recyclability": "string - exactly one of: Very Low, Low, Medium, High, Very High",
    "biodegradability": "string - exactly one of: Never, Very Low, Low, Medium, High, Very High"
  },
  "disposalTips": ["array of 3-4 specific disposal instructions"],
  "reuseSuggestions": ["array of 3-4 creative reuse ideas"],
  "educationalFacts": ["array of 3-4 interesting environmental facts about this specific item type"]
}

Focus on accuracy, practical advice, and detailed information. Be specific about materials and recycling codes where applicable.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image for waste classification and comprehensive environmental impact information. Provide detailed, actionable eco-friendly advice.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'low' // Use low detail for faster processing
                }
              }
            ]
          }
        ],
        max_tokens: 800, // Reduced for faster response
        temperature: 0.1, // Lower temperature for more consistent results
        top_p: 0.9
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    console.log('AI analysis completed successfully');

    let analysisResult;
    try {
      const content = data.choices[0].message.content;
      console.log('Raw AI response:', content);
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      // Enhanced fallback response
      const content = data.choices[0].message.content || '';
      analysisResult = {
        objectName: 'Detected Item',
        classification: 'non-recyclable',
        confidence: 75,
        materials: ['Unknown Material'],
        environmentalImpact: {
          carbonFootprint: 'Medium',
          recyclability: 'Medium',
          biodegradability: 'Low'
        },
        disposalTips: [
          'Check local waste disposal guidelines',
          'Consider if item can be repaired or repurposed',
          'Look for specialized recycling programs',
          'Dispose of responsibly at waste management facility'
        ],
        reuseSuggestions: [
          'Consider creative repurposing projects',
          'Use for storage or organization',
          'Transform into decorative items',
          'Repurpose for gardening activities'
        ],
        educationalFacts: [
          'Many items have hidden recycling potential',
          'Proper disposal prevents environmental contamination',
          'Reusing items reduces manufacturing demand',
          content.substring(0, 150) + '...'
        ]
      };
    }

    // Validate required fields
    if (!analysisResult.objectName) analysisResult.objectName = 'Detected Item';
    if (!['reusable', 'recyclable', 'non-recyclable'].includes(analysisResult.classification)) {
      analysisResult.classification = 'non-recyclable';
    }
    if (!analysisResult.confidence || analysisResult.confidence < 0 || analysisResult.confidence > 100) {
      analysisResult.confidence = 75;
    }

    console.log('Returning analysis result:', analysisResult.objectName);

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
