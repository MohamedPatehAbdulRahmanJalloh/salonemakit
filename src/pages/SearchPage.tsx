import { useState, useMemo, useRef } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ArrowUpDown, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { CATEGORIES } from "@/data/products";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/components/ProductCard";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type SortOption = "newest" | "price_low" | "price_high" | "popular";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low → High" },
  { value: "price_high", label: "Price: High → Low" },
  { value: "popular", label: "Popular" },
];

const ALL_SIZES = ["S", "M", "L", "XL", "XXL", "38", "39", "40", "41", "42", "43", "44", "45"];

const SearchPage = () => {
  useDocumentTitle("Shop");
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const activeCategory = searchParams.get("category") || "all";
  const { data: products = [], isLoading } = useProducts();
  const inputRef = useRef<HTMLInputElement>(null);

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const names = products
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => p.name)
      .slice(0, 5);
    // Add matching categories
    const cats = CATEGORIES
      .filter((c) => c.label.toLowerCase().includes(q))
      .map((c) => c.label);
    return [...new Set([...cats, ...names])].slice(0, 6);
  }, [query, products]);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 1000000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  const hasActiveFilters = selectedSizes.length > 0 || priceRange[0] > 0 || priceRange[1] < maxPrice;

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedSizes([]);
    setPriceRange([0, maxPrice]);
    setSortBy("newest");
  };

  const filtered = useMemo(() => {
    let results = products;
    if (activeCategory !== "all") {
      results = results.filter((p) => p.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    results = results.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedSizes.length > 0) {
      results = results.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }
    switch (sortBy) {
      case "price_low":
        results = [...results].sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        results = [...results].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        results = [...results].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }
    return results;
  }, [activeCategory, query, products, priceRange, selectedSizes, sortBy]);

  return (
    <div className="pb-20 lg:pb-6 bg-background">
      {/* SHEIN-style sticky header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search products..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-9 bg-secondary border-none h-9 rounded-full text-xs"
            />
            {/* Autocomplete dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-secondary flex items-center gap-2 transition-colors"
                    onMouseDown={() => { setQuery(s); setShowSuggestions(false); }}
                  >
                    <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="text-sm">Sort By</SheetTitle>
              </SheetHeader>
              <div className="space-y-1 mt-3 pb-6">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      sortBy === opt.value ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Filter */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0 relative">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                {hasActiveFilters && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between text-sm">
                  Filters
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-accent font-semibold">
                      Clear All
                    </button>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-5 mt-3 pb-6">
                <div>
                  <p className="text-xs font-bold mb-3">Price Range</p>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={5000}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={cn(
                          "h-9 min-w-[40px] px-3 rounded-lg text-xs font-semibold border transition-all",
                          selectedSizes.includes(size)
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-background border-border"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg font-bold text-sm"
                >
                  Show {filtered.length} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Category pills - horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide border-b border-border">
        <button
          onClick={() => setSearchParams({})}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
            activeCategory === "all"
              ? "bg-foreground text-background"
              : "bg-secondary text-muted-foreground"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSearchParams({ category: cat.id })}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
              activeCategory === cat.id
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex gap-1.5 px-4 py-2 flex-wrap">
          {selectedSizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold"
            >
              Size: {s} <X className="h-2.5 w-2.5" />
            </button>
          ))}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold">
              {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="px-4 py-2">
        <p className="text-[10px] text-muted-foreground">{filtered.length} items</p>
      </div>

      {/* Product Grid — SHEIN edge-to-edge */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] lg:gap-4 bg-border lg:bg-transparent lg:px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-background lg:rounded-lg lg:overflow-hidden lg:border lg:border-border">
              <Skeleton className="aspect-[3/4]" />
              <div className="p-2">
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 text-center">
          <div className="relative mb-5">
            <div className="h-24 w-24 rounded-full bg-secondary/80 flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <span className="absolute -top-1 -right-1 text-3xl">🔍</span>
          </div>
          <h2 className="text-base font-bold text-foreground">No products found</h2>
          <p className="text-xs text-muted-foreground mt-1.5">Try a different search or filter</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-accent text-xs font-bold mt-4 underline underline-offset-2">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] lg:gap-4 bg-border lg:bg-transparent lg:px-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-background lg:rounded-lg lg:overflow-hidden lg:border lg:border-border lg:hover:shadow-md lg:transition-shadow">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
