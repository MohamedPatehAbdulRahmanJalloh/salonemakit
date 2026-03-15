import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { CATEGORIES } from "@/data/products";
import { formatPrice } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ShoppingCart, TrendingUp, ArrowLeft, Plus, X, Trash2, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyProduct = {
  name: "",
  price: "",
  category: "men",
  image: "",
  description: "",
  sizes: "",
  in_stock: true,
};

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts(undefined, true);
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  if (!authLoading && !isAdmin) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4">You don't have admin privileges. Contact the store owner.</p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">Go Home</Button>
      </div>
    );
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) {
      toast.error("Name, price, and image are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: parseInt(form.price),
      category: form.category,
      image: form.image.trim(),
      description: form.description.trim(),
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      in_stock: form.in_stock,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? "Product updated!" : "Product added!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setForm(emptyProduct);
      setEditingId(null);
    }
  };

  const handleEdit = (product: any) => {
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      image: product.image,
      description: product.description || "",
      sizes: product.sizes?.join(", ") || "",
      in_stock: product.in_stock ?? true,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

  return (
    <div className="pb-20">
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Admin Dashboard</h1>
        <button onClick={signOut} className="text-xs text-muted-foreground font-medium px-3 py-1.5 rounded-full bg-secondary">
          Sign Out
        </button>
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
      <div className="flex gap-2 px-4 mb-4 items-center">
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
        {activeTab === "products" && (
          <button
            onClick={() => { setForm(emptyProduct); setEditingId(null); setShowForm(true); }}
            className="ml-auto h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
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
                <div className="flex gap-1.5">
                  <button onClick={() => handleEdit(product)} className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Edit2 className="h-3.5 w-3.5 text-primary" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            <Input placeholder="Price (in Leones) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <Input placeholder="Image URL *" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-xl" />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            <Input placeholder="Sizes (comma separated: S, M, L)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="rounded-xl" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} />
              In Stock
            </label>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-accent hover:bg-accent/90">
              {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
