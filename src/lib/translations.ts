export type Language = 'en' | 'ar';

export const translations = {
  en: {
    // App
    appName: 'Saroara Builder',
    tagline: 'Generate professional websites for your clients from Google Maps data',
    
    // Admin Navigation
    navDashboard: 'Dashboard',
    navGenerator: 'Generate Site',
    navGeneratedSites: 'Generated Sites',
    
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
    saveSite: 'Save Site',
    
    // Reviews
    rating: 'Rating',
    reviews: 'reviews',
    noReviews: 'No reviews yet',
    viewAllReviews: 'View All Reviews',
    
    // Footer (for client sites)
    poweredBy: 'Powered by Saroara Builder',
    
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
    siteSaved: 'Site saved successfully!',
    
    // API Key
    apiKeyTitle: 'Google Places API Key',
    apiKeyDescription: 'Enter your Google Places API key to fetch real business data',
    apiKeyPlaceholder: 'Enter your API key...',
    saveApiKey: 'Save API Key',
    
    // WhatsApp (for client sites - uses dynamic data)
    whatsappGreeting: 'Hello! I found your business and would like to know more.',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    email: 'Email',
    emailPlaceholder: 'Enter your email...',
    password: 'Password',
    passwordPlaceholder: 'Enter your password...',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name...',
    authDescription: 'Sign in to manage your generated websites',
    accountCreated: 'Account created successfully!',
    welcomeMessage: 'Welcome to Saroara Builder!',
    orContinueWith: 'Or continue with',
    continueWithGoogle: 'Continue with Google',
    signOut: 'Sign Out',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    adminDashboardDescription: 'Manage all sites and users from here',
    clientDashboardDescription: 'Manage your generated websites',
    generateNewSite: 'Generate New Site',
    generateNewSiteDesc: 'Create a new website from Google Maps data',
    startGenerating: 'Start Generating',
    mySites: 'My Sites',
    mySitesDesc: 'View and manage your generated websites',
    viewSites: 'View Sites',
    manageUsers: 'Manage Users',
    manageUsersDesc: 'View and manage all registered users',
    viewUsers: 'View Users',
    dashboard: 'Dashboard',
    
    // Generated Sites Admin
    generatedSites: 'Generated Sites',
    generatedSitesDescription: 'Manage all your generated client websites from here.',
    noSitesYet: 'No sites generated yet',
    noSitesDescription: 'Generate your first client website to see it here.',
    siteName: 'Site Name',
    slug: 'Slug',
    status: 'Status',
    customDomain: 'Custom Domain',
    createdAt: 'Created',
    openSite: 'Open Site',
    markPublished: 'Mark as Published',
    readyForDomain: 'Ready for Domain',
    delete: 'Delete',
    statusDraft: 'Draft',
    statusPublished: 'Published',
    statusReadyForDomain: 'Ready for Domain',
    
    // Stats
    totalSites: 'Total Sites',
    publishedCount: 'Published',
    withDomain: 'With Domain',
    totalUsers: 'Users',
    
    // Filters
    filterByStatus: 'Status:',
    filterByOwner: 'Owner:',
    allStatuses: 'All',
    allUsers: 'All Users',
    owner: 'Owner',
    
    // Domain
    subdomainFree: 'Subdomain (Free)',
    customDomainOption: 'Custom Domain',
    instantActivation: 'Instant Activation!',
    subdomainInstant: 'Subdomain works instantly without DNS configuration',
    subdomainName: 'Subdomain Name',
    siteUrl: 'Site URL:',
    activateSubdomain: 'Activate Subdomain',
    saveCustomDomain: 'Save Custom Domain',
    
    // Premium Site Navigation
    home: 'Home',
    gallery: 'Gallery',
    contact: 'Contact',
    contactUs: 'Contact Us',
    
    // Premium Hero
    welcomeTo: 'Welcome to',
    exploreMore: 'Explore More',
    
    // Premium Gallery
    discoverOurSpace: 'Discover Our Space',
    galleryDescription: 'Take a visual tour through our establishment',
    
    // Premium Reviews
    whatOurClientsSay: 'What Our Clients Say',
    reviewsDescription: 'Real experiences from our valued customers',
    
    // Premium Business Info
    whenToVisit: 'When to Visit',
    findUs: 'Find Us',
    visitOurLocation: 'Visit Our Location',
    address: 'Address',
    phone: 'Phone',
    website: 'Website',
    
    // Premium CTA
    callUs: 'Call Us',
    reachOut: 'Reach Out',
    ctaDescription: 'We would love to hear from you. Get in touch with us today.',
    
    // Premium Map
    ourLocation: 'Our Location',
    findUsOnMap: 'Find Us on the Map',
    
    // Premium Footer
    allRightsReserved: 'All rights reserved',
    madeWith: 'Made with',
    
    // Payment Methods
    paymentMethods: 'Payment Methods (Optional)',
    paymentMethodName: 'Payment Method Name',
    paymentMethodPlaceholder: 'e.g., InstaPay, Bank Transfer',
    accountOwnerName: 'Account Owner Name',
    accountOwnerPlaceholder: 'e.g., Ahmed Mohamed',
    accountNumber: 'Account Number / IBAN',
    accountNumberPlaceholder: 'Enter account number or IBAN',
    paymentLink: 'Payment Link',
    paymentLinkPlaceholder: 'https://pay.example.com/...',
    addAnotherPayment: 'Add Another Payment Method',
    removePayment: 'Remove',
    by: 'by',
  },
  ar: {
    // App
    appName: 'Saroara Builder',
    tagline: 'أنشئ مواقع احترافية لعملائك من بيانات خرائط جوجل',
    
    // Admin Navigation
    navDashboard: 'لوحة التحكم',
    navGenerator: 'إنشاء موقع',
    navGeneratedSites: 'المواقع المُنشأة',
    
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
    saveSite: 'حفظ الموقع',
    
    // Reviews
    rating: 'التقييم',
    reviews: 'تقييمات',
    noReviews: 'لا توجد تقييمات بعد',
    viewAllReviews: 'عرض جميع التقييمات',
    
    // Footer
    poweredBy: 'مدعوم بواسطة Saroara Builder',
    
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
    siteSaved: 'تم حفظ الموقع بنجاح!',
    
    // API Key
    apiKeyTitle: 'مفتاح Google Places API',
    apiKeyDescription: 'أدخل مفتاح Google Places API لجلب بيانات الأعمال الحقيقية',
    apiKeyPlaceholder: 'أدخل مفتاح API...',
    saveApiKey: 'حفظ مفتاح API',
    
    // WhatsApp
    whatsappGreeting: 'مرحباً! وجدت نشاطك التجاري وأود معرفة المزيد.',
    
    // Auth
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'أدخل بريدك الإلكتروني...',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور...',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'أدخل اسمك الكامل...',
    authDescription: 'سجل دخولك لإدارة مواقعك المُنشأة',
    accountCreated: 'تم إنشاء الحساب بنجاح!',
    welcomeMessage: 'مرحباً بك في Saroara Builder!',
    orContinueWith: 'أو تابع باستخدام',
    continueWithGoogle: 'المتابعة عبر Google',
    signOut: 'تسجيل الخروج',
    
    // Dashboard
    welcomeBack: 'مرحباً بعودتك',
    adminDashboardDescription: 'أدر جميع المواقع والمستخدمين من هنا',
    clientDashboardDescription: 'أدر مواقعك المُنشأة',
    generateNewSite: 'إنشاء موقع جديد',
    generateNewSiteDesc: 'أنشئ موقعاً جديداً من بيانات خرائط جوجل',
    startGenerating: 'ابدأ الإنشاء',
    mySites: 'مواقعي',
    mySitesDesc: 'عرض وإدارة مواقعك المُنشأة',
    viewSites: 'عرض المواقع',
    manageUsers: 'إدارة المستخدمين',
    manageUsersDesc: 'عرض وإدارة جميع المستخدمين المسجلين',
    viewUsers: 'عرض المستخدمين',
    dashboard: 'لوحة التحكم',
    
    // Generated Sites Admin
    generatedSites: 'المواقع المُنشأة',
    generatedSitesDescription: 'أدر جميع مواقع عملائك المُنشأة من هنا.',
    noSitesYet: 'لا توجد مواقع مُنشأة بعد',
    noSitesDescription: 'أنشئ أول موقع عميل لرؤيته هنا.',
    siteName: 'اسم الموقع',
    slug: 'الرابط',
    status: 'الحالة',
    customDomain: 'النطاق المخصص',
    createdAt: 'تاريخ الإنشاء',
    openSite: 'فتح الموقع',
    markPublished: 'تعيين كمنشور',
    readyForDomain: 'جاهز للنطاق',
    delete: 'حذف',
    statusDraft: 'مسودة',
    statusPublished: 'منشور',
    statusReadyForDomain: 'جاهز للنطاق',
    
    // Stats
    totalSites: 'إجمالي المواقع',
    publishedCount: 'منشور',
    withDomain: 'مع نطاق',
    totalUsers: 'المستخدمين',
    
    // Filters
    filterByStatus: 'الحالة:',
    filterByOwner: 'المالك:',
    allStatuses: 'الكل',
    allUsers: 'جميع المستخدمين',
    owner: 'المالك',
    
    // Domain
    subdomainFree: 'نطاق فرعي (مجاني)',
    customDomainOption: 'نطاق مخصص',
    instantActivation: 'تفعيل فوري!',
    subdomainInstant: 'النطاق الفرعي يعمل فوراً بدون إعدادات DNS',
    subdomainName: 'اسم النطاق الفرعي',
    siteUrl: 'رابط الموقع:',
    activateSubdomain: 'تفعيل النطاق الفرعي',
    saveCustomDomain: 'حفظ النطاق المخصص',
    
    // Premium Site Navigation
    home: 'الرئيسية',
    gallery: 'المعرض',
    contact: 'اتصل',
    contactUs: 'تواصل معنا',
    
    // Premium Hero
    welcomeTo: 'مرحباً بكم في',
    exploreMore: 'استكشف المزيد',
    
    // Premium Gallery
    discoverOurSpace: 'اكتشف مساحتنا',
    galleryDescription: 'جولة بصرية في منشأتنا',
    
    // Premium Reviews
    whatOurClientsSay: 'ماذا يقول عملاؤنا',
    reviewsDescription: 'تجارب حقيقية من عملائنا الكرام',
    
    // Premium Business Info
    whenToVisit: 'متى تزورنا',
    findUs: 'اعثر علينا',
    visitOurLocation: 'زيارة موقعنا',
    address: 'العنوان',
    phone: 'الهاتف',
    website: 'الموقع الإلكتروني',
    
    // Premium CTA
    callUs: 'اتصل بنا',
    reachOut: 'تواصل معنا',
    ctaDescription: 'نحب أن نسمع منك. تواصل معنا اليوم.',
    
    // Premium Map
    ourLocation: 'موقعنا',
    findUsOnMap: 'اعثر علينا على الخريطة',
    
    // Premium Footer
    allRightsReserved: 'جميع الحقوق محفوظة',
    madeWith: 'صنع بـ',
    by: 'بواسطة',
    
    // Payment Methods
    paymentMethods: 'وسائل الدفع (اختياري)',
    paymentMethodName: 'وسيلة الدفع',
    paymentMethodPlaceholder: 'مثال: انستا باي، تحويل بنكي',
    accountOwnerName: 'اسم صاحب الحساب',
    accountOwnerPlaceholder: 'مثال: أحمد محمد',
    accountNumber: 'رقم الحساب / IBAN',
    accountNumberPlaceholder: 'أدخل رقم الحساب أو IBAN',
    paymentLink: 'رابط الدفع',
    paymentLinkPlaceholder: 'https://pay.example.com/...',
    addAnotherPayment: 'إضافة وسيلة دفع أخرى',
    removePayment: 'إزالة',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
