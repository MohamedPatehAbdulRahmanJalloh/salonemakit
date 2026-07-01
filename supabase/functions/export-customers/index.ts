import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await caller.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [{ data: isAdmin }, { data: isStaff }] = await Promise.all([
      admin.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      admin.rpc("has_role", { _user_id: user.id, _role: "staff" }),
    ]);
    if (!isAdmin && !isStaff) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull all orders
    const { data: orders, error: ordersErr } = await admin
      .from("orders")
      .select("customer_name, phone, district, address, total, user_id, created_at")
      .order("created_at", { ascending: false });
    if (ordersErr) throw ordersErr;

    // Fetch emails for known user IDs from auth.users
    const userIds = Array.from(new Set((orders ?? []).map((o) => o.user_id).filter(Boolean))) as string[];
    const emailMap = new Map<string, string>();
    // Paginate through auth.users (up to 10k for now)
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) break;
      for (const u of data.users) if (u.email) emailMap.set(u.id, u.email);
      if (!data.users.length || data.users.length < 1000) break;
    }

    // Aggregate by phone (dedupe repeat customers)
    type Row = {
      name: string; phone: string; email: string; district: string;
      address: string; orders: number; total_spent: number;
      first_order: string; last_order: string;
    };
    const byKey = new Map<string, Row>();
    for (const o of orders ?? []) {
      const email = o.user_id ? emailMap.get(o.user_id) ?? "" : "";
      const key = (o.phone || email || o.customer_name || "").trim().toLowerCase();
      if (!key) continue;
      const existing = byKey.get(key);
      const created = o.created_at as string;
      const total = Number(o.total || 0);
      if (existing) {
        existing.orders += 1;
        existing.total_spent += total;
        if (created < existing.first_order) existing.first_order = created;
        if (created > existing.last_order) existing.last_order = created;
        if (!existing.email && email) existing.email = email;
      } else {
        byKey.set(key, {
          name: o.customer_name || "",
          phone: o.phone || "",
          email,
          district: o.district || "",
          address: o.address || "",
          orders: 1,
          total_spent: total,
          first_order: created,
          last_order: created,
        });
      }
    }

    const headerRow = [
      "name", "email", "phone", "district", "address",
      "orders", "total_spent", "first_order", "last_order",
    ];
    const lines = [headerRow.join(",")];
    for (const r of byKey.values()) {
      lines.push([
        r.name, r.email, r.phone, r.district, r.address,
        r.orders, r.total_spent.toFixed(2),
        r.first_order?.slice(0, 10) ?? "",
        r.last_order?.slice(0, 10) ?? "",
      ].map(csvEscape).join(","));
    }

    const csv = lines.join("\n");
    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="salonemakitsl-customers-${new Date().toISOString().slice(0,10)}.csv"`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});