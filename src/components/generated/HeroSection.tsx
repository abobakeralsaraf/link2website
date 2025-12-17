import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Star } from 'lucide-react';
import defaultHeroBg from '@/assets/hero-bg.jpg';

interface HeroSectionProps {
  business: BusinessData;
}

export function HeroSection({ business }: HeroSectionProps) {
  const { t, language } = useLanguage();
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  
  // Use first Google Maps photo if available, otherwise fall back to default
  const heroImage = business.photos && business.photos.length > 0 
    ? business.photos[0] 
    : defaultHeroBg;

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image - Dynamic from Google Maps or fallback */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/60 to-foreground/80" />

      <div className="relative z-10 px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="animate-fade-up">
          {/* Business Name */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {name}
          </h1>

          {/* Rating badge */}
          {business.rating && (
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(business.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-white/30'}`} 
                  />
                ))}
              </div>
              <span className="text-white font-bold text-lg">{business.rating}</span>
              <span className="text-white/70">({business.totalReviews} {t('reviews')})</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
