import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Sparkles } from "lucide-react";
import type { Product } from "@/data/types";

interface StaffPicksSectionProps {
  products: Product[];
  isLoading: boolean;
}

const StaffPicksSection = ({ products, isLoading }: StaffPicksSectionProps) => {
  // Pick products with badges or highest priced as "staff picks"
  const picks = products
    .filter((p) => p.badge || (p.original_price && p.original_price > p.price))
    .slice(0, 4);

  if (picks.length === 0 && !isLoading) return null;

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between px-4 lg:px-8 mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-accent" />
          <h2 className="text-sm lg:text-lg font-bold text-foreground">Staff Picks</h2>
        </div>
        <Link to="/search" className="text-[11px] lg:text-sm text-accent font-semibold hover:underline">
          View All &gt;
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4 lg:px-8">
        {picks.map((p) => (
          <div key={p.id} className="min-w-[140px] w-[140px] lg:min-w-[200px] lg:w-[200px]">
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StaffPicksSection;
