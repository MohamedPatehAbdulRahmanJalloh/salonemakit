import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/components/ProductCard";
import { SIERRA_LEONE_DISTRICTS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");

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
          Your order will be delivered to {district}. Pay {formatPrice(grandTotal)} on delivery.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="mt-8 bg-primary text-primary-foreground"
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
          <Input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary border-none"
          />
          <Input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            className="bg-secondary border-none"
          />
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
          <Input
            placeholder="Delivery Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-secondary border-none"
          />
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-sm font-semibold mb-2">Payment Method</h2>
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-accent-foreground text-lg">💵</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
            </div>
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
          className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold disabled:opacity-50"
        >
          Place Order — {formatPrice(grandTotal)}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;
