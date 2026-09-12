# AI Search Optimization (`llms.txt`)

This static website exposes structured summaries for AI search platforms such as ChatGPT, Gemini, Claude, Perplexity and Copilot.

> Note: This project is a static HTML site (not Laravel).  
> The generator below is the equivalent of `php artisan seo:generate-llms`.

## Purpose of `llms.txt`

`llms.txt` is a concise, human- and machine-readable overview of the brand:

- who the business is
- primary services
- important pages
- knowledge resources
- contact endpoints
- sitemap references
- an AI summary block

Public URL:

`https://thaievent.co/llms.txt`

Sister brand (separate domain):

`https://thaidecor.co/llms.txt`

## Purpose of `llms-full.txt`

`llms-full.txt` is a fuller inventory of major public pages, grouped into sections:

- About
- Services
- Blog
- Guides
- Knowledge Base
- FAQs
- Case Studies
- Portfolio
- Gallery
- Locations
- Resources
- Partners
- Testimonials
- Contact
- Future-ready placeholders (Whitepapers, Downloads, Videos, Events, Products, Team)

Each section lists up to the latest **50** matching URLs.

Public URL:

`https://thaievent.co/llms-full.txt`

## How to regenerate

From the project root:

```bash
python3 scripts/generate-llms.py
```

This writes/updates:

- `/llms.txt`
- `/llms-full.txt`

Both files are UTF-8 plain text with no authentication required. On standard static hosting they are served as `text/plain` with HTTP 200.

## How new pages are automatically included

The generator:

1. Scans all `*.html` files under the website root
2. Ignores non-public areas (`.git`, `docs`, `scripts`, `admin`, `dashboard`, `api`, login/register patterns)
3. Converts each file path into a public URL under `https://thaidecor.co`
4. Reads `<title>` tags for page labels
5. Assigns pages into sections using matchers in `scripts/generate-llms.py`
6. Limits each section to 50 entries

When you add a new public HTML page (for example `decor/new-service.html` or `blog/my-post.html`), re-run the generator and it will appear automatically in the matching section.

## Adding future sections

Open `scripts/generate-llms.py` and append a new `Section(...)` in `build_sections()`.

Examples already prepared as empty placeholders:

- Whitepapers
- Downloads
- Videos
- Events
- Products
- Team Members

No core generation logic changes are required—only a matcher for the new URL pattern.

## Validation checklist

- [x] UTF-8 plain text
- [x] Accessible at site root (`/llms.txt`, `/llms-full.txt`)
- [x] No authentication
- [x] Public HTML discovery
- [x] Dynamic regeneration support
- [x] Extensible section registry

After deploy, verify:

```bash
curl -I https://thaidecor.co/llms.txt
curl -I https://thaievent.co/llms-full.txt
```

Both should return `HTTP/1.1 200` (or `HTTP/2 200`) with a text content type.
