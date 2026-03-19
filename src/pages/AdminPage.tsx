import { useState, useRef, useEffect } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { CATEGORIES } from "@/data/products";
import { useRegion } from "@/context/RegionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, ShoppingCart, TrendingUp, ArrowLeft, Plus, Trash2, Edit2, Tag, Zap, Upload, BarChart3, Users, Shield, UserPlus, UserMinus, X, ImagePlus, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyProduct = {
  name: "", price: "", original_price: "", price_aed: "", category: "men", image: "",
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

type AdminTab = "products" | "orders" | "coupons" | "flash" | "staff";

const AdminPage = () => {
  const navigate = useNavigate();
  const { formatPrice } = useRegion();
  const { user, isAdmin, isStaff, signOut, loading: authLoading } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useProducts(undefined, true);
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);
  const [extraImages, setExtraImages] = useState<{ id?: string; image_url: string }[]>([]);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [productColors, setProductColors] = useState<{ id?: string; color_name: string; color_hex: string; color_image: string }[]>([]);
  const [colorImageUploading, setColorImageUploading] = useState(false);
  const colorImageInputRef = useRef<HTMLInputElement>(null);
  const [colorImageIndex, setColorImageIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Staff management state
  const [staffEmail, setStaffEmail] = useState("");
  const [addingStaff, setAddingStaff] = useState(false);

  // Coupons
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const { data: coupons = [] } = useQuery({
    queryKey: ["admin-coupons"],
    enabled: isAdmin,
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
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("flash_sales").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Staff list (admin only)
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: ["admin-staff"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("role", "staff" as any);
      if (error) throw error;
      return data || [];
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const hasAccess = isAdmin || isStaff;

  if (!authLoading && !user) { navigate("/auth"); return null; }
  if (!authLoading && !hasAccess) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-4">You don't have admin or staff privileges.</p>
        <Button onClick={() => navigate("/")} variant="outline" className="rounded-full">Go Home</Button>
      </div>
    );
  }

  // Tabs available based on role
  const availableTabs: AdminTab[] = isAdmin
    ? ["products", "orders", "coupons", "flash", "staff"]
    : ["products", "orders"]; // Staff only sees products & orders

  // Image upload (main)
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

  // Extra images upload
  const handleExtraImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingExtra(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file);
      if (error) { toast.error("Upload failed: " + error.message); continue; }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      setExtraImages((prev) => [...prev, { image_url: urlData.publicUrl }]);
    }
    setUploadingExtra(false);
    toast.success("Extra images uploaded!");
    if (e.target) e.target.value = "";
  };

  const removeExtraImage = (index: number) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Color image upload
  const handleColorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || colorImageIndex === null) return;
    setColorImageUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `color-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast.error("Upload failed"); setColorImageUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setProductColors((prev) => prev.map((c, i) => i === colorImageIndex ? { ...c, color_image: urlData.publicUrl } : c));
    setColorImageUploading(false);
    if (e.target) e.target.value = "";
  };

  // Product CRUD
  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) { toast.error("Name, price, and image required"); return; }
    setSaving(true);
    const payload: any = {
      name: form.name.trim(), price: Math.round(parseFloat(form.price) * 1000), category: form.category,
      image: form.image.trim(), description: form.description.trim(),
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
      in_stock: form.in_stock, badge: form.badge || null,
      original_price: form.original_price ? Math.round(parseFloat(form.original_price) * 1000) : null,
      price_aed: form.price_aed ? Math.round(parseFloat(form.price_aed)) : null,
    };
    let error;
    let productId = editingId;
    if (editingId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editingId));
    } else {
      const { data, error: insertErr } = await supabase.from("products").insert(payload).select("id").single();
      error = insertErr;
      if (data) productId = data.id;
    }

    // Save extra images
    if (!error && productId) {
      // Delete old extra images for this product
      await supabase.from("product_images").delete().eq("product_id", productId);
      // Insert new ones
      if (extraImages.length > 0) {
        const rows = extraImages.map((img, i) => ({
          product_id: productId!,
          image_url: img.image_url,
          sort_order: i + 1,
        }));
        const { error: imgErr } = await supabase.from("product_images").insert(rows);
        if (imgErr) toast.error("Failed to save extra images: " + imgErr.message);
      }
      // Save colors
      await supabase.from("product_colors").delete().eq("product_id", productId);
      if (productColors.length > 0) {
        const colorRows = productColors.map((c, i) => ({
          product_id: productId!,
          color_name: c.color_name,
          color_hex: c.color_hex,
          color_image: c.color_image || null,
          sort_order: i,
        }));
        const { error: clrErr } = await supabase.from("product_colors").insert(colorRows);
        if (clrErr) toast.error("Failed to save colors: " + clrErr.message);
      }
    }

    setSaving(false);
    if (error) { toast.error(error.message); }
    else {
      toast.success(editingId ? "Product updated!" : "Product added!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-images"] });
      queryClient.invalidateQueries({ queryKey: ["all-product-colors"] });
      queryClient.invalidateQueries({ queryKey: ["product-colors"] });
      setShowForm(false); setForm(emptyProduct); setEditingId(null); setExtraImages([]); setProductColors([]);
    }
  };

  const handleEdit = async (p: any) => {
    setForm({
      name: p.name, price: String(p.price / 1000), original_price: p.original_price ? String(p.original_price / 1000) : "",
      price_aed: p.price_aed ? String(p.price_aed) : "",
      category: p.category, image: p.image, description: p.description || "",
      sizes: p.sizes?.join(", ") || "", badge: p.badge || "", in_stock: p.in_stock ?? true,
    });
    setEditingId(p.id);
    // Load existing extra images and colors
    const [{ data: imgs }, { data: colors }] = await Promise.all([
      supabase.from("product_images").select("id, image_url").eq("product_id", p.id).order("sort_order", { ascending: true }),
      supabase.from("product_colors").select("id, color_name, color_hex, color_image").eq("product_id", p.id).order("sort_order", { ascending: true }),
    ]);
    setExtraImages(imgs || []);
    setProductColors((colors || []).map((c: any) => ({ id: c.id, color_name: c.color_name, color_hex: c.color_hex, color_image: c.color_image || "" })));
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) { toast.error("Only the owner can delete products"); return; }
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); queryClient.invalidateQueries({ queryKey: ["products"] }); }
  };

  // Order status update
  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order ${status}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Fire-and-forget: send status email notification
      supabase.functions.invoke("send-order-status-email", {
        body: { orderId, newStatus: status },
      }).catch(() => {});
    }
  };

  // Coupon CRUD (admin only)
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

  // Flash Sale CRUD (admin only)
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

  // Staff management (admin only)
  const handleAddStaff = async () => {
    if (!staffEmail.trim()) { toast.error("Enter staff email"); return; }
    setAddingStaff(true);

    // Find user by email using edge function
    const { data, error } = await supabase.functions.invoke("manage-staff", {
      body: { action: "add", email: staffEmail.trim().toLowerCase() },
    });

    setAddingStaff(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Failed to add staff");
    } else {
      toast.success(`${staffEmail} added as staff!`);
      setStaffEmail("");
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke("manage-staff", {
      body: { action: "remove", userId },
    });

    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Failed to remove staff");
    } else {
      toast.success("Staff member removed");
      queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
    }
  };

  const tabLabel = (tab: AdminTab) => {
    switch (tab) {
      case "products": return `Products (${products.length})`;
      case "orders": return `Orders (${orders.length})`;
      case "coupons": return `Coupons (${coupons.length})`;
      case "flash": return `Flash Sales (${flashSales.length})`;
      case "staff": return `Staff (${staffMembers.length})`;
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">
            {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
          </h1>
          {isStaff && !isAdmin && (
            <p className="text-[10px] text-muted-foreground">Staff access • Limited permissions</p>
          )}
        </div>
        {isAdmin && (
          <button onClick={() => navigate("/admin/analytics")} className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-accent" />
          </button>
        )}
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
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === tab ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            )}
          >
            {tabLabel(tab)}
          </button>
        ))}
        {activeTab === "products" && (
          <button onClick={() => { setForm(emptyProduct); setEditingId(null); setExtraImages([]); setProductColors([]); setShowForm(true); }}
            className="ml-auto h-9 w-9 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        )}
        {activeTab === "coupons" && isAdmin && (
          <button onClick={() => { setCouponForm(emptyCoupon); setEditingCouponId(null); setShowCouponForm(true); }}
            className="ml-auto h-9 w-9 shrink-0 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        )}
        {activeTab === "flash" && isAdmin && (
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
                {/* Only admin can delete */}
                {isAdmin && (
                  <button onClick={() => handleDelete(product.id)} className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </button>
                )}
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

        {/* COUPONS TAB (Admin only) */}
        {activeTab === "coupons" && isAdmin && (
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

        {/* FLASH SALES TAB (Admin only) */}
        {activeTab === "flash" && isAdmin && (
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

        {/* STAFF TAB (Admin only) */}
        {activeTab === "staff" && isAdmin && (
          <div className="space-y-4">
            {/* Security notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-primary">Owner Only</p>
                <p className="text-xs text-muted-foreground">Only you (the owner) can add or remove staff. Staff can manage products & orders but cannot delete products, manage coupons, flash sales, or other staff.</p>
              </div>
            </div>

            {/* Add staff form */}
            <div className="bg-secondary rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="h-4 w-4 text-accent" />
                <p className="text-sm font-bold">Add Staff Member</p>
              </div>
              <p className="text-xs text-muted-foreground">The person must have an account on SaloneMakitSL first. Enter their email below.</p>
              <div className="flex gap-2">
                <Input
                  placeholder="staff@email.com"
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="rounded-xl flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleAddStaff()}
                />
                <Button
                  onClick={handleAddStaff}
                  disabled={addingStaff || !staffEmail.trim()}
                  className="rounded-xl bg-accent hover:bg-accent/90 shrink-0"
                >
                  {addingStaff ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>

            {/* Staff list */}
            {staffLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
            ) : staffMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No staff members yet</p>
                <p className="text-xs text-muted-foreground/70">Add team members to help run your business</p>
              </div>
            ) : (
              staffMembers.map((member: any) => (
                <div key={member.id} className="bg-secondary rounded-2xl p-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{member.user_id}</p>
                    <p className="text-xs text-muted-foreground">Staff Member</p>
                  </div>
                  <button
                    onClick={() => handleRemoveStaff(member.user_id)}
                    className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center"
                    title="Remove staff"
                  >
                    <UserMinus className="h-3.5 w-3.5 text-destructive" />
                  </button>
                </div>
              ))
            )}
          </div>
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
            <Input placeholder="AED Price (UAE, optional)" type="number" value={form.price_aed} onChange={(e) => setForm({ ...form, price_aed: e.target.value })} className="rounded-xl" />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm">
                {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <Input placeholder="Badge (HOT, NEW, -20%)" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className="rounded-xl" />
            </div>
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

            {/* Extra Images */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Additional Images (customers can swipe)</p>
                <button
                  type="button"
                  onClick={() => extraFileInputRef.current?.click()}
                  disabled={uploadingExtra}
                  className="h-8 px-2.5 rounded-lg bg-secondary text-foreground flex items-center gap-1 text-[10px] font-semibold"
                >
                  {uploadingExtra ? "..." : <><ImagePlus className="h-3 w-3" /> Add</>}
                </button>
                <input ref={extraFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraImageUpload} />
              </div>
              {extraImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {extraImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img.image_url} alt={`Extra ${i + 1}`} className="h-16 w-16 rounded-lg object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => removeExtraImage(i)}
                        className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold text-muted-foreground">Available Colors</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProductColors((prev) => [...prev, { color_name: "", color_hex: "#000000", color_image: "" }])}
                  className="h-8 px-2.5 rounded-lg bg-secondary text-foreground flex items-center gap-1 text-[10px] font-semibold"
                >
                  <Plus className="h-3 w-3" /> Add Color
                </button>
              </div>
              {productColors.map((color, i) => (
                <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2">
                  <input
                    type="color"
                    value={color.color_hex}
                    onChange={(e) => setProductColors((prev) => prev.map((c, j) => j === i ? { ...c, color_hex: e.target.value } : c))}
                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    placeholder="Color name (e.g. Red)"
                    value={color.color_name}
                    onChange={(e) => setProductColors((prev) => prev.map((c, j) => j === i ? { ...c, color_name: e.target.value } : c))}
                    className="rounded-lg flex-1 h-8 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => { setColorImageIndex(i); colorImageInputRef.current?.click(); }}
                    className="h-8 px-2 rounded-lg bg-background border border-border text-[10px] font-medium shrink-0"
                  >
                    {color.color_image ? "✓ Img" : "📷"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductColors((prev) => prev.filter((_, j) => j !== i))}
                    className="h-6 w-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"
                  >
                    <X className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
              <input ref={colorImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleColorImageUpload} />
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
