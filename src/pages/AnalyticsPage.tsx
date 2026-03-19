import { useMemo, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { useRegion } from "@/context/RegionContext";
import { ArrowLeft, TrendingUp, Package, ShoppingCart, DollarSign, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, isStaff } = useAuth();
  const { data: orders = [] } = useOrders();
  const { data: products = [] } = useProducts(undefined, true);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
    const deliveredOrders = orders.filter((o: any) => o.status === "delivered").length;

    // Revenue by day (last 7 days)
    const last7Days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayLabel = date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
      const dayOrders = orders.filter((o) => o.created_at.startsWith(dateStr));
      last7Days.push({
        date: dayLabel,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      });
    }

    // Top products by order frequency
    const productCounts: Record<string, { name: string; count: number; revenue: number }> = {};
    orders.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        if (!productCounts[item.product_id]) {
          productCounts[item.product_id] = { name: item.product_name, count: 0, revenue: 0 };
        }
        productCounts[item.product_id].count += item.quantity;
        productCounts[item.product_id].revenue += item.product_price * item.quantity;
      });
    });
    const topProducts = Object.values(productCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Revenue by category
    const categoryCounts: Record<string, number> = {};
    orders.forEach((order: any) => {
      order.order_items?.forEach((item: any) => {
        const product = products.find((p) => p.id === item.product_id);
        const cat = product?.category || "other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + item.product_price * item.quantity;
      });
    });

    // Payment method split
    const paymentMethods = {
      cod: orders.filter((o) => o.payment_method !== "orange_money").length,
      orange: orders.filter((o) => o.payment_method === "orange_money").length,
    };

    return { totalRevenue, avgOrderValue, pendingOrders, deliveredOrders, last7Days, topProducts, categoryCounts, paymentMethods };
  }, [orders, products]);

  const maxRevenue = Math.max(...stats.last7Days.map((d) => d.revenue), 1);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin && !isStaff) {
      navigate("/");
    }
  }, [loading, user, isAdmin, isStaff, navigate]);

  if (loading || !user || (!isAdmin && !isStaff)) {
    return null;
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Sales Analytics</h1>
        <BarChart3 className="h-5 w-5 text-accent" />
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-accent/10 rounded-2xl p-4">
            <DollarSign className="h-5 w-5 text-accent mb-1" />
            <p className="text-xl font-extrabold">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total Revenue</p>
          </div>
          <div className="bg-primary/10 rounded-2xl p-4">
            <ShoppingCart className="h-5 w-5 text-primary mb-1" />
            <p className="text-xl font-extrabold">{orders.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total Orders</p>
          </div>
          <div className="bg-orange/10 rounded-2xl p-4">
            <TrendingUp className="h-5 w-5 text-orange mb-1" />
            <p className="text-xl font-extrabold">{formatPrice(stats.avgOrderValue)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Avg. Order Value</p>
          </div>
          <div className="bg-secondary rounded-2xl p-4">
            <Package className="h-5 w-5 text-muted-foreground mb-1" />
            <p className="text-xl font-extrabold">{products.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Total Products</p>
          </div>
        </div>

        {/* Revenue Chart (last 7 days) */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-4">Revenue (Last 7 Days)</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.last7Days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[8px] text-muted-foreground font-medium">
                  {day.revenue > 0 ? formatPrice(day.revenue) : ""}
                </span>
                <div
                  className="w-full bg-accent/20 rounded-t-lg relative overflow-hidden"
                  style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%` }}
                >
                  <div className="absolute inset-0 bg-accent rounded-t-lg" />
                </div>
                <span className="text-[9px] text-muted-foreground font-medium">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-3">Top Products</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No sales data yet</p>
          ) : (
            <div className="space-y-2.5">
              {stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold",
                    i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.count} sold</p>
                  </div>
                  <p className="text-xs font-bold text-accent">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-3">Revenue by Category</h3>
          {Object.keys(stats.categoryCounts).length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No sales data yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.categoryCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, revenue]) => {
                  const maxCatRevenue = Math.max(...Object.values(stats.categoryCounts));
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="capitalize font-medium">{cat}</span>
                        <span className="font-bold">{formatPrice(revenue)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${(revenue / maxCatRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-3">Payment Methods</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{stats.paymentMethods.cod}</p>
              <p className="text-[10px] text-muted-foreground font-medium">💵 Cash on Delivery</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold">{stats.paymentMethods.orange}</p>
              <p className="text-[10px] text-muted-foreground font-medium">📱 Orange Money</p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-sm font-bold text-primary mb-3">Order Status</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Pending", count: stats.pendingOrders, color: "bg-orange/10 text-orange" },
              { label: "Delivered", count: stats.deliveredOrders, color: "bg-accent/10 text-accent" },
            ].map((s) => (
              <div key={s.label} className={cn("rounded-xl p-3 text-center", s.color)}>
                <p className="text-2xl font-extrabold">{s.count}</p>
                <p className="text-[10px] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
