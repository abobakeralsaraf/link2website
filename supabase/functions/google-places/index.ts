import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');

// Allowed domains for URL validation
const ALLOWED_DOMAINS = [
  'google.com',
  'google.co',
  'maps.google.com',
  'www.google.com',
  'maps.app.goo.gl',
  'goo.gl',
];

// Input validation constants
const MAX_INPUT_LENGTH = 2000;
const VALID_PLACE_ID_PATTERN = /^ChIJ[a-zA-Z0-9_-]{20,}$/;

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

// Generic error codes for client responses (no internal details)
const ERROR_CODES = {
  INVALID_INPUT: { code: 'INVALID_INPUT', message: 'Invalid input provided. Please enter a valid Google Maps URL or Place ID.' },
  PLACE_NOT_FOUND: { code: 'PLACE_NOT_FOUND', message: 'Could not find the business. Please try with a different URL.' },
  SERVICE_ERROR: { code: 'SERVICE_ERROR', message: 'Service temporarily unavailable. Please try again later.' },
  CONFIG_ERROR: { code: 'CONFIG_ERROR', message: 'Service configuration error. Please contact support.' },
  INVALID_URL: { code: 'INVALID_URL', message: 'Invalid URL format. Please use a valid Google Maps URL.' },
  INVALID_DOMAIN: { code: 'INVALID_DOMAIN', message: 'URL must be from Google Maps. Please copy the URL directly from Google Maps.' },
};

// Validate URL is from allowed Google domains only
function isAllowedDomain(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Must be HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    // Check against allowed domains
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Validate Place ID format
function isValidPlaceId(id: string): boolean {
  return VALID_PLACE_ID_PATTERN.test(id);
}

// Sanitize input string
function sanitizeInput(input: string): string {
  return input.trim().slice(0, MAX_INPUT_LENGTH);
}

// Resolve shortened Google Maps URL with domain validation
async function resolveShortUrl(shortUrl: string): Promise<string> {
  console.log('[INFO] Resolving short URL');
  
  // Validate the short URL domain first
  if (!isAllowedDomain(shortUrl)) {
    throw new Error('INVALID_DOMAIN');
  }
  
  try {
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'follow',
    });
    
    const resolvedUrl = response.url;
    
    // Validate the resolved URL domain
    if (!isAllowedDomain(resolvedUrl)) {
      console.error('[SECURITY] Redirect led to non-allowed domain');
      throw new Error('INVALID_DOMAIN');
    }
    
    console.log('[INFO] URL resolved successfully');
    return resolvedUrl;
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_DOMAIN') {
      throw error;
    }
    console.error('[ERROR] Failed to resolve URL');
    throw new Error('INVALID_URL');
  }
}

// Extract Place ID from various Google Maps URL formats
function extractPlaceId(url: string): { placeId: string | null; searchQuery: string | null } {
  console.log('[INFO] Extracting Place ID');
  
  // Direct Place ID format (starts with ChIJ - valid for new API)
  if (isValidPlaceId(url)) {
    console.log('[INFO] Valid Place ID format detected');
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
    if (match && match[1]) {
      const extractedId = decodeURIComponent(match[1]);
      if (isValidPlaceId(extractedId)) {
        console.log('[INFO] Valid Place ID extracted from URL');
        return { placeId: extractedId, searchQuery: null };
      }
    }
  }

  // Extract search query from URL for Text Search fallback
  let searchQuery: string | null = null;
  
  // Try to get from 'q' parameter (business name + address)
  const qMatch = url.match(/[?&]q=([^&]+)/);
  if (qMatch) {
    searchQuery = decodeURIComponent(qMatch[1].replace(/\+/g, ' ')).slice(0, 200);
    console.log('[INFO] Search query extracted from q param');
  }
  
  // Try to get from /place/ path
  if (!searchQuery) {
    const placeMatch = url.match(/\/place\/([^\/\@\?]+)/);
    if (placeMatch) {
      searchQuery = decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')).slice(0, 200);
      console.log('[INFO] Search query extracted from place path');
    }
  }

  // If we found ftid but no valid ChIJ place ID, we need to use search
  const ftidMatch = url.match(/ftid=([^&]+)/);
  if (ftidMatch) {
    console.log('[INFO] ftid found (requires search fallback)');
    return { placeId: null, searchQuery };
  }

  return { placeId: null, searchQuery };
}

// Search for place by text query (fallback)
async function searchPlace(query: string): Promise<string | null> {
  console.log('[INFO] Searching for place by query');
  
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

  if (!response.ok) {
    console.error('[ERROR] Places search failed with status:', response.status);
    return null;
  }

  const data = await response.json();

  if (data.places && data.places.length > 0) {
    console.log('[INFO] Place found via search');
    return data.places[0].id;
  }
  
  console.log('[INFO] No places found for query');
  return null;
}

