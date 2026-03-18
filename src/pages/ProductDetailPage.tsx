import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ArrowLeft, Heart, Share2, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, BadgeCheck } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { useProductImages } from "@/hooks/useProductImages";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import SizeGuide from "@/components/SizeGuide";
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
  useDocumentTitle(product?.name);
  const { data: extraImages = [] } = useProductImages(id || "");
  const { data: allProducts = [] } = useProducts();
  const { averageRating, reviewCount } = useReviews(id || "");
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(0);
  const { addViewed } = useRecentlyViewed();

  useEffect(() => {
    if (id) addViewed(id);
  }, [id, addViewed]);

  const wishlisted = product ? isInWishlist(product.id) : false;

  const allImages = product
    ? [product.image, ...extraImages.map((img) => img.image_url)]
    : [];

  const relatedProducts = product
    ? allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 6)
    : [];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50 && allImages.length > 1) {
      if (diff > 0 && currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      } else if (diff < 0 && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="pb-24">
        <Skeleton className="aspect-square w-full" />
        <div className="px-4 pt-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-16 w-full" />
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
  const discountPercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, currentSize);
    }
    toast.success(`${quantity} item(s) added to cart`);
    if (navigator.vibrate) navigator.vibrate(50);
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
      transition={{ duration: 0.25 }}
      className="pb-[72px] lg:pb-6"
    >
      {/* Desktop: side-by-side layout */}
      <div className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:pt-6 lg:grid lg:grid-cols-2 lg:gap-8">
      {/* Image Gallery */}
      <div
        className="relative aspect-square bg-secondary overflow-hidden lg:rounded-xl lg:sticky lg:top-6 lg:self-start"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <motion.img
          key={currentImageIndex}
          src={allImages[currentImageIndex] || product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-b from-foreground/20 to-transparent">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = window.location.href;
                const text = `Check out ${product.name} for ${formatPrice(product.price)} on SaloneMakitSL! 🛍️\n${url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
              }}
              className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={handleWishlist}
              className="h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
            >
              <Heart className={cn("h-4 w-4", wishlisted ? "fill-destructive text-destructive" : "text-foreground")} />
            </button>
          </div>
        </div>

        {/* Discount badge */}
        {discountPercent && (
          <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 mt-12">
            -{discountPercent}%
          </div>
        )}

        {/* Image dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={cn(
                  "rounded-full transition-all",
                  i === currentImageIndex ? "h-2 w-5 bg-accent" : "h-2 w-2 bg-foreground/30"
                )}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-foreground/60 text-background text-[10px] font-medium px-2 py-0.5 rounded-full">
          {currentImageIndex + 1}/{allImages.length}
        </div>
      </div>

      {/* Product Info - right column on desktop */}
      <div className="lg:py-0">
      <div className="px-4 pt-3 lg:px-0">
        {/* Price section - SHEIN style */}
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-extrabold text-destructive">{formatPrice(product.price)}</p>
          {product.original_price && product.original_price > product.price && (
            <p className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</p>
          )}
          {discountPercent && (
            <span className="text-xs font-bold text-destructive">-{discountPercent}%</span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-sm font-medium text-foreground mt-2 leading-snug">{product.name}</h1>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">{averageRating.toFixed(1)} ({reviewCount})</span>
          </div>
        )}

        {/* Stock status */}
        <div className="mt-2">
          <span className={cn(
            "text-xs font-medium",
            product.in_stock ? "text-accent" : "text-destructive"
          )}>
            {product.in_stock ? "✓ In Stock" : "✗ Out of Stock"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-2 bg-secondary mt-3" />

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-xs font-bold text-foreground">Size</p>
            <SizeGuide category={product.category} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "h-9 min-w-[40px] px-4 rounded-sm text-xs font-medium border transition-all",
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

      {/* Quantity */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">Quantity</span>
        <div className="flex items-center border border-border rounded-sm overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="h-8 w-10 flex items-center justify-center text-xs font-bold border-x border-border">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Service promises - SHEIN style */}
      <div className="px-4 py-3 border-b border-border flex gap-4">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          <span className="text-[10px]">Nationwide Delivery</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span className="text-[10px]">Secure Payment</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="text-[10px]">Easy Returns</span>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-bold text-foreground mb-2">Product Details</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Payment methods */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-2">
          <div className="inline-flex items-center gap-1 bg-accent/10 px-2.5 py-1.5 rounded-sm">
            <span className="text-[10px] font-semibold text-accent">💵 Cash on Delivery</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-orange/10 px-2.5 py-1.5 rounded-sm">
            <span className="text-[10px] font-semibold text-orange">📱 Orange Money</span>
          </div>
        </div>
      </div>

      {/* Desktop Add to Cart */}
      <div className="hidden lg:block px-4 py-4 lg:px-0">
        <Button
          onClick={handleAddToCart}
          className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm rounded-lg"
        >
          Add to Cart — {formatPrice(product.price * quantity)}
        </Button>
      </div>

      {/* Reviews Section */}
      <div className="px-4">
        <ReviewSection productId={product.id} />
      </div>

      </div>{/* end right column */}
      </div>{/* end grid */}

      {/* Divider */}
      <div className="h-2 bg-secondary mt-2 lg:hidden" />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="py-3">
          <h3 className="text-sm font-bold text-foreground mb-2 px-4">You May Also Like</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4">
            {relatedProducts.map((p) => (
              <div key={p.id} className="min-w-[130px] w-[130px]">
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHEIN-style Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom lg:hidden">
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-2">
          <button
            onClick={handleWishlist}
            className="flex flex-col items-center justify-center w-12"
          >
            <Heart className={cn("h-5 w-5", wishlisted ? "fill-destructive text-destructive" : "text-muted-foreground")} />
            <span className="text-[9px] text-muted-foreground mt-0.5">Save</span>
          </button>
          <Link to="/cart" className="flex flex-col items-center justify-center w-12">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            <span className="text-[9px] text-muted-foreground mt-0.5">Cart</span>
          </Link>
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-10 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-sm rounded-sm"
          >
            Add to Cart — {formatPrice(product.price * quantity)}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
