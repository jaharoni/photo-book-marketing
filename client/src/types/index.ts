export interface Spread {
  id: string;
  imageUrl: string;
  title: string;
  caption: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface BookSettings {
  bookTitle: string;
  subtitle: string;
  autoplayIntervalMs: number;
  inactivityTimeoutMs: number;
}

export interface LeadFormData {
  name: string;
  email: string;
  interest: 'Buying now' | 'Gifting' | 'Future editions';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
