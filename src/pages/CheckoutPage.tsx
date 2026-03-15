import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { SIERRA_LEONE_DISTRICTS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type PaymentMethod = "cod" | "orange_money";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const deliveryFee = 25000;
  const grandTotal = totalPrice + deliveryFee;

  const canSubmit = name.trim() && phone.trim() && district && address.trim() && items.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStep("success");
    clearCart();
  };

  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center"
      >
        <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-5">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>
        <h1 className="text-xl font-bold">Order Confirmed!</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Your order will be delivered to {district}.
          {paymentMethod === "cod"
            ? ` Pay ${formatPrice(grandTotal)} on delivery.`
            : " You will receive an Orange Money payment prompt shortly."}
        </p>
        <Button
          onClick={() => navigate("/")}
          className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Continue Shopping
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Checkout</h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Delivery Info */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" /> Delivery Information
          </h2>
          <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-none" />
          <Input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="bg-secondary border-none" />
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="bg-secondary border-none">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {SIERRA_LEONE_DISTRICTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-secondary border-none" />
        </section>

        {/* Payment Method */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Payment Method</h2>
          <div className="space-y-2">
            {/* Cash on Delivery */}
            <button
              onClick={() => setPaymentMethod("cod")}
              className={cn(
                "w-full rounded-xl p-3 flex items-center gap-3 border-2 transition-colors text-left",
                paymentMethod === "cod"
                  ? "border-accent bg-accent/5"
                  : "border-border bg-secondary"
              )}
            >
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-lg">💵</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                paymentMethod === "cod" ? "border-accent" : "border-muted-foreground/30"
              )}>
                {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
              </div>
            </button>

            {/* Orange Money */}
            <button
              onClick={() => setPaymentMethod("orange_money")}
              className={cn(
                "w-full rounded-xl p-3 flex items-center gap-3 border-2 transition-colors text-left",
                paymentMethod === "orange_money"
                  ? "border-[hsl(var(--orange))] bg-[hsl(var(--orange))]/5"
                  : "border-border bg-secondary"
              )}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "hsl(24, 95%, 53%, 0.1)" }}>
                <span className="text-lg font-bold" style={{ color: "hsl(24, 95%, 53%)" }}>OM</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Orange Money</p>
                <p className="text-xs text-muted-foreground">Pay via Orange Money mobile wallet</p>
              </div>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                paymentMethod === "orange_money" ? "border-[hsl(24,95%,53%)]" : "border-muted-foreground/30"
              )}>
                {paymentMethod === "orange_money" && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(24, 95%, 53%)" }} />}
              </div>
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="bg-secondary rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{formatPrice(grandTotal)}</span>
          </div>
        </section>

        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full h-12 font-semibold disabled:opacity-50",
            paymentMethod === "orange_money"
              ? "text-white hover:opacity-90"
              : "bg-accent text-accent-foreground hover:bg-accent/90"
          )}
          style={paymentMethod === "orange_money" ? { backgroundColor: "hsl(24, 95%, 53%)" } : undefined}
        >
          {paymentMethod === "orange_money" ? "Pay with Orange Money" : "Place Order"} — {formatPrice(grandTotal)}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
