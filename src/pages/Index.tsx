import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData, PaymentMethod } from '@/lib/types';
import { Header } from '@/components/Header';
import { InputSection } from '@/components/InputSection';
import { WebsitePreview } from '@/components/WebsitePreview';
import { LoadingState } from '@/components/LoadingState';
import { AdminHero } from '@/components/AdminHero';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { t } = useLanguage();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (input: string, payments: PaymentMethod[]) => {
    setIsLoading(true);
    setBusiness(null);
    setPaymentMethods([]);
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
      setPaymentMethods(payments);
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
    setPaymentMethods([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Admin Hero Section - show when no business loaded */}
        {!business && !isLoading && (
          <AdminHero />
        )}

        {/* Generator Section */}
        {!business && !isLoading && (
          <section id="generator" className="py-16 bg-secondary/30">
            <div className="max-w-7xl mx-auto px-4">
              {/* Error Display */}
              {error && (
                <div className="max-w-3xl mx-auto mb-6">
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('errorTitle')}</p>
                      <p className="text-sm mt-1 opacity-90">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <InputSection 
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <section className="py-20">
            <LoadingState />
          </section>
        )}

        {/* Generated Client Website Preview */}
        {business && !isLoading && (
          <div className="animate-fade-up">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <button
                onClick={handleReset}
                className="text-primary hover:underline font-medium flex items-center gap-2"
              >
                ← {t('generateAnother')}
              </button>
            </div>
            <WebsitePreview business={business} paymentMethods={paymentMethods} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
