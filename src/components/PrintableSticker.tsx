import { useRef, useCallback, useState, useEffect, useId } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { BusinessData, PaymentMethod } from '@/lib/types';
import { filterPositiveReviews } from '@/lib/reviewUtils';
import { useLanguage } from '@/hooks/useLanguage';
import { useAdminWhatsApp } from '@/hooks/useAdminWhatsApp';
import { Button } from '@/components/ui/button';
import { Download, Printer, Star, Quote, User, Loader2, FileText, CreditCard, Wallet, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// QR Code component that renders as a Base64 image for PDF compatibility
function QRCodeImage({ value, size, className }: { value: string; size: number; className?: string }) {
  const containerId = useId();
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const el = document.getElementById(containerId);
        const canvas = el?.querySelector('canvas') as HTMLCanvasElement | null;
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/png');
          setImgSrc(dataUrl);
        }
      } catch (e) {
        console.error('QR conversion error:', e);
      } finally {
        setIsReady(true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [containerId, value, size]);

  return (
    <div className={className} style={{ width: size, height: size, position: 'relative' }}>
      {/* Hidden QR canvas for data extraction */}
      <div id={containerId} style={{ position: 'absolute', left: -9999, top: 0, opacity: 0, pointerEvents: 'none' }}>
        <QRCodeCanvas
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
        <div
          style={{
            width: size,
            height: size,
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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

// Fixed sticker dimensions with strict 1:2 aspect ratio (width:height)
// Export resolution: 10000px × 20000px
export const STICKER_CONFIG = {
  displayWidth: 400, // Display width in pixels
  aspectRatio: 2, // height = width * 2
  exportWidth: 10000, // Export width in pixels (10k)
  exportHeight: 20000, // Export height in pixels (20k)
  pdfWidth: 100, // PDF width in mm
  pdfHeight: 200, // PDF height in mm
};

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

  // Review count control
  const [reviewCount, setReviewCount] = useState<number>(4);

  // Live dimensions (for verifying strict 1:2 in the UI)
  const [measuredBox, setMeasuredBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!stickerRef.current) return;

    const update = () => {
      const rect = stickerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMeasuredBox({ w: Math.round(rect.width), h: Math.round(rect.height) });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(stickerRef.current);
    window.addEventListener('resize', update);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [language]);

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
  const filteredReviews = filterPositiveReviews(business.reviews, language).slice(0, reviewCount);
  const topReviews = filteredReviews.length > 0 ? filteredReviews : [];

  const getProxyUrl = useCallback((src: string) => {
    const base = import.meta.env.VITE_SUPABASE_URL;
    return `${base}/functions/v1/image-proxy?url=${encodeURIComponent(src)}`;
  }, []);

  // Generate high-resolution 10000×20000px image (exact 1:2, fills the whole canvas)
  const generateStickerImage = useCallback(async (): Promise<string | null> => {
    if (!stickerRef.current) return null;

    // Wait for QR codes to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    const element = stickerRef.current;

    // IMPORTANT: force base dimensions to the exact 1:2 display box,
    // so capture/export can never drift due to content reflow.
    const baseW = STICKER_CONFIG.displayWidth;
    const baseH = STICKER_CONFIG.displayWidth * STICKER_CONFIG.aspectRatio;

    // Clone for capture
    const clone = element.cloneNode(true) as HTMLElement;
    clone.removeAttribute('id');
    clone.style.width = `${baseW}px`;
    clone.style.height = `${baseH}px`;
    clone.style.overflow = 'hidden';
    clone.style.boxSizing = 'border-box';
    clone.style.background = '#ffffff';
    clone.style.fontFamily = language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif';

    // Remove all borders/shadows in clone + hide measurement overlay
    const resetStyle = document.createElement('style');
    resetStyle.textContent = `
      *, *::before, *::after { outline: none !important; border: none !important; box-shadow: none !important; }
      .measurement-overlay { display: none !important; }
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

    try {
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
          })
        ),
        new Promise<void>((resolve) => setTimeout(resolve, 6000)),
      ]);

      const targetWidth = STICKER_CONFIG.exportWidth;
      const targetHeight = STICKER_CONFIG.exportHeight;
      const captureScale = targetWidth / baseW;

      const rawCanvas = await html2canvas(clone, {
        scale: captureScale,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      document.body.removeChild(stage);

      // Draw as "cover" so the result fills the whole 10000×20000 canvas (no white margins)
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return null;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      const scale = Math.max(targetWidth / rawCanvas.width, targetHeight / rawCanvas.height);
      const drawW = rawCanvas.width * scale;
      const drawH = rawCanvas.height * scale;
      const drawX = (targetWidth - drawW) / 2;
      const drawY = (targetHeight - drawH) / 2;

      ctx.drawImage(rawCanvas, drawX, drawY, drawW, drawH);

      // Export image as PNG only (WebP option removed)
      return finalCanvas.toDataURL('image/png');
    } catch (error) {
      document.body.removeChild(stage);
      throw error;
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

      // IMPORTANT: force base dimensions to the exact 1:2 display box
      const baseW = STICKER_CONFIG.displayWidth;
      const baseH = STICKER_CONFIG.displayWidth * STICKER_CONFIG.aspectRatio;

      // Clone for capture
      const clone = element.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.style.width = `${baseW}px`;
      clone.style.height = `${baseH}px`;
      clone.style.overflow = 'hidden';
      clone.style.boxSizing = 'border-box';
      clone.style.background = '#ffffff';
      clone.style.fontFamily = language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif';

      // Remove all borders/shadows in clone + hide measurement overlay
      const resetStyle = document.createElement('style');
      resetStyle.textContent = `
        *, *::before, *::after { outline: none !important; border: none !important; box-shadow: none !important; }
        .measurement-overlay { display: none !important; }
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

      // Ultra high-quality capture - scale to achieve 10000px width
      const targetWidth = STICKER_CONFIG.exportWidth;
      const targetHeight = STICKER_CONFIG.exportHeight;
      const captureScale = targetWidth / baseW;
      
      const rawCanvas = await html2canvas(clone, {
        scale: captureScale,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      document.body.removeChild(stage);

      // Force exact 1:2 aspect ratio and fill the whole canvas (cover)
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const finalCtx = finalCanvas.getContext('2d');

      if (finalCtx) {
        finalCtx.fillStyle = '#ffffff';
        finalCtx.fillRect(0, 0, targetWidth, targetHeight);

        const scale = Math.max(targetWidth / rawCanvas.width, targetHeight / rawCanvas.height);
        const drawW = rawCanvas.width * scale;
        const drawH = rawCanvas.height * scale;
        const drawX = (targetWidth - drawW) / 2;
        const drawY = (targetHeight - drawH) / 2;

        finalCtx.drawImage(rawCanvas, drawX, drawY, drawW, drawH);
      }

      // Create PDF with fixed 1:2 aspect ratio (100mm × 200mm)
      const pdfWidth = STICKER_CONFIG.pdfWidth;
      const pdfHeight = STICKER_CONFIG.pdfHeight;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      const imgData = finalCanvas.toDataURL('image/png');
      
      // Image fills the entire PDF (exact 1:2 ratio)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

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
      const dataUrl = await generateStickerImage();
      if (!dataUrl) return;

      // Verify the exported pixel size is exactly 10000×20000
      await new Promise<void>((resolve) => {
        const img = document.createElement('img');
        img.onload = () => {
          const ok =
            img.naturalWidth === STICKER_CONFIG.exportWidth &&
            img.naturalHeight === STICKER_CONFIG.exportHeight;

          if (!ok) {
            toast.error(
              language === 'ar'
                ? `⚠️ قياس التصدير غير مطابق: ${img.naturalWidth}×${img.naturalHeight}`
                : `⚠️ Export size mismatch: ${img.naturalWidth}×${img.naturalHeight}`
            );
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = dataUrl;
      });

      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-sticker.png`;
      link.href = dataUrl;
      link.click();

      toast.success(language === 'ar' ? 'تم تحميل الاستيكر بصيغة PNG' : 'Sticker downloaded as PNG');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء التحميل' : 'Download failed');
    } finally {
      setIsDownloading(false);
      actionLockRef.current = null;
    }
  }, [name, language, generateStickerImage]);

  const handlePrint = useCallback(async () => {
    if (actionLockRef.current) return;

    actionLockRef.current = 'print';
    setIsPrinting(true);
    try {
      const dataUrl = await generateStickerImage();
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
  }, [language, name, generateStickerImage]);

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
      {/* Review Count Control */}
      <div className="flex flex-wrap gap-4 justify-center items-center print:hidden bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">
            {language === 'ar' ? 'عدد التعليقات:' : 'Reviews:'}
          </label>
          <select
            value={reviewCount}
            onChange={(e) => setReviewCount(Number(e.target.value))}
            className="px-3 py-1.5 border rounded-md bg-background text-foreground text-sm"
          >
            <option value={2}>{language === 'ar' ? 'تعليقان' : '2 Reviews'}</option>
            <option value={4}>{language === 'ar' ? '4 تعليقات' : '4 Reviews'}</option>
            <option value={6}>{language === 'ar' ? '6 تعليقات' : '6 Reviews'}</option>
          </select>
        </div>
        <div className="text-xs text-muted-foreground">
          {language === 'ar' ? 'الدقة: 10000×20000 بكسل (نسبة 1:2)' : 'Resolution: 10000×20000px (1:2 ratio)'}
        </div>
      </div>

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
          variant="default"
          className="gap-2"
        >
          {isDownloading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Image className="w-4 h-4" />
          )}
          {language === 'ar' ? 'تحميل PNG' : 'Download PNG'}
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
      
      {/* Printable Sticker - Fixed 1:2 aspect ratio container */}
      <div className="flex justify-center">
        <div
          ref={stickerRef}
          id="printable-sticker"
          className="bg-white shadow-lg rounded-lg flex flex-col"
          style={{ 
            width: `${STICKER_CONFIG.displayWidth}px`,
            height: `${STICKER_CONFIG.displayWidth * STICKER_CONFIG.aspectRatio}px`,
            fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif',
            overflow: 'hidden',
            position: 'relative'
          }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Graduated Ruler Overlay (cm) - Hidden during export */}
          {measuredBox && (() => {
            // Calculate cm based on 96 DPI (standard screen)
            const PX_PER_CM = 37.8; // 96 DPI ≈ 37.8 px/cm
            const widthCm = measuredBox.w / PX_PER_CM;
            const heightCm = measuredBox.h / PX_PER_CM;
            const isRatioCorrect = Math.abs(measuredBox.h - measuredBox.w * 2) < 2; // tolerance of 2px
            
            // Generate tick marks for horizontal ruler
            const hTicks = [];
            for (let cm = 0; cm <= Math.ceil(widthCm); cm++) {
              const pos = (cm / widthCm) * 100;
              if (pos <= 100) {
                hTicks.push({ cm, pos });
              }
            }
            
            // Generate tick marks for vertical ruler
            const vTicks = [];
            for (let cm = 0; cm <= Math.ceil(heightCm); cm++) {
              const pos = (cm / heightCm) * 100;
              if (pos <= 100) {
                vTicks.push({ cm, pos });
              }
            }
            
            // Generate grid lines every 1cm
            const gridLinesH = [];
            for (let cm = 1; cm < Math.ceil(widthCm); cm++) {
              const pos = (cm / widthCm) * 100;
              if (pos < 100) {
                gridLinesH.push({ cm, pos });
              }
            }
            const gridLinesV = [];
            for (let cm = 1; cm < Math.ceil(heightCm); cm++) {
              const pos = (cm / heightCm) * 100;
              if (pos < 100) {
                gridLinesV.push({ cm, pos });
              }
            }
            
            return (
              <div className="measurement-overlay absolute inset-0 z-50 pointer-events-none print:hidden">
                {/* Internal Calibration Grid - dashed lines every 1cm */}
                <div className="absolute inset-0">
                  {/* Vertical grid lines */}
                  {gridLinesH.map(({ cm, pos }) => (
                    <div 
                      key={`grid-v-${cm}`} 
                      className="absolute top-0 bottom-0 w-px"
                      style={{ 
                        left: `${pos}%`,
                        background: cm % 5 === 0 
                          ? 'repeating-linear-gradient(to bottom, rgba(59, 130, 246, 0.6) 0, rgba(59, 130, 246, 0.6) 4px, transparent 4px, transparent 8px)'
                          : 'repeating-linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 0, rgba(59, 130, 246, 0.3) 2px, transparent 2px, transparent 6px)'
                      }}
                    />
                  ))}
                  {/* Horizontal grid lines */}
                  {gridLinesV.map(({ cm, pos }) => (
                    <div 
                      key={`grid-h-${cm}`} 
                      className="absolute left-0 right-0 h-px"
                      style={{ 
                        top: `${pos}%`,
                        background: cm % 5 === 0 
                          ? 'repeating-linear-gradient(to right, rgba(59, 130, 246, 0.6) 0, rgba(59, 130, 246, 0.6) 4px, transparent 4px, transparent 8px)'
                          : 'repeating-linear-gradient(to right, rgba(59, 130, 246, 0.3) 0, rgba(59, 130, 246, 0.3) 2px, transparent 2px, transparent 6px)'
                      }}
                    />
                  ))}
                </div>

                {/* Status badge */}
                <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${isRatioCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isRatioCorrect 
                    ? (language === 'ar' ? '✓ نسبة 1:2 صحيحة' : '✓ Ratio 1:2 correct')
                    : (language === 'ar' ? `✗ نسبة 1:${(heightCm / widthCm).toFixed(2)} غير صحيحة` : `✗ Ratio 1:${(heightCm / widthCm).toFixed(2)} incorrect`)
                  }
                </div>
                
                {/* Horizontal graduated ruler (top) */}
                <div className="absolute left-0 right-0 top-0 h-6 bg-yellow-100/90 border-b-2 border-yellow-600">
                  {hTicks.map(({ cm, pos }) => (
                    <div key={`h-${cm}`} className="absolute top-0 h-full" style={{ left: `${pos}%` }}>
                      <div className={`absolute bottom-0 w-px ${cm % 5 === 0 ? 'h-full bg-yellow-800' : 'h-2 bg-yellow-600'}`} />
                      {cm % 2 === 0 && (
                        <span className="absolute bottom-1 -translate-x-1/2 text-[8px] font-mono text-yellow-900 font-bold">
                          {cm}
                        </span>
                      )}
                    </div>
                  ))}
                  <span className="absolute right-1 top-0 text-[8px] font-mono text-yellow-800">
                    {widthCm.toFixed(1)} cm
                  </span>
                </div>

                {/* Vertical graduated ruler (left) */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-yellow-100/90 border-r-2 border-yellow-600">
                  {vTicks.map(({ cm, pos }) => (
                    <div key={`v-${cm}`} className="absolute left-0 w-full" style={{ top: `${pos}%` }}>
                      <div className={`absolute right-0 h-px ${cm % 5 === 0 ? 'w-full bg-yellow-800' : 'w-2 bg-yellow-600'}`} />
                      {cm % 2 === 0 && (
                        <span className="absolute right-1 -translate-y-1/2 text-[8px] font-mono text-yellow-900 font-bold">
                          {cm}
                        </span>
                      )}
                    </div>
                  ))}
                  <span className="absolute bottom-1 left-0 text-[8px] font-mono text-yellow-800 [writing-mode:vertical-rl]">
                    {heightCm.toFixed(1)} cm
                  </span>
                </div>
                
                {/* Dimension info box */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg">
                  <div>{measuredBox.w}×{measuredBox.h} px</div>
                  <div>{widthCm.toFixed(1)}×{heightCm.toFixed(1)} cm</div>
                  <div>Ratio: 1:{(heightCm / widthCm).toFixed(2)}</div>
                  <div className="text-blue-300 mt-1">Grid: 1cm spacing</div>
                </div>
              </div>
            );
          })()}
          {/* Hero Image Header - 25% of sticker height */}
          {heroImage ? (
            <div 
              className="relative overflow-hidden flex-shrink-0"
              style={{ height: '25%' }}
            >
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
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-4 text-center flex-shrink-0" style={{ height: '25%' }}>
              <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">{name.charAt(0)}</span>
              </div>
              <h1 className="text-xl font-bold">{name}</h1>
            </div>
          )}
          
          {/* Rating Section - compact */}
          {business.rating && (
            <div className="bg-white px-3 py-2 flex-shrink-0">
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-0.5">
                  {renderStars(business.rating)}
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-primary">{business.rating}</span>
                  <span className="text-sm text-muted-foreground mx-1">/5</span>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-1">
                {language === 'ar' 
                  ? `${business.totalReviews} تقييم`
                  : `${business.totalReviews} reviews`}
              </p>
            </div>
          )}
          
          {/* Photo Gallery Strip - compact */}
          {displayPhotos.length > 0 && (
            <div className="flex gap-1 px-3 py-2 bg-white flex-shrink-0">
              {displayPhotos.map((photo, index) => (
                <div key={index} className="flex-1 h-16 overflow-hidden rounded">
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
          
          {/* Customer Reviews Section - Grid 2 columns, compact */}
          {topReviews.length > 0 && (
            <div className="px-3 py-2 bg-white flex-shrink-0">
              <div className="grid grid-cols-2 gap-1">
                {topReviews.map((review, index) => (
                  <div key={index} className="bg-gray-50/50 rounded p-2">
                    <div className="flex items-center gap-1 mb-0.5">
                      {review.authorPhoto ? (
                        <img
                          src={review.authorPhoto}
                          alt={review.authorName}
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className="block w-4 h-4 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-2 h-2 text-primary" />
                        </div>
                      )}
                      <span className="text-[10px] font-medium text-foreground truncate">{review.authorName}</span>
                      <div className="flex items-center flex-shrink-0 ms-auto">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-[10px] text-muted-foreground ms-0.5">{review.rating}</span>
                      </div>
                    </div>
                    <p 
                      className="text-[9px] text-muted-foreground leading-tight"
                      style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {language === 'ar' && review.textAr ? review.textAr : review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Main Content - CTA & QR Codes - compact flex-1 to fill remaining space */}
          <div className="px-3 py-2 bg-white flex-1 flex flex-col justify-center">
            <div className="text-center mb-2">
              <p className="text-sm font-bold text-foreground">
                {language === 'ar' ? 'ندعوكم لتقييمنا' : 'Rate us'}
              </p>
            </div>
            
            {/* Conditional Layout: 2-Column if payment details exist, else centered */}
            {hasPaymentDetails && primaryPayment ? (
              <div className="grid grid-cols-2 gap-2">
                {/* Left: Google Maps */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <svg width="14" height="14" viewBox="0 0 92.3 132.3" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                      <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/>
                      <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3z"/>
                      <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3z"/>
                      <path fill="#34a853" d="M59.2 109.2c19.4-26.7 33.1-41.2 33.1-63.1 0-8.3-2-16.2-5.6-23.2L25.5 97.6c4.7 6.2 9.1 12.6 11.9 20.3 4.9 13.5 8.7 14.4 8.7 14.4s3.9-.9 8.7-14.4c.6-1.8 1.5-3.6 2.5-5.4l1.9-3.3z"/>
                    </svg>
                    <span className="text-[10px] font-bold text-foreground">Google</span>
                  </div>
                  <QRCodeImage value={reviewUrl} size={70} />
                  <p className="mt-1 text-[9px] text-primary font-semibold">
                    {language === 'ar' ? 'امسح للتقييم' : 'Scan to rate'}
                  </p>
                </div>
                
                {/* Right: Payment Details */}
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {(() => {
                      const iconUrl = getPaymentMethodIcon(primaryPayment.methodName);
                      if (iconUrl) {
                        return (
                          <img 
                            src={iconUrl} 
                            alt={primaryPayment.methodName}
                            className="w-4 h-4 object-contain"
                            crossOrigin="anonymous"
                          />
                        );
                      }
                      return <Wallet className="w-3 h-3 text-primary" />;
                    })()}
                    <span className="text-[10px] font-bold text-foreground truncate">
                      {primaryPayment.methodName || (language === 'ar' ? 'الدفع' : 'Pay')}
                    </span>
                  </div>
                  
                  {primaryPayment.paymentLink && (
                    <QRCodeImage value={primaryPayment.paymentLink} size={70} />
                  )}
                  
                  {primaryPayment.paymentLink && (
                    <p className="mt-1 text-[9px] text-primary font-semibold">
                      {language === 'ar' ? 'امسح للدفع' : 'Scan to pay'}
                    </p>
                  )}
                  
                  {(primaryPayment.accountOwner || primaryPayment.accountNumber) && (
                    <div className="mt-1 text-center">
                      {primaryPayment.accountOwner && (
                        <p className="text-[9px] text-muted-foreground truncate max-w-full">
                          {primaryPayment.accountOwner}
                        </p>
                      )}
                      {primaryPayment.accountNumber && (
                        <p className="text-[9px] font-mono text-foreground">
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
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg width="16" height="16" viewBox="0 0 92.3 132.3" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
                    <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/>
                    <path fill="#4285f4" d="M46.1 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.5-6.3z"/>
                    <path fill="#fbbc04" d="M46.1 63.5c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3z"/>
                    <path fill="#34a853" d="M59.2 109.2c19.4-26.7 33.1-41.2 33.1-63.1 0-8.3-2-16.2-5.6-23.2L25.5 97.6c4.7 6.2 9.1 12.6 11.9 20.3 4.9 13.5 8.7 14.4 8.7 14.4s3.9-.9 8.7-14.4c.6-1.8 1.5-3.6 2.5-5.4l1.9-3.3z"/>
                  </svg>
                  <span className="text-xs font-bold text-foreground">Google Maps</span>
                </div>
                
                <QRCodeImage value={reviewUrl} size={90} />
                <p className="mt-1 text-[10px] font-semibold text-primary">
                  {language === 'ar' ? 'امسح للتقييم' : 'Scan to rate'}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer - Promo - compact */}
          <div className="bg-gray-50 px-3 py-2 flex-shrink-0">
            <div className="flex items-center justify-center gap-3">
              <div className="text-[9px] text-center">
                <p className="text-muted-foreground">{language === 'ar' ? 'لطلب استيكر' : 'Order sticker'}</p>
                <p className="font-bold text-foreground">
                  <span dir="ltr" style={{ unicodeBidi: 'embed' }}>{adminWhatsApp || '+20 151 416 7733'}</span>
                </p>
              </div>
              <QRCodeImage value={whatsappUrl} size={50} />
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
