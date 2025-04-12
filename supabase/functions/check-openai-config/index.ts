
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { isValidApiKey, initOpenAI, makeOpenAIRequest } from '../lib/openai.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API key from environment
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          configured: false,
          valid: false,
          error: "API key not configured"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate API key format
    const valid = isValidApiKey(apiKey);
    
    if (!valid) {
      return new Response(
        JSON.stringify({
          configured: true,
          valid: false,
          error: "Invalid API key format"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Test API key with a simple request
    const openai = initOpenAI(apiKey);
    await makeOpenAIRequest(apiKey, async () => {
      return await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: "test" }],
        max_tokens: 1
      });
    });

    return new Response(
      JSON.stringify({
        configured: true,
        valid: true,
        models: ["gpt-4", "gpt-3.5-turbo"]
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in check-openai-config function:", error);
    return new Response(
      JSON.stringify({
        configured: true,
        valid: false,
        error: error.message || "Failed to validate API key"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
