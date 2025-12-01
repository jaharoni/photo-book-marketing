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

export interface VirtualPhotoBookProps {
  spreads: Spread[];
  settings: BookSettings;
}
