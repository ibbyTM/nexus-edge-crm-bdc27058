import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Total leads
    const { count: total } = await supabase.from("leads").select("*", { count: "exact", head: true });

    // Called today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count: calledToday } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("last_called_at", todayStart.toISOString())
      .neq("status", "new");

    // Demos booked
    const { count: demosBooked } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "demo_booked");

    // Closed
    const { count: closed } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "closed");

    // Contacted (not new)
    const { count: contacted } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .neq("status", "new");

    const conversionRate = contacted && contacted > 0 ? +((closed! / contacted) * 100).toFixed(1) : 0;

    // Status breakdown
    const { data: allLeads } = await supabase.from("leads").select("status");
    const byStatus: Record<string, number> = {};
    for (const l of allLeads || []) {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1;
    }

    // Recent activity
    const { data: recentActivity } = await supabase
      .from("call_log")
      .select("id, lead_id, outcome, notes, created_at, leads(company_name)")
      .order("created_at", { ascending: false })
      .limit(25);

    // Flatten the join
    const activity = (recentActivity || []).map((r: any) => ({
      id: r.id,
      lead_id: r.lead_id,
      outcome: r.outcome,
      notes: r.notes,
      created_at: r.created_at,
      company_name: r.leads?.company_name || "Unknown",
    }));

    return json({
      total: total || 0,
      calledToday: calledToday || 0,
      demosBooked: demosBooked || 0,
      conversionRate,
      byStatus,
      recentActivity: activity,
    });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
