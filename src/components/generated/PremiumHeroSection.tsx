import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Star, MapPin, ChevronDown } from 'lucide-react';
import defaultHeroBg from '@/assets/hero-bg.jpg';

interface PremiumHeroSectionProps {
  business: BusinessData;
}

export function PremiumHeroSection({ business }: PremiumHeroSectionProps) {
  const { t, language } = useLanguage();
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  const address = language === 'ar' && business.addressAr ? business.addressAr : business.address;
  
  const heroImage = business.photos && business.photos.length > 0 
    ? business.photos[0] 
    : defaultHeroBg;

  const scrollToContent = () => {
    const element = document.getElementById('gallery');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Premium Dark Overlay with Gradient */}
      <div className="absolute inset-0 gradient-dark-overlay" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Gold Border Frame */}
      <div className="absolute inset-8 md:inset-16 border border-primary/20 rounded-3xl pointer-events-none" />

      <div className="relative z-10 px-4 py-32 text-center max-w-5xl mx-auto">
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark mb-8"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-primary-foreground/80 text-sm font-medium tracking-wider uppercase">
            {t('welcomeTo')}
          </span>
        </motion.div>

        {/* Business Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 leading-tight"
        >
          <span className="text-gradient-gold">{name}</span>
        </motion.h1>

        {/* Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <MapPin className="w-5 h-5 text-primary" />
          <span className="text-primary-foreground/70 text-lg">{address}</span>
        </motion.div>

        {/* Rating Card */}
        {business.rating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex flex-col sm:flex-row items-center gap-4 glass-dark px-8 py-5 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <Star 
                    className={`h-6 w-6 ${
                      i < Math.floor(business.rating!) 
                        ? 'text-primary fill-primary' 
                        : 'text-primary-foreground/20'
                    }`} 
                  />
                </motion.div>
              ))}
            </div>
            <div className="h-8 w-px bg-primary-foreground/20 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold text-3xl">{business.rating}</span>
              <div className="text-start">
                <p className="text-primary-foreground font-semibold">{t('rating')}</p>
                <p className="text-primary-foreground/60 text-sm">({business.totalReviews} {t('reviews')})</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/60 hover:text-primary transition-colors"
        >
          <span className="text-sm font-medium tracking-wider">{t('exploreMore')}</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
