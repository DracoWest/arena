export async function onRequestPut({ request, env }) {
  const body = await request.json().catch(() => ({}));
  const monster_id = typeof body.monster_id === "string" ? body.monster_id : "";
  const tally = Number.isFinite(body.tally) ? body.tally : Number(body.tally || 0);

  if (!monster_id) return new Response("monster_id required", { status: 400 });

  const payload = [{ owner: env.ARENA_OWNER, monster_id, tally }];

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
