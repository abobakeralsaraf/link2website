import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoGalleryProps {
  business: BusinessData;
}

export function PhotoGallery({ business }: PhotoGalleryProps) {
  const { t, dir } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % business.photos.length);
    }
  };
  
  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + business.photos.length) % business.photos.length);
    }
  };

  if (business.photos.length === 0) return null;

  return (
    <>
      <Card className="shadow-card-lg border-border/50 overflow-hidden">
        <CardHeader className="bg-secondary/50 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="p-2 rounded-lg gradient-primary">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </div>
            {t('photoGallery')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {business.photos.slice(0, 6).map((photo, index) => (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={photo}
                  alt={`${business.name} photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300" />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20 ${dir === 'rtl' ? 'right-4' : 'left-4'}`}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-1/2 -translate-y-1/2 text-primary-foreground hover:bg-primary-foreground/20 ${dir === 'rtl' ? 'left-4' : 'right-4'}`}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <img
            src={business.photos[lightboxIndex]}
            alt={`${business.name} photo ${lightboxIndex + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