// Fetch place details using Google Places API (New)
async function fetchPlaceDetails(placeId: string): Promise<PlaceDetails> {
  console.log('[INFO] Fetching place details');

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
    console.error('[ERROR] Places API request failed with status:', response.status);
    throw new Error('PLACE_NOT_FOUND');
  }

  const data = await response.json();
  console.log('[INFO] Place details fetched successfully');

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
      console.log('[INFO] Arabic data fetched successfully');
    }
  } catch {
    console.log('[INFO] Arabic data not available');
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

  // Process reviews - sanitize to remove email addresses and PII
  // Match Arabic reviews by author name instead of index for accurate data
  const reviews: Review[] = [];
  if (data.reviews && Array.isArray(data.reviews)) {
    const arabicReviews = dataAr?.reviews || [];
    
    // إنشاء خريطة للتقييمات العربية بالاسم لمطابقة دقيقة
    const arabicReviewsMap = new Map<string, typeof arabicReviews[0]>();
    for (const arReview of arabicReviews) {
      const authorName = arReview.authorAttribution?.displayName;
      if (authorName) {
        arabicReviewsMap.set(authorName, arReview);
      }
    }
    console.log(`[INFO] Arabic reviews map created with ${arabicReviewsMap.size} entries`);
    
    // Sanitize review text to remove potential email addresses and phone numbers
    const sanitizeText = (text: string) => {
      if (!text) return '';
      return text
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[email]')
        .replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[phone]');
    };
    
    for (let i = 0; i < Math.min(10, data.reviews.length); i++) {
      const review = data.reviews[i];
      const authorName = review.authorAttribution?.displayName || 'Anonymous';
      
      // مطابقة التقييم العربي بالاسم وليس الفهرس
      const arReview = arabicReviewsMap.get(authorName);
      
      reviews.push({
        authorName: authorName,
        authorPhoto: review.authorAttribution?.photoUri || undefined,
        rating: review.rating || 5,
        text: sanitizeText(review.text?.text || ''),
        textAr: arReview?.text?.text ? sanitizeText(arReview.text.text) : undefined,
        time: review.publishTime || new Date().toISOString(),
        relativeTime: review.relativePublishTimeDescription || '',
      });
    }
    console.log(`[INFO] Processed ${reviews.length} reviews`);
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
    console.log('[INFO] Google Places function called');

    if (!GOOGLE_API_KEY) {
      console.error('[ERROR] API key not configured');
      return new Response(
        JSON.stringify({ error: ERROR_CODES.CONFIG_ERROR.message, code: ERROR_CODES.CONFIG_ERROR.code }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const rawInput = body?.input;

    // Input validation
    if (!rawInput || typeof rawInput !== 'string') {
      console.log('[WARN] Invalid input type received');
      return new Response(
        JSON.stringify({ error: ERROR_CODES.INVALID_INPUT.message, code: ERROR_CODES.INVALID_INPUT.code }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and validate input length
    const input = sanitizeInput(rawInput);
    
    if (input.length === 0) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.INVALID_INPUT.message, code: ERROR_CODES.INVALID_INPUT.code }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let placeId: string | null = null;
    let searchQuery: string | null = null;
    let resolvedUrl = input;

    // Check if input is a URL
    const isUrl = input.startsWith('http://') || input.startsWith('https://');
    
    if (isUrl) {
      // Validate URL domain
      if (!isAllowedDomain(input)) {
        console.log('[WARN] URL from non-allowed domain');
        return new Response(
          JSON.stringify({ error: ERROR_CODES.INVALID_DOMAIN.message, code: ERROR_CODES.INVALID_DOMAIN.code }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if it's a shortened URL that needs resolving
      if (input.includes('maps.app.goo.gl') || input.includes('goo.gl/maps')) {
        try {
          resolvedUrl = await resolveShortUrl(input);
        } catch (error) {
          const errorCode = error instanceof Error && error.message === 'INVALID_DOMAIN' 
            ? ERROR_CODES.INVALID_DOMAIN 
            : ERROR_CODES.INVALID_URL;
          return new Response(
            JSON.stringify({ error: errorCode.message, code: errorCode.code }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    } else if (!isValidPlaceId(input)) {
      // If not a URL and not a valid Place ID, reject
      console.log('[WARN] Input is neither valid URL nor Place ID');
      return new Response(
        JSON.stringify({ error: ERROR_CODES.INVALID_INPUT.message, code: ERROR_CODES.INVALID_INPUT.code }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to extract Place ID from URL
    const extracted = extractPlaceId(resolvedUrl);
    placeId = extracted.placeId;
    searchQuery = extracted.searchQuery;

    // If no valid Place ID found but we have a search query, use Text Search
    if (!placeId && searchQuery) {
      console.log('[INFO] Using Text Search fallback');
      placeId = await searchPlace(searchQuery);
    }

    // If still no Place ID and input is a direct ChIJ format
    if (!placeId && isValidPlaceId(resolvedUrl)) {
      placeId = resolvedUrl;
    }

    if (!placeId) {
      return new Response(
        JSON.stringify({ error: ERROR_CODES.PLACE_NOT_FOUND.message, code: ERROR_CODES.PLACE_NOT_FOUND.code }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Final validation of Place ID format
    if (!isValidPlaceId(placeId)) {
      console.log('[WARN] Extracted Place ID failed validation');
      return new Response(
        JSON.stringify({ error: ERROR_CODES.PLACE_NOT_FOUND.message, code: ERROR_CODES.PLACE_NOT_FOUND.code }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch place details
    const placeDetails = await fetchPlaceDetails(placeId);
    console.log('[INFO] Request completed successfully');

    return new Response(
      JSON.stringify({ data: placeDetails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    // Log detailed error server-side only
    console.error('[ERROR] Function error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return generic error to client
    const errorCode = error instanceof Error && error.message in ERROR_CODES
      ? ERROR_CODES[error.message as keyof typeof ERROR_CODES]
      : ERROR_CODES.SERVICE_ERROR;
    
    return new Response(
      JSON.stringify({ error: errorCode.message, code: errorCode.code }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
