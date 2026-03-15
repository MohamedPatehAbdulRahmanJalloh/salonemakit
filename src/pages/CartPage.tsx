import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/components/ProductCard";
import { Minus, Plus, Trash2, ShoppingBag, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-bold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mt-1">Start shopping to add items</p>
        <Link to="/search">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-48">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold">Cart ({items.length} items)</h1>
      </div>

      <div className="px-4 pt-3 space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.product.id + (item.selectedSize || "")}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex gap-3 bg-secondary rounded-2xl p-3"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-24 object-cover rounded-xl"
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold line-clamp-1">{item.product.name}</h3>
                  {item.selectedSize && (
                    <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                  )}
                  <p className="text-sm font-bold text-accent mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-8 w-8 rounded-xl bg-background flex items-center justify-center border border-border"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-8 w-8 rounded-xl bg-background flex items-center justify-center border border-border"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="h-8 w-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border/50 p-4">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
          </div>
          <Link to="/checkout" className="block">
            <Button className="w-full h-13 bg-accent text-accent-foreground hover:bg-accent/90 font-bold rounded-2xl" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
