/**
 * VirtualPhotoBook Component
 * 
 * An interactive 3D book viewer with auto-animation and smart pausing:
 * 
 * ANIMATION BEHAVIOR:
 * 1. On mount: Starts auto-playing through spreads at settings.autoplayIntervalMs intervals
 * 2. On user interaction (click, swipe, keyboard): Immediately pauses autoplay
 * 3. After inactivity: Resumes autoplay after settings.inactivityTimeoutMs of no interaction
 * 4. Tab visibility: Pauses when tab is not visible (optional, uses Page Visibility API)
 * 
 * INTERACTION:
 * - Desktop: Click arrows, use keyboard left/right, hover for captions
 * - Mobile: Swipe left/right, tap for captions
 * 
 * HOW TO TWEAK TIMING:
 * Edit content/settings.json:
 * - autoplayIntervalMs: Time between page turns (default 3000ms = 3 seconds)
 * - inactivityTimeoutMs: Wait time before resuming (default 5000ms = 5 seconds)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { VirtualPhotoBookProps } from './types';
import { useSwipe } from '../../hooks/useSwipe';
import styles from './VirtualPhotoBook.module.css';

const VirtualPhotoBook = ({ spreads, settings }: VirtualPhotoBookProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplayActive, setIsAutoplayActive] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const autoplayIntervalRef = useRef<number | null>(null);
  const inactivityTimeoutRef = useRef<number | null>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % spreads.length);
  }, [spreads.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + spreads.length) % spreads.length);
  }, [spreads.length]);

  // Handle user interaction - pause autoplay and start inactivity timer
  const handleUserInteraction = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    setIsAutoplayActive(false);

    // Clear existing timers
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Set new inactivity timeout to resume autoplay
    inactivityTimeoutRef.current = window.setTimeout(() => {
      setIsAutoplayActive(true);
    }, settings.inactivityTimeoutMs);
  }, [settings.inactivityTimeoutMs]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleUserInteraction();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        handleUserInteraction();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, handleUserInteraction]);

  // Swipe gesture support for mobile
  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      handleUserInteraction();
      goToNext();
    },
    onSwipeRight: () => {
      handleUserInteraction();
      goToPrevious();
    },
  });

  // Autoplay logic
  useEffect(() => {
    if (isAutoplayActive && spreads.length > 1) {
      autoplayIntervalRef.current = window.setInterval(() => {
        goToNext();
      }, settings.autoplayIntervalMs);
    }

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [isAutoplayActive, goToNext, settings.autoplayIntervalMs, spreads.length]);

  // Page Visibility API - pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (autoplayIntervalRef.current) {
          clearInterval(autoplayIntervalRef.current);
          autoplayIntervalRef.current = null;
        }
      } else if (isAutoplayActive) {
        autoplayIntervalRef.current = window.setInterval(() => {
          goToNext();
        }, settings.autoplayIntervalMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAutoplayActive, goToNext, settings.autoplayIntervalMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  if (!spreads || spreads.length === 0) {
    return <div>No spreads available</div>;
  }

  const currentSpread = spreads[currentIndex];
  const isMobile = window.innerWidth <= 768;

  const handleArrowClick = (direction: 'prev' | 'next') => {
    handleUserInteraction();
    direction === 'prev' ? goToPrevious() : goToNext();
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Desktop: Open book with two pages */}
      <div className={styles.bookDesktop}>
        <div
          className={styles.spread}
          {...swipeHandlers}
          onClick={handleUserInteraction}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={currentSpread.imageUrl}
            alt={currentSpread.title}
            className={styles.spreadImage}
          />
          <div className={styles.spreadContent}>
            <h3 className={styles.spreadTitle}>{currentSpread.title}</h3>
            <p className={styles.spreadCaption}>{currentSpread.caption}</p>
            {currentSpread.ctaLabel && currentSpread.ctaLink && (
              <a
                href={currentSpread.ctaLink}
                className={styles.spreadCta}
                onClick={(e) => e.stopPropagation()}
              >
                {currentSpread.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: Single page view */}
      <div className={styles.bookMobile}>
        <div
          className={styles.spread}
          {...swipeHandlers}
          onClick={handleUserInteraction}
        >
          <img
            src={currentSpread.imageUrl}
            alt={currentSpread.title}
            className={styles.spreadImage}
          />
          <div className={styles.spreadContent}>
            <h3 className={styles.spreadTitle}>{currentSpread.title}</h3>
            <p className={styles.spreadCaption}>{currentSpread.caption}</p>
            {currentSpread.ctaLabel && currentSpread.ctaLink && (
              <a
                href={currentSpread.ctaLink}
                className={styles.spreadCta}
                onClick={(e) => e.stopPropagation()}
              >
                {currentSpread.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className={styles.controls}>
        <button
          className={styles.navButton}
          onClick={() => handleArrowClick('prev')}
          disabled={spreads.length <= 1}
          aria-label="Previous page"
        >
          <span>←</span> Previous
        </button>
        
        <span className={styles.pageIndicator}>
          Page {currentIndex + 1} of {spreads.length}
        </span>
        
        <button
          className={styles.navButton}
          onClick={() => handleArrowClick('next')}
          disabled={spreads.length <= 1}
          aria-label="Next page"
        >
          Next <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default VirtualPhotoBook;
