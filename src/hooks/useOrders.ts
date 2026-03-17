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
  couponCode?: string | null;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      // Get fresh session
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        // Try refreshing the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (!refreshData?.session?.user) {
          throw new Error("Session expired. Please sign in again.");
        }
      }

      const currentUser = user || (await supabase.auth.getSession()).data.session?.user;
      if (!currentUser) {
        throw new Error("Not authenticated. Please sign in.");
      }

      const orderId = crypto.randomUUID();

      const { error: orderError } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: input.customerName,
        phone: input.phone,
        district: input.district,
        address: input.address,
        payment_method: input.paymentMethod,
        subtotal: input.subtotal,
        delivery_fee: input.deliveryFee,
        total: input.total,
        user_id: currentUser.id,
      });

      if (orderError) {
        console.error("Order insert error:", orderError);
        throw new Error(`Order failed: ${orderError.message}`);
      }

      const orderItems = input.items.map((item) => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        selected_size: item.selectedSize || null,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Order items insert error:", itemsError);
        throw new Error(`Order items failed: ${itemsError.message}`);
      }

      // Send order confirmation email (fire-and-forget)
      const userEmail = currentUser.email;
      if (userEmail) {
        supabase.functions.invoke("send-transactional-email", {
          body: {
            template: "order_confirmation",
            to: userEmail,
            props: {
              customerName: input.customerName,
              orderId,
              items: input.items.map((item) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                size: item.selectedSize || undefined,
              })),
              subtotal: input.subtotal,
              deliveryFee: input.deliveryFee,
              total: input.total,
              district: input.district,
              address: input.address,
              paymentMethod: input.paymentMethod,
            },
          },
        }).catch((err) => console.error("Order confirmation email failed:", err));
      }

      return { id: orderId };
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
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};
