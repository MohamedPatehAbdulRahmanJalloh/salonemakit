import { useOrders } from "@/hooks/useOrders";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRegion } from "@/context/RegionContext";
import { ClipboardList, Package, Clock, CheckCircle, Truck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-orange bg-orange/10" },
  confirmed: { label: "Confirmed", icon: CheckCircle, color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30" },
  processing: { label: "Processing", icon: Package, color: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-accent bg-accent/10" },
  cancelled: { label: "Cancelled", icon: ClipboardList, color: "text-destructive bg-destructive/10" },
};

const OrdersPage = () => {
  useDocumentTitle("My Orders");
  const { data: orders = [], isLoading } = useOrders();

  return (
    <div className="pb-20 bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="px-4 py-2.5">
          <h1 className="text-sm font-bold">My Orders</h1>
        </div>
      </header>

      {isLoading ? (
        <div className="px-4 pt-3 space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          emoji="📦"
          title="No Orders Yet"
          description="Once you place an order, it will appear here"
          actionLabel="Start Shopping"
          actionLink="/search"
        />
      ) : (
        <div className="px-4 pt-3 space-y-2">
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const itemCount = (order as any).order_items?.length || 0;
            return (
              <Link key={order.id} to={`/order/${order.id}`} className="block">
                <div className="bg-card border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-sm font-extrabold mt-0.5">{formatPrice(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>📍 {order.district}</span>
                    <span>•</span>
                    <span>{order.payment_method === "orange_money" ? "Orange Money" : "COD"}</span>
                    <span>•</span>
                    <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
