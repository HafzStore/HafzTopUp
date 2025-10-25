import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Banner } from "@shared/schema";

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.order - b.order);

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  if (activeBanners.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
            GameTopUp
          </h2>
          <p className="text-muted-foreground">
            Platform Top Up Game Termurah dan Tercepat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden group">
      {/* Banners */}
      <div className="relative w-full h-full">
        {activeBanners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Banner Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-2">
                {banner.title}
              </h2>
              {banner.linkUrl && (
                <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="bg-black/50 backdrop-blur border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Lihat Detail
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show if more than 1 banner */}
      {activeBanners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur border-primary/50 hover:bg-primary hover:text-primary-foreground"
            onClick={goToPrevious}
            data-testid="button-banner-prev"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur border-primary/50 hover:bg-primary hover:text-primary-foreground"
            onClick={goToNext}
            data-testid="button-banner-next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                data-testid={`button-banner-dot-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
