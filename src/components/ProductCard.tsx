import { Product } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { Heart, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export const formatPrice = (price: number) => {
  return `Le ${price.toLocaleString()}`;
};

const ProductCard = ({ product, compact }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className={`relative overflow-hidden rounded-2xl bg-secondary ${compact ? "aspect-square" : "aspect-[3/4]"}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Wishlist button */}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="h-4 w-4 text-foreground" />
          </button>
          {/* Quick add */}
          {!compact && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, product.sizes?.[0]);
              }}
              className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-all active:scale-90 opacity-0 group-hover:opacity-100"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-2 px-0.5">
          {!compact && <p className="text-[10px] text-muted-foreground capitalize tracking-wide">{product.category}</p>}
          <h3 className="text-sm font-semibold leading-tight line-clamp-1">{product.name}</h3>
          <p className="text-sm font-bold text-accent mt-0.5">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
