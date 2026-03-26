import { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useRegion } from "@/context/RegionContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import CouponInput from "@/components/CouponInput";
import confetti from "canvas-confetti";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import DeliveryForm from "@/components/checkout/DeliveryForm";
import PaymentMethodSelector from "@/components/checkout/PaymentMethodSelector";
import OrderSummaryCard from "@/components/checkout/OrderSummaryCard";
import OrderSuccessView from "@/components/checkout/OrderSuccessView";

type PaymentMethod = "cod" | "orange_money";

const CheckoutPage = () => {
  useDocumentTitle("Checkout");
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { region, config, formatPrice, getProductDisplayPrice, getProductRawPrice } = useRegion();
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

  const regionTotalPrice = items.reduce((sum, i) => sum + getProductRawPrice(i.product) * i.quantity, 0);
  const deliveryFee = config.deliveryFee;
  const discountedSubtotal = Math.max(0, regionTotalPrice - couponDiscount);
  const grandTotal = discountedSubtotal + deliveryFee;

  const isValidPhone = (p: string) => config.phonePattern.test(p.replace(/\s/g, ""));
  const phoneError = phone.trim() && !isValidPhone(phone) ? `Enter a valid ${region === "dubai" ? "UAE" : "Sierra Leone"} phone number` : "";
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
        couponCode: appliedCode,
        region,
      });
      setOrderDistrict(district);
      setOrderId(result.id);
      setStep("success");
      clearCart();
      toast.success("Order placed successfully!");
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      if (navigator.vibrate) navigator.vibrate(200);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
      toast.error(message);
    }
  };

  if (step === "success") {
    return (
      <OrderSuccessView
        orderId={orderId}
        orderDistrict={orderDistrict}
        paymentMethod={paymentMethod}
        grandTotal={grandTotal}
        formatPrice={formatPrice}
        name={name}
        phone={phone}
        address={address}
        items={items}
      />
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
      <CheckoutHeader />

      <div className="px-4 pt-4 space-y-4">
        <DeliveryForm
          name={name} setName={setName}
          phone={phone} setPhone={setPhone}
          district={district} setDistrict={setDistrict}
          address={address} setAddress={setAddress}
          phoneError={phoneError}
          districts={config.districts}
          districtLabel={region === "dubai" ? "📍 Select Emirate/Area" : "📍 Select District"}
        />

        <PaymentMethodSelector
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          showOrangeMoney={region === "sl"}
          formatPrice={formatPrice}
          grandTotal={grandTotal}
        />

        <section>
          <h2 className="text-xs font-bold mb-2">Coupon Code</h2>
          <CouponInput
            subtotal={regionTotalPrice}
            onApply={(discount, code) => { setCouponDiscount(discount); setAppliedCode(code); }}
            onRemove={() => { setCouponDiscount(0); setAppliedCode(null); }}
            appliedCode={appliedCode}
            discount={couponDiscount}
          />
        </section>

        <OrderSummaryCard
          items={items}
          regionTotalPrice={regionTotalPrice}
          couponDiscount={couponDiscount}
          deliveryFee={deliveryFee}
          grandTotal={grandTotal}
          formatPrice={formatPrice}
          getProductDisplayPrice={getProductDisplayPrice}
        />

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
