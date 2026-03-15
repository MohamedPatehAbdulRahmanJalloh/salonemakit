import CategoryBar from "@/components/CategoryBar";
import ProductCard from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/data/products";
import { motion } from "framer-motion";

const HomePage = () => {
  const featured = MOCK_PRODUCTS.slice(0, 4);
  const newArrivals = MOCK_PRODUCTS.slice(4);

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SaloneMakit</h1>
            <p className="text-xs text-muted-foreground">Fashion for Sierra Leone 🇸🇱</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold text-sm">SM</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 mt-3 rounded-xl overflow-hidden relative h-44 bg-primary"
      >
        <img
          src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=400&fit=crop"
          alt="Fashion collection"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <span className="text-xs font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full w-fit mb-2">
            Cash on Delivery
          </span>
          <h2 className="text-xl font-bold text-primary-foreground">New Collection</h2>
          <p className="text-xs text-primary-foreground/80">Delivered across Sierra Leone</p>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="mt-4">
        <h2 className="text-sm font-semibold px-4 mb-1">Shop by Category</h2>
        <CategoryBar />
      </div>

      {/* Featured */}
      <section className="mt-4 px-4">
        <h2 className="text-sm font-semibold mb-3">Featured</h2>
        <div className="grid grid-cols-2 gap-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mt-6 px-4">
        <h2 className="text-sm font-semibold mb-3">New Arrivals</h2>
        <div className="grid grid-cols-2 gap-3">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
