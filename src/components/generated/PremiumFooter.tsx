import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Heart, ExternalLink } from 'lucide-react';

interface PremiumFooterProps {
  business: BusinessData;
}

export function PremiumFooter({ business }: PremiumFooterProps) {
  const { t, language } = useLanguage();
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                {name.charAt(0)}
              </span>
            </div>
            <span className="font-display font-bold text-lg text-background">
              {name}
            </span>
          </motion.div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <p className="text-background/60 text-sm">
              © {currentYear} {name}. {t('allRightsReserved')}
            </p>
          </motion.div>

          {/* Powered By */}
          <motion.a
            href="https://saroara.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 text-background/50 hover:text-background/80 transition-colors text-sm"
          >
            <span>{t('madeWith')}</span>
            <Heart className="w-4 h-4 text-destructive fill-destructive" />
            <span>{t('by')}</span>
            <span className="font-semibold text-primary">Saroara</span>
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
