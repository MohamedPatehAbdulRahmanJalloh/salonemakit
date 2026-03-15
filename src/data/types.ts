export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  sizes: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  district: string;
  address: string;
  phone: string;
  customerName: string;
  paymentMethod: "cod";
  status: "pending" | "confirmed" | "delivered";
  createdAt: Date;
}
