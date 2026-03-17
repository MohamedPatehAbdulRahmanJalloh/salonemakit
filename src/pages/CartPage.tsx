import { useCart } from "@/context/CartContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/components/ProductCard";
import { Minus, Plus, Trash2, ShoppingBag, LogIn, ArrowLeft } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  useDocumentTitle("Shopping Bag");
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-base font-bold">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground mt-1">Start shopping to add items</p>
        <Link to="/search">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg px-8 h-10 text-xs font-bold">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-44 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold flex-1">Shopping Bag ({items.length})</h1>
        </div>
      </header>

      <div className="px-4 pt-3 space-y-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.product.id + (item.selectedSize || "")}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-3 bg-card border border-border rounded-lg p-3"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-24 object-cover rounded-md"
              />
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-xs font-medium line-clamp-2 leading-tight">{item.product.name}</h3>
                  {item.selectedSize && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Size: {item.selectedSize}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-extrabold text-foreground">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-7 w-7 rounded-l-md bg-secondary flex items-center justify-center border border-border"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="h-7 w-8 flex items-center justify-center text-xs font-bold border-y border-border bg-background">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-7 w-7 rounded-r-md bg-secondary flex items-center justify-center border border-border"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.product.id)}
                className="self-start h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom checkout bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-3 safe-area-bottom z-40">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-base font-extrabold">{formatPrice(totalPrice)}</p>
          </div>
          {user ? (
            <Link to="/checkout" className="flex-1">
              <Button className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-lg text-xs">
                Checkout
              </Button>
            </Link>
          ) : (
            <Link to="/auth?redirect=/checkout" className="flex-1">
              <Button className="w-full h-11 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-lg text-xs gap-1.5">
                <LogIn className="h-4 w-4" />
                Sign In to Checkout
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
