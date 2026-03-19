import { Product } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useProductReviewStats } from "@/hooks/useProductReviewStats";
import { useAllProductColors } from "@/hooks/useProductColors";
import { useRegion } from "@/context/RegionContext";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forwardRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

// Legacy formatPrice for non-region-aware usage (fallback)
export const formatPrice = (price: number) => {
  const amount = price / 1000;
  return `NLe ${amount.toLocaleString("en-SL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(({ product, compact }, ref) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data: reviewStats = {} } = useProductReviewStats();
  const { data: allColors = [] } = useAllProductColors();
  const navigate = useNavigate();

  const productColors = allColors.filter((c) => c.product_id === product.id);

  const stats = reviewStats[product.id];

  const wishlisted = isInWishlist(product.id);
  const originalPrice = product.original_price;
  const badge = product.badge;
  const hasDiscount = originalPrice && originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;
  const isLowStock = product.stock_quantity !== null && product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to save items");
      navigate("/auth");
      return;
    }
    toggleWishlist(product.id);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div
      ref={ref}
      className="group relative bg-card overflow-hidden animate-fade-in"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image */}
        <div className={cn(
          "relative overflow-hidden bg-secondary",
          compact ? "aspect-square rounded-lg" : "aspect-[3/4]"
        )}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Discount badge - SHEIN style top-left */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1">
              -{discountPercent}%
            </div>
          )}

          {/* Text badge */}
          {badge && !hasDiscount && (
            <div className="absolute top-0 left-0 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1">
              {badge}
            </div>
          )}

          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90"
          >
            <Heart
              className={cn(
                "h-3.5 w-3.5 transition-colors",
                wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Low stock urgency */}
          {isLowStock && !compact && (
            <div className="absolute top-0 right-0 bg-orange text-orange-foreground text-[9px] font-bold px-1.5 py-0.5">
              Only {product.stock_quantity} left
            </div>
          )}

          {/* Quick add - desktop hover */}
          {!compact && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, product.sizes?.[0]);
                toast.success("Added to cart");
                if (navigator.vibrate) navigator.vibrate(50);
              }}
              className="absolute bottom-2 left-2 h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md transition-all active:scale-90 opacity-0 group-hover:opacity-100"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className={cn("py-2", compact ? "px-1" : "px-1")}>
          <h3 className="text-xs font-medium leading-tight line-clamp-2 text-foreground min-h-[32px]">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className={cn(
              "text-sm font-extrabold",
              hasDiscount ? "text-destructive" : "text-foreground"
            )}>
              {formatPrice(product.price)}
            </p>
          </div>
          {hasDiscount && (
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </p>
              <span className="text-[10px] text-destructive font-semibold">-{discountPercent}%</span>
            </div>
          )}
          {/* Rating */}
          {stats && stats.count > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-semibold text-foreground">{stats.avg.toFixed(1)}</span>
              <span className="text-[9px] text-muted-foreground">({stats.count})</span>
            </div>
          )}
          {/* Color dots */}
          {productColors.length > 0 && (
            <div className="flex items-center gap-1 mt-1">
              {productColors.slice(0, 5).map((c) => (
                <span
                  key={c.id}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c.color_hex }}
                  title={c.color_name}
                />
              ))}
              {productColors.length > 5 && (
                <span className="text-[9px] text-muted-foreground">+{productColors.length - 5}</span>
              )}
            </div>
          )}
          {!compact && product.category && (
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{product.category}</p>
          )}
        </div>
      </Link>
    </div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
