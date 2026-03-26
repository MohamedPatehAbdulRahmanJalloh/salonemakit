import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CheckoutHeader = () => {
  const navigate = useNavigate();
  return (
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
  );
};

export default CheckoutHeader;
