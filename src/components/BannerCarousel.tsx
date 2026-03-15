import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BannerSlide {
  image: string;
  title: string;
  highlight: string;
  subtitle: string;
  tag: string;
  link: string;
}

const BANNERS: BannerSlide[] = [
  {
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=400&fit=crop",
    tag: "🔥 Hot Deals",
    title: "Up to",
    highlight: "50% OFF",
    subtitle: "On Fashion & Beauty Items",
    link: "/search",
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=400&fit=crop",
    tag: "✨ New Season",
    title: "Fresh",
    highlight: "Arrivals",
    subtitle: "Trending Styles Just In",
    link: "/search?category=women",
  },
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
    tag: "👟 Shoes Collection",
    title: "Step Up",
    highlight: "Your Game",
    subtitle: "Premium Footwear Collection",
    link: "/search?category=shoes",
  },
];

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const touchStartX = useRef(0);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % BANNERS.length) + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    clearInterval(intervalRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
  };

  const slide = BANNERS[current];

  return (
    <div
      className="mx-4 mt-2 rounded-2xl overflow-hidden relative h-48"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.img
        key={current}
        src={slide.image}
        alt={slide.title}
        className="w-full h-full object-cover absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/50 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-6">
        <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">{slide.tag}</p>
        <h2 className="text-2xl font-extrabold text-white leading-tight">
          {slide.title} <span className="text-accent">{slide.highlight}</span>
        </h2>
        <p className="text-xs text-white/70 mt-1">{slide.subtitle}</p>
        <Link
          to={slide.link}
          className="mt-4 bg-accent text-accent-foreground text-xs font-bold px-6 py-2.5 rounded-full w-fit hover:bg-accent/90 transition-colors"
        >
          Shop Now
        </Link>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all",
              i === current ? "h-2 w-6 bg-accent" : "h-2 w-2 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
