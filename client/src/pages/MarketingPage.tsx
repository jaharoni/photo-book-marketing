import { useEffect, useState } from 'react';
import VirtualPhotoBook from '../components/VirtualPhotoBook/VirtualPhotoBook';
import LeadCaptureForm from '../components/LeadCaptureForm/LeadCaptureForm';
import { Spread, BookSettings } from '../components/VirtualPhotoBook/types';
import { adaptSpreadsData, adaptSettingsData } from '../components/VirtualPhotoBook/dataAdapter';
import styles from './MarketingPage.module.css';

interface PageData {
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  detailsText: string;
  bulletPoints: string[];
  thumbnails: string[];
}

const MarketingPage = () => {
  const [spreads, setSpreads] = useState<Spread[]>([]);
  const [settings, setSettings] = useState<BookSettings | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, settingsRes] = await Promise.all([
          fetch('/api/book'),
          fetch('/api/settings'),
        ]);

        if (!bookRes.ok || !settingsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const bookData = await bookRes.json();
        const settingsData = await settingsRes.json();

        setSpreads(adaptSpreadsData(bookData));
        setSettings(adaptSettingsData(settingsData));
        setPageData({
          heroTitle: settingsData.bookTitle,
          heroSubtitle: settingsData.subtitle,
          primaryCtaLabel: settingsData.primaryCtaLabel || 'Buy the Photo Book',
          primaryCtaLink: settingsData.primaryCtaLink || '#buy',
          secondaryCtaLabel: settingsData.secondaryCtaLabel || 'View Full Gallery',
          secondaryCtaLink: settingsData.secondaryCtaLink || '#gallery',
          detailsText: settingsData.detailsText || '',
          bulletPoints: settingsData.bulletPoints || [],
          thumbnails: settingsData.thumbnails || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!settings || !pageData) {
    return <div className={styles.error}>No data available</div>;
  }

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{pageData.heroTitle}</h1>
            <p className={styles.heroSubtitle}>{pageData.heroSubtitle}</p>
            <div className={styles.heroCtas}>
              <a href={pageData.primaryCtaLink} className={styles.primaryCta}>
                {pageData.primaryCtaLabel}
              </a>
              <a href={pageData.secondaryCtaLink} className={styles.secondaryCta}>
                {pageData.secondaryCtaLabel}
              </a>
            </div>
          </div>
          <div className={styles.heroBook}>
            <VirtualPhotoBook spreads={spreads} settings={settings} />
          </div>
        </div>
      </section>

      {/* Book Details Section */}
      <section className={styles.details}>
        <div className={styles.detailsContainer}>
          <h2 className={styles.sectionTitle}>About This Book</h2>
          {pageData.detailsText && (
            <p className={styles.detailsText}>{pageData.detailsText}</p>
          )}
          {pageData.bulletPoints.length > 0 && (
            <ul className={styles.bulletList}>
              {pageData.bulletPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          )}
          {pageData.thumbnails.length > 0 && (
            <div className={styles.thumbnailStrip}>
              {pageData.thumbnails.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className={styles.thumbnail}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className={styles.leadCapture}>
        <div className={styles.leadCaptureContainer}>
          <h2 className={styles.sectionTitle}>Stay Updated</h2>
          <p className={styles.leadCaptureText}>
            Be the first to know about new editions and special offers.
          </p>
          <LeadCaptureForm />
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacy Policy</a>
            <a href="#contact">Contact</a>
          </div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Premium Photo Books. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;
