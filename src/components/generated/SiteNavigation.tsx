import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Star, MapPin, Phone, MessageSquare, Clock, Images } from 'lucide-react';

interface SiteNavigationProps {
  business: BusinessData;
}

export function SiteNavigation({ business }: SiteNavigationProps) {
  const { t, language } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const name = language === 'ar' && business.nameAr ? business.nameAr : business.name;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: t('home'), icon: Star },
    { id: 'gallery', label: t('gallery'), icon: Images },
    { id: 'reviews', label: t('customerReviews'), icon: MessageSquare },
    { id: 'hours', label: t('businessHours'), icon: Clock },
    { id: 'location', label: t('location'), icon: MapPin },
    { id: 'contact', label: t('contact'), icon: Phone },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'glass-dark shadow-lg py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">
                  {name.charAt(0)}
                </span>
              </div>
              <span className={`font-display font-bold text-lg hidden sm:block ${
                isScrolled ? 'text-primary-foreground' : 'text-primary-foreground'
              }`}>
                {name}
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isScrolled 
                      ? 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary/20' 
                      : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <motion.button
                onClick={() => scrollToSection('contact')}
                className="gradient-gold px-6 py-2.5 rounded-full text-primary-foreground font-semibold shadow-lg btn-premium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('contactUs')}
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-primary/20 text-primary-foreground"
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 lg:hidden pt-20"
          >
            <div 
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div 
              className="relative mx-4 mt-2 glass-dark rounded-2xl p-6 shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary/20 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-primary-foreground/10">
                <motion.button
                  onClick={() => scrollToSection('contact')}
                  className="w-full gradient-gold py-4 rounded-xl text-primary-foreground font-bold shadow-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  {t('contactUs')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
