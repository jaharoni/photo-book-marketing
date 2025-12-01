import { Spread, BookSettings } from './types';

/**
 * Adapts raw JSON data to component-compatible types
 * Add transformation logic here if backend format differs from component needs
 */
export const adaptSpreadsData = (rawData: any[]): Spread[] => {
  return rawData.map((item) => ({
    id: item.id,
    imageUrl: item.imageUrl,
    title: item.title,
    caption: item.caption,
    ctaLabel: item.ctaLabel,
    ctaLink: item.ctaLink,
  }));
};

export const adaptSettingsData = (rawData: any): BookSettings => {
  return {
    bookTitle: rawData.bookTitle,
    subtitle: rawData.subtitle,
    autoplayIntervalMs: rawData.autoplayIntervalMs || 3000,
    inactivityTimeoutMs: rawData.inactivityTimeoutMs || 5000,
  };
};
