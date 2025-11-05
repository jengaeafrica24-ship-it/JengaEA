import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sample remote images (replace or pass `slides` prop with your own URLs)
const sampleSlides = [
  {
    // local images (place real photos in public/images/africa/)
    image: '/images/africa/construction1.jpg',
    title: 'Urban construction in Africa',
    description: 'Modern building project progress',
  },
  {
    image: '/images/africa/construction2.jpg',
    title: 'Site development',
    description: 'Groundwork and early-stage site preparation',
  },
  {
    image: '/images/africa/construction3.jpg',
    title: 'Structural works',
    description: 'Concrete and steel framework',
  },
  {
    image: '/images/africa/construction4.jpg',
    title: 'Finishing touches',
    description: 'Finishing and facade work',
  },
];

/**
 * Enhanced Carousel with keyboard, swipe, lazy-loading and a11y.
 * Props:
 * - slides: array of { image, title?, description?, cta? }
 * - autoplayInterval: number (ms)
 */
export default function Carousel2({ slides, autoplayInterval = 4500 }) {
  const effectiveSlides = (slides && slides.length ? slides : sampleSlides);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  // For swipe
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  // Announce slide changes for screen readers
  const liveRef = useRef(null);

  useEffect(() => {
    if (liveRef.current) {
      const slide = effectiveSlides[current];
      const text = slide && (slide.title || `Slide ${current + 1}`);
      liveRef.current.textContent = text;
    }
  }, [current, effectiveSlides]);

  // Autoplay
  useEffect(() => {
    if (isPaused || effectiveSlides.length <= 1) return undefined;
    const t = setInterval(() => setCurrent((c) => (c + 1) % effectiveSlides.length), autoplayInterval);
    return () => clearInterval(t);
  }, [autoplayInterval, isPaused, effectiveSlides.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current]);

  const goTo = (i) => setCurrent(((i % effectiveSlides.length) + effectiveSlides.length) % effectiveSlides.length);
  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  // Touch handlers for swipe support
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };
  const onTouchMove = (e) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };
  const onTouchEnd = () => {
    const threshold = 50; // px
    if (touchDeltaX.current > threshold) prev();
    else if (touchDeltaX.current < -threshold) next();
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured projects carousel"
      className="relative w-full max-w-7xl mx-auto rounded-xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Visually hidden live region for screen readers */}
      <div className="sr-only" aria-live="polite" ref={liveRef} />

      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]">
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {effectiveSlides.map((slide, i) => (
            <div key={i} className="w-full flex-shrink-0 relative">
              {/* Use img for lazy-loading and better semantics */}
              <img
                src={slide.image}
                alt={slide.title || `Slide ${i + 1}`}
                loading={i === current || i === current + 1 ? 'eager' : 'lazy'}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80'; }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
              <div className="relative z-10 h-full flex items-center justify-center text-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  {slide.title && <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 px-4">{slide.title}</h2>}
                  {slide.description && <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 leading-relaxed px-4">{slide.description}</p>}
                  {slide.cta && (
                    <div className="mt-4 sm:mt-6">
                      <a href={slide.cta.href || '#'} className="inline-block bg-gradient-to-r from-orange-500 to-amber-500 px-5 sm:px-6 py-2 sm:py-3 rounded-lg text-white text-sm sm:text-base font-semibold hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105">
                        {slide.cta.label || 'Learn more'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 z-20 flex gap-2">
          {effectiveSlides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current 
                  ? 'bg-white w-8 h-2.5 sm:w-10 sm:h-3' 
                  : 'bg-white/50 hover:bg-white/70 w-2.5 h-2.5 sm:w-3 sm:h-3'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
