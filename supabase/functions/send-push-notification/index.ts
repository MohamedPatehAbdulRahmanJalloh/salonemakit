import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  user_ids?: string[];
}

async function createApnsJwt(): Promise<string> {
  const keyId = Deno.env.get("APNS_KEY_ID")!;
  const teamId = Deno.env.get("APNS_TEAM_ID")!;
  const privateKeyPem = Deno.env.get("APNS_PRIVATE_KEY")!;

  const privateKey = await jose.importPKCS8(privateKeyPem, "ES256");

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .sign(privateKey);

  return jwt;
}

async function sendToApns(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; status: number }> {
  const jwt = await createApnsJwt();
  const bundleId = "app.lovable.03bef03fed5040a9bfc05500cd196410";

  const payload = {
    aps: {
      alert: { title, body },
      sound: "default",
      badge: 1,
    },
    ...(data || {}),
  };

  const response = await fetch(
    `https://api.push.apple.com/3/device/${token}`,
    {
      method: "POST",
      headers: {
        authorization: `bearer ${jwt}`,
        "apns-topic": bundleId,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return { success: response.ok, status: response.status };
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

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin or staff role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    const { data: isStaff } = await supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "staff" });

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

    if (error) throw error;

    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ message: "No push tokens found", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send to each device
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const t of tokens) {
      try {
        if (t.platform === "ios") {
          const result = await sendToApns(t.token, title, body, data);
          if (result.success) {
            successCount++;
          } else {
            failCount++;
            errors.push(`iOS token ${t.token.slice(0, 8)}... status ${result.status}`);
          }
        } else {
          // Android/FCM not yet implemented
          console.log(`Skipping non-iOS token for platform: ${t.platform}`);
          failCount++;
        }
      } catch (sendErr) {
        failCount++;
        errors.push(`Error sending to ${t.token.slice(0, 8)}...: ${sendErr.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        message: `Sent ${successCount}/${tokens.length} notifications`,
        sent: successCount,
        failed: failCount,
        errors: errors.length > 0 ? errors : undefined,
        title,
        body,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
