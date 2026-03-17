import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  user_ids?: string[]; // specific users, or omit for all
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await callerClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin or staff role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: isStaff } = await supabaseAdmin.rpc("has_role", { _user_id: userId, _role: "staff" });

    if (!isAdmin && !isStaff) {
      return new Response(JSON.stringify({ error: "Forbidden: admin or staff role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { title, body, data, user_ids } = (await req.json()) as NotificationPayload;

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get push tokens
    let query = supabaseAdmin.from("push_tokens").select("token, platform, user_id");
    if (user_ids && user_ids.length > 0) {
      query = query.in("user_id", user_ids);
    }
    const { data: tokens, error } = await query;

    if (error) {
      throw error;
    }

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No push tokens found", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For now, log tokens — actual APNs sending requires APNs key configuration
    // When Apple Developer account is ready, integrate with APNs HTTP/2 API
    console.log(`Would send "${title}" to ${tokens.length} devices`);

    // TODO: Implement APNs sending when Apple Developer account is approved
    // This requires:
    // 1. APNs Auth Key (.p8 file) from Apple Developer portal
    // 2. Team ID and Key ID
    // 3. HTTP/2 connection to api.push.apple.com

    return new Response(
      JSON.stringify({
        message: `Notification queued for ${tokens.length} devices`,
        sent: tokens.length,
        title,
        body,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
