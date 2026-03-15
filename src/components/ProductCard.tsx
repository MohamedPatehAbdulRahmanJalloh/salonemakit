import { Product } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const formatPrice = (price: number) => {
  return `Le ${price.toLocaleString()}`;
};

const BADGE_STYLES: Record<string, string> = {
  NEW: "bg-accent text-accent-foreground",
  HOT: "bg-destructive text-destructive-foreground",
  SALE: "bg-destructive text-destructive-foreground",
};

const ProductCard = ({ product, compact }: ProductCardProps) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const wishlisted = isInWishlist(product.id);
  const originalPrice = (product as any).original_price;
  const badge = (product as any).badge;
  const hasDiscount = originalPrice && originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
    : 0;

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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className={`relative overflow-hidden rounded-xl bg-secondary ${compact ? "aspect-square" : "aspect-[3/4]"}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badge */}
          {(badge || hasDiscount) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {badge && (
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase",
                  BADGE_STYLES[badge] || "bg-primary text-primary-foreground"
                )}>
                  {badge}
                </span>
              )}
              {hasDiscount && !badge && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-destructive text-destructive-foreground">
                  -{discountPercent}%
                </span>
              )}
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Quick add */}
          {!compact && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, product.sizes?.[0]);
                toast.success("Added to cart");
              }}
              className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-all active:scale-90 opacity-0 group-hover:opacity-100"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-2 px-0.5">
          {!compact && <p className="text-[10px] text-muted-foreground capitalize tracking-wide">{product.category}</p>}
          <h3 className="text-sm font-semibold leading-tight line-clamp-1 text-foreground">{product.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <p className={cn(
              "text-sm font-bold",
              hasDiscount ? "text-destructive" : "text-primary"
            )}>
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </p>
            )}
          </div>
          {hasDiscount && (
            <p className="text-[10px] text-destructive font-semibold">-{discountPercent}% OFF</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
