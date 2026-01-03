export async function onRequestGet({ env }) {
  const url = new URL(env.SUPABASE_URL);
  const endpoint = `${url.origin}/rest/v1/arena_tallies?owner=eq.${encodeURIComponent(env.ARENA_OWNER)}&select=monster_id,tally`;

  const res = await fetch(endpoint, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  if (!res.ok) return new Response("Supabase read failed", { status: 500 });

  const rows = await res.json();
  const tallies = {};
  for (const r of rows) tallies[r.monster_id] = Number(r.tally || 0);

  return Response.json({ tallies });
}

export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];

  // Validate
  const payload = [];
  for (const it of items) {
    if (!it || typeof it.monster_id !== "string") continue;
    const tally = Number.isFinite(it.tally) ? it.tally : Number(it.tally || 0);
    payload.push({ owner: env.ARENA_OWNER, monster_id: it.monster_id, tally });
  }
  if (payload.length === 0) return new Response("No items", { status: 400 });

  const url = new URL(env.SUPABASE_URL);
  const endpoint = `${url.origin}/rest/v1/arena_tallies`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return new Response("Supabase write failed: " + txt, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
