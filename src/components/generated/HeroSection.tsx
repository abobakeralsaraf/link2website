import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { MapPin, Star } from 'lucide-react';

interface HeroSectionProps {
  business: BusinessData;
}

export function HeroSection({ business }: HeroSectionProps) {
  const { language, t } = useLanguage();
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  const address = language === 'ar' && business.addressAr ? business.addressAr : business.address;

  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative px-4 py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto animate-fade-up">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground mb-4 leading-tight">
            {name}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary-foreground" />
              <span className="text-primary-foreground font-medium">{address}</span>
            </div>
          </div>

          {business.rating && (
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm px-5 py-2.5 rounded-full">
              <Star className="h-5 w-5 text-yellow-300 fill-yellow-300" />
              <span className="text-primary-foreground font-bold text-lg">{business.rating}</span>
              <span className="text-primary-foreground/80">
                ({business.totalReviews} {t('reviews')})
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
