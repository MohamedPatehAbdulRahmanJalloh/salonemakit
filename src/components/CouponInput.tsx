import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tag, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/components/ProductCard";

interface CouponInputProps {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
  appliedCode: string | null;
  discount: number;
}

const CouponInput = ({ subtotal, onApply, onRemove, appliedCode, discount }: CouponInputProps) => {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setChecking(true);

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    setChecking(false);

    if (error || !data) {
      toast.error("Invalid coupon code");
      return;
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast.error("This coupon has expired");
      return;
    }

    // Check usage limit
    if (data.max_uses && data.used_count >= data.max_uses) {
      toast.error("This coupon has been fully used");
      return;
    }

    // Check min order
    if (data.min_order_amount && subtotal < data.min_order_amount) {
      toast.error(`Minimum order of ${formatPrice(data.min_order_amount)} required`);
      return;
    }

    // Calculate discount
    let discountAmount = 0;
    if (data.discount_percent > 0) {
      discountAmount = Math.round((subtotal * data.discount_percent) / 100);
    } else if (data.discount_amount > 0) {
      discountAmount = data.discount_amount;
    }

    if (discountAmount <= 0) {
      toast.error("Invalid coupon");
      return;
    }

    onApply(discountAmount, data.code);
    toast.success(`Coupon applied! You save ${formatPrice(discountAmount)}`);
    setCode("");
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between bg-accent/10 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-accent" />
          <div>
            <p className="text-xs font-bold text-accent">{appliedCode}</p>
            <p className="text-[10px] text-muted-foreground">-{formatPrice(discount)}</p>
          </div>
        </div>
        <button onClick={onRemove} className="h-7 w-7 rounded-lg bg-background flex items-center justify-center">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="pl-9 bg-secondary border-none h-11 rounded-xl text-sm uppercase"
          maxLength={20}
        />
      </div>
      <Button
        onClick={handleApply}
        disabled={checking || !code.trim()}
        variant="outline"
        className="h-11 rounded-xl px-5 text-xs font-bold border-accent text-accent hover:bg-accent hover:text-accent-foreground"
      >
        {checking ? "..." : "Apply"}
      </Button>
    </div>
  );
};

export default CouponInput;
