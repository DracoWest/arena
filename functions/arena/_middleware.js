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
      color:var(--text); font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
    }
    .card{
      width:min(520px, 92vw);
      background:linear-gradient(180deg, rgba(20,26,58,.75), rgba(5,6,10,.85));
      border:1px solid rgba(201,162,74,.25);
      border-radius:16px;
      box-shadow:0 12px 50px rgba(0,0,0,.55);
      padding:22px 22px 18px;
    }
    .title{
      letter-spacing:.16em; text-transform:uppercase;
      font-weight:700; color:var(--gold);
      margin:0 0 6px;
    }
    .sub{margin:0 0 18px; color:var(--muted); font-size:14px; line-height:1.4;}
    .row{display:flex; gap:10px; align-items:center;}
    input{
      flex:1;
      padding:12px 14px;
      border-radius:12px;
      border:1px solid rgba(201,162,74,.22);
      background:rgba(0,0,0,.35);
      color:var(--text);
      outline:none;
    }
    input:focus{border-color:rgba(201,162,74,.55);}
    button{
      padding:12px 14px;
      border-radius:12px;
      border:1px solid rgba(201,162,74,.35);
      background:linear-gradient(180deg, rgba(201,162,74,.95), rgba(141,106,31,.95));
      color:#0b0b0f;
      font-weight:800;
      cursor:pointer;
    }
    .msg{
      margin:12px 0 0;
      color:#ffb4b4;
      font-size:14px;
      min-height:18px;
    }
    .tiny{
      margin:18px 0 0;
      color:rgba(170,178,216,.75);
      font-size:12px;
    }
  </style>
</head>
<body>
  <main class="card">
    <h1 class="title">Monster Arena Access</h1>
    <p class="sub">Private gate. Enter your passcode to continue.</p>

    <form method="post" action="/arena/login" autocomplete="off">
      <div class="row">
        <input name="code" type="password" inputmode="text" placeholder="Passcode" required />
        <button type="submit">Enter</button>
      </div>
      <div class="msg">${message || ""}</div>
    </form>

    <div class="tiny">Tip: This creates a cookie on this device. Log in once per browser.</div>
  </main>
</body>
</html>`;
}

async function handleLogin(context) {
  const { request, env } = context;

  // Show login form
  if (request.method === "GET") {
    return new Response(loginPage(""), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Accept POST (no code in URL)
  if (request.method === "POST") {
    let code = "";
    try {
      const form = await request.formData();
      code = String(form.get("code") || "");
    } catch (_) {}

    const ok = code && env.ARENA_ADMIN_CODE && code === env.ARENA_ADMIN_CODE;

    if (!ok) {
      return new Response(loginPage("Wrong passcode."), {
        status: 401,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const headers = new Headers();
    headers.append(
      "Set-Cookie",
      "dw_arena=1; Path=/; Max-Age=604800; Secure; HttpOnly; SameSite=Lax"
    );
    headers.append("Location", "/arena/");
    return new Response(null, { status: 302, headers });
  }

  return new Response("Method not allowed", { status: 405 });
}
