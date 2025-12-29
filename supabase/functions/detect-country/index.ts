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
    // Get the client's IP address from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || '';

    console.log('Detecting country for IP:', clientIp);

    // Use ip-api.com for geolocation (free tier, no API key needed)
    const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,countryCode,country`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data');
    }

    const data = await response.json();
    console.log('Geolocation response:', data);

    if (data.status === 'success') {
      return new Response(
        JSON.stringify({
          countryCode: data.countryCode,
          country: data.country,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      // Fallback to default if geolocation fails
      return new Response(
        JSON.stringify({
          countryCode: 'EG',
          country: 'Egypt',
          fallback: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error('Error detecting country:', error);
    
    // Return default country on error
    return new Response(
      JSON.stringify({
        countryCode: 'EG',
        country: 'Egypt',
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});
