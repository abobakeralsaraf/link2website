import { useRef, useCallback, useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { BusinessData, PaymentMethod } from '@/lib/types';
import { filterPositiveReviews } from '@/lib/reviewUtils';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminWhatsApp } from '@/hooks/useAdminWhatsApp';
import { Button } from '@/components/ui/button';
import { Download, Printer, Star, Quote, User, Loader2, FileText, CreditCard, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// QR Code component that renders as a Base64 image for PDF compatibility
function QRCodeImage({ value, size, className }: { value: string; size: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Convert canvas to data URL after render with sufficient delay
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        try {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          setImgSrc(dataUrl);
          setIsReady(true);
        } catch (e) {
          console.error('QR conversion error:', e);
          setIsReady(true);
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [value, size]);

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      {/* Hidden canvas for QR generation - always render for data extraction */}
      <div style={{ position: 'absolute', left: -9999, top: 0, opacity: 0, pointerEvents: 'none' }}>
        <QRCodeCanvas
          ref={canvasRef}
          value={value}
          size={size * 3}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      {/* Visible Base64 image for reliable PDF capture */}
      {imgSrc && isReady ? (
        <img 
          src={imgSrc} 
          alt="QR Code" 
          width={size} 
          height={size}
          crossOrigin="anonymous"
          style={{ display: 'block', width: size, height: size, imageRendering: 'crisp-edges' }}
        />
      ) : (
        <div style={{ width: size, height: size, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 10, color: '#999' }}>...</span>
        </div>
      )}
    </div>
  );
}

// Component to convert external image URL to Base64 for PDF export
function Base64Image({ 
  src, 
  alt, 
  width, 
  height, 
  className,
  fallback 
}: { 
  src: string; 
  alt: string; 
  width: number; 
  height: number; 
  className?: string;
  fallback?: React.ReactNode;
}) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Convert to Base64 for PDF compatibility
    const convertToBase64 = async () => {
      try {
        // Use proxy for external images
        const base = import.meta.env.VITE_SUPABASE_URL;
        const proxyUrl = `${base}/functions/v1/image-proxy?url=${encodeURIComponent(src)}`;
        
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImgSrc(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Failed to convert image to Base64:', error);
        setHasError(true);
      }
    };

    // Only convert if it's an external URL (not already Base64 or local)
    if (src && src.startsWith('http') && !src.includes('data:')) {
      convertToBase64();
    }
  }, [src]);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      crossOrigin="anonymous"
      onError={() => setHasError(true)}
      style={{ display: 'block' }}
    />
  );
}

export type PrintableStickerProps = {
  business: BusinessData;
  paymentMethods?: PaymentMethod[];
};

type PaymentMethodType = {
  id: string;
  name: string;
  name_ar: string;
  icon_url: string;
};

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

  try {
    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) return webp;
  } catch {
    // ignore
  }

  return dataUrl;
}

