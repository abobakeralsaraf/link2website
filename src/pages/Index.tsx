import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { mockBusinessData } from '@/lib/mockData';
import { Header } from '@/components/Header';
import { InputSection } from '@/components/InputSection';
import { WebsitePreview } from '@/components/WebsitePreview';
import { LoadingState } from '@/components/LoadingState';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (input: string) => {
    setIsLoading(true);
    setBusiness(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // For demo purposes, we'll use mock data
    // In production, this would call the Google Places API
    try {
      // Validate input format (Google Maps URL or Place ID)
      const isValidInput = 
        input.includes('google.com/maps') || 
        input.includes('goo.gl/maps') ||
        input.startsWith('ChIJ') ||
        input.length > 10;

      if (!isValidInput) {
        toast.error(t('errorInvalidInput'));
        setIsLoading(false);
        return;
      }

      // Use mock data for demonstration
      setBusiness({
        ...mockBusinessData,
        placeId: input.startsWith('ChIJ') ? input : 'generated-place-id',
      });
      
      toast.success(t('websiteGenerated'));
    } catch {
      toast.error(t('errorFetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    setIsLoading(true);
    setBusiness(null);

    setTimeout(() => {
      setBusiness(mockBusinessData);
      setIsLoading(false);
      toast.success(t('websiteGenerated'));
    }, 1500);
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

        {/* Main Content */}
        <div className="space-y-12">
          {!business && !isLoading && (
            <InputSection 
              onGenerate={handleGenerate}
              onDemo={handleDemo}
              isLoading={isLoading}
            />
          )}

          {isLoading && <LoadingState />}

          {business && !isLoading && (
            <div className="animate-fade-up">
              <div className="max-w-7xl mx-auto px-4 mb-6">
                <button
                  onClick={() => setBusiness(null)}
                  className="text-primary hover:underline font-medium flex items-center gap-2"
                >
                  ← Generate another website
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
