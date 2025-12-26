import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Globe, MapPin, Send, Sparkles } from 'lucide-react';

interface PremiumCTAProps {
  business: BusinessData;
}

export function PremiumCTA({ business }: PremiumCTAProps) {
  const { t, language } = useLanguage();
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  const phoneDigits = business.phone?.replace(/\D/g, '') || '';
  const whatsappUrl = `https://wa.me/${phoneDigits}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`;

  const buttons = [
    {
      show: !!business.phone,
      href: `tel:${business.phone}`,
      icon: Phone,
      label: t('callUs'),
      variant: 'gold' as const,
    },
    {
      show: !!business.phone,
      href: whatsappUrl,
      icon: MessageCircle,
      label: t('whatsapp'),
      variant: 'emerald' as const,
      external: true,
    },
    {
      show: !!business.website,
      href: business.website || '',
      icon: Globe,
      label: t('visitWebsite'),
      variant: 'outline' as const,
      external: true,
    },
    {
      show: true,
      href: directionsUrl,
      icon: MapPin,
      label: t('getDirections'),
      variant: 'outline' as const,
      external: true,
    },
  ];

  return (
    <section id="contact" className="relative py-24 md:py-36 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-foreground/5 blur-3xl" />
      
      {/* Floating Sparkles */}
      <motion.div
        animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute top-20 left-20"
      >
        <Sparkles className="w-8 h-8 text-primary-foreground/30" />
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute bottom-20 right-20"
      >
        <Sparkles className="w-6 h-6 text-primary-foreground/30" />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-8">
            <Send className="w-5 h-5 text-primary-foreground" />
            <span className="text-primary-foreground/80 font-semibold text-sm tracking-wider uppercase">
              {t('reachOut')}
            </span>
          </div>
          
          <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            {t('getInTouch')}
          </h2>
          
          <p className="text-primary-foreground/70 text-xl max-w-2xl mx-auto mb-12">
            {t('ctaDescription')} <span className="text-primary-foreground font-semibold">{name}</span>
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {buttons.filter(btn => btn.show).map((btn, index) => (
            <motion.a
              key={index}
              href={btn.href}
              target={btn.external ? '_blank' : undefined}
              rel={btn.external ? 'noopener noreferrer' : undefined}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`
                inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300
                ${btn.variant === 'gold' 
                  ? 'bg-primary-foreground text-foreground shadow-lg hover:shadow-xl' 
                  : btn.variant === 'emerald'
                  ? 'bg-accent text-accent-foreground shadow-lg hover:shadow-xl'
                  : 'border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10'
                }
              `}
            >
              <btn.icon className="w-5 h-5" />
              {btn.label}
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
