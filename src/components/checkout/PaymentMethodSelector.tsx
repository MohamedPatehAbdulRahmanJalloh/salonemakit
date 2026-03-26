import { cn } from "@/lib/utils";

type PaymentMethod = "cod" | "orange_money";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  showOrangeMoney: boolean;
  formatPrice: (p: number) => string;
  grandTotal: number;
}

const PaymentMethodSelector = ({ paymentMethod, setPaymentMethod, showOrangeMoney, formatPrice, grandTotal }: PaymentMethodSelectorProps) => (
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
        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", paymentMethod === "cod" ? "border-accent" : "border-muted-foreground/30")}>
          {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-accent" />}
        </div>
      </button>

      {showOrangeMoney && (
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
            <p className="text-[10px] text-muted-foreground">Pay via mobile money</p>
          </div>
          <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center", paymentMethod === "orange_money" ? "border-orange" : "border-muted-foreground/30")}>
            {paymentMethod === "orange_money" && <div className="h-2.5 w-2.5 rounded-full bg-orange" />}
          </div>
        </button>
      )}

      {paymentMethod === "orange_money" && showOrangeMoney && (
        <div className="rounded-lg bg-orange/5 border border-orange/20 p-3 mt-2 space-y-1.5">
          <p className="text-[11px] font-bold text-orange">How to pay:</p>
          <ol className="text-[10px] text-muted-foreground space-y-1 list-decimal list-inside leading-relaxed">
            <li>Place your order first</li>
            <li>Send <span className="font-bold text-foreground">{formatPrice(grandTotal)}</span> to <span className="font-bold text-orange">+232 78 928 111</span></li>
            <li>We'll confirm your payment and process your order</li>
          </ol>
        </div>
      )}
    </div>
  </section>
);

export default PaymentMethodSelector;
