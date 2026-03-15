import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES } from "@/data/products";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeCategory = searchParams.get("category") || "all";
  const { data: products = [], isLoading } = useProducts();

  const filtered = useMemo(() => {
    let results = products;
    if (activeCategory !== "all") {
      results = results.filter((p) => p.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [activeCategory, query, products]);

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-lg font-bold flex-1">Browse</h1>
          <button className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-secondary border-none h-11 rounded-2xl"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        <button
          onClick={() => setSearchParams({})}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
            activeCategory === "all"
              ? "bg-accent text-accent-foreground shadow-md"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: cat.id })}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeCategory === cat.id
                ? "bg-accent text-accent-foreground shadow-md"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4">
        <p className="text-xs text-muted-foreground mb-3">{filtered.length} products found</p>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] rounded-2xl" />
                <Skeleton className="h-4 mt-2 w-3/4" />
                <Skeleton className="h-4 mt-1 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-muted-foreground text-sm">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
