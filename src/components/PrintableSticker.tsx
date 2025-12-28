import { useRef, useCallback, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import domtoimage from 'dom-to-image-more';
import { BusinessData } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Download, Printer, Star, MapPin, Clock, Quote, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PrintableStickerProps {
  business: BusinessData;
}



function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return fetch(dataUrl).then((r) => r.blob());
}

async function convertDataUrlToWebp(dataUrl: string, quality = 0.92): Promise<string> {
  const blob = await dataUrlToBlob(dataUrl);
  const img = await createImageBitmap(blob);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;

  ctx.drawImage(img, 0, 0);

  // Some browsers may not support webp; fall back to PNG data URL.
  try {
    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) return webp;
  } catch {
    // ignore
  }

  return dataUrl;
}

export function PrintableSticker({ business }: PrintableStickerProps) {
  const { language } = useLanguage();
  const stickerRef = useRef<HTMLDivElement>(null);
  const actionLockRef = useRef<null | 'download' | 'print'>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;

  // Google Maps review link using place_id
  const reviewUrl = business.placeId 
    ? `https://search.google.com/local/writereview?placeid=${business.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

  // WhatsApp link for ordering stickers
  const whatsappNumber = '201514167733';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  // Get hero image (first photo)
  const heroImage = business.photos?.[0];

  // Get display photos (up to 3 small ones)
  const displayPhotos = business.photos?.slice(1, 4) || [];

  // Get top reviews (up to 2)
  const topReviews = business.reviews?.slice(0, 2) || [];
  const getProxyUrl = useCallback((src: string) => {
    const base = import.meta.env.VITE_SUPABASE_URL;
    return `${base}/functions/v1/image-proxy?url=${encodeURIComponent(src)}`;
  }, []);

  const renderStickerWebp = useCallback(async () => {
    if (!stickerRef.current) return null;

    const srcRect = stickerRef.current.getBoundingClientRect();

    // Temporarily disable Google Fonts stylesheet links to avoid cssRules SecurityError
    const fontLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).filter((l) =>
      l.href?.includes('fonts.googleapis.com'),
    );
    const prevDisabled = fontLinks.map((l) => l.disabled);
    fontLinks.forEach((l) => (l.disabled = true));

    const baseW = Math.max(1, Math.round(srcRect.width));
    const baseH = Math.max(1, Math.round(srcRect.height));

    // Clone sticker for capture (avoids mutating what the user sees)
    const clone = stickerRef.current.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.style.width = `${baseW}px`;
    clone.style.height = `${baseH}px`;
    clone.style.background = '#ffffff';

    // Remove runtime <style> blocks from the clone
    Array.from(clone.querySelectorAll('style')).forEach((s) => s.remove());

    // Proxy external images to avoid CORS-taint (otherwise images disappear)
    const imgs = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/^https?:\/\//.test(src) && !src.startsWith(window.location.origin)) {
        img.setAttribute('src', getProxyUrl(src));
      }
    });

    // Put clone offscreen
    const stage = document.createElement('div');
    stage.style.position = 'fixed';
    stage.style.left = '-10000px';
    stage.style.top = '0';
    stage.style.zIndex = '-1';
    stage.style.background = '#ffffff';
    stage.style.display = 'inline-block';
    stage.style.width = `${baseW}px`;
    stage.style.height = `${baseH}px`;
    stage.appendChild(clone);
    document.body.appendChild(stage);

    try {
      // Wait a moment for proxied images to settle
      await Promise.race([
        Promise.all(
          imgs.map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete) return resolve();
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }),
          ),
        ).then(() => undefined),
        new Promise<void>((resolve) => setTimeout(resolve, 2000)),
      ]);

      const scale = 3;
      const pngDataUrl = await domtoimage.toPng(clone, {
        cacheBust: true,
        bgcolor: '#ffffff',
        width: Math.max(1, Math.round(baseW * scale)),
        height: Math.max(1, Math.round(baseH * scale)),
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${baseW}px`,
          height: `${baseH}px`,
          // Kill any accidental outlines/borders in capture without changing the real UI
          outline: 'none',
          border: 'none',
          boxShadow: 'none',
        },
      } as any);

      return convertDataUrlToWebp(pngDataUrl, 0.92);
    } finally {
      document.body.removeChild(stage);
      fontLinks.forEach((l, i) => (l.disabled = prevDisabled[i]));
    }
  }, [getProxyUrl]);

  const handleDownload = useCallback(async () => {
    if (!stickerRef.current) return;
    if (actionLockRef.current) return;

    actionLockRef.current = 'download';
    setIsDownloading(true);
    try {
      const dataUrl = await renderStickerWebp();
      if (!dataUrl) return;

      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-sticker.webp`;
      link.href = dataUrl;
      link.click();

      toast.success(language === 'ar' ? 'تم تحميل الاستيكر بصيغة WebP' : 'Sticker downloaded as WebP');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Download failed');
    } finally {
      setIsDownloading(false);
      actionLockRef.current = null;
    }
  }, [name, language, renderStickerWebp]);

  const handlePrint = useCallback(async () => {
    if (actionLockRef.current) return;

    actionLockRef.current = 'print';
    setIsPrinting(true);
    try {
      const dataUrl = await renderStickerWebp();
      if (!dataUrl) return;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error(language === 'ar' ? 'تعذر فتح نافذة الطباعة' : 'Could not open print window');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="${language === 'ar' ? 'ar' : 'en'}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${name} - Sticker</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { width: 100%; height: 100%; background: #fff; }
            body { display: grid; place-items: center; }
            img {
              display: block;
              width: 100vw;
              height: 100vh;
              object-fit: contain;
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page { margin: 0; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="${name} sticker" onload="window.print();" />
          <script>window.onafterprint = () => window.close();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Print error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الطباعة' : 'Print failed');
    } finally {
      setIsPrinting(false);
      actionLockRef.current = null;
    }
  }, [language, name, renderStickerWebp]);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        );
      } else if (i === fullStars && hasHalf) {
        stars.push(
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400/50" />
        );
      } else {
        stars.push(
          <Star key={i} className="w-5 h-5 text-yellow-400/30" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 justify-center print:hidden">
        <Button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handleDownload();
          }}
          disabled={isDownloading || isPrinting}
          className="gap-2"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {language === 'ar' ? 'تحميل' : 'Download'}
        </Button>

        <Button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handlePrint();
          }}
          disabled={isDownloading || isPrinting}
          variant="outline"
          className="gap-2"
        >
          {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          {language === 'ar' ? 'طباعة' : 'Print'}
        </Button>
      </div>
      
      {/* Printable Sticker */}
      <div className="flex justify-center">
        <div
          ref={stickerRef}
          id="printable-sticker"
          className="w-[400px] bg-white rounded-2xl overflow-hidden"
          style={{ fontFamily: language === 'ar' ? 'Noto Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif' }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Hero Image Header */}
          {heroImage ? (
            <div className="relative h-40 overflow-hidden">
              <img 
                src={heroImage} 
                alt={name}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="block w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                <h1 className="text-xl font-bold drop-shadow-lg">{name}</h1>
                {business.types?.[0] && (
                  <p className="text-sm opacity-90">{business.types[0]}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">{name.charAt(0)}</span>
              </div>
              <h1 className="text-xl font-bold mb-1">{name}</h1>
            </div>
          )}
          
          {/* Rating Section - Like Website */}
          {business.rating && (
            <div className="bg-white p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                  {renderStars(business.rating)}
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-primary">{business.rating}</span>
                  <span className="text-sm text-muted-foreground mx-1">/</span>
                  <span className="text-sm text-muted-foreground">5</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-1">
                {language === 'ar' 
                  ? `${business.totalReviews} تقييم من العملاء`
                  : `${business.totalReviews} customer reviews`}
              </p>
            </div>
          )}
          
          {/* Photo Gallery Strip */}
          {displayPhotos.length > 0 && (
            <div className="flex gap-1 p-2 bg-white">
              {displayPhotos.map((photo, index) => (
                <div key={index} className="flex-1 h-20 overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`${name} ${index + 1}`}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    className="block w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Customer Reviews Section */}
          {topReviews.length > 0 && (
            <div className="p-3 space-y-2">
              {topReviews.map((review, index) => (
                <div key={index} className="bg-white p-3 relative">
                  <Quote className="absolute top-2 right-2 w-4 h-4 text-primary/20" />
                  <div className="flex items-center gap-2 mb-1">
                    {review.authorPhoto ? (
                      <img
                        src={review.authorPhoto}
                        alt={review.authorName}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="block w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <span className="text-xs font-semibold text-foreground">{review.authorName}</span>
                    <div className="flex items-center gap-0.5 ms-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {language === 'ar' && review.textAr ? review.textAr : review.text}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Main Content */}
          <div className="p-4 text-center space-y-3">
            {/* Trust Message */}
            <div className="space-y-0.5">
              <p className="text-base font-bold text-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'لأننا نثق في جودة خدماتنا' 
                  : 'Because we trust our service quality'}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {language === 'ar' 
                  ? 'ندعو الجميع لتقييمنا' 
                  : 'We invite everyone to rate us'}
              </p>
            </div>
            
            {/* Smaller QR Code for Google Reviews */}
            <div className="py-2">
              <div className="inline-block p-2 bg-white">
                <QRCodeSVG
                  value={reviewUrl}
                  size={100}
                  level="H"
                  includeMargin={false}
                  bgColor="transparent"
                  fgColor="#000000"
                />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-primary">
                {language === 'ar' 
                  ? 'امسح للتقييم على جوجل' 
                  : 'Scan to rate on Google'}
              </p>
            </div>
            
            {/* Business Info */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
              {business.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[120px]">{business.address.split(',')[0]}</span>
                </div>
              )}
              {business.isOpen !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span className={business.isOpen ? 'text-green-600' : 'text-red-500'}>
                    {business.isOpen 
                      ? (language === 'ar' ? 'مفتوح' : 'Open')
                      : (language === 'ar' ? 'مغلق' : 'Closed')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 text-xs text-muted-foreground">
                <p className="font-medium mb-0.5">
                  {language === 'ar' 
                    ? 'لطلب استيكر كهذا' 
                    : 'To order a sticker like this'}
                </p>
                <p className="font-bold text-foreground">
                  {language === 'ar' ? 'تواصل واتساب' : 'WhatsApp us'}
                </p>
                <p className="text-[10px] mt-0.5">+20 151 416 7733</p>
              </div>
              <div className="flex-shrink-0">
                <QRCodeSVG
                  value={whatsappUrl}
                  size={45}
                  level="M"
                  includeMargin={false}
                  bgColor="transparent"
                  fgColor="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-sticker, #printable-sticker * {
            visibility: visible;
          }
          #printable-sticker {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}
