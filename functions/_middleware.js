export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;

  // Allow login endpoint always
  if (path.startsWith("/arena/login")) {
    return context.next();
  }

  // Check auth cookie
  const cookie = context.request.headers.get("Cookie") || "";
  const authed = cookie.includes("dw_arena=1");

  // Root path: redirect only if already authed
  if (path === "/") {
    if (authed) {
      return Response.redirect(`${url.origin}/arena/`, 302);
    }
    // Not authed: stay on 404 root (no redirect)
    return new Response(null, { status: 404 });
  }

  // Protect arena pages
  if (path.startsWith("/arena") && !authed) {
    return Response.redirect(`${url.origin}/arena/login`, 302);
  }

  return context.next();
}
