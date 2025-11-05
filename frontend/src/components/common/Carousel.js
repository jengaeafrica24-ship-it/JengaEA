import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const defaultSlides = [
  {
    // local image path - place authentic African construction images in public/images/africa/
    image: '/images/africa/construction1.jpg',
    title: 'Construction Site — Nairobi',
    description: 'Local contractors building residential and commercial projects',
  },
  {
    image: '/images/africa/construction2.jpg',
    title: 'Infrastructure Works — Lagos',
    description: 'Roads, bridges and urban renewal projects',
  },
  {
    image: '/images/africa/construction3.jpg',
    title: 'Commercial Development — Accra',
    description: 'Commercial and mixed-use developments across the region',
  },
  {
    image: '/images/africa/construction4.jpg',
    title: 'Community Builds — Dar es Salaam',
    description: 'Local community and housing projects',
  },
];

export default function Carousel({ slides = defaultSlides, autoplayInterval = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);
  const liveRef = useRef(null);

  const goTo = useCallback((idx) => {
    setCurrent((idx + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(current + 1), [goTo, current]);
  const prev = useCallback(() => goTo(current - 1), [goTo, current]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [autoplayInterval, isPaused, slides.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  useEffect(() => {
    if (liveRef.current) {
      const slide = slides[current];
      liveRef.current.textContent = slide?.title || `Slide ${current + 1}`;
    }
  }, [current, slides]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      delta > 0 ? prev() : next();
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  return (
    <div
      className="relative w-full max-w-7xl mx-auto rounded-xl overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="sr-only" aria-live="polite" ref={liveRef} />
      
      <div className="relative h-64 sm:h-80 md:h-96">
        <div 
          className="absolute inset-0 flex transition-transform duration-500 ease-out" 
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div key={idx} className="w-full flex-shrink-0 relative">
              <img
                src={slide.image}
                alt={slide.title || `Slide ${idx + 1}`}
                loading={idx === current || idx === (current + 1) % slides.length ? 'eager' : 'lazy'}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1529429618124-0c2f0a1df5a0?auto=format&fit=crop&w=1400&q=80'; }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-transparent" />
              <div className="relative z-10 h-full flex items-center justify-center text-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  {slide.title && (
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{slide.title}</h2>
                  )}
                  {slide.description && (
                    <p className="text-sm md:text-lg text-white/90">{slide.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          type="button"
          onClick={prev}
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
          type="button"
          onClick={next}
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === current}
              className={`w-3 h-3 rounded-full ${idx === current ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
