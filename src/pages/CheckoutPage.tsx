import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { SIERRA_LEONE_DISTRICTS } from "@/data/products";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Truck, MapPin, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CouponInput from "@/components/CouponInput";

type PaymentMethod = "cod" | "orange_money";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [orderDistrict, setOrderDistrict] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const deliveryFee = 25000;
  const discountedSubtotal = Math.max(0, totalPrice - couponDiscount);
  const grandTotal = discountedSubtotal + deliveryFee;

  const canSubmit = name.trim() && phone.trim() && district && address.trim() && items.length > 0 && !createOrder.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createOrder.mutateAsync({
        customerName: name,
        phone,
        district,
        address,
        paymentMethod,
        items,
        subtotal: discountedSubtotal,
        deliveryFee,
        total: grandTotal,
      });
      setOrderDistrict(district);
      setStep("success");
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      >
        <div className="h-24 w-24 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <CheckCircle className="h-12 w-12 text-accent" />
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed! 🎉</h1>
        <p className="text-sm text-muted-foreground mt-3 max-w-xs leading-relaxed">
          Your order will be delivered to {orderDistrict}.
          {paymentMethod === "cod"
            ? ` Pay ${formatPrice(grandTotal)} on delivery.`
            : ` Please send ${formatPrice(grandTotal)} to Orange Money number +232 78 928 111, then your order will be processed.`}
        </p>
        <Button
          onClick={() => navigate("/")}
          className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8"
        >
          Continue Shopping
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Delivery Info */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent" /> Delivery Information
          </h2>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9 bg-secondary border-none h-12 rounded-xl" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Phone Number (e.g. +23276...)" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="pl-9 bg-secondary border-none h-12 rounded-xl" />
          </div>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="bg-secondary border-none h-12 rounded-xl">
              <SelectValue placeholder="📍 Select District" />
            </SelectTrigger>
            <SelectContent>
              {SIERRA_LEONE_DISTRICTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9 bg-secondary border-none h-12 rounded-xl" />
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-sm font-bold mb-3">Payment Method</h2>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod("cod")}
              className={cn(
                "w-full rounded-2xl p-4 flex items-center gap-3 border-2 transition-all text-left",
                paymentMethod === "cod"
                  ? "border-accent bg-accent/5 shadow-sm"
                  : "border-border bg-secondary"
              )}
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-2xl">💵</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
              </div>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                paymentMethod === "cod" ? "border-accent" : "border-muted-foreground/30"
              )}>
                {paymentMethod === "cod" && <div className="h-3 w-3 rounded-full bg-accent" />}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("orange_money")}
              className={cn(
                "w-full rounded-2xl p-4 flex items-center gap-3 border-2 transition-all text-left",
                paymentMethod === "orange_money"
                  ? "border-orange bg-orange/5 shadow-sm"
                  : "border-border bg-secondary"
              )}
            >
              <div className="h-12 w-12 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-orange">OM</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Orange Money</p>
                <p className="text-xs text-muted-foreground">Send to: <span className="font-semibold text-orange">+232 78 928 111</span></p>
              </div>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                paymentMethod === "orange_money" ? "border-orange" : "border-muted-foreground/30"
              )}>
                {paymentMethod === "orange_money" && <div className="h-3 w-3 rounded-full bg-orange" />}
              </div>
            </button>
          </div>
        </section>

        {/* Coupon Code */}
        <section>
          <h2 className="text-sm font-bold mb-3">Coupon Code</h2>
          <CouponInput
            subtotal={totalPrice}
            onApply={(discount, code) => {
              setCouponDiscount(discount);
              setAppliedCode(code);
            }}
            onRemove={() => {
              setCouponDiscount(0);
              setAppliedCode(null);
            }}
            appliedCode={appliedCode}
            discount={couponDiscount}
          />
        </section>

        {/* Order Summary */}
        <section className="bg-secondary rounded-2xl p-4 space-y-2.5">
          <h3 className="text-sm font-bold mb-2">Order Summary</h3>
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground line-clamp-1 flex-1">{item.product.name} × {item.quantity}</span>
              <span className="font-medium ml-2">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-accent font-semibold">Coupon Discount</span>
                <span className="text-accent font-semibold">-{formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-extrabold text-lg text-accent">{formatPrice(grandTotal)}</span>
          </div>
        </section>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full h-14 font-bold rounded-2xl text-base disabled:opacity-50",
            paymentMethod === "orange_money"
              ? "bg-orange text-orange-foreground hover:bg-orange/90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
        >
          {createOrder.isPending ? "Placing Order..." : paymentMethod === "orange_money" ? `Pay ${formatPrice(grandTotal)} with Orange Money` : `Place Order — ${formatPrice(grandTotal)}`}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
