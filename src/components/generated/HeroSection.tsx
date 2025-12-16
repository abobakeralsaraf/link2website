import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Star, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroSectionProps {
  business?: BusinessData;
}

export function HeroSection({ business }: HeroSectionProps) {
  const { t } = useLanguage();
  
  const name = business 
    ? (useLanguage().language === 'ar' && business.nameAr ? business.nameAr : business.name)
    : null;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/60 to-foreground/80" />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 px-4 py-20 text-center max-w-4xl mx-auto">
        <div className="animate-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="text-white/90 text-sm font-medium">{t('heroTrusted')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {name || t('heroTitle')}
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Rating badge if business exists */}
          {business?.rating && (
            <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
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

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-base font-semibold gradient-primary hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('heroCta')}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-base font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('heroCtaSecondary')}
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="h-6 w-6 text-white/60" />
        </div>
      </div>
    </section>
  );
}
