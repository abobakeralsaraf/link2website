export interface BusinessData {
  placeId: string;
  name: string;
  nameAr?: string;
  address: string;
  addressAr?: string;
  phone?: string;
  website?: string;
  rating?: number;
  totalReviews?: number;
  photos: string[];
  reviews: Review[];
  hours?: BusinessHours;
  location: {
    lat: number;
    lng: number;
  };
  types?: string[];
  priceLevel?: number;
  isOpen?: boolean;
}

export interface Review {
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text: string;
  textAr?: string;
  time: string;
  relativeTime: string;
}

export interface BusinessHours {
  periods: DayPeriod[];
  weekdayText: string[];
  weekdayTextAr?: string[];
  isOpenNow?: boolean;
}

export interface DayPeriod {
  day: number;
  open: string;
  close: string;
}

export interface PaymentMethodType {
  id: string;
  name: string;
  name_ar: string;
  icon_url: string;
}

export interface PaymentMethod {
  id: string;
  methodTypeId?: string;
  methodName: string;
  accountOwner: string;
  accountNumber: string;
  paymentLink: string;
}

export interface GeneratedSite {
  business: BusinessData;
  generatedAt: string;
  language: 'en' | 'ar';
}
