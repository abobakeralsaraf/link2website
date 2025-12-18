import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// User agents for social media crawlers
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'LinkedInBot',
  'Pinterest',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'vkShare',
  'Googlebot',
  'bingbot',
];

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return CRAWLER_USER_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );
}

function generateOGHtml(data: {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName: string;
}): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <meta name="description" content="${data.description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${data.url}">
  <meta property="og:title" content="${data.title}">
  <meta property="og:description" content="${data.description}">
  <meta property="og:image" content="${data.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${data.siteName}">
  <meta property="og:locale" content="ar_SA">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${data.url}">
  <meta name="twitter:title" content="${data.title}">
  <meta name="twitter:description" content="${data.description}">
  <meta name="twitter:image" content="${data.image}">
  
  <!-- WhatsApp specific -->
  <meta property="og:image:secure_url" content="${data.image}">
  
  <!-- Redirect to actual site after a short delay for real users -->
  <meta http-equiv="refresh" content="0;url=${data.url}">
</head>
<body>
  <h1>${data.title}</h1>
  <p>${data.description}</p>
  <p>Redirecting to <a href="${data.url}">${data.url}</a>...</p>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const customDomain = url.searchParams.get("domain");
    const userAgent = req.headers.get("user-agent");
    const returnHtml = url.searchParams.get("html") === "true" || isCrawler(userAgent);

    console.log("OG Meta request:", { slug, customDomain, userAgent, returnHtml });

    if (!slug && !customDomain) {
      return new Response(JSON.stringify({ error: "Missing slug or domain parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build query based on slug or custom domain
    let query = supabase
      .from("public_sites")
      .select("site_name, business_data, custom_domain, slug");

    if (customDomain) {
      // Search by custom domain
      query = query.eq("custom_domain", customDomain);
    } else if (slug) {
      // Search by slug
      query = query.eq("slug", slug);
    }

    const { data: site, error: fetchError } = await query.maybeSingle();

    if (fetchError) {
      console.error("Error fetching site:", fetchError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!site) {
      console.log("Site not found for:", { slug, customDomain });
      return new Response(JSON.stringify({ error: "Site not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const businessData = site.business_data as any;
    const siteName = site.site_name || businessData?.name || "موقع تجاري";
    
    // Build a good description from available data
    let description = "";
    if (businessData?.description) {
      description = businessData.description;
    } else if (businessData?.formatted_address) {
      description = `${siteName} - ${businessData.formatted_address}`;
    } else if (businessData?.types?.length > 0) {
      description = `${siteName} - ${businessData.types.slice(0, 3).join(", ")}`;
    } else {
      description = `اكتشف ${siteName} - خدماتنا ومنتجاتنا المميزة`;
    }

    // Get the first photo as hero image
    const photos = businessData?.photos || [];
    const heroImage = photos.length > 0 
      ? photos[0] 
      : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop";

    // Determine the site URL
    const siteUrl = site.custom_domain 
      ? `https://${site.custom_domain}`
      : `https://abobakeralsaraf.com/site/${site.slug}`;

    console.log("Generated OG meta:", { siteName, description: description.substring(0, 50), heroImage, siteUrl });

    const ogData = {
      title: siteName,
      description: description.substring(0, 160), // Limit to 160 chars for SEO
      image: heroImage,
      url: siteUrl,
      siteName: siteName,
    };

    // Return HTML for crawlers, JSON for API calls
    if (returnHtml) {
      return new Response(generateOGHtml(ogData), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return new Response(JSON.stringify(ogData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in og-meta function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
