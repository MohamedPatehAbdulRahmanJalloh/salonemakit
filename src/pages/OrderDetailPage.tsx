import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, CheckCircle, Truck, Clock, MapPin, Phone, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock, description: "Your order has been received" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle, description: "Order confirmed by seller" },
  { key: "processing", label: "Processing", icon: Package, description: "Your items are being prepared" },
  { key: "shipped", label: "Shipped", icon: Truck, description: "On the way to your location" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, description: "Successfully delivered" },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="pb-20 px-4 pt-4 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const currentStatus = order.status;
  const isCancelled = currentStatus === "cancelled";
  const currentStepIndex = TRACKING_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Order Tracking</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Order ID & Date */}
        <div className="bg-secondary rounded-2xl p-4">
          <p className="text-xs text-muted-foreground">Order ID</p>
          <p className="text-sm font-mono font-bold text-primary mt-0.5">{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-4">Order Status</h3>

          {isCancelled ? (
            <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Package className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold text-destructive">Order Cancelled</p>
                <p className="text-xs text-muted-foreground">This order has been cancelled</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {TRACKING_STEPS.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const StepIcon = step.icon;
                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                        isCurrent ? "bg-accent text-accent-foreground ring-4 ring-accent/20" :
                        isCompleted ? "bg-accent text-accent-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>
                        <StepIcon className="h-4 w-4" />
                      </div>
                      {i < TRACKING_STEPS.length - 1 && (
                        <div className={cn("w-0.5 h-10", isCompleted ? "bg-accent" : "bg-border")} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-6">
                      <p className={cn("text-sm font-semibold", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      {isCurrent && (
                        <span className="inline-block mt-1 text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Details */}
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">Delivery Details</h3>
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="h-4 w-4 text-accent shrink-0" />
            <span className="text-muted-foreground">{order.address}, {order.district}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Phone className="h-4 w-4 text-accent shrink-0" />
            <span className="text-muted-foreground">{order.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <CreditCard className="h-4 w-4 text-accent shrink-0" />
            <span className="text-muted-foreground">{order.payment_method === "orange_money" ? "Orange Money" : "Cash on Delivery"}</span>
          </div>
        </div>

        {/* Items */}
        <div className="bg-secondary rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-primary">Items ({(order as any).order_items?.length || 0})</h3>
          {(order as any).order_items?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div>
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}{item.selected_size ? ` • Size: ${item.selected_size}` : ""}
                </p>
              </div>
              <p className="text-sm font-bold">{formatPrice(item.product_price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-secondary rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span>{formatPrice(order.delivery_fee)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-border/30 pt-2">
            <span>Total</span>
            <span className="text-accent">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
