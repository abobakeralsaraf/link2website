import { useLanguage } from '@/hooks/useLanguage';
import { BusinessData } from '@/lib/types';
import { motion } from 'framer-motion';
import { Star, MessageSquare, User, Quote } from 'lucide-react';

interface PremiumReviewsProps {
  business: BusinessData;
}

export function PremiumReviews({ business }: PremiumReviewsProps) {
  const { language, t } = useLanguage();

  if (business.reviews.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="reviews" className="py-20 md:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="text-primary font-semibold text-sm tracking-wider uppercase">
              {t('customerReviews')}
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('whatOurClientsSay')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('reviewsDescription')}
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {business.reviews.slice(0, 6).map((review, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-card rounded-3xl p-6 md:p-8 shadow-card hover:shadow-card-lg transition-all duration-500 border border-border/50 hover:border-primary/30"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-primary" />
              </div>
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating 
                        ? 'text-primary fill-primary' 
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-foreground leading-relaxed mb-6 line-clamp-4">
                {language === 'ar' && review.textAr ? review.textAr : review.text}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                {review.authorPhoto ? (
                  <img
                    src={review.authorPhoto}
                    alt={review.authorName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-foreground">
                    {review.authorName}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {review.relativeTime}
                  </span>
                </div>
              </div>
              
              {/* Decorative gradient line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
