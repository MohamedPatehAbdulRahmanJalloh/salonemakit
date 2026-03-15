import { useState, useRef } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { CATEGORIES } from "@/data/products";
import { formatPrice } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ShoppingCart, TrendingUp, ArrowLeft, Plus, Trash2, Edit2, Tag, Zap, Upload, Image, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const emptyProduct = {
  name: "", price: "", original_price: "", category: "men", image: "",
  description: "", sizes: "", badge: "", in_stock: true,
};

const emptyCoupon = {
  code: "", discount_percent: "", discount_amount: "", min_order_amount: "0",
  max_uses: "", expires_at: "",
};

const emptyFlashSale = {
  title: "", subtitle: "", discount_percent: "20", starts_at: "", ends_at: "",
};

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts(undefined, true);
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "coupons" | "flash">("products");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Coupons
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Flash Sales
  const [showFlashForm, setShowFlashForm] = useState(false);
  const [flashForm, setFlashForm] = useState(emptyFlashSale);
  const [editingFlashId, setEditingFlashId] = useState<string | null>(null);
  const { data: flashSales = [] } = useQuery({
    queryKey: ["admin-flash-sales"],
    queryFn: async () => {
      const { data, error } = await supabase.from("flash_sales").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  if (!authLoading && !user) { navigate("/auth"); return null; }
  if (!authLoading && !isAdmin) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4">You don't have admin privileges.</p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">Go Home</Button>
      </div>
    );
  }

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setForm({ ...form, image: urlData.publicUrl });
    setUploading(false);
    toast.success("Image uploaded!");
  };

  // Product CRUD
  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) { toast.error("Name, price, and image required"); return; }
    setSaving(true);
    const payload: any = {
      name: form.name.trim(), price: parseInt(form.price), category: form.category,
      image: form.image.trim(), description: form.description.trim(),
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      in_stock: form.in_stock, badge: form.badge || null,
      original_price: form.original_price ? parseInt(form.original_price) : null,
    };
    let error;
    if (editingId) { ({ error } = await supabase.from("products").update(payload).eq("id", editingId)); }
    else { ({ error } = await supabase.from("products").insert(payload)); }
    setSaving(false);
    if (error) { toast.error(error.message); }
    else {
      toast.success(editingId ? "Product updated!" : "Product added!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false); setForm(emptyProduct); setEditingId(null);
    }
  };

  const handleEdit = (p: any) => {
    setForm({
      name: p.name, price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category: p.category, image: p.image, description: p.description || "",
      sizes: p.sizes?.join(", ") || "", badge: p.badge || "", in_stock: p.in_stock ?? true,
    });
    setEditingId(p.id); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["products"] }); }
  };

  // Order status update
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast.error(error.message);
    else { toast.success(`Order ${status}`); queryClient.invalidateQueries({ queryKey: ["orders"] }); }
  };

  // Coupon CRUD
  const handleSaveCoupon = async () => {
    if (!couponForm.code) { toast.error("Coupon code required"); return; }
    setSaving(true);
    const payload: any = {
      code: couponForm.code.toUpperCase().trim(),
      discount_percent: couponForm.discount_percent ? parseFloat(couponForm.discount_percent) : 0,
      discount_amount: couponForm.discount_amount ? parseInt(couponForm.discount_amount) : 0,
      min_order_amount: parseInt(couponForm.min_order_amount) || 0,
      max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
      expires_at: couponForm.expires_at || null,
    };
    let error;
    if (editingCouponId) { ({ error } = await supabase.from("coupons").update(payload).eq("id", editingCouponId)); }
    else { ({ error } = await supabase.from("coupons").insert(payload)); }
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(editingCouponId ? "Coupon updated!" : "Coupon created!");
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setShowCouponForm(false); setCouponForm(emptyCoupon); setEditingCouponId(null);
    }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Coupon deleted"); queryClient.invalidateQueries({ queryKey: ["admin-coupons"] }); }
  };

  // Flash Sale CRUD
  const handleSaveFlash = async () => {
    if (!flashForm.title || !flashForm.starts_at || !flashForm.ends_at) { toast.error("Title, start and end dates required"); return; }
    setSaving(true);
    const payload: any = {
      title: flashForm.title.trim(), subtitle: flashForm.subtitle.trim() || null,
      discount_percent: parseInt(flashForm.discount_percent) || 20,
      starts_at: flashForm.starts_at, ends_at: flashForm.ends_at,
    };
    let error;
    if (editingFlashId) { ({ error } = await supabase.from("flash_sales").update(payload).eq("id", editingFlashId)); }
    else { ({ error } = await supabase.from("flash_sales").insert(payload)); }
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(editingFlashId ? "Flash sale updated!" : "Flash sale created!");
      queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
      setShowFlashForm(false); setFlashForm(emptyFlashSale); setEditingFlashId(null);
    }
  };

  const deleteFlash = async (id: string) => {
    const { error } = await supabase.from("flash_sales").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Flash sale deleted"); queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] }); }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Admin Dashboard</h1>
        <button onClick={() => navigate("/admin/analytics")} className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-accent" />
        </button>
        <button onClick={signOut} className="text-xs text-muted-foreground font-medium px-3 py-1.5 rounded-full bg-secondary">Sign Out</button>
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
      <div className="flex gap-2 overflow-x-auto px-4 mb-4 scrollbar-hide">
        {(["products", "orders", "coupons", "flash"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === tab ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            {tab === "products" ? `Products (${products.length})` :
             tab === "orders" ? `Orders (${orders.length})` :
             tab === "coupons" ? `Coupons (${coupons.length})` :
             `Flash Sales (${flashSales.length})`}
          </button>
        ))}
        {activeTab === "products" && (
          <button onClick={() => { setForm(emptyProduct); setEditingId(null); setShowForm(true); }}
            className="ml-auto h-9 w-9 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        )}
        {activeTab === "coupons" && (
          <button onClick={() => { setCouponForm(emptyCoupon); setEditingCouponId(null); setShowCouponForm(true); }}
            className="ml-auto h-9 w-9 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        )}
        {activeTab === "flash" && (
          <button onClick={() => { setFlashForm(emptyFlashSale); setEditingFlashId(null); setShowFlashForm(true); }}
            className="ml-auto h-9 w-9 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 space-y-2">
        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          productsLoading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />) :
          products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 bg-secondary rounded-2xl p-3">
              <img src={product.image} alt={product.name} className="w-14 h-14 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                  {product.badge && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold">{product.badge}</span>}
                </div>
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
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          ordersLoading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />) :
          orders.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">No orders yet</p> :
          orders.map((order) => (
            <div key={order.id} className="bg-secondary rounded-2xl p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold">{order.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-extrabold text-accent">{formatPrice(order.total)}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>📍 {order.district} • 📱 {order.phone}</p>
                <p>💳 {order.payment_method === "orange_money" ? "Orange Money" : "COD"} • 📦 {(order as any).order_items?.length || 0} items</p>
              </div>
              {/* Status dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-muted-foreground">Status:</span>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full border-0 appearance-none cursor-pointer",
                    order.status === "pending" ? "bg-orange/10 text-orange" :
                    order.status === "confirmed" ? "bg-blue-100 text-blue-600" :
                    order.status === "processing" ? "bg-purple-100 text-purple-600" :
                    order.status === "shipped" ? "bg-indigo-100 text-indigo-600" :
                    order.status === "delivered" ? "bg-accent/10 text-accent" :
                    "bg-destructive/10 text-destructive"
                  )}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}

        {/* COUPONS TAB */}
        {activeTab === "coupons" && (
          coupons.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">No coupons yet</p> :
          coupons.map((coupon: any) => (
            <div key={coupon.id} className="bg-secondary rounded-2xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <Tag className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{coupon.code}</p>
                <p className="text-xs text-muted-foreground">
                  {coupon.discount_percent > 0 ? `${coupon.discount_percent}% off` : `Le ${coupon.discount_amount.toLocaleString()} off`}
                  {coupon.min_order_amount > 0 && ` • Min: ${formatPrice(coupon.min_order_amount)}`}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Used: {coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ""} • {coupon.is_active ? "✅ Active" : "❌ Inactive"}
                </p>
              </div>
              <button onClick={() => deleteCoupon(coupon.id)} className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))
        )}

        {/* FLASH SALES TAB */}
        {activeTab === "flash" && (
          flashSales.length === 0 ? <p className="text-center text-muted-foreground text-sm py-8">No flash sales</p> :
          flashSales.map((sale: any) => (
            <div key={sale.id} className="bg-secondary rounded-2xl p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{sale.title}</p>
                <p className="text-xs text-muted-foreground">{sale.discount_percent}% off • {sale.is_active ? "🟢 Active" : "🔴 Ended"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(sale.starts_at).toLocaleDateString()} – {new Date(sale.ends_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => deleteFlash(sale.id)} className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Product name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Price (Leones) *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
              <Input placeholder="Original price" type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <Input placeholder="Badge (HOT, NEW, -20%)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="rounded-xl" />
            </div>
            {/* Image upload or URL */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Image URL *" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="rounded-xl flex-1" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="h-10 px-3 rounded-xl bg-accent text-accent-foreground flex items-center gap-1.5 text-xs font-semibold shrink-0"
                >
                  {uploading ? "..." : <><Upload className="h-3.5 w-3.5" /> Upload</>}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              {form.image && (
                <img src={form.image} alt="Preview" className="h-20 w-20 rounded-xl object-cover border border-border" />
              )}
            </div>
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            <Input placeholder="Sizes (S, M, L, XL)" value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} className="rounded-xl" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.in_stock} onChange={(e) => setForm({ ...form, in_stock: e.target.checked })} /> In Stock
            </label>
            <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl bg-accent hover:bg-accent/90">
              {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={showCouponForm} onOpenChange={setShowCouponForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCouponId ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Coupon Code *" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} className="rounded-xl uppercase" />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Discount %" type="number" value={couponForm.discount_percent} onChange={(e) => setCouponForm({ ...couponForm, discount_percent: e.target.value })} className="rounded-xl" />
              <Input placeholder="Discount Amount (Le)" type="number" value={couponForm.discount_amount} onChange={(e) => setCouponForm({ ...couponForm, discount_amount: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Min order (Le)" type="number" value={couponForm.min_order_amount} onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })} className="rounded-xl" />
              <Input placeholder="Max uses" type="number" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} className="rounded-xl" />
            </div>
            <Input type="datetime-local" value={couponForm.expires_at} onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })} className="rounded-xl" />
            <Button onClick={handleSaveCoupon} disabled={saving} className="w-full rounded-xl bg-accent hover:bg-accent/90">
              {saving ? "Saving..." : editingCouponId ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flash Sale Dialog */}
      <Dialog open={showFlashForm} onOpenChange={setShowFlashForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingFlashId ? "Edit Flash Sale" : "Create Flash Sale"}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Input placeholder="Sale title *" value={flashForm.title} onChange={(e) => setFlashForm({ ...flashForm, title: e.target.value })} className="rounded-xl" />
            <Input placeholder="Subtitle" value={flashForm.subtitle} onChange={(e) => setFlashForm({ ...flashForm, subtitle: e.target.value })} className="rounded-xl" />
            <Input placeholder="Discount %" type="number" value={flashForm.discount_percent} onChange={(e) => setFlashForm({ ...flashForm, discount_percent: e.target.value })} className="rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Starts</label>
                <Input type="datetime-local" value={flashForm.starts_at} onChange={(e) => setFlashForm({ ...flashForm, starts_at: e.target.value })} className="rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Ends</label>
                <Input type="datetime-local" value={flashForm.ends_at} onChange={(e) => setFlashForm({ ...flashForm, ends_at: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <Button onClick={handleSaveFlash} disabled={saving} className="w-full rounded-xl bg-accent hover:bg-accent/90">
              {saving ? "Saving..." : editingFlashId ? "Update Sale" : "Create Flash Sale"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
