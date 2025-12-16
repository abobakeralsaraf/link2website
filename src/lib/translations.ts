export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // App
    appName: 'PlaceID2Site',
    tagline: 'Transform any Google Maps location into a stunning business website',
    
    // Input section
    inputTitle: 'Enter Business Location',
    inputPlaceholder: 'Paste Google Maps URL or Place ID...',
    generateButton: 'Generate Website',
    generating: 'Generating...',
    
    // Demo
    tryDemo: 'Try Demo',
    demoDescription: 'See how it works with a sample business',
    
    // Errors
    errorInvalidInput: 'Please enter a valid Google Maps URL or Place ID',
    errorFetchFailed: 'Failed to fetch business data. Please try again.',
    errorApiKey: 'API key required. Please configure your Google Places API key.',
    
    // Preview
    previewTitle: 'Generated Website Preview',
    
    // Business sections
    aboutUs: 'About Us',
    businessHours: 'Business Hours',
    location: 'Location',
    photoGallery: 'Photo Gallery',
    customerReviews: 'Customer Reviews',
    getInTouch: 'Get in Touch',
    
    // Days
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Status
    open: 'Open',
    closed: 'Closed',
    openNow: 'Open Now',
    closedNow: 'Closed Now',
    
    // Actions
    call: 'Call',
    whatsapp: 'WhatsApp',
    visitWebsite: 'Visit Website',
    getDirections: 'Get Directions',
    downloadHtml: 'Download HTML',
    shareWebsite: 'Share',
    
    // Reviews
    rating: 'Rating',
    reviews: 'reviews',
    noReviews: 'No reviews yet',
    viewAllReviews: 'View All Reviews',
    
    // Footer
    poweredBy: 'Powered by PlaceID2Site',
    
    // Language
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    
    // Loading
    loading: 'Loading...',
    fetchingData: 'Fetching business data...',
    
    // Success
    websiteGenerated: 'Website generated successfully!',
    copiedToClipboard: 'Copied to clipboard!',
    
    // API Key
    apiKeyTitle: 'Google Places API Key',
    apiKeyDescription: 'Enter your Google Places API key to fetch real business data',
    apiKeyPlaceholder: 'Enter your API key...',
    saveApiKey: 'Save API Key',
  },
  ar: {
    // App
    appName: 'PlaceID2Site',
    tagline: 'حوّل أي موقع على خرائط جوجل إلى موقع أعمال احترافي',
    
    // Input section
    inputTitle: 'أدخل موقع العمل',
    inputPlaceholder: 'الصق رابط خرائط جوجل أو معرف المكان...',
    generateButton: 'إنشاء الموقع',
    generating: 'جارٍ الإنشاء...',
    
    // Demo
    tryDemo: 'جرب العرض التوضيحي',
    demoDescription: 'شاهد كيف يعمل مع عمل نموذجي',
    
    // Errors
    errorInvalidInput: 'يرجى إدخال رابط خرائط جوجل صحيح أو معرف مكان',
    errorFetchFailed: 'فشل في جلب بيانات العمل. يرجى المحاولة مرة أخرى.',
    errorApiKey: 'مطلوب مفتاح API. يرجى تكوين مفتاح Google Places API.',
    
    // Preview
    previewTitle: 'معاينة الموقع المُنشأ',
    
    // Business sections
    aboutUs: 'من نحن',
    businessHours: 'ساعات العمل',
    location: 'الموقع',
    photoGallery: 'معرض الصور',
    customerReviews: 'آراء العملاء',
    getInTouch: 'تواصل معنا',
    
    // Days
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
    sunday: 'الأحد',
    
    // Status
    open: 'مفتوح',
    closed: 'مغلق',
    openNow: 'مفتوح الآن',
    closedNow: 'مغلق الآن',
    
    // Actions
    call: 'اتصل',
    whatsapp: 'واتساب',
    visitWebsite: 'زيارة الموقع',
    getDirections: 'الحصول على الاتجاهات',
    downloadHtml: 'تحميل HTML',
    shareWebsite: 'مشاركة',
    
    // Reviews
    rating: 'التقييم',
    reviews: 'تقييمات',
    noReviews: 'لا توجد تقييمات بعد',
    viewAllReviews: 'عرض جميع التقييمات',
    
    // Footer
    poweredBy: 'مدعوم بواسطة PlaceID2Site',
    
    // Language
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    
    // Loading
    loading: 'جارٍ التحميل...',
    fetchingData: 'جارٍ جلب بيانات العمل...',
    
    // Success
    websiteGenerated: 'تم إنشاء الموقع بنجاح!',
    copiedToClipboard: 'تم النسخ إلى الحافظة!',
    
    // API Key
    apiKeyTitle: 'مفتاح Google Places API',
    apiKeyDescription: 'أدخل مفتاح Google Places API لجلب بيانات الأعمال الحقيقية',
    apiKeyPlaceholder: 'أدخل مفتاح API...',
    saveApiKey: 'حفظ مفتاح API',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
