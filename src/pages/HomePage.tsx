import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import logo from "@/assets/logo.png";
import model1 from "@/assets/model-1.jpg";
import model2 from "@/assets/model-2.jpg";
import model3 from "@/assets/model-3.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import BannerCarousel from "@/components/BannerCarousel";
import { toast } from "sonner";

const CATEGORY_IMAGES = [
  { id: "men", label: "Men", image: model2 },
  { id: "women", label: "Women", image: model3 },
  { id: "shoes", label: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" },
  { id: "bags", label: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop" },
  { id: "perfumes", label: "Perfume & Beauty", image: "https://images.unsplash.com/photo-1541643600914-78b084753601?w=300&h=300&fit=crop" },
  { id: "accessories", label: "Accessories", image: model1 },
];

const PROMO_MESSAGES = [
  "🔥 Flash Sale! Up to 50% off on selected items!",
  "🎉 Free delivery on orders above Le 200,000!",
  "✨ New arrivals just dropped — check them out!",
  "💰 Use code SALONE10 for 10% off your first order!",
];

const HomePage = () => {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const { recentIds } = useRecentlyViewed();

  const newArrivals = products.slice(0, 6);
  const trending = products.slice(6, 12);

  // Recently viewed products
  const recentlyViewed = useMemo(() => {
    if (recentIds.length === 0 || products.length === 0) return [];
    return recentIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 8) as typeof products;
  }, [recentIds, products]);

  // Promo notification toast on first visit per session
  useEffect(() => {
    const shown = sessionStorage.getItem("promo-shown");
    if (!shown) {
      const msg = PROMO_MESSAGES[Math.floor(Math.random() * PROMO_MESSAGES.length)];
      setTimeout(() => {
        toast(msg, { duration: 5000 });
        sessionStorage.setItem("promo-shown", "true");
      }, 2000);
    }
  }, []);

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="SaloneMakit" className="h-10 w-10 object-contain rounded-lg" />
            <div>
              <h1 className="text-base font-extrabold text-primary leading-none tracking-tight">SaloneMakit</h1>
              <p className="text-[9px] text-accent font-semibold uppercase tracking-widest">Di Place Fo Shop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center relative">
              <User className="h-4 w-4 text-muted-foreground" />
              {user && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-background" />}
            </Link>
            <Link to="/cart" className="h-9 w-9 rounded-full bg-accent flex items-center justify-center relative">
              <ShoppingCart className="h-4 w-4 text-accent-foreground" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 pt-3 pb-2">
        <Link to="/search" className="flex items-center gap-0 bg-secondary rounded-xl overflow-hidden border border-border/50">
          <div className="flex-1 flex items-center gap-2.5 px-4 h-11">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Search products...</span>
          </div>
          <div className="h-11 w-11 bg-accent flex items-center justify-center shrink-0">
            <Search className="h-4 w-4 text-accent-foreground" />
          </div>
        </Link>
      </div>

      {/* Hero Banner Carousel */}
      <BannerCarousel />

      {/* Flash Sale Banner */}
      <FlashSaleBanner />

      {/* Categories Grid */}
      <section className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-primary">Categories</h2>
          <Link to="/search" className="text-xs text-accent font-semibold">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORY_IMAGES.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="relative overflow-hidden rounded-xl aspect-square bg-secondary group"
            >
              <img src={cat.image} alt={cat.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <span className="absolute bottom-2 left-2 right-2 text-[11px] font-bold text-white text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="mt-6 px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-primary">Recently Viewed 👀</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {recentlyViewed.map((p) => (
              <div key={p.id} className="min-w-[150px] w-[150px]">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-primary">New Arrivals ✨</h2>
          <Link to="/search" className="text-xs text-accent font-semibold">See all &gt;</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 mt-2 w-3/4" />
                <Skeleton className="h-4 mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Delivery Banner */}
      <div className="mx-4 mt-6 rounded-xl bg-accent/10 border border-accent/20 p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <span className="text-lg">🇸🇱</span>
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Delivery Across Sierra Leone</p>
          <p className="text-xs text-muted-foreground">All 16 districts • Cash on Delivery & Orange Money</p>
        </div>
      </div>

      {/* Trending */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-primary">Trending 🔥</h2>
          <Link to="/search" className="text-xs text-accent font-semibold">See all &gt;</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 mt-2 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {trending.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
