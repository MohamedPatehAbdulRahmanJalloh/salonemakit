import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import FlashSaleBanner from "@/components/FlashSaleBanner";

const CATEGORY_IMAGES = [
  { id: "men", label: "Men", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop", emoji: "👔" },
  { id: "women", label: "Women", image: "https://images.unsplash.com/photo-1590400516695-36e8d208be6b?w=300&h=300&fit=crop", emoji: "👗" },
  { id: "shoes", label: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop", emoji: "👟" },
  { id: "bags", label: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop", emoji: "👜" },
  { id: "perfumes", label: "Perfume", image: "https://images.unsplash.com/photo-1541643600914-78b084753601?w=300&h=300&fit=crop", emoji: "🧴" },
];

const HomePage = () => {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { data: products = [], isLoading } = useProducts();

  const newArrivals = products.slice(0, 6);
  const trending = products.slice(6, 12);

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
            <Link to="/auth" className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center relative">
              <User className="h-4 w-4 text-muted-foreground" />
              {user && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-background" />
              )}
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

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mt-2 rounded-2xl overflow-hidden relative h-48"
      >
        <img
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=400&fit=crop"
          alt="Hot Deals"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">🔥 Hot Deals</p>
          <h2 className="text-2xl font-extrabold text-white leading-tight">
            Up to <span className="text-accent">50% OFF</span>
          </h2>
          <p className="text-xs text-white/70 mt-1">On Fashion & Beauty Items</p>
          <Link
            to="/search"
            className="mt-4 bg-accent text-accent-foreground text-xs font-bold px-6 py-2.5 rounded-full w-fit hover:bg-accent/90 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </motion.div>

      {/* Flash Sale Banner */}
      <FlashSaleBanner />

      {/* Categories */}
      <section className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-primary">Categories</h2>
          <Link to="/search" className="text-xs text-accent font-semibold">See all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORY_IMAGES.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="flex flex-col items-center gap-1.5 min-w-[64px]"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-secondary border-2 border-transparent hover:border-accent transition-colors">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className="text-[11px] font-semibold text-center text-foreground">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

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
                <Skeleton className="aspect-[3/4] rounded-2xl" />
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
      <div className="mx-4 mt-6 rounded-2xl bg-accent/10 border border-accent/20 p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <span className="text-lg">🚚</span>
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
                <Skeleton className="aspect-[3/4] rounded-2xl" />
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
