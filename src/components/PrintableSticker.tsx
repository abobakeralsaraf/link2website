import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BusinessData } from '@/lib/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Download, Printer, Star, MapPin, Clock, Quote, User } from 'lucide-react';
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

  // Get hero image (first photo)
  const heroImage = business.photos?.[0];

  // Get display photos (up to 3 small ones)
  const displayPhotos = business.photos?.slice(1, 4) || [];

  // Get top reviews (up to 2)
  const topReviews = business.reviews?.slice(0, 2) || [];

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
    svg.setAttribute('height', '700');

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
          {/* Hero Image Header */}
          {heroImage ? (
            <div className="relative h-40 overflow-hidden">
              <img 
                src={heroImage} 
                alt={name}
                className="w-full h-full object-cover"
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
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 p-4 border-b">
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
            <div className="flex gap-1 p-2 bg-secondary/20">
              {displayPhotos.map((photo, index) => (
                <div key={index} className="flex-1 h-20 overflow-hidden rounded-lg">
                  <img 
                    src={photo} 
                    alt={`${name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Customer Reviews Section */}
          {topReviews.length > 0 && (
            <div className="p-3 space-y-2">
              {topReviews.map((review, index) => (
                <div key={index} className="bg-secondary/30 rounded-xl p-3 relative">
                  <Quote className="absolute top-2 right-2 w-4 h-4 text-primary/20" />
                  <div className="flex items-center gap-2 mb-1">
                    {review.authorPhoto ? (
                      <img
                        src={review.authorPhoto}
                        alt={review.authorName}
                        className="w-6 h-6 rounded-full object-cover"
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
              <div className="inline-block p-2 bg-secondary/50 rounded-lg">
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
          <div className="bg-secondary/30 p-3 border-t">
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
