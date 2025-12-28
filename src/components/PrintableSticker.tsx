import { useRef, useCallback, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BusinessData } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Download, Printer, Star, MapPin, Clock, Quote, User, Loader2, FileText } from 'lucide-react';
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
  const actionLockRef = useRef<null | 'download' | 'print' | 'pdf'>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;

  const reviewUrl = business.placeId 
    ? `https://search.google.com/local/writereview?placeid=${business.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

  const whatsappNumber = '201514167733';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  const heroImage = business.photos?.[0];
  const displayPhotos = business.photos?.slice(1, 4) || [];
  const topReviews = business.reviews?.slice(0, 2) || [];

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
        allowTaint: false,
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

      // High-quality capture with scale 4
      const canvas = await html2canvas(clone, {
        scale: 4,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      document.body.removeChild(stage);

      // Create PDF with 1:2 aspect ratio (width:height)
      // Using mm units, 100mm x 200mm (suitable for 40cm x 80cm when scaled)
      const pdfWidth = 100;
      const pdfHeight = 200;
      
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
      
      {/* Printable Sticker - Seamless poster design */}
      <div className="flex justify-center">
        <div
          ref={stickerRef}
          id="printable-sticker"
          className="w-[400px] bg-white overflow-hidden"
          style={{ fontFamily: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif' }}
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
          
          {/* Rating Section */}
          {business.rating && (
            <div className="bg-white px-4 pt-4 pb-2">
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
            <div className="flex gap-1 px-4 py-2 bg-white">
              {displayPhotos.map((photo, index) => (
                <div key={index} className="flex-1 h-20 overflow-hidden rounded-sm">
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
            <div className="px-4 py-2 space-y-2 bg-white">
              {topReviews.map((review, index) => (
                <div key={index} className="relative bg-gray-50/50 rounded-lg p-3">
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
          
          {/* Main Content - CTA */}
          <div className="px-4 py-4 text-center bg-white">
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
            
            {/* QR Code */}
            <div className="py-3">
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
          <div className="bg-gray-50 px-4 py-3">
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
