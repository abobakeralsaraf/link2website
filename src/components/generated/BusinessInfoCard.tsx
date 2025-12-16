import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Globe, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface BusinessInfoCardProps {
  business: BusinessData;
}

export function BusinessInfoCard({ business }: BusinessInfoCardProps) {
  const { language, t } = useLanguage();
  
  const address = language === 'ar' && business.addressAr ? business.addressAr : business.address;
  const weekdayText = business.hours
    ? language === 'ar' && business.hours.weekdayTextAr
      ? business.hours.weekdayTextAr
      : business.hours.weekdayText
    : [];

  return (
    <Card className="shadow-card-lg border-border/50 overflow-hidden">
      <CardHeader className="bg-secondary/50 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="p-2 rounded-lg gradient-primary">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          {t('businessHours')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Open/Closed Status */}
        {business.hours?.isOpenNow !== undefined && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
            business.hours.isOpenNow 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {business.hours.isOpenNow ? (
              <>
                <CheckCircle className="h-5 w-5" />
                {t('openNow')}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5" />
                {t('closedNow')}
              </>
            )}
          </div>
        )}

        {/* Hours List */}
        {weekdayText.length > 0 && (
          <ul className="space-y-2">
            {weekdayText.map((day, index) => (
              <li 
                key={index}
                className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
              >
                <span className="text-muted-foreground">{day.split(':')[0]}</span>
                <span className="font-medium text-foreground">{day.split(': ')[1]}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Contact Info */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <span className="text-foreground">{address}</span>
          </div>
          
          {business.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              <a 
                href={`tel:${business.phone}`} 
                className="text-primary hover:underline font-medium"
              >
                {business.phone}
              </a>
            </div>
          )}
          
          {business.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <a 
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium truncate"
              >
                {business.website}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
