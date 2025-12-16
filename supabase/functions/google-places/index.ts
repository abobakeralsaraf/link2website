import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

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
function extractPlaceId(url: string): string | null {
  console.log('Extracting Place ID from:', url);
  
  // Direct Place ID format (starts with ChIJ)
  if (url.startsWith('ChIJ') || url.startsWith('0x')) {
    return url;
  }

  // Try to extract from URL patterns
  const patterns = [
    /place_id[=:]([^&\s]+)/i,
    /!1s([^!]+)/,
    /data=[^!]*!1s([^!]+)/,
    /\/place\/[^\/]+\/@[^\/]+\/data=[^!]*!3m1!4b1!4m[^!]*!3m[^!]*!1s([^!]+)/,
    /ftid=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      console.log('Found Place ID:', match[1]);
      return decodeURIComponent(match[1]);
    }
  }

  // Try to extract from CID (Customer ID)
  const cidMatch = url.match(/cid=(\d+)/);
  if (cidMatch) {
    console.log('Found CID:', cidMatch[1]);
    return `cid:${cidMatch[1]}`;
  }

  console.log('No Place ID found in URL');
  return null;
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
    let resolvedUrl = input.trim();

    // Check if it's a shortened URL that needs resolving
    if (resolvedUrl.includes('maps.app.goo.gl') || resolvedUrl.includes('goo.gl/maps')) {
      resolvedUrl = await resolveShortUrl(resolvedUrl);
    }

    // Try to extract Place ID from URL
    placeId = extractPlaceId(resolvedUrl);

    // If no Place ID found and it looks like a URL, try to extract a search query
    if (!placeId && resolvedUrl.includes('google.com/maps')) {
      // Extract place name from URL for search
      const placeMatch = resolvedUrl.match(/\/place\/([^\/\@]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        console.log('Extracted place name:', placeName);
        placeId = await searchPlace(placeName);
      }
    }

    // If still no Place ID and input is not a URL, treat it as a direct Place ID
    if (!placeId && !resolvedUrl.includes('http')) {
      placeId = resolvedUrl;
    }

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: 'Could not extract Place ID from the provided URL. Please try with a different URL format or provide the Place ID directly.' }),
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
