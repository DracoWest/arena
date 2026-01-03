export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Login endpoint
  if (url.pathname === "/arena/login") {
    return handleLogin(context);
  }

  // Allow API for authenticated users only
  if (url.pathname.startsWith("/api/arena")) {
    return requireAuth(context);
  }

  // Protect /arena/*
  if (url.pathname.startsWith("/arena")) {
    return requireAuth(context);
  }

  return context.next();
}

function isAuthed(req) {
  const cookie = req.headers.get("Cookie") || "";
  return cookie.includes("dw_arena=1");
}

async function requireAuth(context) {
  if (isAuthed(context.request)) return context.next();
  const url = new URL(context.request.url);
  return Response.redirect(new URL("/", url.origin).toString(), 302);
}

async function handleLogin(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code") || "";
  const ok = code && env.ARENA_ADMIN_CODE && code === env.ARENA_ADMIN_CODE;

  if (!ok) return new Response("Nope.", { status: 401 });

  const headers = new Headers();
  headers.append("Set-Cookie", "dw_arena=1; Path=/; Max-Age=604800; Secure; HttpOnly; SameSite=Lax");
  headers.append("Location", "/arena/");
  return new Response(null, { status: 302, headers });
}
