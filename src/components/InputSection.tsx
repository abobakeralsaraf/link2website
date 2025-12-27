import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, MapPin, Zap } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (input: string) => void;
  isLoading: boolean;
}

const DEMO_URL = 'https://www.google.com/maps/place/Ramses+Hilton/@29.9958183,31.1568785,12z/data=!4m13!1m2!2m1!1shilton+!3m9!1s0x145840c381a29537:0xf1d5b3a64a0e4de1!5m2!4m1!1i2!8m2!3d30.050365!4d31.2320411!15sCgZoaWx0b24iA4gBAVoIIgZoaWx0b26SAQVob3RlbOABAA!16s%2Fg%2F1tf3kxjk?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D';

export function InputSection({ onGenerate, isLoading }: InputSectionProps) {
  const { t, dir } = useLanguage();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(input.trim());
    }
  };

  const handleTryDemo = () => {
    setInput(DEMO_URL);
    onGenerate(DEMO_URL);
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4">
      <div className="bg-card rounded-2xl shadow-card-lg p-6 md:p-8 border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {t('inputTitle')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${dir === 'rtl' ? 'right-4' : 'left-4'}`} />
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('inputPlaceholder')}
              className={`h-14 text-base bg-background border-2 border-border focus:border-primary ${dir === 'rtl' ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              dir={dir}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="flex-1"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{t('generating')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>{t('generateButton')}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleTryDemo}
              disabled={isLoading}
              className="gap-2"
            >
              <Zap className="h-5 w-5" />
              <span>{t('tryDemo')}</span>
            </Button>
          </div>
        </form>

        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t('demoDescription')}
        </p>
      </div>
    </section>
  );
}
