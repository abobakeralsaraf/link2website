import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

interface PremiumMapSectionProps {
  business: BusinessData;
}

export function PremiumMapSection({ business }: PremiumMapSectionProps) {
  const { t, language } = useLanguage();
  
  const address = language === 'ar' && business.addressAr ? business.addressAr : business.address;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`;
  
  // Create embed URL from placeId or address
  const embedUrl = business.placeId 
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=place_id:${business.placeId}&zoom=16`
    : `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(business.address)}&zoom=16`;

  return (
    <section className="py-20 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 mb-6">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">
              {t('ourLocation')}
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('findUsOnMap')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {address}
          </p>
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-card-lg border border-border/50"
        >
          {/* Map Iframe */}
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
          
          {/* Floating Directions Button */}
          <motion.a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute bottom-6 right-6 inline-flex items-center gap-3 px-6 py-3 gradient-gold rounded-full text-primary-foreground font-semibold shadow-lg btn-premium"
          >
            <Navigation className="w-5 h-5" />
            {t('getDirections')}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
