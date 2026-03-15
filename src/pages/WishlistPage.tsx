import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const WishlistPage = () => {
  const { user } = useAuth();
  const { wishlistItems, isLoading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Heart className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-bold">Sign in to see your wishlist</h2>
        <p className="text-sm text-muted-foreground mt-1">Save your favorite items for later</p>
        <Link to="/auth">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-6 pb-3">
          <h1 className="text-lg font-bold">Wishlist</h1>
        </div>
        <div className="px-4 pt-3 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-4 mt-2 w-3/4" />
              <Skeleton className="h-4 mt-1 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Heart className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-bold">Your wishlist is empty</h2>
        <p className="text-sm text-muted-foreground mt-1">Tap the heart on items you love</p>
        <Link to="/search">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold">Wishlist ({wishlistItems.length} items)</h1>
      </div>

      <div className="px-4 pt-3 grid grid-cols-2 gap-3">
        <AnimatePresence>
          {wishlistItems.map((item: any) => {
            const product = item.products;
            if (!product) return null;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative overflow-hidden rounded-2xl bg-secondary aspect-[3/4]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id);
                        toast.success("Removed from wishlist");
                      }}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addItem(product, product.sizes?.[0]);
                        toast.success("Added to cart!");
                      }}
                      className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg active:scale-90 transition-all"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 px-0.5">
                    <p className="text-[10px] text-muted-foreground capitalize tracking-wide">{product.category}</p>
                    <h3 className="text-sm font-semibold leading-tight line-clamp-1">{product.name}</h3>
                    <p className="text-sm font-bold text-accent mt-0.5">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WishlistPage;
