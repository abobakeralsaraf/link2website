import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { filterPositiveReviews } from '@/lib/reviewUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, MessageSquare, User } from 'lucide-react';

interface ReviewsSectionProps {
  business: BusinessData;
}

export function ReviewsSection({ business }: ReviewsSectionProps) {
  const { language, t } = useLanguage();

  // فلترة التقييمات: 4-5 نجوم فقط بدون كلمات سلبية
  const filteredReviews = filterPositiveReviews(business.reviews, language);

  // إخفاء القسم إذا لم توجد تقييمات إيجابية
  if (filteredReviews.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-card-lg border-border/50 overflow-hidden">
      <CardHeader className="bg-secondary/50 border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-foreground">
          <div className="p-2 rounded-lg gradient-primary">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          {t('customerReviews')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {filteredReviews.slice(0, 5).map((review, index) => (
            <div 
              key={index}
              className="p-4 bg-secondary/30 rounded-xl border border-border/30 animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                {review.authorPhoto ? (
                  <img
                    src={review.authorPhoto}
                    alt={review.authorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">
                      {review.authorName}
                    </h4>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {review.relativeTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating 
                            ? 'text-yellow-500 fill-yellow-500' 
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-foreground leading-relaxed">
                    {language === 'ar' && review.textAr ? review.textAr : review.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
