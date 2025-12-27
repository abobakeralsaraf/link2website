import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BusinessData } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Download, Printer, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PrintableStickerProps {
  business: BusinessData;
}

export function PrintableSticker({ business }: PrintableStickerProps) {
  const { language } = useLanguage();
  const stickerRef = useRef<HTMLDivElement>(null);
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  
  // Google Maps review link using place_id
  const reviewUrl = business.placeId 
    ? `https://search.google.com/local/writereview?placeid=${business.placeId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
  
  // WhatsApp link for ordering stickers
  const whatsappNumber = '201514167733';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  
  const handlePrint = useCallback(() => {
    window.print();
  }, []);
  
  const handleDownloadSVG = useCallback(() => {
    if (!stickerRef.current) return;
    
    // Clone the sticker element
    const clone = stickerRef.current.cloneNode(true) as HTMLElement;
    
    // Create SVG wrapper
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '600');
    
    // Create foreignObject to embed HTML
    const foreignObject = document.createElementNS(svgNS, 'foreignObject');
    foreignObject.setAttribute('width', '100%');
    foreignObject.setAttribute('height', '100%');
    foreignObject.appendChild(clone);
    svg.appendChild(foreignObject);
    
    // Serialize and download
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-sticker.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success(language === 'ar' ? 'تم تحميل الاستيكر بنجاح' : 'Sticker downloaded successfully');
  }, [name, language]);

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 justify-center print:hidden">
        <Button onClick={handleDownloadSVG} className="gap-2">
          <Download className="w-4 h-4" />
          {language === 'ar' ? 'تحميل كصورة' : 'Download as Image'}
        </Button>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          {language === 'ar' ? 'طباعة' : 'Print'}
        </Button>
      </div>
      
      {/* Printable Sticker */}
      <div className="flex justify-center">
        <div
          ref={stickerRef}
          id="printable-sticker"
          className="w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-primary/20"
          style={{ fontFamily: language === 'ar' ? 'Noto Sans Arabic, sans-serif' : 'Plus Jakarta Sans, sans-serif' }}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold">{name.charAt(0)}</span>
            </div>
            <h1 className="text-xl font-bold mb-1">{name}</h1>
            {business.rating && (
              <div className="flex items-center justify-center gap-1 text-sm opacity-90">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{business.rating}</span>
                <span>({business.totalReviews})</span>
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="p-6 text-center space-y-4">
            {/* Trust Message */}
            <div className="space-y-2">
              <p className="text-lg font-bold text-foreground leading-relaxed">
                {language === 'ar' 
                  ? 'لأننا نثق في جودة خدماتنا' 
                  : 'Because we trust our service quality'}
              </p>
              <p className="text-muted-foreground font-medium">
                {language === 'ar' 
                  ? 'ندعو الجميع لتقييمنا' 
                  : 'We invite everyone to rate us'}
              </p>
            </div>
            
            {/* Main QR Code for Google Reviews */}
            <div className="py-4">
              <div className="inline-block p-4 bg-secondary/50 rounded-xl">
                <QRCodeSVG
                  value={reviewUrl}
                  size={160}
                  level="H"
                  includeMargin={false}
                  bgColor="transparent"
                  fgColor="#000000"
                />
              </div>
              <p className="mt-3 text-sm font-semibold text-primary">
                {language === 'ar' 
                  ? 'امسح للتقييم على جوجل' 
                  : 'Scan to rate on Google'}
              </p>
            </div>
            
            {/* Decorative Stars */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className="w-6 h-6 text-yellow-400 fill-yellow-400" 
                />
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-secondary/30 p-4 border-t">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-xs text-muted-foreground">
                <p className="font-medium mb-1">
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
                  size={50}
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
