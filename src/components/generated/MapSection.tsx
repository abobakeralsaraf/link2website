import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapSectionProps {
  business: BusinessData;
}

export function MapSection({ business }: MapSectionProps) {
  const { t } = useLanguage();
  
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(business.address)}&zoom=15`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.address)}`;

  return (
    <Card className="shadow-card-lg border-border/50 overflow-hidden">
      <CardHeader className="bg-secondary/50 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="p-2 rounded-lg gradient-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          {t('location')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video relative bg-secondary">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, position: 'absolute', inset: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Business Location Map"
          />
        </div>
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t('getDirections')}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
