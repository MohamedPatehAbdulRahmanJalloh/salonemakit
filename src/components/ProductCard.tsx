import { Product } from "@/data/types";
import { useCart } from "@/context/CartContext";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number) => {
  return `Le ${price.toLocaleString()}`;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="mt-2 pr-8">
          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
          <h3 className="text-sm font-medium leading-tight line-clamp-1">{product.name}</h3>
          <p className="text-sm font-bold mt-0.5">{formatPrice(product.price)}</p>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          addItem(product, product.sizes[0]);
        }}
        className="absolute bottom-[52px] right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform active:scale-90"
        aria-label={`Add ${product.name} to cart`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export { formatPrice };
export default ProductCard;
