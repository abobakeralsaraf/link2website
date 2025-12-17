import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

interface PlaceDetails {
  placeId: string;
  name: string;
  nameAr?: string;
  address: string;
  addressAr?: string;
  phone?: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  photos: string[];
  reviews: Review[];
  hours?: BusinessHours;
  location: { lat: number; lng: number };
  types?: string[];
  priceLevel?: number;
  isOpen?: boolean;
}

interface Review {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  textAr?: string;
  time: string;
  relativeTime: string;
}

interface BusinessHours {
  periods: { day: number; open: string; close: string }[];
  weekdayText: string[];
  weekdayTextAr?: string[];
  isOpenNow?: boolean;
}

// Resolve shortened Google Maps URL to get the actual URL
async function resolveShortUrl(shortUrl: string): Promise<string> {
  console.log('Resolving short URL:', shortUrl);
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });
    const resolvedUrl = response.url;
    console.log('Resolved URL:', resolvedUrl);
    return resolvedUrl;
  } catch (error) {
    console.error('Error resolving URL:', error);
    throw new Error('Failed to resolve shortened URL');
  }
}

// Extract Place ID from various Google Maps URL formats
function extractPlaceId(url: string): { placeId: string | null; searchQuery: string | null } {
  console.log('Extracting Place ID from:', url);
  
  // Direct Place ID format (starts with ChIJ - valid for new API)
  if (url.startsWith('ChIJ')) {
    return { placeId: url, searchQuery: null };
  }

  // Try to extract valid Place ID from URL patterns (only ChIJ format is valid)
  const validPatterns = [
    /place_id[=:]([^&\s]+)/i,
    /!1s(ChIJ[^!]+)/,
    /data=[^!]*!1s(ChIJ[^!]+)/,
  ];

  for (const pattern of validPatterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].startsWith('ChIJ')) {
      console.log('Found valid Place ID:', match[1]);
      return { placeId: decodeURIComponent(match[1]), searchQuery: null };
    }
  }

  // Extract search query from URL for Text Search fallback
  let searchQuery: string | null = null;
  
  // Try to get from 'q' parameter (business name + address)
  const qMatch = url.match(/[?&]q=([^&]+)/);
  if (qMatch) {
    searchQuery = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
    console.log('Found search query from q param:', searchQuery);
  }
  
  // Try to get from /place/ path
  if (!searchQuery) {
    const placeMatch = url.match(/\/place\/([^\/\@\?]+)/);
    if (placeMatch) {
      searchQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      console.log('Found search query from place path:', searchQuery);
    }
  }

  // If we found ftid but no valid ChIJ place ID, we need to use search
  const ftidMatch = url.match(/ftid=([^&]+)/);
  if (ftidMatch) {
    console.log('Found ftid (not valid for new API):', ftidMatch[1]);
    // ftid is not valid for new Places API, must use search
    return { placeId: null, searchQuery };
  }

  console.log('No valid Place ID found, search query:', searchQuery);
  return { placeId: null, searchQuery };
}

// Search for place by text query (fallback)
async function searchPlace(query: string): Promise<string | null> {
  console.log('Searching for place:', query);
  
  const searchUrl = `https://places.googleapis.com/v1/places:searchText`;
  
  const response = await fetch(searchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName',
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 1,
    }),
  });

  const data = await response.json();
  console.log('Search response:', JSON.stringify(data));

  if (data.places && data.places.length > 0) {
    return data.places[0].id;
  }
  
  return null;
}

