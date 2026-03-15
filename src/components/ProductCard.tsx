import { Product } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const formatPrice = (price: number) => {
  return `Le ${(price / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const ProductCard = ({ product, compact }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className={`relative overflow-hidden rounded-xl bg-secondary ${compact ? "aspect-square" : "aspect-[3/4]"}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="mt-1.5 pr-7">
          {!compact && <p className="text-[10px] text-muted-foreground capitalize">{product.category}</p>}
          <h3 className="text-xs font-medium leading-tight line-clamp-1">{product.name}</h3>
          <p className="text-xs font-bold mt-0.5">{formatPrice(product.price)}</p>
        </div>
      </Link>
      {!compact && (
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product, product.sizes[0]);
          }}
          className="absolute bottom-[52px] right-2 h-7 w-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-lg transition-transform active:scale-90"
          aria-label={`Add ${product.name} to cart`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
};

export { formatPrice };
export default ProductCard;
