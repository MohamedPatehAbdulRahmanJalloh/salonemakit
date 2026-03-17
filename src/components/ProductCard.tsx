import { Product } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { Heart, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { forwardRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const formatPrice = (price: number) => {
  return `Le ${price.toLocaleString()}`;
};

const ProductCard = ({ product, compact }: ProductCardProps) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-card overflow-hidden"
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
          {!compact && product.category && (
            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{product.category}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
