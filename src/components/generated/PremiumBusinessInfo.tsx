import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, MapPin, Phone, Globe } from 'lucide-react';

interface PremiumBusinessInfoProps {
  business: BusinessData;
}

export function PremiumBusinessInfo({ business }: PremiumBusinessInfoProps) {
  const { language, t } = useLanguage();
  
  const address = language === 'ar' && business.addressAr ? business.addressAr : business.address;
  const weekdayText = business.hours
    ? language === 'ar' && business.hours.weekdayTextAr
      ? business.hours.weekdayTextAr
      : business.hours.weekdayText
    : [];

  return (
    <section id="hours" className="py-20 md:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold text-sm tracking-wider uppercase">
                {t('businessHours')}
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
              {t('whenToVisit')}
            </h2>

            {/* Open/Closed Status */}
            {business.hours?.isOpenNow !== undefined && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-lg mb-8 ${
                  business.hours.isOpenNow 
                    ? 'bg-accent/10 text-accent' 
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {business.hours.isOpenNow ? (
                  <>
                    <CheckCircle className="h-6 w-6" />
                    {t('openNow')}
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6" />
                    {t('closedNow')}
                  </>
                )}
              </motion.div>
            )}

            {/* Hours List */}
            {weekdayText.length > 0 && (
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50">
                <div className="space-y-4">
                  {weekdayText.map((day, index) => {
                    const [dayName, hours] = day.split(': ');
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between items-center py-3 border-b border-border/30 last:border-0"
                      >
                        <span className="text-muted-foreground font-medium">{dayName}</span>
                        <span className="font-semibold text-foreground">{hours}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="location"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent/10 mb-6">
              <MapPin className="w-5 h-5 text-accent" />
              <span className="text-accent font-semibold text-sm tracking-wider uppercase">
                {t('findUs')}
              </span>
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
              {t('visitOurLocation')}
            </h2>

            <div className="space-y-6">
              {/* Address */}
              <motion.div 
                whileHover={{ x: 10 }}
                className="flex items-start gap-5 p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{t('address')}</h4>
                  <p className="text-muted-foreground leading-relaxed">{address}</p>
                </div>
              </motion.div>
              
              {/* Phone */}
              {business.phone && (
                <motion.a
                  href={`tel:${business.phone}`}
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-5 p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:border-primary/30 transition-all duration-300 block"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-emerald flex items-center justify-center flex-shrink-0">
                    <Phone className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('phone')}</h4>
                    <p className="text-primary font-medium text-lg">{business.phone}</p>
                  </div>
                </motion.a>
              )}
              
              {/* Website */}
              {business.website && (
                <motion.a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 10 }}
                  className="flex items-start gap-5 p-6 bg-card rounded-2xl shadow-card border border-border/50 hover:border-primary/30 transition-all duration-300 block"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center flex-shrink-0">
                    <Globe className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{t('website')}</h4>
                    <p className="text-primary font-medium truncate max-w-xs">{business.website}</p>
                  </div>
                </motion.a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