// Convert image URL to Base64 for PDF export
async function imageToBase64(url: string): Promise<string> {
  try {
    const base = import.meta.env.VITE_SUPABASE_URL;
    // Use image proxy for external URLs
    const fetchUrl = url.startsWith('http') 
      ? `${base}/functions/v1/image-proxy?url=${encodeURIComponent(url)}`
      : url;
    
    const response = await fetch(fetchUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert to Base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('imageToBase64 error:', error);
    return url; // Return original URL as fallback
  }
}

export function PrintableSticker({ business, paymentMethods = [] }: PrintableStickerProps) {
  const { language } = useLanguage();
  const { adminWhatsApp, loading: adminLoading } = useAdminWhatsApp();
  const stickerRef = useRef<HTMLDivElement>(null);
  const actionLockRef = useRef<null | 'download' | 'print' | 'pdf'>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [paymentMethodTypes, setPaymentMethodTypes] = useState<PaymentMethodType[]>([]);
  const [iconBase64Map, setIconBase64Map] = useState<Record<string, string>>({});
  
  // Fetch payment method types from database
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data, error } = await supabase
        .from('payment_method_types')
        .select('*')
        .order('name', { ascending: true });
      
      if (!error && data) {
        setPaymentMethodTypes(data);
        
        // Pre-convert icons to Base64 for PDF export
        const base64Map: Record<string, string> = {};
        for (const method of data) {
          if (method.icon_url) {
            try {
              // For local paths, we can use them directly
              if (method.icon_url.startsWith('/')) {
                base64Map[method.id] = method.icon_url;
              } else {
                const base64 = await imageToBase64(method.icon_url);
                base64Map[method.id] = base64;
              }
            } catch (e) {
              console.error('Failed to convert icon:', e);
              base64Map[method.id] = method.icon_url;
            }
          }
        }
        setIconBase64Map(base64Map);
      }
    };
    
    fetchPaymentMethods();
  }, []);
  
  // Check if any payment details were provided
  const hasPaymentDetails = paymentMethods.some(p => 
    p.methodName.trim() || p.accountOwner.trim() || p.accountNumber.trim() || p.paymentLink.trim()
  );
  
  // Get first valid payment method for display
  const primaryPayment = paymentMethods.find(p => 
    p.methodName.trim() || p.accountOwner.trim() || p.accountNumber.trim() || p.paymentLink.trim()
  );
  
  // Find matching payment method type for icon
  const getPaymentMethodIcon = (methodName: string): string | null => {
    const method = paymentMethodTypes.find(m => 
      m.name.toLowerCase() === methodName.toLowerCase() || 
      m.name_ar === methodName
    );
    if (method) {
      return iconBase64Map[method.id] || method.icon_url;
    }
    return null;
  };

  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;

  const reviewUrl = business.placeId 
    ? `https://search.google.com/local/writereview?placeid=${business.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

  // Use admin WhatsApp number, removing + for wa.me URL format
  const whatsappNumber = adminWhatsApp ? adminWhatsApp.replace(/^\+/, '') : '201514167733';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  const heroImage = business.photos?.[0];
  const displayPhotos = business.photos?.slice(1, 4) || [];
  // Smart review filtering: 4-5 star only, no negative keywords (using centralized utility)
  const filteredReviews = filterPositiveReviews(business.reviews, language).slice(0, 2);
  const topReviews = filteredReviews.length > 0 ? filteredReviews : [];

  const getProxyUrl = useCallback((src: string) => {
    const base = import.meta.env.VITE_SUPABASE_URL;
    return `${base}/functions/v1/image-proxy?url=${encodeURIComponent(src)}`;
  }, []);

  const renderStickerWebp = useCallback(async () => {
    if (!stickerRef.current) return null;

    const baseW = Math.max(1, Math.round(stickerRef.current.offsetWidth));
    const baseH = Math.max(1, Math.round(stickerRef.current.offsetHeight));

    const clone = stickerRef.current.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.style.width = `${baseW}px`;
    clone.style.height = `${baseH}px`;
    clone.style.background = '#ffffff';
    clone.style.fontFamily = language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif';

    Array.from(clone.querySelectorAll('style')).forEach((s) => s.remove());

    const resetStyle = document.createElement('style');
    resetStyle.textContent = `
      *, *::before, *::after { outline: none !important; border: none !important; box-shadow: none !important; }
    `;
    clone.prepend(resetStyle);

    const imgs = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
    imgs.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/^https?:\/\//.test(src) && !src.startsWith(window.location.origin)) {
        img.setAttribute('src', getProxyUrl(src));
      }
      img.decoding = 'sync';
    });

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
      await Promise.race([
        Promise.allSettled(
          imgs.map(async (img) => {
            try {
              const anyImg = img as any;
              if (typeof anyImg.decode === 'function') await anyImg.decode();
              else if (!img.complete) {
                await new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                });
              }
            } catch {
              // ignore
            }
          }),
        ) as unknown as Promise<void>,
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]);

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const pngDataUrl = canvas.toDataURL('image/png');
      return convertDataUrlToWebp(pngDataUrl, 0.92);
    } finally {
      document.body.removeChild(stage);
    }
  }, [getProxyUrl, language]);

  const handleDownloadPdf = useCallback(async () => {
    if (!stickerRef.current) return;
    if (actionLockRef.current) return;

    actionLockRef.current = 'pdf';
    setIsGeneratingPdf(true);

    try {
      // Wait 500ms to ensure QR codes are fully rendered as Base64 images
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const element = stickerRef.current;
      const baseW = element.offsetWidth;
      const baseH = element.offsetHeight;

      // Clone for capture
      const clone = element.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.style.width = `${baseW}px`;
      clone.style.height = `${baseH}px`;
      clone.style.background = '#ffffff';
      clone.style.fontFamily = language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif';

      // Remove all borders/shadows in clone
      const resetStyle = document.createElement('style');
      resetStyle.textContent = `
        *, *::before, *::after { outline: none !important; border: none !important; box-shadow: none !important; }
      `;
      clone.prepend(resetStyle);

      // Proxy images
      const imgs = Array.from(clone.querySelectorAll<HTMLImageElement>('img'));
      imgs.forEach((img) => {
        const src = img.getAttribute('src') || '';
        if (/^https?:\/\//.test(src) && !src.startsWith(window.location.origin)) {
          img.setAttribute('src', getProxyUrl(src));
        }
        img.decoding = 'sync';
      });

      // Stage offscreen
      const stage = document.createElement('div');
      stage.style.position = 'fixed';
      stage.style.left = '-10000px';
      stage.style.top = '0';
      stage.style.zIndex = '-1';
      stage.style.background = '#ffffff';
      stage.appendChild(clone);
      document.body.appendChild(stage);

      // Wait for images
      await Promise.race([
        Promise.allSettled(
          imgs.map(async (img) => {
            try {
              const anyImg = img as any;
              if (typeof anyImg.decode === 'function') await anyImg.decode();
              else if (!img.complete) {
                await new Promise<void>((resolve) => {
                  img.onload = () => resolve();
                  img.onerror = () => resolve();
                });
              }
            } catch {}
          }),
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]);

      // High-quality capture with scale 4 and CORS settings for QR codes
      const canvas = await html2canvas(clone, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: true,
      });

      document.body.removeChild(stage);

      // Create PDF with 5:9 aspect ratio (width:height)
      // Using mm units, 100mm x 180mm (50cm x 90cm scaled)
      const pdfWidth = 100;
      const pdfHeight = 180;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit while maintaining aspect ratio
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;
      
      let imgWidth = pdfWidth;
      let imgHeight = pdfHeight;
      let offsetX = 0;
      let offsetY = 0;
      
      if (canvasRatio > pdfRatio) {
        // Canvas is wider, fit to width
        imgHeight = pdfWidth / canvasRatio;
        offsetY = (pdfHeight - imgHeight) / 2;
      } else {
        // Canvas is taller, fit to height
        imgWidth = pdfHeight * canvasRatio;
        offsetX = (pdfWidth - imgWidth) / 2;
      }

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);

      pdf.save(`${name.replace(/\s+/g, '-').toLowerCase()}-sticker.pdf`);

      toast.success(language === 'ar' ? 'تم تحميل PDF عالي الجودة' : 'High-quality PDF downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إنشاء PDF' : 'PDF generation failed');
    } finally {
      setIsGeneratingPdf(false);
      actionLockRef.current = null;
    }
  }, [name, language, getProxyUrl]);

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

  // QR sizes as constants for visual balance
  const MAIN_QR_SIZE = 130;
  const PROMO_QR_SIZE = 80;

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 justify-center print:hidden">
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handleDownload();
          }}
          disabled={isDownloading || isPrinting || isGeneratingPdf}
          className="gap-2"
        >
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {language === 'ar' ? 'تحميل WebP' : 'Download WebP'}
        </Button>

        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handleDownloadPdf();
          }}
          disabled={isDownloading || isPrinting || isGeneratingPdf}
          variant="default"
          className="gap-2 bg-red-600 hover:bg-red-700"
        >
          {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {language === 'ar' ? 'PDF للطباعة' : 'Print-Ready PDF'}
        </Button>

        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void handlePrint();
          }}
          disabled={isDownloading || isPrinting || isGeneratingPdf}
          variant="outline"
          className="gap-2"
        >
          {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          {language === 'ar' ? 'طباعة' : 'Print'}
        </Button>
      </div>
      
      {/* Printable Sticker - Wider layout (500px, no fixed aspect ratio) */}
      <div className="flex justify-center">
        <div
          ref={stickerRef}
          id="printable-sticker"
          className="w-[500px] bg-white overflow-hidden shadow-lg rounded-lg"
          style={{ 
            fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
          }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Hero Image Header */}
          {heroImage ? (
            <div className="relative h-48 overflow-hidden">
              <img 
                src={heroImage} 
                alt={name}
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="block w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white text-center">
                <h1 className="text-2xl font-bold drop-shadow-lg">{name}</h1>
                {business.types?.[0] && (
                  <p className="text-base opacity-90 mt-1">{business.types[0]}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold">{name.charAt(0)}</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">{name}</h1>
            </div>
          )}
          
          {/* Rating Section */}
          {business.rating && (
            <div className="bg-white px-5 pt-5 pb-3">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  {renderStars(business.rating)}
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">{business.rating}</span>
                  <span className="text-base text-muted-foreground mx-1">/</span>
                  <span className="text-base text-muted-foreground">5</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                {language === 'ar' 
                  ? `${business.totalReviews} تقييم من العملاء`
                  : `${business.totalReviews} customer reviews`}
              </p>
            </div>
          )}
          
          {/* Photo Gallery Strip */}
          {displayPhotos.length > 0 && (
            <div className="flex gap-2 px-5 py-3 bg-white">
              {displayPhotos.map((photo, index) => (
                <div key={index} className="flex-1 h-24 overflow-hidden rounded">
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
          
          {/* Customer Reviews Section - Hidden if no reviews pass filter */}
          {topReviews.length > 0 && (
            <div className="px-5 py-3 space-y-3 bg-white">
              {topReviews.map((review, index) => (
                <div key={index} className="relative bg-gray-50/50 rounded-lg p-4">
                  <Quote className="absolute top-3 right-3 w-5 h-5 text-primary/20" />
                  <div className="flex items-center gap-3 mb-2">
                    {review.authorPhoto ? (
                      <img
                        src={review.authorPhoto}
                        alt={review.authorName}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        className="block w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-foreground">{review.authorName}</span>
                    <div className="flex items-center gap-0.5 ms-auto">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed" style={{ height: 'auto', overflow: 'visible' }}>
                    {language === 'ar' && review.textAr ? review.textAr : review.text}
                  </p>
                </div>
              ))}
            </div>
          )}
          
          {/* Main Content - Conditional Layout */}
          <div className="px-5 py-5 bg-white">
            <div className="text-center space-y-1 mb-4">
              <p className="text-lg font-bold text-foreground leading-relaxed">
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
            
            {/* Conditional Layout: 2-Column if payment details exist, else centered */}
            {hasPaymentDetails && primaryPayment ? (
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Google Maps */}
                <div className="text-center border-e border-border/50 pe-4 flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <svg width="20" height="20" viewBox="0 0 92.3 132.3" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                      <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/>
                      <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3z"/>
                      <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3z"/>
                      <path fill="#34a853" d="M59.2 109.2c19.4-26.7 33.1-41.2 33.1-63.1 0-8.3-2-16.2-5.6-23.2L25.5 97.6c4.7 6.2 9.1 12.6 11.9 20.3 4.9 13.5 8.7 14.4 8.7 14.4s3.9-.9 8.7-14.4c.6-1.8 1.5-3.6 2.5-5.4l1.9-3.3z"/>
                    </svg>
                    <span className="text-sm font-bold text-foreground">Google Maps</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <QRCodeImage value={reviewUrl} size={MAIN_QR_SIZE} />
                  </div>
                  <p className="mt-2 text-xs text-primary font-semibold">
                    {language === 'ar' ? 'امسح للتقييم' : 'Scan to rate'}
                  </p>
                </div>
                
                {/* Right: Payment Details - Same order as Google Maps */}
                <div className="text-center ps-4 flex flex-col items-center">
                  {/* 1. Title with Icon */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {(() => {
                      const iconUrl = getPaymentMethodIcon(primaryPayment.methodName);
                      if (iconUrl) {
                        return (
                          <img 
                            src={iconUrl} 
                            alt={primaryPayment.methodName}
                            className="w-6 h-6 object-contain"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        );
                      }
                      return <Wallet className="w-5 h-5 text-primary" />;
                    })()}
                    <Wallet className="w-5 h-5 text-primary hidden" />
                    <span className="text-sm font-bold text-foreground">
                      {primaryPayment.methodName || (language === 'ar' ? 'الدفع' : 'Payment')}
                    </span>
                  </div>
                  
                  {/* 2. QR Code */}
                  {primaryPayment.paymentLink && (
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <QRCodeImage value={primaryPayment.paymentLink} size={MAIN_QR_SIZE} />
                    </div>
                  )}
                  
                  {/* 3. Scan to Pay Label */}
                  {primaryPayment.paymentLink && (
                    <p className="mt-2 text-xs text-primary font-semibold">
                      {language === 'ar' ? 'امسح للدفع' : 'Scan to pay'}
                    </p>
                  )}
                  
                  {/* 4. Account Owner & Number */}
                  {(primaryPayment.accountOwner || primaryPayment.accountNumber) && (
                    <div className="mt-2 text-center">
                      {primaryPayment.accountOwner && (
                        <p className="text-xs text-muted-foreground">
                          {primaryPayment.accountOwner}
                        </p>
                      )}
                      {primaryPayment.accountNumber && (
                        <p className="text-xs font-mono text-foreground mt-0.5">
                          <span dir="ltr" style={{ unicodeBidi: 'embed' }}>{primaryPayment.accountNumber}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Centered Layout (No payment details) */
              <div className="text-center flex flex-col items-center">
                {/* Google Maps Logo */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg width="24" height="24" viewBox="0 0 92.3 132.3" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                    <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/>
                    <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3z"/>
                    <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3z"/>
                    <path fill="#34a853" d="M59.2 109.2c19.4-26.7 33.1-41.2 33.1-63.1 0-8.3-2-16.2-5.6-23.2L25.5 97.6c4.7 6.2 9.1 12.6 11.9 20.3 4.9 13.5 8.7 14.4 8.7 14.4s3.9-.9 8.7-14.4c.6-1.8 1.5-3.6 2.5-5.4l1.9-3.3z"/>
                  </svg>
                  <span className="text-base font-bold text-foreground">Google Maps</span>
                </div>
                
                {/* QR Code */}
                <div className="py-3">
                  <div className="p-3 bg-white rounded-lg shadow-sm inline-block">
                    <QRCodeImage value={reviewUrl} size={MAIN_QR_SIZE} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {language === 'ar' 
                      ? 'امسح للتقييم على جوجل' 
                      : 'Scan to rate on Google'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer - Smaller Promo QR */}
          <div className="bg-gray-50 px-5 py-4">
            <div className="flex flex-col items-center justify-center text-center gap-2">
              <p className="text-xs text-muted-foreground font-medium">
                {language === 'ar' 
                  ? 'لطلب استيكر كهذا' 
                  : 'To order a sticker like this'}
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-xs">
                  <p className="font-bold text-foreground">
                    {language === 'ar' ? 'تواصل واتساب' : 'WhatsApp us'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    <span dir="ltr" style={{ unicodeBidi: 'embed' }}>{adminWhatsApp || '+20 151 416 7733'}</span>
                  </p>
                </div>
                <QRCodeImage value={whatsappUrl} size={PROMO_QR_SIZE} />
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
