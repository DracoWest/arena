export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Redirect root to /arena/
  if (url.pathname === "/") {
    return Response.redirect(`${url.origin}/arena/`, 302);
  }

  return context.next();
}
