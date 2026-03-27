const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-apify-token",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getToken(req: Request): string {
  const token = req.headers.get("x-apify-token") || Deno.env.get("APIFY_TOKEN") || "";
  if (!token) throw new Error("No Apify token configured. Add it in Settings.");
  return token;
}

async function apifyFetch(token: string, path: string) {
  const res = await fetch(`https://api.apify.com/v2${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Apify API error: ${res.status}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const stripped = url.pathname.replace(/^\/apify\/?/, "");
  // Match: actors, actors/<actorId>/run, actors/<actorId>/last-run, actors/<actorId>/runs
  // Actor IDs can contain slashes (e.g. compass/crawler-google-places)
  const actorsMatch = stripped.match(/^actors(?:\/(.+)\/(run|runs|last-run))?$/);

  try {
    const token = getToken(req);

    // GET /apify/actors
    if (req.method === "GET" && actorsMatch && !actorsMatch[1]) {
      const data = await apifyFetch(token, "/acts?limit=50");
      return json(data.data?.items || []);
    }

    if (actorsMatch && actorsMatch[1] && actorsMatch[2]) {
      const actorId = actorsMatch[1];
      const action = actorsMatch[2];

      // POST /apify/actors/:actorId/run
      if (req.method === "POST" && action === "run") {
        const body = await req.json().catch(() => ({}));
        const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return json(data.data || data);
      }

      // GET /apify/actors/:actorId/runs
      if (req.method === "GET" && action === "runs") {
        const data = await apifyFetch(token, `/acts/${actorId}/runs?limit=10&desc=1`);
        return json(data.data?.items || []);
      }

      // GET /apify/actors/:actorId/last-run
      if (req.method === "GET" && action === "last-run") {
        const runsData = await apifyFetch(token, `/acts/${actorId}/runs?limit=1&desc=1`);
        const runs = runsData.data?.items || [];

        if (!runs || runs.length === 0) return json({ run: null, items: [] });

        const lastRun = runs[0];
        if (lastRun.status !== "SUCCEEDED") return json({ run: lastRun, items: [] });

        const dsData = await apifyFetch(token, `/datasets/${lastRun.defaultDatasetId}/items?limit=1000`);
        return json({ run: lastRun, items: dsData || [] });
      }
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
});
