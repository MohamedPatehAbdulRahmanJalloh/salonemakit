import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/data/types";

interface CreateOrderInput {
  customerName: string;
  phone: string;
  district: string;
  address: string;
  paymentMethod: "cod" | "orange_money";
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: input.customerName,
          phone: input.phone,
          district: input.district,
          address: input.address,
          payment_method: input.paymentMethod,
          subtotal: input.subtotal,
          delivery_fee: input.deliveryFee,
          total: input.total,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // Create order items
      const orderItems = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        selected_size: item.selectedSize || null,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};
