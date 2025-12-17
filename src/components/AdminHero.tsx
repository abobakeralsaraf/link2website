import { useLanguage } from '@/hooks/useLanguage';
import { Globe, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function AdminHero() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-primary text-sm font-medium">{t('adminBadge')}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
          {t('adminTitle')}
        </h1>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          {t('adminSubtitle')}
        </p>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-10 text-left">
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-xl border border-border/50">
            <Globe className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground mb-1">{t('featureGenerate')}</h3>
            <p className="text-sm text-muted-foreground">{t('featureGenerateDesc')}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-xl border border-border/50">
            <svg className="h-8 w-8 text-primary mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h3 className="font-semibold text-foreground mb-1">{t('featureData')}</h3>
            <p className="text-sm text-muted-foreground">{t('featureDataDesc')}</p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm p-5 rounded-xl border border-border/50">
            <svg className="h-8 w-8 text-primary mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h3 className="font-semibold text-foreground mb-1">{t('featureTemplate')}</h3>
            <p className="text-sm text-muted-foreground">{t('featureTemplateDesc')}</p>
          </div>
        </div>

        {/* CTA */}
        <Button 
          size="lg" 
          className="h-12 px-6 text-base font-semibold"
          onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
        >
          {t('adminCta')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
