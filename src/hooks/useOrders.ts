import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/data/types";
import { toast } from "sonner";

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
  region?: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const { data: sessionData } = await supabase.auth.getSession();
      let currentUser = sessionData?.session?.user;

      if (!currentUser) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        currentUser = refreshData?.session?.user ?? null;
        if (!currentUser) {
          throw new Error("Session expired. Please sign in again.");
        }
      }

      const { data: orderId, error } = await supabase.rpc("create_order_secure", {
        p_customer_name: input.customerName,
        p_phone: input.phone,
        p_district: input.district,
        p_address: input.address,
        p_payment_method: input.paymentMethod,
        p_delivery_fee: input.deliveryFee,
        p_coupon_code: input.couponCode || null,
        p_items: input.items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          selected_size: item.selectedSize || "",
        })),
        p_region: input.region || "sl",
      } as any);

      if (error) {
        console.error("Order creation error:", error);
        throw new Error(`Order failed: ${error.message}`);
      }

      // Send order confirmation email (fire-and-forget)
      const userEmail = currentUser.email;
      if (userEmail) {
        supabase.functions.invoke("send-transactional-email", {
          body: {
            template: "order_confirmation",
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

      return { id: orderId as string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw new Error(`Cancel failed: ${error.message}`);
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", orderId] });
      toast.success("Order cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.message);
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