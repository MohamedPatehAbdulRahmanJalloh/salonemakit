import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import model1 from "@/assets/model-1.jpg";

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
    image: banner1,
    tag: "🔥 Hot Deals",
    title: "Up to",
    highlight: "50% OFF",
    subtitle: "On Fashion & Beauty Items",
    link: "/search",
  },
  {
    image: banner2,
    tag: "✨ New Collection",
    title: "Sierra Leone",
    highlight: "Style",
    subtitle: "Traditional & Modern African Fashion",
    link: "/search?category=women",
  },
  {
    image: model1,
    tag: "👗 Country Cloth",
    title: "Authentic",
    highlight: "Salone Fashion",
    subtitle: "Premium African Attire Collection",
    link: "/search?category=men",
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
      className="relative overflow-hidden aspect-[2/1] lg:aspect-[3/1] lg:rounded-xl lg:mx-8 lg:mt-4"
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
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center p-5">
        <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-0.5">{slide.tag}</p>
        <h2 className="text-xl font-extrabold text-white leading-tight">
          {slide.title} <span className="text-accent">{slide.highlight}</span>
        </h2>
        <p className="text-[11px] text-white/70 mt-0.5">{slide.subtitle}</p>
        <Link
          to={slide.link}
          className="mt-3 bg-accent text-accent-foreground text-[11px] font-bold px-5 py-2 rounded-sm w-fit hover:bg-accent/90 transition-colors"
        >
          Shop Now
        </Link>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all",
              i === current ? "h-1.5 w-5 bg-accent" : "h-1.5 w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
