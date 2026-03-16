import { useEffect, useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Search, ShoppingBag, Bell, Heart } from "lucide-react";
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

const CATEGORY_ICONS = [
  { id: "women", label: "Women", symbol: "W" },
  { id: "men", label: "Men", symbol: "M" },
  { id: "shoes", label: "Shoes", symbol: "S" },
  { id: "bags", label: "Bags", symbol: "B" },
  { id: "perfumes", label: "Beauty", symbol: "P" },
  { id: "accessories", label: "Accessories", symbol: "A" },
];

const PROMO_MESSAGES = [
  "Flash Sale! Up to 50% off on selected items!",
  "Free delivery on orders above Le 200,000!",
  "New arrivals just dropped — check them out!",
  "Use code SALONE10 for 10% off your first order!",
];

const HomePage = () => {
  useDocumentTitle();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const { recentIds } = useRecentlyViewed();

  const newArrivals = products.slice(0, 6);
  const trending = products.slice(6, 12);

  const recentlyViewed = useMemo(() => {
    if (recentIds.length === 0 || products.length === 0) return [];
    return recentIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)
      .slice(0, 8) as typeof products;
  }, [recentIds, products]);

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
      {/* SHEIN-style Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SaloneMakitSL" className="h-8 w-8 object-contain rounded-md" />
            <div className="leading-none">
              <h1 className="text-sm font-extrabold text-primary tracking-tight">SaloneMakitSL</h1>
              <p className="text-[8px] text-accent font-bold uppercase tracking-[0.15em]">Di Place Fo Shop</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/wishlist" className="h-9 w-9 flex items-center justify-center">
              <Heart className="h-[18px] w-[18px] text-foreground" />
            </Link>
            <Link to="/cart" className="h-9 w-9 flex items-center justify-center relative">
              <ShoppingBag className="h-[18px] w-[18px] text-foreground" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-2.5">
          <Link to="/search" className="flex items-center gap-2.5 bg-secondary rounded-full h-9 px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Search products...</span>
          </Link>
        </div>
      </header>

      {/* Hero Banner Carousel */}
      <BannerCarousel />

      {/* Flash Sale Banner */}
      <FlashSaleBanner />

      {/* Category Icons - SHEIN style horizontal scroll */}
      <section className="py-3 border-b border-border">
        <div className="flex justify-around px-2">
          {CATEGORY_ICONS.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="flex flex-col items-center gap-1 min-w-[50px]"
            >
              <div className="h-11 w-11 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-sm font-bold text-accent">{cat.symbol}</span>
              </div>
              <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="mt-3">
          <div className="flex items-center justify-between px-4 mb-2">
            <h2 className="text-sm font-bold text-foreground">Recently Viewed</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4">
            {recentlyViewed.map((p) => (
              <div key={p.id} className="min-w-[120px] w-[120px]">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Delivery Banner */}
      <div className="mx-4 mt-3 rounded-lg bg-accent/5 border border-accent/15 px-3 py-2.5 flex items-center gap-2.5">
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5">SL</span>
        <div>
          <p className="text-xs font-bold text-foreground">Delivery Across Sierra Leone</p>
          <p className="text-[10px] text-muted-foreground">All 16 districts • COD & Orange Money</p>
        </div>
      </div>

      {/* New Arrivals */}
      <section className="mt-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="text-sm font-bold text-foreground">New Arrivals</h2>
          <Link to="/search" className="text-[11px] text-accent font-semibold">View All &gt;</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-[1px] bg-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-background">
                <Skeleton className="aspect-[3/4]" />
                <div className="p-2">
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[1px] bg-border">
            {newArrivals.map((p) => (
              <div key={p.id} className="bg-background">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trending */}
      <section className="mt-4">
        <div className="flex items-center justify-between px-4 mb-2">
          <h2 className="text-sm font-bold text-foreground">Trending Now</h2>
          <Link to="/search" className="text-[11px] text-accent font-semibold">View All &gt;</Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-[1px] bg-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-background">
                <Skeleton className="aspect-[3/4]" />
                <div className="p-2">
                  <Skeleton className="h-3 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[1px] bg-border">
            {trending.map((p) => (
              <div key={p.id} className="bg-background">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
