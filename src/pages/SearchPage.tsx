import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/products";
import { cn } from "@/lib/utils";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeCategory = searchParams.get("category") || "all";

  const filtered = useMemo(() => {
    let results = MOCK_PRODUCTS;
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
  }, [activeCategory, query]);

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold mb-3">Browse</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-secondary border-none h-10"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        <button
          onClick={() => setSearchParams({})}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
            activeCategory === "all"
              ? "bg-primary text-primary-foreground"
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
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="px-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
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
