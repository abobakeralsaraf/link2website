export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // App
    appName: 'PlaceID2Site',
    tagline: 'Generate professional websites for your clients from Google Maps data',
    
    // Admin Navigation
    navDashboard: 'Dashboard',
    navGenerator: 'Generate Site',
    
    // Admin Hero
    adminBadge: 'Website Generator Tool',
    adminTitle: 'Generate Client Websites from Google Maps',
    adminSubtitle: 'This tool generates individual websites for your clients based on their Google Maps Place IDs and business data. Enter a Place ID or Google Maps URL to get started.',
    adminCta: 'Start Generating',
    
    // Features
    featureGenerate: 'Auto-Generate Sites',
    featureGenerateDesc: 'Create beautiful websites instantly from any Google Maps listing.',
    featureData: 'Real Google Data',
    featureDataDesc: 'Pull reviews, photos, hours, and contact info directly from Google.',
    featureTemplate: 'Professional Templates',
    featureTemplateDesc: 'Each generated site includes hero, reviews, gallery, and contact sections.',
    
    // Input section
    inputTitle: 'Enter Client Business Location',
    inputPlaceholder: 'Paste Google Maps URL or Place ID...',
    generateButton: 'Generate Client Website',
    generating: 'Generating...',
    
    // Demo
    tryDemo: 'Try Demo',
    demoDescription: 'See how it works with a sample business',
    
    // Errors
    errorTitle: 'Error',
    errorInvalidInput: 'Please enter a valid Google Maps URL or Place ID',
    errorFetchFailed: 'Failed to fetch business data. Please try again.',
    errorApiKey: 'API key required. Please configure your Google Places API key.',
    
    // Navigation
    generateAnother: 'Generate another client site',
    
    // Preview
    previewTitle: 'Generated Client Website Preview',
    
    // Client Site Sections (used in generated websites)
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
    
    // Actions (for client sites)
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
    
    // Footer (for client sites)
    poweredBy: 'Powered by PlaceID2Site',
    
    // Language
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    
    // Loading
    loading: 'Loading...',
    fetchingData: 'Fetching business data...',
    
    // Success
    websiteGenerated: 'Client website generated successfully!',
    copiedToClipboard: 'Copied to clipboard!',
    
    // API Key
    apiKeyTitle: 'Google Places API Key',
    apiKeyDescription: 'Enter your Google Places API key to fetch real business data',
    apiKeyPlaceholder: 'Enter your API key...',
    saveApiKey: 'Save API Key',
    
    // WhatsApp (for client sites - uses dynamic data)
    whatsappGreeting: 'Hello! I found your business and would like to know more.',
  },
  ar: {
    // App
    appName: 'PlaceID2Site',
    tagline: 'أنشئ مواقع احترافية لعملائك من بيانات خرائط جوجل',
    
    // Admin Navigation
    navDashboard: 'لوحة التحكم',
    navGenerator: 'إنشاء موقع',
    
    // Admin Hero
    adminBadge: 'أداة إنشاء المواقع',
    adminTitle: 'أنشئ مواقع العملاء من خرائط جوجل',
    adminSubtitle: 'هذه الأداة تنشئ مواقع فردية لعملائك بناءً على معرّفات أماكن خرائط جوجل وبيانات أعمالهم. أدخل معرّف المكان أو رابط خرائط جوجل للبدء.',
    adminCta: 'ابدأ الإنشاء',
    
    // Features
    featureGenerate: 'إنشاء تلقائي',
    featureGenerateDesc: 'أنشئ مواقع جميلة فوراً من أي قائمة على خرائط جوجل.',
    featureData: 'بيانات جوجل الحقيقية',
    featureDataDesc: 'استخرج التقييمات والصور وساعات العمل ومعلومات الاتصال مباشرة.',
    featureTemplate: 'قوالب احترافية',
    featureTemplateDesc: 'كل موقع يتضمن قسم البطل والتقييمات والمعرض والاتصال.',
    
    // Input section
    inputTitle: 'أدخل موقع عمل العميل',
    inputPlaceholder: 'الصق رابط خرائط جوجل أو معرف المكان...',
    generateButton: 'إنشاء موقع العميل',
    generating: 'جارٍ الإنشاء...',
    
    // Demo
    tryDemo: 'جرب العرض التوضيحي',
    demoDescription: 'شاهد كيف يعمل مع عمل نموذجي',
    
    // Errors
    errorTitle: 'خطأ',
    errorInvalidInput: 'يرجى إدخال رابط خرائط جوجل صحيح أو معرف مكان',
    errorFetchFailed: 'فشل في جلب بيانات العمل. يرجى المحاولة مرة أخرى.',
    errorApiKey: 'مطلوب مفتاح API. يرجى تكوين مفتاح Google Places API.',
    
    // Navigation
    generateAnother: 'إنشاء موقع عميل آخر',
    
    // Preview
    previewTitle: 'معاينة موقع العميل المُنشأ',
    
    // Client Site Sections
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
    websiteGenerated: 'تم إنشاء موقع العميل بنجاح!',
    copiedToClipboard: 'تم النسخ إلى الحافظة!',
    
    // API Key
    apiKeyTitle: 'مفتاح Google Places API',
    apiKeyDescription: 'أدخل مفتاح Google Places API لجلب بيانات الأعمال الحقيقية',
    apiKeyPlaceholder: 'أدخل مفتاح API...',
    saveApiKey: 'حفظ مفتاح API',
    
    // WhatsApp
    whatsappGreeting: 'مرحباً! وجدت نشاطك التجاري وأود معرفة المزيد.',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
