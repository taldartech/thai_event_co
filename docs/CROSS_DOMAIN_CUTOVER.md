# Cross-domain cutover: thaidecor.co ↔ thaievent.co

Thai Event Collective now lives at **https://thaievent.co/** (repo: `thai_event_co`).
Thai Decor Collective remains at **https://thaidecor.co/** (this repo).

## Redirect map (configure as HTTP 301)

Prefer Cloudflare (or DNS host) Redirect Rules so clients receive a true 301.
In-repo HTML stubs with `meta refresh` + `canonical` already exist as a fallback.

| Source (thaidecor.co) | Destination (thaievent.co) |
|-----------------------|----------------------------|
| `/thai-event-collective.html` | `/` |
| `/events/corporate-events.html` | `/events/corporate-events.html` |
| `/events/destination-weddings.html` | `/events/destination-weddings.html` |
| `/events/product-launch.html` | `/events/product-launch.html` |
| `/events/conference-management.html` | `/events/conference-management.html` |
| `/events/exhibition-management.html` | `/events/exhibition-management.html` |
| `/events/brand-activation.html` | `/events/brand-activation.html` |
| `/events/private-events.html` | `/events/private-events.html` |
| `/events/luxury-events.html` | `/events/luxury-events.html` |
| `/events/event-production.html` | `/events/event-production.html` |
| `/events/faq.html` | `/events/faq.html` |
| `/events/partners.html` | `/events/partners.html` |

### Cloudflare example

1. Zone: `thaidecor.co`
2. Rules → Redirect Rules → Create rule
3. For each path (or use a dynamic rule):
   - If URI Path equals `/thai-event-collective.html` → Dynamic redirect to `concat("https://thaievent.co", "")` / static `https://thaievent.co/`
   - If URI Path matches `/events/*` → `https://thaievent.co${uri.path}` (301, preserve query string)

Bulk dynamic rule (recommended):

- **If:** `(http.host eq "thaidecor.co" and starts_with(http.request.uri.path, "/events/"))`
- **Then:** Dynamic `concat("https://thaievent.co", http.request.uri.path)` — Status **301**
- **Plus:** Path equals `/thai-event-collective.html` → `https://thaievent.co/` — Status **301**

## DNS / GitHub Pages (Event)

1. Create GitHub repo (e.g. `taldartech/thai_event_co`) and push `thai_event_co/`
2. Enable GitHub Pages from default branch / root
3. Set custom domain `thaievent.co` (CNAME file already contains `thaievent.co`)
4. At DNS: apex + `www` → GitHub Pages per GitHub docs; enable HTTPS
5. Optional: redirect `www.thaievent.co` → apex (or vice versa)

## Search Console

1. Add property `https://thaievent.co/`
2. Submit `https://thaievent.co/sitemap.xml`
3. Re-submit `https://thaidecor.co/sitemap.xml` (Decor-only; Event URLs removed)
4. Use URL Inspection on a few old Event URLs to confirm 301 → thaievent.co

## Verify checklist

- [ ] `https://thaievent.co/` loads Event home
- [ ] Sister nav on Decor → Event and Event → Decor are absolute HTTPS
- [ ] Old `https://thaidecor.co/thai-event-collective.html` 301s (or stub-redirects) to `https://thaievent.co/`
- [ ] Old `https://thaidecor.co/events/corporate-events.html` → `https://thaievent.co/events/corporate-events.html`
- [ ] Decor sitemap has no Event service URLs
- [ ] Event sitemap lists Event URLs only
- [ ] Canonicals on Event pages use `thaievent.co`
