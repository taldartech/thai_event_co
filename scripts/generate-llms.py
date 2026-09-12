#!/usr/bin/env python3
"""
Generate llms.txt and llms-full.txt for AI search discovery.

Usage:
  python3 scripts/generate-llms.py

This static-site equivalent of `php artisan seo:generate-llms`
discovers public HTML pages, ignores non-public paths, and writes
UTF-8 plain-text files to the website root.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Callable, Iterable, List, Optional
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://thaievent.co"
SITE_LANGUAGE = "en"
SITE_COUNTRY = "Thailand"
PRIMARY_INDUSTRY = "Event management"
BUSINESS_TYPE = "Local business"
PRIMARY_AUDIENCE = "Couples, corporate hosts, wedding planners, hotels and venues"
MAX_PER_SECTION = 50

IGNORE_DIR_NAMES = {
    ".git",
    "node_modules",
    "vendor",
    "admin",
    "dashboard",
    "api",
    "docs",
    "scripts",
    "storage",
    "tests",
}

IGNORE_FILE_PATTERNS = (
    re.compile(r"(^|/)(login|register|admin|dashboard)(/|$|\.)", re.I),
    re.compile(r"(^|/)api(/|$)", re.I),
)


@dataclass
class Page:
    path: str  # URL path starting with /
    title: str
    absolute_url: str


@dataclass
class Section:
    key: str
    heading: str
    matcher: Callable[[Page], bool]
    limit: int = MAX_PER_SECTION
    sort_key: Callable[[Page], str] = field(default=lambda p: p.path)


def html_to_url_path(rel: Path) -> str:
    parts = rel.as_posix()
    if parts == "index.html":
        return "/"
    if parts.endswith("/index.html"):
        return "/" + parts[: -len("index.html")]
    return "/" + parts


def extract_title(html: str, fallback: str) -> str:
    m = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    if not m:
        return fallback
    title = re.sub(r"\s+", " ", m.group(1)).strip()
    title = title.split("|")[0].strip()
    return title or fallback


def should_ignore(rel_posix: str) -> bool:
    for pat in IGNORE_FILE_PATTERNS:
        if pat.search(rel_posix):
            return True
    return False


def discover_pages() -> List[Page]:
    pages: List[Page] = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in IGNORE_DIR_NAMES for part in path.parts):
            continue
        rel = path.relative_to(ROOT)
        rel_posix = rel.as_posix()
        if should_ignore(rel_posix):
            continue
        url_path = html_to_url_path(rel)
        html = path.read_text(encoding="utf-8", errors="ignore")
        title = extract_title(html, rel.stem.replace("-", " ").title())
        pages.append(
            Page(
                path=url_path,
                title=title,
                absolute_url=f"{BASE_URL}{url_path}" if url_path != "/" else f"{BASE_URL}/",
            )
        )
    # Stable unique by path
    unique = {}
    for p in pages:
        unique[p.path] = p
    return list(unique.values())


def path_contains(page: Page, *needles: str) -> bool:
    p = page.path.lower()
    return any(n in p for n in needles)


def build_sections() -> List[Section]:
    """
    Extensible section registry.
    Add future sections (whitepapers, downloads, videos, events, products,
    testimonials, partners, team) by appending Section entries here — no
    core generation logic changes required.
    """
    return [
        Section(
            key="about",
            heading="About",
            matcher=lambda p: p.path in {"/", "/media-kit.html"},
        ),
        Section(
            key="services",
            heading="Services",
            matcher=lambda p: p.path.startswith("/events/") and not path_contains(p, "faq", "partners"),
        ),
        Section(
            key="blog",
            heading="Blog",
            matcher=lambda p: path_contains(p, "/blog/", "/posts/"),
        ),
        Section(
            key="guides",
            heading="Guides",
            matcher=lambda p: path_contains(p, "/guides/", "/guide/"),
        ),
        Section(
            key="knowledge",
            heading="Knowledge Base",
            matcher=lambda p: path_contains(p, "/knowledge/", "/resources/"),
        ),
        Section(
            key="faqs",
            heading="FAQs",
            matcher=lambda p: path_contains(p, "faq"),
        ),
        Section(
            key="case_studies",
            heading="Case Studies",
            matcher=lambda p: path_contains(p, "/case-stud", "/case_stud"),
        ),
        Section(
            key="portfolio",
            heading="Portfolio",
            matcher=lambda p: path_contains(p, "/portfolio"),
        ),
        Section(
            key="gallery",
            heading="Gallery",
            matcher=lambda p: path_contains(p, "/gallery") or p.path in {"/"},
        ),
        Section(
            key="locations",
            heading="Locations",
            matcher=lambda p: path_contains(p, "/location", "/bangkok", "/phuket"),
        ),
        Section(
            key="resources",
            heading="Resources",
            matcher=lambda p: p.path in {"/media-kit.html", "/partners.html"}
            or path_contains(p, "/resources"),
        ),
        Section(
            key="partners",
            heading="Partners",
            matcher=lambda p: path_contains(p, "partner"),
        ),
        Section(
            key="testimonials",
            heading="Testimonials",
            matcher=lambda p: path_contains(p, "testimonial") or p.path in {"/"},
        ),
        Section(
            key="contact",
            heading="Contact",
            matcher=lambda p: path_contains(p, "contact") or p.path in {"/"},
        ),
        # Future-ready placeholders (empty until pages exist)
        Section(key="whitepapers", heading="Whitepapers", matcher=lambda p: path_contains(p, "whitepaper")),
        Section(key="downloads", heading="Downloads", matcher=lambda p: path_contains(p, "download")),
        Section(key="videos", heading="Videos", matcher=lambda p: path_contains(p, "/video")),
        Section(key="events_calendar", heading="Events", matcher=lambda p: path_contains(p, "/event-calendar", "/upcoming-events")),
        Section(key="products", heading="Products", matcher=lambda p: path_contains(p, "/product/") and "product-launch" not in p.path),
        Section(key="team", heading="Team Members", matcher=lambda p: path_contains(p, "/team", "/about-team")),
    ]


def pages_for_section(section: Section, pages: Iterable[Page]) -> List[Page]:
    matched = [p for p in pages if section.matcher(p)]
    matched.sort(key=section.sort_key)
    return matched[: section.limit]


def metadata_block(generated: str) -> str:
    return "\n".join(
        [
            "Website Name: Thai Event Collective",
            "Website Description: Wedding planner in Thailand for destination weddings, corporate events, MICE, booth building in Bangkok and event production.",
            f"Website Language: {SITE_LANGUAGE}",
            f"Country: {SITE_COUNTRY}",
            f"Primary Industry: {PRIMARY_INDUSTRY}",
            f"Business Type: {BUSINESS_TYPE}",
            f"Primary Audience: {PRIMARY_AUDIENCE}",
            f"Last Updated: {generated}",
            f"Generated Date: {generated}",
            "",
        ]
    )


def ai_summary_block() -> str:
    return "\n".join(
        [
            "## AI Summary",
            "",
            "Who we are: Thai Event Collective is a full-service Thai event planner. Sister firm Thai Decor Collective (https://thaidecor.co/) handles luxury décor and styling.",
            "What we do: Destination wedding planning, corporate events, MICE, conferences, exhibitions, brand activations and event production.",
            "Industries served: Weddings, hospitality, corporate celebrations, tourism and lifestyle events.",
            "Countries served: Thailand (Phuket, Bangkok and destination venues nationwide), supporting international clients hosting events in Thailand.",
            "Primary expertise: Destination wedding planning, corporate event management and on-site production.",
            "Target audience: Couples, corporate hosts, wedding planners, hotels, venues, photographers and tourism partners.",
            "",
        ]
    )


def render_llms_txt(pages: List[Page], generated: str) -> str:
    decor_services = sorted(
        [p for p in pages if p.path.startswith("/events/") and "faq" not in p.path and "partners" not in p.path],
        key=lambda p: p.path,
    )[:MAX_PER_SECTION]

    lines = [
        "# Thai Event Collective",
        "",
        "> Full-service Thai event planner and wedding planner in Thailand. Sister company: Thai Decor Collective (https://thaidecor.co/).",
        "",
        metadata_block(generated).rstrip(),
        "",
        "## About",
        f"{BASE_URL}/",
        f"{BASE_URL}/media-kit.html",
        "",
        "## Services",
        f"{BASE_URL}/#services",
        "",
        "### Thai Event Collective",
    ]
    for p in decor_services:
        lines.append(f"- {p.absolute_url} — {p.title}")

    lines.extend(
        [
            "",
            "## Sister company",
            "- Thai Decor Collective: https://thaidecor.co/",
            "",
            "## Main Topics Covered",
            "- Destination wedding planning",
            "- Corporate events and MICE",
            "- Conference and exhibition management",
            "- Event production and brand activation",
            "",
            "## Important Pages",
            f"- Home: {BASE_URL}/",
            f"- Partners: {BASE_URL}/partners.html",
            f"- Media Kit: {BASE_URL}/media-kit.html",
            f"- FAQ: {BASE_URL}/faq.html",
            "- Sister (Decor): https://thaidecor.co/",
            "",
            "## Knowledge Resources",
            f"{BASE_URL}/faq.html",
            f"{BASE_URL}/media-kit.html",
            f"{BASE_URL}/partners.html",
            "",
            "## Case Studies",
            "Gallery and past-event showcases are featured on:",
            f"{BASE_URL}/#gallery",
            "",
            "## Contact",
            f"{BASE_URL}/#contact",
            "Email: team@thaidecor.co",
            "Phone: +66 81-149-0924",
            "",
            "## Sitemap",
            f"{BASE_URL}/sitemap.xml",
            f"{BASE_URL}/image-sitemap.xml",
            "",
            "## Last Updated",
            generated,
            "",
            ai_summary_block().rstrip(),
            "",
        ]
    )
    return "\n".join(lines) + "\n"


def render_llms_full_txt(pages: List[Page], generated: str) -> str:
    sections = build_sections()
    lines = [
        "# Thai Event Collective — Full Site Map for AI Systems",
        "",
        "> Complete index of major public pages for AI search platforms.",
        "",
        metadata_block(generated).rstrip(),
        "",
        f"Website URL: {BASE_URL}/",
        f"Total discovered public HTML pages: {len(pages)}",
        "",
    ]

    claimed: set[str] = set()
    for section in sections:
        matched = pages_for_section(section, pages)
        # Gallery/testimonials/contact intentionally reuse homepages; allow overlap
        allow_overlap = section.key in {"gallery", "testimonials", "contact", "about"}
        if not allow_overlap:
            matched = [p for p in matched if p.path not in claimed]
            for p in matched:
                claimed.add(p.path)

        lines.append(f"## {section.heading}")
        lines.append("")
        if not matched:
            lines.append("_No pages in this section yet._")
            lines.append("")
            continue
        for p in matched:
            lines.append(f"- {p.absolute_url} — {p.title}")
        lines.append("")

    # Catch-all for any remaining public pages
    remaining = [p for p in sorted(pages, key=lambda x: x.path) if p.path not in claimed]
    lines.append("## All Other Public Pages")
    lines.append("")
    if remaining:
        for p in remaining[:MAX_PER_SECTION]:
            lines.append(f"- {p.absolute_url} — {p.title}")
    else:
        lines.append("_All discovered pages are listed in the sections above._")
    lines.extend(["", ai_summary_block().rstrip(), ""])
    return "\n".join(lines) + "\n"


def write_utf8(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def main() -> int:
    generated = date.today().isoformat()
    pages = discover_pages()
    if not pages:
        print("No public HTML pages discovered.", file=sys.stderr)
        return 1

    llms = ROOT / "llms.txt"
    llms_full = ROOT / "llms-full.txt"
    write_utf8(llms, render_llms_txt(pages, generated))
    write_utf8(llms_full, render_llms_full_txt(pages, generated))

    print(f"Discovered {len(pages)} public pages")
    print(f"Wrote {llms.relative_to(ROOT)}")
    print(f"Wrote {llms_full.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
