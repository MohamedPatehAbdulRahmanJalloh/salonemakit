import { useOrders } from "@/hooks/useOrders";
import { formatPrice } from "@/components/ProductCard";
import { ClipboardList, Package, Clock, CheckCircle, Truck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-orange bg-orange/10" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  processing: { label: "Processing", icon: Package, color: "text-purple-600 bg-purple-100" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-600 bg-indigo-100" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-accent bg-accent/10" },
  cancelled: { label: "Cancelled", icon: ClipboardList, color: "text-destructive bg-destructive/10" },
};

const OrdersPage = () => {
  const { data: orders = [], isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="pb-20 px-4 pt-6 space-y-3">
        <h1 className="text-lg font-bold mb-3">My Orders</h1>
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-bold">No Orders Yet</h2>
        <p className="text-sm text-muted-foreground mt-1">Your order history will appear here</p>
        <Link to="/search">
          <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-6 pb-3">
        <h1 className="text-lg font-bold">My Orders ({orders.length})</h1>
      </div>

      <div className="px-4 pt-3 space-y-3">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const StatusIcon = status.icon;
          return (
            <Link key={order.id} to={`/order/${order.id}`} className="block">
              <div className="bg-secondary rounded-2xl p-4 space-y-3 hover:bg-secondary/80 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-sm font-bold mt-0.5">{formatPrice(order.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold", status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>📍 {order.district}</p>
                  <p>💳 {order.payment_method === "orange_money" ? "Orange Money" : "Cash on Delivery"}</p>
                  <p>📦 {(order as any).order_items?.length || 0} item(s)</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
