import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch site data from public_sites view
    const { data: site, error: fetchError } = await supabase
      .from("public_sites")
      .select("site_name, business_data, custom_domain")
      .eq("slug", slug)
      .maybeSingle();

    if (fetchError || !site) {
      console.error("Error fetching site:", fetchError);
      return new Response(JSON.stringify({ error: "Site not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const businessData = site.business_data as any;
    const siteName = site.site_name || businessData?.name || "موقع تجاري";
    const description = businessData?.description || businessData?.formatted_address || "اكتشف خدماتنا ومنتجاتنا";
    
    // Get the first photo as hero image
    const photos = businessData?.photos || [];
    const heroImage = photos.length > 0 
      ? photos[0] 
      : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop";

    // Determine the site URL
    const siteUrl = site.custom_domain 
      ? `https://${site.custom_domain}`
      : `https://abobakeralsaraf.com/site/${slug}`;

    console.log("Generating OG meta for:", { siteName, description, heroImage, siteUrl });

    return new Response(
      JSON.stringify({
        title: siteName,
        description: description,
        image: heroImage,
        url: siteUrl,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in og-meta function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
