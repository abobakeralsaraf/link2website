import { useLanguage } from '@/hooks/useLanguage';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-card rounded-2xl shadow-card-lg p-8 text-center border border-border/50">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 rounded-full gradient-primary opacity-20 animate-ping" />
          <div className="absolute inset-2 rounded-full gradient-primary flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{t('loading')}</h3>
        <p className="text-muted-foreground">{t('fetchingData')}</p>
      </div>
    </div>
  );
}
