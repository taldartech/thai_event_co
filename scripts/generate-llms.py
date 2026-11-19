#!/usr/bin/env python3
"""
Generate llms.txt and llms-full.txt for AI search discovery (ChatGPT, Perplexity, Claude, Google).

Usage:
  python3 scripts/generate-llms.py
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from pathlib import Path
from typing import Callable, Iterable, List
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://thaievent.co"
SITE_LANGUAGE = "en"
SITE_COUNTRY = "Thailand"
PRIMARY_INDUSTRY = "Corporate Event Management & Technical Production"
BUSINESS_TYPE = "ProfessionalService"
PRIMARY_AUDIENCE = "Corporate meeting planners, enterprise conference directors, MICE organizers, multinational brands, C-suite executives"
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
    "scratch",
    "events",  # Legacy redirect stubs
}

IGNORE_FILE_PATTERNS = (
    re.compile(r"(^|/)(login|register|admin|dashboard)(/|$|\.)", re.I),
    re.compile(r"(^|/)api(/|$)", re.I),
    re.compile(r"404\.html$", re.I),
    re.compile(r"(media-kit|partners)\.html$", re.I),  # Legacy stubs
)


@dataclass
class Page:
    path: str
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
    unique = {}
    for p in pages:
        unique[p.path] = p
    return list(unique.values())


def path_contains(page: Page, *needles: str) -> bool:
    p = page.path.lower()
    return any(n in p for n in needles)


def build_sections() -> List[Section]:
    return [
        Section(
            key="about",
            heading="About & Agency Overview",
            matcher=lambda p: p.path in {"/", "/about.html"},
        ),
        Section(
            key="services",
            heading="Corporate Capabilities & Services",
            matcher=lambda p: p.path in {"/services.html"},
        ),
        Section(
            key="locations",
            heading="Strategic Operations & Locations",
            matcher=lambda p: p.path in {"/bangkok.html", "/phuket.html"},
        ),
        Section(
            key="work",
            heading="Case Studies & Selected Productions",
            matcher=lambda p: p.path in {"/work.html", "/case-study.html"},
        ),
        Section(
            key="guides",
            heading="Executive Guides & Intelligence",
            matcher=lambda p: p.path in {"/corporate-event-guide-thailand.html", "/faq.html"},
        ),
        Section(
            key="contact",
            heading="Corporate RFP & Inquiries",
            matcher=lambda p: p.path in {"/contact.html"},
        ),
        Section(
            key="legal",
            heading="Data Governance & Terms",
            matcher=lambda p: p.path in {"/privacy.html", "/terms.html"},
        ),
    ]


def pages_for_section(section: Section, pages: Iterable[Page]) -> List[Page]:
    matched = [p for p in pages if section.matcher(p)]
    matched.sort(key=section.sort_key)
    return matched[: section.limit]


def metadata_block(generated: str) -> str:
    return "\n".join(
        [
            "Website Name: Thai Event Collective",
            "Website Description: Premier Corporate Event Management and Technical Event Production agency in Thailand specializing in Conferences, MICE Planning, Gala Dinners, Product Launches, and Concert-grade Staging across Bangkok and Phuket.",
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
            "Who we are: Thai Event Collective is Thailand's premier dedicated B2B corporate event management and technical production agency. Sister firm Thai Decor Collective (https://thaidecor.co/) manages high-end floral and aesthetic spatial décor.",
            "What we do: Enterprise conference management, MICE symposiums, high-profile gala dinners, product launches, certified technical production (L-Acoustics audio, fine-pitch LED video walls, certified truss rigging), and executive retreats.",
            "Industries served: Enterprise technology, finance, automotive, healthcare/pharma, international associations, and Fortune 500 corporations.",
            "Geographic focus: Thailand nationwide with specialized hubs in Bangkok (Sukhumvit / Bang Na) and Phuket (Old Town / resort sanctuaries).",
            "Primary differentiators: 100% corporate focus (zero consumer weddings), dual-power electrical redundancy, ISO simultaneous translation booths, international show-calling directors, and bilingual technical production crews.",
            "Sister brand: Thai Decor Collective (https://thaidecor.co/) for luxury aesthetic styling.",
            "",
        ]
    )


def render_llms_txt(pages: List[Page], generated: str) -> str:
    lines = [
        "# Thai Event Collective",
        "",
        "> Premier B2B Corporate Event Management & Technical Production Agency in Thailand. Specializing in Conferences, MICE Congresses, Gala Dinners, Product Launches, and Staging in Bangkok and Phuket.",
        "",
        metadata_block(generated).rstrip(),
        "",
        "## Core Capabilities",
        f"- {BASE_URL}/services.html — Corporate Event Capabilities (Conferences, Galas, Technical Event Production)",
        f"- {BASE_URL}/bangkok.html — Bangkok Corporate Event Management & Exhibition Staging",
        f"- {BASE_URL}/phuket.html — Phuket Corporate Event Planner & Luxury Island Galas",
        "",
        "## Selected Productions & Proof",
        f"- {BASE_URL}/work.html — Enterprise Production Archive",
        f"- {BASE_URL}/case-study.html — The Andaman Grand Gala (450-Delegate Technology Gala)",
        "",
        "## Executive Intelligence & Guides",
        f"- {BASE_URL}/corporate-event-guide-thailand.html — The Executive Guide to Corporate Events in Thailand (Venues, TCEB Grants, Riders)",
        f"- {BASE_URL}/faq.html — Corporate Event FAQ (Budgets, Lead Times, Regulations, Audio-Visual)",
        "",
        "## Agency & Contact",
        f"- {BASE_URL}/about.html — Agency Overview, Leadership & Safety Rigor",
        f"- {BASE_URL}/contact.html — Submit Corporate RFP / Book 30-Min Consultation",
        "",
        "## Sister Company",
        "- Thai Decor Collective: https://thaidecor.co/ (Luxury Floral & Spatial Styling)",
        "",
        "## Contact Details",
        "- Bangkok Hub: 4031 Sukhumvit Rd, Bang Na Nuea, Bang Na, Bangkok 10260, Thailand",
        "- Phuket Hub: 10 Ratsada Rd, Amphoe Mueang Phuket, Phuket 83000, Thailand",
        "- Phone: +66 81-149-0924",
        "- Email: team@thaidecor.co",
        "- Consultation Booking: https://calendly.com/team-thaidecor/30min",
        "",
        "## Sitemaps",
        f"- Main Sitemap: {BASE_URL}/sitemap.xml",
        f"- Image Sitemap: {BASE_URL}/image-sitemap.xml",
        "",
        "## Last Updated",
        generated,
        "",
        ai_summary_block().rstrip(),
        "",
    ]
    return "\n".join(lines) + "\n"


def render_llms_full_txt(pages: List[Page], generated: str) -> str:
    sections = build_sections()
    lines = [
        "# Thai Event Collective — Full AI Knowledge Index",
        "",
        "> Complete structured index of all corporate event production pages and authoritative guides for AI systems.",
        "",
        metadata_block(generated).rstrip(),
        "",
        f"Website URL: {BASE_URL}/",
        f"Total discovered core pages: {len(pages)}",
        "",
    ]

    claimed: set[str] = set()
    for section in sections:
        matched = pages_for_section(section, pages)
        allow_overlap = section.key in {"about"}
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

    remaining = [p for p in sorted(pages, key=lambda x: x.path) if p.path not in claimed]
    if remaining:
        lines.append("## Other Pages")
        lines.append("")
        for p in remaining:
            lines.append(f"- {p.absolute_url} — {p.title}")
        lines.append("")

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
