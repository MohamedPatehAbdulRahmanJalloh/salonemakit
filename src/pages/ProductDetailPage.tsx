import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Heart, Share2, ShoppingCart, Truck, Minus, Plus } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);

  const wishlisted = product ? isInWishlist(product.id) : false;

  const relatedProducts = product
    ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6)
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
    for (let i = 0; i < quantity; i++) {
      addItem(product, currentSize);
    }
    toast.success(`${quantity} item(s) added to cart`);
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
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            <button className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={handleWishlist}
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
            >
              <Heart className={cn("h-4 w-4", wishlisted ? "fill-destructive text-destructive" : "text-foreground")} />
            </button>
          </div>
        </div>

        {/* Image dots indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div className="h-2 w-6 rounded-full bg-accent" />
          <div className="h-2 w-2 rounded-full bg-background/50" />
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <span className="capitalize">{product.category}</span>
          <span>·</span>
          <span>Clothing</span>
        </div>

        <h1 className="text-xl font-bold text-primary">{product.name}</h1>

        <p className="text-xl font-extrabold text-primary mt-1">{formatPrice(product.price)}</p>

        {/* Rating summary */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-xs font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({reviewCount} reviews)</span>
          </div>
        )}

        {/* Size Selection */}
        {sizes.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-primary mb-2.5">Select Size</p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-11 min-w-[48px] px-5 rounded-xl text-sm font-semibold border-2 transition-all",
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

        {/* Quantity + Add to Cart */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex items-center border-2 border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-secondary"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="h-11 w-10 flex items-center justify-center text-sm font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="h-11 w-11 flex items-center justify-center text-muted-foreground hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm gap-2 rounded-xl"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>

        {/* Delivery info */}
        <div className="mt-4 flex items-center gap-2 text-muted-foreground bg-secondary rounded-xl px-4 py-3">
          <span className="text-base">🇸🇱</span>
          <span className="text-xs font-medium">Delivery Available Nationwide</span>
        </div>

        {/* Description */}
        <div className="mt-5">
          <h3 className="text-sm font-bold text-primary mb-2">Product Details</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
        </div>

        {/* Payment badges */}
        <div className="mt-4 flex gap-2">
          <div className="inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-2 rounded-xl">
            <span className="text-xs font-semibold">💵 Cash on Delivery</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-orange/10 text-orange px-3 py-2 rounded-xl">
            <span className="text-xs font-semibold">📱 Orange Money</span>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewSection productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-bold text-primary mb-3">You May Also Like</h3>
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
    </motion.div>
  );
};

export default ProductDetailPage;
