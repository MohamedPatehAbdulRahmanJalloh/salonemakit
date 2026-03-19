import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem, Product } from "@/data/types";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, size?: string, color?: string, colorImage?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  justAdded: boolean;
}

const CART_STORAGE_KEY = "salonemakit-cart";

const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [justAdded, setJustAdded] = useState(false);

  const matchItem = (i: CartItem, productId: string, size?: string, color?: string) =>
    i.product.id === productId && i.selectedSize === size && i.selectedColor === color;

  const addItem = useCallback((product: Product, size?: string, color?: string, colorImage?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => matchItem(i, product.id, size, color));
      if (existing) {
        return prev.map((i) =>
          matchItem(i, product.id, size, color)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color, selectedColorImage: colorImage }];
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 500);
  }, []);

  const removeItem = useCallback((productId: string, size?: string, color?: string) => {
    setItems((prev) => prev.filter((i) => !matchItem(i, productId, size, color)));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => !matchItem(i, productId, size, color)));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          matchItem(i, productId, size, color) ? { ...i, quantity } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, justAdded }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
