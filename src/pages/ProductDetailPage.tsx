import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { MOCK_PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes[0]
  );

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, selectedSize);
    navigate("/cart");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Details */}
      <div className="px-4 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
            <h1 className="text-xl font-bold mt-0.5">{product.name}</h1>
          </div>
          <p className="text-xl font-bold">{formatPrice(product.price)}</p>
        </div>

        <p className="text-sm text-muted-foreground mt-3">{product.description}</p>

        {/* COD Badge */}
        <div className="mt-4 inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full">
          <span className="text-xs font-semibold">✓ Cash on Delivery Available</span>
        </div>

        {/* Size Selection */}
        {product.sizes.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold mb-2">Size</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-10 min-w-[40px] px-3 rounded-lg text-sm font-medium border transition-colors",
                    selectedSize === size
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleAddToCart}
          className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-sm gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart — {formatPrice(product.price)}
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductDetailPage;
