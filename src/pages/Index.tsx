import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Header } from '@/components/Header';
import { InputSection } from '@/components/InputSection';
import { WebsitePreview } from '@/components/WebsitePreview';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { t } = useLanguage();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: string) => {
    setIsLoading(true);
    setBusiness(null);
    setError(null);

    try {
      // Validate input format
      const isValidInput = 
        input.includes('google.com/maps') || 
        input.includes('goo.gl') ||
        input.includes('maps.app.goo.gl') ||
        input.startsWith('ChIJ') ||
        input.startsWith('0x') ||
        input.length > 10;

      if (!isValidInput) {
        setError(t('errorInvalidInput'));
        toast.error(t('errorInvalidInput'));
        setIsLoading(false);
        return;
      }

      // Call edge function to fetch place data
      const { data, error: fnError } = await supabase.functions.invoke('google-places', {
        body: { input }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        throw new Error(fnError.message || 'Failed to fetch place data');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        setError(data.error);
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      if (!data?.data) {
        throw new Error('No data received from API');
      }

      setBusiness(data.data);
      toast.success(t('websiteGenerated'));
    } catch (err: any) {
      console.error('Error generating website:', err);
      const errorMessage = err.message || t('errorFetchFailed');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBusiness(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-16">
        {/* Hero Section */}
        {!business && !isLoading && (
          <section className="py-12 md:py-20 text-center px-4">
            <div className="max-w-3xl mx-auto animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 font-medium">
                <Sparkles className="h-4 w-4" />
                <span>AI-Powered Website Generator</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 leading-tight">
                {t('tagline')}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Simply paste a Google Maps link and watch your professional business website come to life in seconds.
              </p>
            </div>
          </section>
        )}

        {/* Error Display */}
        {error && !isLoading && !business && (
          <div className="max-w-3xl mx-auto px-4 mb-6">
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{t('errorTitle')}</p>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-12">
          {!business && !isLoading && (
            <InputSection 
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          )}

          {isLoading && <LoadingState />}

          {business && !isLoading && (
            <div className="animate-fade-up">
              <div className="max-w-7xl mx-auto px-4 mb-6">
                <button
                  onClick={handleReset}
                  className="text-primary hover:underline font-medium flex items-center gap-2"
                >
                  ← {t('generateAnother')}
                </button>
              </div>
              <WebsitePreview business={business} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