// Fetch place details using Google Places API (New)
async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  console.log('Fetching place details for:', placeId);

  const fields = [
    'id',
    'displayName',
    'formattedAddress',
    'internationalPhoneNumber',
    'nationalPhoneNumber',
    'websiteUri',
    'rating',
    'userRatingCount',
    'photos',
    'reviews',
    'regularOpeningHours',
    'currentOpeningHours',
    'location',
    'types',
    'priceLevel',
  ].join(',');

  const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Goog-Api-Key': GOOGLE_API_KEY!,
      'X-Goog-FieldMask': fields,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Places API error:', response.status, errorText);
    throw new Error(`Places API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Place details response:', JSON.stringify(data).substring(0, 500));

  // Also fetch Arabic version
  const urlAr = `https://places.googleapis.com/v1/places/${placeId}?languageCode=ar`;
  let dataAr: any = null;
  
  try {
    const responseAr = await fetch(urlAr, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY!,
        'X-Goog-FieldMask': 'displayName,formattedAddress,regularOpeningHours,reviews',
      },
    });
    if (responseAr.ok) {
      dataAr = await responseAr.json();
      console.log('Arabic data fetched successfully');
    }
  } catch (e) {
    console.log('Could not fetch Arabic data:', e);
  }

  // Process photos
  const photos: string[] = [];
  if (data.photos && Array.isArray(data.photos)) {
    for (const photo of data.photos.slice(0, 10)) {
      if (photo.name) {
        const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_API_KEY}`;
        photos.push(photoUrl);
      }
    }
  }

  // Process reviews
  const reviews: Review[] = [];
  if (data.reviews && Array.isArray(data.reviews)) {
    const arabicReviews = dataAr?.reviews || [];
    
    for (let i = 0; i < Math.min(5, data.reviews.length); i++) {
      const review = data.reviews[i];
      const arReview = arabicReviews[i];
      
      reviews.push({
        authorName: review.authorAttribution?.displayName || 'Anonymous',
        authorPhoto: review.authorAttribution?.photoUri || undefined,
        rating: review.rating || 5,
        text: review.text?.text || '',
        textAr: arReview?.text?.text || undefined,
        time: review.publishTime || new Date().toISOString(),
        relativeTime: review.relativePublishTimeDescription || '',
      });
    }
  }

  // Process hours
  let hours: BusinessHours | undefined;
  if (data.regularOpeningHours) {
    const openingHours = data.regularOpeningHours;
    const arOpeningHours = dataAr?.regularOpeningHours;
    
    const periods: { day: number; open: string; close: string }[] = [];
    if (openingHours.periods) {
      for (const period of openingHours.periods) {
        periods.push({
          day: period.open?.day || 0,
          open: `${String(period.open?.hour || 0).padStart(2, '0')}:${String(period.open?.minute || 0).padStart(2, '0')}`,
          close: `${String(period.close?.hour || 0).padStart(2, '0')}:${String(period.close?.minute || 0).padStart(2, '0')}`,
        });
      }
    }

    hours = {
      periods,
      weekdayText: openingHours.weekdayDescriptions || [],
      weekdayTextAr: arOpeningHours?.weekdayDescriptions || [],
      isOpenNow: data.currentOpeningHours?.openNow,
    };
  }

  const placeDetails: PlaceDetails = {
    placeId: data.id || placeId,
    name: data.displayName?.text || 'Unknown Business',
    nameAr: dataAr?.displayName?.text || undefined,
    address: data.formattedAddress || '',
    addressAr: dataAr?.formattedAddress || undefined,
    phone: data.internationalPhoneNumber || data.nationalPhoneNumber || undefined,
    website: data.websiteUri || undefined,
    rating: data.rating,
    totalReviews: data.userRatingCount,
    photos,
    reviews,
    hours,
    location: {
      lat: data.location?.latitude || 0,
      lng: data.location?.longitude || 0,
    },
    types: data.types,
    priceLevel: typeof data.priceLevel === 'string' 
      ? ['PRICE_LEVEL_FREE', 'PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE', 'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'].indexOf(data.priceLevel)
      : data.priceLevel,
    isOpen: data.currentOpeningHours?.openNow,
  };

  return placeDetails;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    if (!GOOGLE_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Google Places API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { input } = await req.json();
    console.log('Received input:', input);

    if (!input || typeof input !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid input. Please provide a Google Maps URL or Place ID.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let placeId: string | null = null;
    let searchQuery: string | null = null;
    let resolvedUrl = input.trim();

    // Check if it's a shortened URL that needs resolving
    if (resolvedUrl.includes('maps.app.goo.gl') || resolvedUrl.includes('goo.gl/maps')) {
      resolvedUrl = await resolveShortUrl(resolvedUrl);
    }

    // Try to extract Place ID from URL
    const extracted = extractPlaceId(resolvedUrl);
    placeId = extracted.placeId;
    searchQuery = extracted.searchQuery;

    // If no valid Place ID found but we have a search query, use Text Search
    if (!placeId && searchQuery) {
      console.log('No valid Place ID, using Text Search with:', searchQuery);
      placeId = await searchPlace(searchQuery);
    }

    // If still no Place ID and input is a direct ChIJ format
    if (!placeId && !resolvedUrl.includes('http') && resolvedUrl.startsWith('ChIJ')) {
      placeId = resolvedUrl;
    }

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'Could not find the business. Please try with a different URL or check that the business exists on Google Maps.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch place details
    const placeDetails = await fetchPlaceDetails(placeId);

    return new Response(
      JSON.stringify({ data: placeDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in google-places function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while fetching place data';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
