import { Review } from './types';

// قائمة الكلمات السلبية بالإنجليزية والعربية
const NEGATIVE_KEYWORDS = [
  // English
  'old', 'dirty', 'bad', 'slow', 'expensive', 'noisy',
  'terrible', 'awful', 'worst', 'horrible', 'rude',
  'unprofessional', 'disgusting', 'overpriced', 'disappointing',
  'poor', 'mediocre', 'avoid', 'never again', 'waste',
  // Arabic
  'سيء', 'سيئ', 'قديم', 'وسخ', 'غالي', 'زحمة', 'إزعاج',
  'قذر', 'بطيء', 'اسوء', 'أسوء', 'زفت', 'وحشة', 'لا انصح',
  'مقرف', 'فاشل', 'ضعيف', 'مخيب', 'نصب', 'غش'
];

/**
 * فلترة التقييمات: 4-5 نجوم فقط بدون كلمات سلبية
 * @param reviews - قائمة التقييمات
 * @param language - اللغة الحالية ('en' أو 'ar')
 * @returns التقييمات المفلترة
 */
export function filterPositiveReviews(
  reviews: Review[],
  language: 'en' | 'ar' = 'en'
): Review[] {
  return reviews.filter(review => {
    // رفض أي تقييم أقل من 4 نجوم
    if (review.rating < 4) return false;

    // الحصول على النص المناسب حسب اللغة
    const text = (language === 'ar' && review.textAr
      ? review.textAr : review.text).toLowerCase();

    // رفض التقييمات التي تحتوي على كلمات سلبية
    const hasNegativeKeyword = NEGATIVE_KEYWORDS.some(keyword =>
      text.includes(keyword.toLowerCase())
    );

    return !hasNegativeKeyword;
  });
}
