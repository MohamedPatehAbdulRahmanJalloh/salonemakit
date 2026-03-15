import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const WishlistPage = () => {
  const { user } = useAuth();
  const { wishlistItems, isLoading, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-3">
          <Heart className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <h2 className="text-sm font-bold">Sign in to see your wishlist</h2>
        <p className="text-xs text-muted-foreground mt-1">Save your favorite items for later</p>
        <Link to="/auth">
          <Button className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-8 h-10 text-xs font-bold">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold flex-1">
            Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
          </h1>
        </div>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-[1px] bg-border">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-background">
              <Skeleton className="aspect-[3/4]" />
              <div className="p-2">
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Heart className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-sm font-bold">Your wishlist is empty</h2>
          <p className="text-xs text-muted-foreground mt-1">Tap the heart on items you love</p>
          <Link to="/search">
            <Button className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-8 h-10 text-xs font-bold">
              Browse Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-[1px] bg-border">
          <AnimatePresence>
            {wishlistItems.map((item: any) => {
              const product = item.products;
              if (!product) return null;
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-background"
                >
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="relative overflow-hidden aspect-[3/4]">
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
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem(product, product.sizes?.[0]);
                          toast.success("Added to cart!");
                        }}
                        className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md active:scale-90 transition-all"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="py-2 px-1">
                      <h3 className="text-xs font-medium leading-tight line-clamp-2 min-h-[32px]">{product.name}</h3>
                      <p className="text-sm font-extrabold mt-0.5">{formatPrice(product.price)}</p>
                      {product.category && (
                        <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{product.category}</p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
