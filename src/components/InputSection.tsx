import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Sparkles, MapPin } from 'lucide-react';

interface InputSectionProps {
  onGenerate: (input: string) => void;
  isLoading: boolean;
}

export function InputSection({ onGenerate, isLoading }: InputSectionProps) {
  const { t, dir } = useLanguage();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(input.trim());
    }
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

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
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
        </form>

        <p className="mt-4 text-sm text-muted-foreground text-center">
          {t('demoDescription')}
        </p>
      </div>
    </section>
  );
}
