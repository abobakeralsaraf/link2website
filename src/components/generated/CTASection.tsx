import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Globe, MapPin } from 'lucide-react';

interface CTASectionProps {
  business: BusinessData;
}

export function CTASection({ business }: CTASectionProps) {
  const { t, language } = useLanguage();
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  const phoneDigits = business.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = `https://wa.me/${phoneDigits}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`;

  return (
    <section className="gradient-primary py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
          {t('getInTouch')}
        </h2>
        <p className="text-primary-foreground/80 mb-8 text-lg">
          {name}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {business.phone && (
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="min-w-[140px]"
            >
              <a href={`tel:${business.phone}`}>
                <Phone className="h-5 w-5" />
                {t('call')}
              </a>
            </Button>
          )}
          
          {business.phone && (
            <Button
              size="lg"
              asChild
              className="min-w-[140px] bg-green-600 hover:bg-green-700 text-primary-foreground"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                {t('whatsapp')}
              </a>
            </Button>
          )}
          
          {business.website && (
            <Button
              variant="secondary"
              size="lg"
              asChild
              className="min-w-[140px]"
            >
              <a href={business.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-5 w-5" />
                {t('visitWebsite')}
              </a>
            </Button>
          )}
          
          <Button
            variant="outline"
            size="lg"
            asChild
            className="min-w-[140px] border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-5 w-5" />
              {t('getDirections')}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
