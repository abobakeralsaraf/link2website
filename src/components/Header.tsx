import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from './LanguageToggle';
import { MapPin } from 'lucide-react';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">{t('appName')}</span>
        </div>
        
        <LanguageToggle />
      </div>
    </header>
  );
}
