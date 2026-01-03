export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Login page + login POST
  if (url.pathname === "/arena/login") {
    return handleLogin(context);
  }

  // Protect API
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

  // Send people to the login form (not the site root)
  const url = new URL(context.request.url);
  return Response.redirect(new URL("/arena/login", url.origin).toString(), 302);
}

function loginPage(message = "") {
  // Minimal “FFX-ish” vibe without external assets
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>DracoWest | Arena Login</title>
  <style>
    :root{
      --bg0:#05060a; --bg1:#0b0f1e;
      --gold:#c9a24a; --gold2:#8d6a1f;
      --text:#e8ecff; --muted:#aab2d8;
    }
    body{
      margin:0; min-height:100vh; display:grid; place-items:center;
      background:radial-gradient(1200px 600px at 50% 25%, #141a3a 0%, var(--bg0) 55%, #000 100%);
      color:var(--text); font-family:system-ui,-appl
