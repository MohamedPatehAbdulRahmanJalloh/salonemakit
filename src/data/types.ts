import { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

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
  paymentMethod: "cod" | "orange_money";
  status: "pending" | "confirmed" | "delivered";
  createdAt: Date;
}
