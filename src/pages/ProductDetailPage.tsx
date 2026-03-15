import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Heart, Share2, ShoppingCart, Truck } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useReviews } from "@/hooks/useReviews";
import { formatPrice } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
import ReviewSection from "@/components/ReviewSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { data: product, isLoading } = useProduct(id || "");
  const { data: allProducts = [] } = useProducts();
  const { averageRating, reviewCount } = useReviews(id || "");
  const [selectedSize, setSelectedSize] = useState<string | undefined>();

  const wishlisted = product ? isInWishlist(product.id) : false;

  // Related products: same category, exclude current
  const relatedProducts = product
    ? allProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 6)
    : [];

  if (isLoading) {
    return (
      <div className="pb-24">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="px-4 pt-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const sizes = product.sizes || [];
  const currentSize = selectedSize || sizes[0];

  const handleAddToCart = () => {
    addItem(product, currentSize);
    navigate("/cart");
  };

  const handleWishlist = () => {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-28"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleWishlist}
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Heart className={cn("h-4 w-4", wishlisted && "fill-destructive text-destructive")} />
            </button>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[11px] text-accent font-semibold uppercase tracking-wider">{product.category}</p>
            <h1 className="text-xl font-bold mt-0.5">{product.name}</h1>
            {/* Rating summary */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={averageRating} size="sm" />
                <span className="text-xs font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground">({reviewCount} reviews)</span>
              </div>
            )}
          </div>
          <p className="text-xl font-extrabold text-accent">{formatPrice(product.price)}</p>
        </div>

        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{product.description}</p>

        {/* Payment badges */}
        <div className="mt-4 flex gap-2">
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-2 rounded-xl">
            <span className="text-xs font-semibold">💵 Cash on Delivery</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-orange/10 text-orange px-3 py-2 rounded-xl">
            <span className="text-xs font-semibold">📱 Orange Money</span>
          </div>
        </div>

        {/* Delivery info */}
        <div className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Truck className="h-4 w-4" />
          <span className="text-xs">Delivery across all 16 districts of Sierra Leone</span>
        </div>

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold mb-2.5">Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-11 min-w-[44px] px-4 rounded-xl text-sm font-semibold border-2 transition-all",
                    currentSize === size
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-foreground border-border hover:border-accent/50"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-bold mb-3">You May Also Like</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="min-w-[150px] w-[150px]">
                  <ProductCard product={p} compact />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/50">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleAddToCart}
            className="w-full h-13 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm gap-2 rounded-2xl"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5" />
            Add to Cart — {formatPrice(product.price)}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
