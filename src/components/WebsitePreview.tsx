import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';
import { BusinessData } from '@/lib/types';
import { GeneratedWebsite } from './generated/GeneratedWebsite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Share2, ExternalLink, Monitor, Smartphone, Tablet, Check, Save, Loader2, LogIn, Info } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface WebsitePreviewProps {
  business: BusinessData;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

export function WebsitePreview({ business }: WebsitePreviewProps) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getViewModeStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-[375px] mx-auto';
      case 'tablet':
        return 'max-w-[768px] mx-auto';
      default:
        return 'w-full';
    }
  };

  const handleDownload = () => {
    const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
    const htmlContent = generateHTML(business, language);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('websiteGenerated'));
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name}`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('copiedToClipboard'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSite = async () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please sign in first');
      return;
    }
    
    setIsSaving(true);
    
    const slug = business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const uniqueSlug = `${slug}-${Date.now()}`;
    
    const { error } = await supabase
      .from('generated_sites')
      .insert([{
        site_name: business.name,
        slug: uniqueSlug,
        place_id: business.placeId,
        business_data: JSON.parse(JSON.stringify(business)),
        status: 'draft',
        public_url: `/site/${uniqueSlug}`,
        user_id: user.id,
      }]);

    setIsSaving(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('siteSaved'));
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      {/* Demo Mode Banner for non-authenticated users */}
      {!user && (
        <Alert className="bg-primary/10 border-primary/20">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            {language === 'ar' 
              ? 'أنت في وضع المعاينة. سجّل الدخول لحفظ هذا الموقع في لوحة التحكم الخاصة بك والحصول على رابط عام.'
              : 'You\'re in preview mode. Sign in to save this site to your dashboard and get a public URL.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-foreground">{t('previewTitle')}</span>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-3">
            {user ? (
              <Button variant="default" onClick={handleSaveSite} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t('saveSite')}
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  {language === 'ar' ? 'سجّل الدخول لحفظ الموقع' : 'Sign In to Save Site'}
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              {t('downloadHtml')}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {t('shareWebsite')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Frame */}
      <div className={`transition-all duration-300 ${getViewModeStyles()}`}>
        <div className="bg-card rounded-2xl shadow-card-lg border border-border/50 overflow-hidden">
          {/* Browser Chrome */}
          <div className="bg-secondary/50 border-b border-border/50 px-4 py-3 flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 bg-background rounded-lg px-4 py-1.5 text-sm text-muted-foreground truncate">
              {business.website || `https://${business.name.toLowerCase().replace(/\s+/g, '-')}.com`}
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          
          {/* Website Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <GeneratedWebsite business={business} />
          </div>
        </div>
      </div>
    </div>
  );
}

function generateHTML(business: BusinessData, language: string): string {
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  const address = language === 'ar' && business.addressAr ? business.addressAr : business.address;
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  
  return `<!DOCTYPE html>
<html lang="${language}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <meta name="description" content="${name} - ${address}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Arabic:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: '${language === 'ar' ? 'Noto Sans Arabic' : 'Plus Jakarta Sans'}', sans-serif; }
  </style>
</head>
<body class="bg-gray-50 text-gray-900">
  <header class="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16 px-4 text-center">
    <h1 class="text-4xl md:text-5xl font-bold mb-4">${name}</h1>
    <p class="text-lg opacity-90">${address}</p>
    ${business.rating ? `<div class="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
      <span class="text-yellow-300">★</span>
      <span class="font-bold">${business.rating}</span>
      <span class="opacity-80">(${business.totalReviews} reviews)</span>
    </div>` : ''}
  </header>
  
  <main class="max-w-6xl mx-auto px-4 py-12">
    <div class="grid md:grid-cols-2 gap-8">
      ${business.photos.length > 0 ? `<div class="grid grid-cols-2 gap-4">
        ${business.photos.slice(0, 4).map(photo => `<img src="${photo}" alt="${name}" class="w-full aspect-square object-cover rounded-xl">`).join('')}
      </div>` : ''}
      
      <div class="space-y-6">
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h2 class="text-xl font-bold mb-4">Contact Information</h2>
          <p class="mb-2">📍 ${address}</p>
          ${business.phone ? `<p class="mb-2">📞 <a href="tel:${business.phone}" class="text-blue-600 hover:underline">${business.phone}</a></p>` : ''}
          ${business.website ? `<p>🌐 <a href="${business.website}" target="_blank" class="text-blue-600 hover:underline">${business.website}</a></p>` : ''}
        </div>
        
        <div class="flex flex-wrap gap-3">
          ${business.phone ? `<a href="tel:${business.phone}" class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Call Now</a>` : ''}
          ${business.phone ? `<a href="https://wa.me/${business.phone.replace(/\D/g, '')}" target="_blank" class="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">WhatsApp</a>` : ''}
        </div>
      </div>
    </div>
  </main>
  
  <footer class="bg-gray-100 py-6 text-center text-gray-600">
    <p>Powered by Saroara Builder</p>
  </footer>
</body>
</html>`;
}
