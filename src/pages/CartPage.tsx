import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-bold">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground mt-1">Start shopping to add items</p>
        <Link to="/search">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-44">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold">Cart ({items.length})</h1>
      </div>

      <div className="px-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.product.id + (item.selectedSize || "")}
            className="flex gap-3 bg-secondary rounded-xl p-3"
          >
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-24 object-cover rounded-lg"
            />
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-medium line-clamp-1">{item.product.name}</h3>
                {item.selectedSize && (
                  <p className="text-xs text-muted-foreground">Size: {item.selectedSize}</p>
                )}
                <p className="text-sm font-bold mt-1">{formatPrice(item.product.price)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="h-7 w-7 rounded-full bg-background flex items-center justify-center border border-border"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="h-7 w-7 rounded-full bg-background flex items-center justify-center border border-border"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
        </div>
        <Link to="/checkout" className="block">
          <Button className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            Checkout — Cash on Delivery
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CartPage;
