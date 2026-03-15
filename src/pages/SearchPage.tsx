import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeCategory = searchParams.get("category") || "all";
  const { data: products = [], isLoading } = useProducts();

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

    // Category
    if (activeCategory !== "all") {
      results = results.filter((p) => p.category === activeCategory);
    }

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }

    // Price range
    results = results.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sizes
    if (selectedSizes.length > 0) {
      results = results.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    // Sort
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
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <h1 className="text-lg font-bold flex-1">Browse</h1>

          {/* Sort button */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-9 px-3 rounded-full bg-secondary flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sort
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader>
                <SheetTitle>Sort By</SheetTitle>
              </SheetHeader>
              <div className="space-y-1 mt-4 pb-6">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      sortBy === opt.value ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Filter button */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <button className="h-9 px-3 rounded-full bg-secondary flex items-center gap-1.5 text-xs font-semibold text-muted-foreground relative">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Filters
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-xs text-accent font-semibold">
                      Clear All
                    </button>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-4 pb-6">
                {/* Price Range */}
                <div>
                  <p className="text-sm font-bold mb-3">Price Range</p>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={5000}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val as [number, number])}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <p className="text-sm font-bold mb-3">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={cn(
                          "h-10 min-w-[44px] px-3 rounded-xl text-sm font-semibold border-2 transition-all",
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
                  className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-bold"
                >
                  Show {filtered.length} Results
                </Button>
              </div>
            </SheetContent>
          </Sheet>
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

      {/* Active filter tags */}
      {hasActiveFilters && (
        <div className="flex gap-2 px-4 pb-2 flex-wrap">
          {selectedSizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold"
            >
              Size: {s} <X className="h-3 w-3" />
            </button>
          ))}
          {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
              {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
            </span>
          )}
        </div>
      )}

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
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-accent text-sm font-semibold mt-2">
                Clear filters
              </button>
            )}
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
