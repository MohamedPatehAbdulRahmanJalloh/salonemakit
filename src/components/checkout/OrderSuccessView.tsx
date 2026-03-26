import { CheckCircle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/data/types";

interface OrderSuccessViewProps {
  orderId: string;
  orderDistrict: string;
  paymentMethod: "cod" | "orange_money";
  grandTotal: number;
  formatPrice: (p: number) => string;
  name: string;
  phone: string;
  address: string;
  items: CartItem[];
}

const OrderSuccessView = ({ orderId, orderDistrict, paymentMethod, grandTotal, formatPrice, name, phone, address, items }: OrderSuccessViewProps) => {
  const navigate = useNavigate();

  const buildWhatsAppMessage = () => {
    const itemList = items.map(i => `• ${i.product.name} × ${i.quantity}${i.selectedSize ? ` (${i.selectedSize})` : ""}`).join("\n");
    const msg = `🛍️ *New Order from SaloneMakitSL*\n\n📋 *Order ID:* ${orderId.slice(0, 8).toUpperCase()}\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n📍 *Location:* ${address}, ${orderDistrict}\n💳 *Payment:* ${paymentMethod === "orange_money" ? "Orange Money" : "Cash on Delivery"}\n\n*Items:*\n${itemList}\n\n💰 *Total:* ${formatPrice(grandTotal)}${paymentMethod === "orange_money" ? "\n\n📱 Please send payment to: +232 78 928 111" : ""}`;
    return encodeURIComponent(msg);
  };

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
        {paymentMethod === "cod" ? ` Pay ${formatPrice(grandTotal)} on delivery.` : ""}
      </p>
      {paymentMethod === "orange_money" && (
        <div className="rounded-lg bg-orange/5 border border-orange/20 p-3 mt-3 max-w-xs text-left space-y-1.5">
          <p className="text-[11px] font-bold text-orange">📱 Send payment now:</p>
          <p className="text-xs font-bold text-foreground">{formatPrice(grandTotal)}</p>
          <p className="text-[10px] text-muted-foreground">To Orange Money: <span className="font-bold text-orange">+232 78 928 111</span></p>
          <p className="text-[10px] text-muted-foreground">Your order will be processed once payment is confirmed.</p>
        </div>
      )}
      <a
        href={`https://wa.me/23278928111?text=${buildWhatsAppMessage()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
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
};

export default OrderSuccessView;
