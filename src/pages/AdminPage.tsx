import { useState } from "react";
import { MOCK_PRODUCTS, CATEGORIES } from "@/data/products";
import { Product } from "@/data/types";
import { formatPrice } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Package, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = () => {
    if (!editProduct?.name || !editProduct?.price || !editProduct?.category) return;
    
    if (editProduct.id) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editProduct.id ? { ...p, ...editProduct } as Product : p))
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: editProduct.name,
        price: editProduct.price,
        category: editProduct.category,
        image: editProduct.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=500&fit=crop",
        description: editProduct.description || "",
        sizes: editProduct.sizes || [],
        inStock: true,
      };
      setProducts((prev) => [...prev, newProduct]);
    }
    setEditProduct(null);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1"
              onClick={() => setEditProduct({})}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-auto">
            <DialogHeader>
              <DialogTitle>{editProduct?.id ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <Input
                placeholder="Product name"
                value={editProduct?.name || ""}
                onChange={(e) => setEditProduct((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                placeholder="Price (Le)"
                type="number"
                value={editProduct?.price || ""}
                onChange={(e) => setEditProduct((p) => ({ ...p, price: Number(e.target.value) }))}
              />
              <Select
                value={editProduct?.category || ""}
                onValueChange={(v) => setEditProduct((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Image URL"
                value={editProduct?.image || ""}
                onChange={(e) => setEditProduct((p) => ({ ...p, image: e.target.value }))}
              />
              <Input
                placeholder="Sizes (comma separated)"
                value={editProduct?.sizes?.join(", ") || ""}
                onChange={(e) =>
                  setEditProduct((p) => ({
                    ...p,
                    sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  }))
                }
              />
              <Textarea
                placeholder="Description"
                value={editProduct?.description || ""}
                onChange={(e) => setEditProduct((p) => ({ ...p, description: e.target.value }))}
              />
              <Button onClick={handleSave} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                {editProduct?.id ? "Update" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-4">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <Package className="h-5 w-5 mx-auto text-muted-foreground" />
          <p className="text-lg font-bold mt-1">{products.length}</p>
          <p className="text-[10px] text-muted-foreground">Products</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <p className="text-lg font-bold mt-1">{CATEGORIES.length}</p>
          <p className="text-[10px] text-muted-foreground">Categories</p>
        </div>
        <div className="bg-accent/10 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-accent mt-1">{products.filter((p) => p.inStock).length}</p>
          <p className="text-[10px] text-muted-foreground">In Stock</p>
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 space-y-2">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 bg-secondary rounded-xl p-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-14 h-14 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
              <p className="text-sm font-bold">{formatPrice(product.price)}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setEditProduct(product);
                  setDialogOpen(true);
                }}
                className="h-8 w-8 rounded-full bg-background flex items-center justify-center"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="h-8 w-8 rounded-full bg-background flex items-center justify-center text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
