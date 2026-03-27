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

  const url = new URL(req.url);
  const pathParts = url.pathname.replace(/^\/leads\/?/, "").split("/").filter(Boolean);
  // pathParts: [] | ["import"] | ["bulk"] | [":id"] | [":id", "calls"]

  try {
    // GET /leads — list with filters
    if (req.method === "GET" && pathParts.length === 0) {
      const p = Object.fromEntries(url.searchParams);
      let query = supabase.from("leads").select("*", { count: "exact" });

      if (p.status && p.status !== "all") query = query.eq("status", p.status);
      if (p.city && p.city !== "all") query = query.eq("city", p.city);
      if (p.industry && p.industry !== "all") query = query.eq("industry", p.industry);
      if (p.search) {
        query = query.or(
          `company_name.ilike.%${p.search}%,phone.ilike.%${p.search}%,city.ilike.%${p.search}%`
        );
      }

      query = query.order("created_at", { ascending: false });
      if (p.limit) query = query.limit(parseInt(p.limit));
      else query = query.limit(500);
      if (p.offset) query = query.range(parseInt(p.offset), parseInt(p.offset) + (parseInt(p.limit || "500") - 1));

      const { data, count, error } = await query;
      if (error) return json({ error: error.message }, 400);
      return json({ leads: data, total: count });
    }

    // POST /leads/import
    if (req.method === "POST" && pathParts[0] === "import") {
      console.log("Import endpoint hit");
      const body = await req.json();
      const raw = body.leads;
      console.log("Received leads count:", Array.isArray(raw) ? raw.length : "not array");
      if (!Array.isArray(raw) || raw.length === 0)
        return json({ error: "No leads provided" }, 400);

      // Build rows, dedup by phone
      const rows: any[] = [];
      let skipped = 0;
      const seenPhones = new Set<string>();

      for (const item of raw) {
        const name = item.title || item.company_name || item.name || "";
        if (!name) { skipped++; continue; }

        const phone = item.phone || item.phoneUnformatted || null;
        if (phone) {
          if (seenPhones.has(phone)) { skipped++; continue; }
          seenPhones.add(phone);
        }

        let city = item.city || "";
        if (!city && item.address) {
          const parts = item.address.split(",");
          if (parts.length >= 2) city = parts[parts.length - 2].trim();
        }

        rows.push({
          company_name: name,
          phone,
          website: item.website || item.url || null,
          city: city || null,
          industry: item.categoryName || item.industry || "Unknown",
          rating: item.rating || item.totalScore || null,
          review_count: item.reviewsCount || item.review_count || null,
          source: "apify",
        });
      }

      // Filter out existing phones in one query
      if (seenPhones.size > 0) {
        const { data: existing } = await supabase
          .from("leads")
          .select("phone")
          .in("phone", Array.from(seenPhones));
        if (existing) {
          const existingPhones = new Set(existing.map((e: any) => e.phone));
          const before = rows.length;
          const filtered = rows.filter(r => !r.phone || !existingPhones.has(r.phone));
          skipped += before - filtered.length;
          rows.length = 0;
          rows.push(...filtered);
        }
      }

      if (rows.length === 0) return json({ imported: 0, skipped, total: raw.length });

      // Batch insert in chunks of 100
      let imported = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        const { error } = await supabase.from("leads").insert(chunk);
        if (!error) imported += chunk.length;
        else skipped += chunk.length;
      }

      return json({ imported, skipped, total: raw.length });
    }

    // PATCH /leads/bulk
    if (req.method === "PATCH" && pathParts[0] === "bulk") {
      const { ids, status } = await req.json();
      if (!Array.isArray(ids) || !status)
        return json({ error: "ids array and status required" }, 400);

      for (const id of ids) {
        const { data: lead } = await supabase.from("leads").select("status").eq("id", id).single();
        if (!lead) continue;
        if (lead.status !== status) {
          await supabase.from("leads").update({ status }).eq("id", id);
          await supabase.from("call_log").insert({
            lead_id: id,
            outcome: "status_change",
            notes: `Bulk update: ${lead.status} → ${status}`,
          });
        }
      }

      return json({ updated: ids.length });
    }

    // GET /leads/:id/calls
    if (req.method === "GET" && pathParts.length === 2 && pathParts[1] === "calls") {
      const id = pathParts[0];
      const { data, error } = await supabase
        .from("call_log")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 400);
      return json(data);
    }

    // POST /leads — create
    if (req.method === "POST" && pathParts.length === 0) {
      const body = await req.json();
      if (!body.company_name) return json({ error: "company_name is required" }, 400);

      const { data, error } = await supabase
        .from("leads")
        .insert({
          company_name: body.company_name,
          phone: body.phone || null,
          website: body.website || null,
          city: body.city || null,
          postcode: body.postcode || null,
          industry: body.industry || "Unknown",
          notes: body.notes || "",
          source: body.source || "manual",
        })
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json(data, 201);
    }

    // PATCH /leads/:id
    if (req.method === "PATCH" && pathParts.length === 1) {
      const id = pathParts[0];
      const body = await req.json();

      const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single();
      if (!lead) return json({ error: "Lead not found" }, 404);

      const updates: Record<string, unknown> = {};
      const allowed = ["company_name", "phone", "website", "city", "postcode", "industry", "status", "notes", "rating", "review_count"];
      for (const f of allowed) {
        if (body[f] !== undefined) updates[f] = body[f];
      }

      // Status change → log it
      if (body.status && body.status !== lead.status) {
        if (body.status === "called" && lead.status === "new") {
          updates.call_count = (lead.call_count || 0) + 1;
          updates.last_called_at = new Date().toISOString();
        }
        await supabase.from("call_log").insert({
          lead_id: id,
          outcome: "status_change",
          notes: `Status: ${lead.status} → ${body.status}`,
        });
      }

      // Explicit call outcome logging
      if (body.outcome) {
        await supabase.from("call_log").insert({
          lead_id: id,
          outcome: body.outcome,
          notes: body.call_notes || "",
        });
        updates.call_count = (lead.call_count || 0) + 1;
        updates.last_called_at = new Date().toISOString();
      }

      if (Object.keys(updates).length === 0) return json(lead);

      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) return json({ error: error.message }, 400);
      return json(data);
    }

    // DELETE /leads/:id
    if (req.method === "DELETE" && pathParts.length === 1) {
      const id = pathParts[0];
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) return json({ error: error.message }, 400);
      return json({ success: true });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
