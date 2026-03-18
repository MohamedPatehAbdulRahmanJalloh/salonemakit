import { useEffect, useMemo } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Search, ShoppingBag, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import logo from "@/assets/logo.png";
import { Skeleton } from "@/components/ui/skeleton";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import BannerCarousel from "@/components/BannerCarousel";
import TestimonialsSection from "@/components/TestimonialsSection";
import StaffPicksSection from "@/components/StaffPicksSection";
import PromoBanner from "@/components/PromoBanner";
import TrustBadges from "@/components/TrustBadges";
import { toast } from "sonner";

import categoryWomen from "@/assets/category-women.png";
import categoryMen from "@/assets/category-men.png";
import categoryShoes from "@/assets/category-shoes.png";
import categoryBags from "@/assets/category-bags.png";
import categoryPerfumes from "@/assets/category-perfumes.png";
import categoryAccessories from "@/assets/category-accessories.png";

const CATEGORY_ICONS = [
  { id: "women", label: "Women", image: categoryWomen },
  { id: "men", label: "Men", image: categoryMen },
  { id: "shoes", label: "Shoes", image: categoryShoes },
  { id: "bags", label: "Bags", image: categoryBags },
  { id: "perfumes", label: "Beauty", image: categoryPerfumes },
  { id: "accessories", label: "Accessories", image: categoryAccessories },
];

const PROMO_MESSAGES = [
  "Flash Sale! Up to 50% off on selected items!",
  "Free delivery on orders above NLe 200!",
  "New arrivals just dropped — check them out!",
  "Use code SALONE10 for 10% off your first order!",
];

const HomePage = () => {
  useDocumentTitle();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const { recentIds } = useRecentlyViewed();

  const newArrivals = products.slice(0, 8);
  const trending = products.slice(8, 16);

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
    <div className="pb-20 lg:pb-6 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border" role="banner">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="SaloneMakitSL" className="h-8 w-8 object-contain rounded-md" />
            <div className="leading-none">
              <h1 className="text-sm lg:text-base font-extrabold text-primary tracking-tight">SaloneMakitSL</h1>
              <p className="text-[8px] lg:text-[9px] text-accent font-bold uppercase tracking-[0.15em]">Di Place Fo Shop</p>
            </div>
          </div>

          {/* Desktop search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <Link to="/search" className="flex items-center gap-2.5 bg-secondary rounded-full h-10 px-5 w-full hover:bg-secondary/80 transition-colors">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Search products...</span>
            </Link>
          </div>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-6 mr-4">
            <Link to="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
            <Link to="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Orders</Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>

          <div className="flex items-center gap-1">
            <Link to="/wishlist" className="h-9 w-9 flex items-center justify-center hover:bg-secondary rounded-full transition-colors" aria-label="Wishlist">
              <Heart className="h-[18px] w-[18px] text-foreground" />
            </Link>
            <Link to="/cart" className="h-9 w-9 flex items-center justify-center relative hover:bg-secondary rounded-full transition-colors" aria-label={`Cart${totalItems > 0 ? `, ${totalItems} items` : ''}`}>
              <ShoppingBag className="h-[18px] w-[18px] text-foreground" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            {/* Desktop profile */}
            <Link to="/profile" className="hidden lg:flex h-9 w-9 items-center justify-center hover:bg-secondary rounded-full transition-colors" aria-label="Profile">
              <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent">{user?.email?.[0]?.toUpperCase() || "?"}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="px-4 pb-2.5 md:hidden">
          <Link to="/search" className="flex items-center gap-2.5 bg-secondary rounded-full h-9 px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">Search products...</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Hero Banner Carousel */}
        <BannerCarousel />

        {/* Flash Sale Banner */}
        <FlashSaleBanner />

        {/* Category Icons */}
        <section className="py-4 border-b border-border">
          <div className="flex justify-around px-4 lg:px-8 lg:justify-center lg:gap-12">
            {CATEGORY_ICONS.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="flex flex-col items-center gap-1.5 min-w-[50px] group"
              >
                <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-accent/15 transition-colors overflow-hidden">
                  <img src={cat.image} alt={cat.label} className="h-9 w-9 lg:h-11 lg:w-11 object-contain" />
                </div>
                <span className="text-[10px] lg:text-xs font-medium text-foreground">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mt-4">
            <div className="flex items-center justify-between px-4 lg:px-8 mb-2">
              <h2 className="text-sm lg:text-base font-bold text-foreground">Recently Viewed</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4 lg:px-8">
              {recentlyViewed.map((p) => (
                <div key={p.id} className="min-w-[120px] w-[120px] lg:min-w-[160px] lg:w-[160px]">
                  <ProductCard product={p} compact />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Delivery Banner */}
        <div className="mx-4 lg:mx-8 mt-4 rounded-lg bg-accent/5 border border-accent/15 px-4 py-3 flex items-center gap-3">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground px-1.5">SL</span>
          <div>
            <p className="text-xs lg:text-sm font-bold text-foreground">Delivery Across Sierra Leone</p>
            <p className="text-[10px] lg:text-xs text-muted-foreground">All 16 districts • COD & Orange Money</p>
          </div>
        </div>

        {/* New Arrivals */}
        <section className="mt-5">
          <div className="flex items-center justify-between px-4 lg:px-8 mb-3">
            <h2 className="text-sm lg:text-lg font-bold text-foreground">New Arrivals</h2>
            <Link to="/search" className="text-[11px] lg:text-sm text-accent font-semibold hover:underline">View All &gt;</Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] lg:gap-4 bg-border lg:bg-transparent lg:px-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-background lg:rounded-lg lg:overflow-hidden lg:border lg:border-border">
                  <Skeleton className="aspect-[3/4]" />
                  <div className="p-2">
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] lg:gap-4 bg-border lg:bg-transparent lg:px-8">
              {newArrivals.map((p) => (
                <div key={p.id} className="bg-background lg:rounded-lg lg:overflow-hidden lg:border lg:border-border lg:hover:shadow-md lg:transition-shadow">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Staff Picks */}
        <StaffPicksSection products={products} isLoading={isLoading} />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Trending */}
        <section className="mt-5">
          <div className="flex items-center justify-between px-4 lg:px-8 mb-3">
            <h2 className="text-sm lg:text-lg font-bold text-foreground">Trending Now</h2>
            <Link to="/search" className="text-[11px] lg:text-sm text-accent font-semibold hover:underline">View All &gt;</Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] lg:gap-4 bg-border lg:bg-transparent lg:px-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-background lg:rounded-lg lg:overflow-hidden lg:border lg:border-border">
                  <Skeleton className="aspect-[3/4]" />
                  <div className="p-2">
                    <Skeleton className="h-3 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] lg:gap-4 bg-border lg:bg-transparent lg:px-8">
              {trending.map((p) => (
                <div key={p.id} className="bg-background lg:rounded-lg lg:overflow-hidden lg:border lg:border-border lg:hover:shadow-md lg:transition-shadow">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trust Badges */}
        <div className="mt-5">
          <TrustBadges />
        </div>

        {/* Testimonials */}
        <TestimonialsSection />
      </div>
    </div>
  );
};

export default HomePage;
