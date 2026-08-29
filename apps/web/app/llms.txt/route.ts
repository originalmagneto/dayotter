export const dynamic = "force-static";

/**
 * `/llms.txt` - the llmstxt.org convention: a map of a site's public content for
 * AI/answer engines. Off on this deployment.
 *
 * Upstream builds it from the marketing content collections, which is right for
 * a product that wants to be found and compared. Here the domains belong to
 * firms, the marketing group is gated off (see `app/(marketing)/layout.tsx`),
 * and every link that file emitted now 404s - while the text itself described
 * the firm as an open-source scheduling platform with a per-seat price. There is
 * no public content left to map, so the route is 404 rather than a file of dead
 * links.
 *
 * Restoring it means restoring the marketing group first; the upstream version
 * is intact in git history.
 */
export function GET(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
