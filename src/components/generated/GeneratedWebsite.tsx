import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { HeroSection } from './HeroSection';
import { BusinessInfoCard } from './BusinessInfoCard';
import { MapSection } from './MapSection';
import { PhotoGallery } from './PhotoGallery';
import { ReviewsSection } from './ReviewsSection';
import { CTASection } from './CTASection';
import { WhatsAppButton } from '../WhatsAppButton';

interface GeneratedWebsiteProps {
  business: BusinessData;
}

export function GeneratedWebsite({ business }: GeneratedWebsiteProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-background min-h-screen">
      <HeroSection business={business} />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <PhotoGallery business={business} />
            <ReviewsSection business={business} />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6 md:space-y-8">
            <BusinessInfoCard business={business} />
            <MapSection business={business} />
          </div>
        </div>
      </div>
      
      <CTASection business={business} />
      
      {/* WhatsApp Button - only renders if phone exists */}
      {business.phone && <WhatsAppButton phoneNumber={business.phone} />}
      
      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            {t('poweredBy')}
          </p>
        </div>
      </footer>
    </div>
  );
}
