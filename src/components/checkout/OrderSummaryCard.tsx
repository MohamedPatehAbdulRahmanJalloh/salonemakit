import { CartItem } from "@/data/types";

interface OrderSummaryCardProps {
  items: CartItem[];
  regionTotalPrice: number;
  couponDiscount: number;
  deliveryFee: number;
  grandTotal: number;
  formatPrice: (p: number) => string;
  getProductDisplayPrice: (product: any) => string;
}

const OrderSummaryCard = ({ items, regionTotalPrice, couponDiscount, deliveryFee, grandTotal, formatPrice, getProductDisplayPrice }: OrderSummaryCardProps) => (
  <section className="bg-card border border-border rounded-lg p-3 space-y-2">
    <h3 className="text-xs font-bold">Order Summary</h3>
    {items.map((item) => (
      <div key={item.product.id + (item.selectedSize || "")} className="flex justify-between text-xs">
        <span className="text-muted-foreground line-clamp-1 flex-1">{item.product.name} × {item.quantity}</span>
        <span className="font-medium ml-2">{getProductDisplayPrice(item.product)}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</span>
      </div>
    ))}
    <div className="border-t border-border pt-2 space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatPrice(regionTotalPrice)}</span>
      </div>
      {couponDiscount > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-accent font-semibold">Discount</span>
          <span className="text-accent font-semibold">-{formatPrice(couponDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Delivery</span>
        <span>{formatPrice(deliveryFee)}</span>
      </div>
    </div>
    <div className="border-t border-border pt-2 flex justify-between">
      <span className="text-xs font-bold">Total</span>
      <span className="font-extrabold text-base text-accent">{formatPrice(grandTotal)}</span>
    </div>
  </section>
);

export default OrderSummaryCard;
