import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from './LanguageToggle';
import { MapPin, Menu, X, Mail, Phone } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { key: 'navHome', href: '#' },
    { key: 'navAbout', href: '#about' },
    { key: 'navServices', href: '#services' },
    { key: 'navReviews', href: '#reviews' },
    { key: 'navContact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="hidden md:flex items-center justify-end gap-4 py-2 text-sm border-b border-border/30">
          <a 
            href="mailto:contact@example.com" 
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>contact@example.com</span>
          </a>
          <a 
            href="tel:+1234567890" 
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>+1 (234) 567-890</span>
          </a>
        </div>

        {/* Main navbar */}
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl gradient-primary transition-transform group-hover:scale-105">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">{t('appName')}</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-secondary/50 transition-all"
              >
                {t(link.key as any)}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 py-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium text-foreground/80 hover:text-primary rounded-lg hover:bg-secondary/50 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.key as any)}
                </a>
              ))}
            </nav>
            
            {/* Mobile contact info */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border/30 px-4">
              <a 
                href="mailto:contact@example.com" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>contact@example.com</span>
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>+1 (234) 567-890</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
