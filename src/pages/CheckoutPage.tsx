import { useState, useRef } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { formatPrice } from "@/components/ProductCard";
import { SIERRA_LEONE_DISTRICTS } from "@/data/products";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Truck, MapPin, Phone, User, LogIn, ShieldCheck, MessageCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CouponInput from "@/components/CouponInput";
import confetti from "canvas-confetti";

type PaymentMethod = "cod" | "orange_money";

const CheckoutPage = () => {
  useDocumentTitle("Checkout");
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderId, setOrderId] = useState("");
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

  const isValidPhone = (p: string) => /^(\+?232|0)?[2-9]\d{7}$/.test(p.replace(/\s/g, ""));
  const phoneError = phone.trim() && !isValidPhone(phone) ? "Enter a valid Sierra Leone phone number" : "";
  const canSubmit = name.trim() && phone.trim() && !phoneError && district && address.trim() && items.length > 0 && !createOrder.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const result = await createOrder.mutateAsync({
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
      setOrderId(result.id);
      setStep("success");
      clearCart();
      toast.success("Order placed successfully!");
      // 🎉 Confetti celebration
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      if (navigator.vibrate) navigator.vibrate(200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast.error(message);
    }
  };

  const buildWhatsAppMessage = () => {
    const itemList = items.map(i => `• ${i.product.name} × ${i.quantity}${i.selectedSize ? ` (${i.selectedSize})` : ""}`).join("\n");
    const msg = `🛍️ *New Order from SaloneMakitSL*\n\n📋 *Order ID:* ${orderId.slice(0, 8).toUpperCase()}\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Location:* ${address}, ${orderDistrict}\n💳 *Payment:* ${paymentMethod === "orange_money" ? "Orange Money" : "Cash on Delivery"}\n\n*Items:*\n${itemList}\n\n💰 *Total:* ${formatPrice(grandTotal)}${paymentMethod === "orange_money" ? "\n\n📱 Please send payment to: +232 78 928 111" : ""}`;
    return encodeURIComponent(msg);
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-5"
        >
          <CheckCircle className="h-10 w-10 text-accent" />
        </motion.div>
        <h1 className="text-lg font-extrabold">Order Confirmed! 🎉</h1>
        <p className="text-[10px] text-muted-foreground mt-1">Order #{orderId.slice(0, 8).toUpperCase()}</p>
        <p className="text-xs text-muted-foreground mt-3 max-w-xs leading-relaxed">
          Your order will be delivered to {orderDistrict}.
          {paymentMethod === "cod"
            ? ` Pay ${formatPrice(grandTotal)} on delivery.`
            : ` Please send ${formatPrice(grandTotal)} to Orange Money number +232 78 928 111, then your order will be processed.`}
        </p>
        
        {/* WhatsApp Confirmation */}
        <a
          href={`https://wa.me/23278928111?text=${buildWhatsAppMessage()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-[hsl(142,70%,45%)] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-4 w-4" />
          Confirm via WhatsApp
        </a>
        
        <div className="flex gap-3 mt-4">
          <Button onClick={() => navigate("/orders")} variant="outline" className="rounded-lg h-10 text-xs font-bold border-accent text-accent">
            View Orders
          </Button>
          <Button onClick={() => navigate("/")} className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-10 text-xs font-bold px-6">
            Continue Shopping
          </Button>
        </div>
      </motion.div>
    );

  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-3">
          <LogIn className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-sm font-bold">Sign in to checkout</h2>
        <p className="text-xs text-muted-foreground mt-1">Create an account or sign in to place your order</p>
        <Link to="/auth?redirect=/checkout">
          <Button className="mt-5 bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg h-10 px-6 text-xs font-bold gap-1.5">
            <LogIn className="h-4 w-4" /> Sign In / Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-sm font-bold">Checkout</h1>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-accent font-medium">
            <ShieldCheck className="h-3 w-3" /> Secure
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Delivery Info */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-accent" /> Delivery Information
          </h2>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9 bg-secondary border-none h-11 rounded-lg text-sm" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Phone (+23276...)" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className={cn("pl-9 bg-secondary border-none h-11 rounded-lg text-sm", phoneError && "ring-2 ring-destructive")} />
            {phoneError && <p className="text-[10px] text-destructive mt-0.5 pl-1">{phoneError}</p>}
          </div>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="bg-secondary border-none h-11 rounded-lg text-sm">
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
            <Input placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9 bg-secondary border-none h-11 rounded-lg text-sm" />
          </div>
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-xs font-bold mb-2">Payment Method</h2>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentMethod("cod")}
              className={cn(
                "w-full rounded-lg p-3 flex items-center gap-3 border transition-all text-left",
                paymentMethod === "cod" ? "border-accent bg-accent/5" : "border-border bg-card"
              )}
            >
              <span className="text-xl">💵</span>
              <div className="flex-1">
                <p className="text-xs font-bold">Cash on Delivery</p>
                <p className="text-[10px] text-muted-foreground">Pay when you receive</p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                paymentMethod === "cod" ? "border-accent" : "border-muted-foreground/30"
              )}>
                {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("orange_money")}
              className={cn(
                "w-full rounded-lg p-3 flex items-center gap-3 border transition-all text-left",
                paymentMethod === "orange_money" ? "border-orange bg-orange/5" : "border-border bg-card"
              )}
            >
              <span className="text-xl font-black text-orange">OM</span>
              <div className="flex-1">
                <p className="text-xs font-bold">Orange Money</p>
                <p className="text-[10px] text-muted-foreground">Send to: <span className="font-semibold text-orange">+232 78 928 111</span></p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                paymentMethod === "orange_money" ? "border-orange" : "border-muted-foreground/30"
              )}>
                {paymentMethod === "orange_money" && <div className="h-2.5 w-2.5 rounded-full bg-orange" />}
              </div>
            </button>
          </div>
        </section>

        {/* Coupon */}
        <section>
          <h2 className="text-xs font-bold mb-2">Coupon Code</h2>
          <CouponInput
            subtotal={totalPrice}
            onApply={(discount, code) => { setCouponDiscount(discount); setAppliedCode(code); }}
            onRemove={() => { setCouponDiscount(0); setAppliedCode(null); }}
            appliedCode={appliedCode}
            discount={couponDiscount}
          />
        </section>

        {/* Order Summary */}
        <section className="bg-card border border-border rounded-lg p-3 space-y-2">
          <h3 className="text-xs font-bold">Order Summary</h3>
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-xs">
              <span className="text-muted-foreground line-clamp-1 flex-1">{item.product.name} × {item.quantity}</span>
              <span className="font-medium ml-2">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
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

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full h-12 font-bold rounded-lg text-sm disabled:opacity-50",
            paymentMethod === "orange_money"
              ? "bg-orange text-orange-foreground hover:bg-orange/90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
        >
          {createOrder.isPending ? "Placing Order..." : `Place Order — ${formatPrice(grandTotal)}`}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
