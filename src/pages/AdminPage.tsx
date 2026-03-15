import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { CATEGORIES } from "@/data/products";
import { formatPrice } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, TrendingUp, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const AdminPage = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="px-4 pt-4 grid grid-cols-3 gap-2 mb-4">
        <div className="bg-accent/10 rounded-2xl p-3 text-center">
          <Package className="h-5 w-5 mx-auto text-accent" />
          <p className="text-xl font-extrabold mt-1">{products.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Products</p>
        </div>
        <div className="bg-orange/10 rounded-2xl p-3 text-center">
          <ShoppingCart className="h-5 w-5 mx-auto text-orange" />
          <p className="text-xl font-extrabold mt-1">{orders.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Orders</p>
        </div>
        <div className="bg-primary/10 rounded-2xl p-3 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-primary" />
          <p className="text-lg font-extrabold mt-1">{formatPrice(totalRevenue)}</p>
          <p className="text-[10px] text-muted-foreground font-medium">Revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-4">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-semibold transition-all",
            activeTab === "products" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={cn(
            "px-4 py-2 rounded-full text-xs font-semibold transition-all",
            activeTab === "orders" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          Orders ({orders.length})
        </button>
      </div>

      {/* Content */}
      <div className="px-4 space-y-2">
        {activeTab === "products" ? (
          productsLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center gap-3 bg-secondary rounded-2xl p-3">
                <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-xl" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                  <p className="text-sm font-bold text-accent">{formatPrice(product.price)}</p>
                </div>
                <div className={cn(
                  "text-[10px] font-semibold px-2 py-1 rounded-full",
                  product.in_stock ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                )}>
                  {product.in_stock ? "In Stock" : "Out"}
                </div>
              </div>
            ))
          )
        ) : (
          ordersLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)
          ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-secondary rounded-2xl p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-bold">{order.customer_name}</p>
                  <p className="text-sm font-extrabold text-accent">{formatPrice(order.total)}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>📍 {order.district} • 📱 {order.phone}</p>
                  <p>💳 {order.payment_method === "orange_money" ? "Orange Money" : "COD"} • {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className={cn(
                  "inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full",
                  order.status === "pending" ? "bg-orange/10 text-orange" : "bg-accent/10 text-accent"
                )}>
                  {order.status}
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default AdminPage;
