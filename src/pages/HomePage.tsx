import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/data/products";
import { Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";

const CATEGORY_IMAGES = [
  { id: "men", label: "Men", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
  { id: "women", label: "Women", image: "https://images.unsplash.com/photo-1590400516695-36e8d208be6b?w=300&h=300&fit=crop" },
  { id: "shoes", label: "Shoes", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" },
  { id: "bags", label: "Bags", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&h=300&fit=crop" },
  { id: "perfumes", label: "Perfume & Beauty", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=300&h=300&fit=crop" },
];

const HomePage = () => {
  const newArrivals = MOCK_PRODUCTS.slice(0, 3);
  const trending = MOCK_PRODUCTS.slice(3, 6);
  const { totalItems } = useCart();

  return (
    <div className="pb-20">
      {/* Header with Logo */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SaloneMakit" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-primary leading-none">SaloneMakit</h1>
            <p className="text-[10px] text-accent font-medium italic">Di Place Fo Shop</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/admin">
            <User className="h-5 w-5 text-foreground" />
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <Link to="/search" className="flex items-center gap-2 bg-secondary rounded-xl px-3 h-10">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search products...</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 rounded-2xl overflow-hidden relative h-44 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20"
      >
        <img
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=400&fit=crop"
          alt="Hot Deals"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex flex-col justify-center p-6">
          <p className="text-xs text-accent font-semibold mb-1">🔥 Hot Deals!</p>
          <h2 className="text-2xl font-extrabold text-foreground">
            Up to <span className="text-accent">50% OFF</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">On Fashion & Beauty</p>
          <Link
            to="/search"
            className="mt-3 bg-primary text-primary-foreground text-xs font-semibold px-5 py-2 rounded-full w-fit"
          >
            Shop Now
          </Link>
        </div>
      </motion.div>

      {/* Category Grid */}
      <section className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Categories</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORY_IMAGES.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-secondary">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className="text-xs font-medium text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">New Arrivals</h2>
          <Link to="/search" className="text-xs text-accent font-semibold">See all &gt;</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">Trending Products</h2>
          <Link to="/search" className="text-xs text-accent font-semibold">See all &gt;</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
