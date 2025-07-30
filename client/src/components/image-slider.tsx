import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SliderImage } from "@shared/schema";

interface ImageSliderProps {
  images: SliderImage[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  height?: string;
}

export function ImageSlider({
  images,
  autoplay = true,
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
  height = "h-96"
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, autoplayInterval]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative ${height} bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden rounded-lg`}>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/src/assets/geometric-design.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="text-center text-slate-500 relative z-10">
          <h3 className="text-xl font-medium mb-2">No Images Available</h3>
          <p className="text-sm">Upload images from the admin panel to display them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${height} overflow-hidden rounded-lg group`}>
      {/* Main Image Display */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 transform translate-x-0' 
                : index < currentIndex 
                  ? 'opacity-0 transform -translate-x-full'
                  : 'opacity-0 transform translate-x-full'
            }`}
          >
            <img
              src={image.imageUrl}
              alt={image.title || `Slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Image Text Overlay */}
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                {image.title && (
                  <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-lg opacity-90">{image.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && images.length > 1 && (
        <>
          {/* Previous Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Next Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Autoplay Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={toggleAutoplay}
          >
            {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {isAutoPlaying && images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / images.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  );
}