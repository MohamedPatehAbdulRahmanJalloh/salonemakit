import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate and authorize caller (admin or staff only)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: caller.id, _role: "admin" });
    const { data: isStaff } = await supabase.rpc("has_role", { _user_id: caller.id, _role: "staff" });
    if (!isAdmin && !isStaff) {
      return new Response(JSON.stringify({ error: "Forbidden: admin or staff role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId, newStatus } = await req.json();
    if (!orderId || !newStatus) {
      return new Response(JSON.stringify({ error: "orderId and newStatus required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order with user email
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email
    if (!order.user_id) {
      return new Response(JSON.stringify({ error: "No user associated with order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
    const email = userData?.user?.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusEmoji: Record<string, string> = {
      confirmed: "✅",
      processing: "📦",
      shipped: "🚚",
      delivered: "🎉",
      cancelled: "❌",
    };

    const statusMessages: Record<string, string> = {
      confirmed: "Your order has been confirmed and is being prepared.",
      processing: "Your order is being processed and will be shipped soon.",
      shipped: "Your order is on its way! It will arrive at your delivery address soon.",
      delivered: "Your order has been delivered. Thank you for shopping with us!",
      cancelled: "Your order has been cancelled. If you have questions, please contact us.",
    };

    const emoji = statusEmoji[newStatus] || "📋";
    const message = statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`;

    const itemsHtml = (order.order_items || [])
      .map((item: any) => `<li>${item.product_name} × ${item.quantity}</li>`)
      .join("");

    const amount = order.total / 1000;
    const formattedTotal = `NLe ${amount.toLocaleString()}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
  <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="font-size: 20px; color: #1a3a2a; margin: 0;">SaloneMakitSL</h1>
      <p style="color: #2d7a4f; font-size: 10px; letter-spacing: 2px; margin: 4px 0 0;">DI PLACE FO SHOP</p>
    </div>
    <div style="text-align: center; font-size: 48px; margin: 16px 0;">${emoji}</div>
    <h2 style="text-align: center; font-size: 18px; color: #1a3a2a;">Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</h2>
    <p style="text-align: center; color: #6b7280; font-size: 14px; line-height: 1.6;">${message}</p>
    <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
      <p style="margin: 0 0 4px; font-size: 14px;"><strong>${order.customer_name}</strong></p>
      <p style="margin: 0 0 4px; font-size: 13px; color: #6b7280;">📍 ${order.address}, ${order.district}</p>
      <ul style="font-size: 13px; color: #374151; padding-left: 16px; margin: 12px 0;">${itemsHtml}</ul>
      <p style="margin: 12px 0 0; font-size: 16px; font-weight: bold; color: #2d7a4f;">Total: ${formattedTotal}</p>
    </div>
    <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 24px;">
      Questions? WhatsApp us at +232 78 928 111
    </p>
  </div>
</body>
</html>`;

    // Enqueue the email
    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: email,
        subject: `${emoji} Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} — #${order.id.slice(0, 8).toUpperCase()}`,
        html,
        template_name: "order_status_update",
      },
    });

    if (enqueueError) {
      console.error("Failed to enqueue email:", enqueueError);
      return new Response(JSON.stringify({ error: "Failed to queue email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
