import policy from "./security-policy.json";

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    const documentRequest = request.headers.get("accept")?.includes("text/html")
      || pathname.endsWith(".html") || !pathname.split("/").pop().includes(".");
    let assetRequest = request;
    if (documentRequest) {
      const headers = new Headers(request.headers);
      headers.delete("if-none-match");
      headers.delete("if-modified-since");
      assetRequest = new Request(request, { headers });
    }
    const response = await env.ASSETS.fetch(assetRequest);
    if (!response.headers.get("content-type")?.includes("text/html") || !response.body) return response;

    // Cloudflare also reads this nonce when adding its bot-detection scripts.
    const nonce = crypto.randomUUID();
    const headers = new Headers(response.headers);
    headers.set("content-security-policy", policy.contentSecurityPolicy.replace(
      "script-src 'self'", `script-src 'self' 'nonce-${nonce}'`));
    headers.delete("etag");
    headers.delete("last-modified");
    headers.set("cache-control", "public, max-age=0, must-revalidate");
    return new HTMLRewriter()
      .on("script", { element(element) { element.setAttribute("nonce", nonce); } })
      .transform(new Response(response.body, { status: response.status, statusText: response.statusText, headers }));
  },
};
