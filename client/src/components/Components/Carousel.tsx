/**
 * Carousel Component
 * Interactive image/content carousel with navigation
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselItem {
  id: string;
  image?: string;
  title?: string;
  description?: string;
  content?: React.ReactNode;
}

export interface CarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  interval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function Carousel({
  items,
  autoPlay = false,
  interval = 5000,
  showIndicators = true,
  showArrows = true,
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval]);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 bg-muted rounded-lg ${className}`}>
        <p className="text-muted-foreground">No items to display</p>
      </div>
    );
  }

  // Current item available via items[currentIndex] if needed

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      {/* Carousel Container */}
      <div className="relative h-[400px] w-full">
        {/* Slide Content */}
        <div
          className="absolute inset-0 transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          <div className="flex h-full" style={{ width: `${items.length * 100}%` }}>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-full h-full flex items-center justify-center"
                style={{ width: `${100 / items.length}%` }}
              >
                {item.image ? (
                  <div className="relative w-full h-full">
                    <img
                      src={item.image}
                      alt={item.title || `Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {(item.title || item.description) && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-8">
                        {item.title && (
                          <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                        )}
                        {item.description && (
                          <p className="text-lg text-center max-w-2xl">{item.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    {item.content || (
                      <div>
                        {item.title && <h3 className="text-2xl font-bold mb-2">{item.title}</h3>}
                        {item.description && <p>{item.description}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && items.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && items.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

