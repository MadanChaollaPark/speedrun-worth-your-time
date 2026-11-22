#!/usr/bin/env python3
"""Render the PE application page and related talent-network pages. NEVER submit the pitch."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json, re, time

OUT = Path("/workspace/speedrun-pe/research")
SHOT = OUT / "screenshots"
SHOT.mkdir(parents=True, exist_ok=True)
BASE = "https://speedrun-talent-network.com/product-engineer/"

def visible_text(page):
    return page.evaluate("""() => {
      const skip = new Set(['SCRIPT','STYLE','NOSCRIPT']);
      const walk = (n, acc) => {
        if (!n) return acc;
        if (n.nodeType === 3) {
          const t = n.textContent.replace(/\\s+/g, ' ').trim();
          if (t) acc.push(t);
          return acc;
        }
        if (n.nodeType !== 1 || skip.has(n.tagName)) return acc;
        const st = getComputedStyle(n);
        if (st.display === 'none' || st.visibility === 'hidden') return acc;
        for (const c of n.childNodes) walk(c, acc);
        return acc;
      };
      return walk(document.body, []).join('\\n');
    }""")

def fields(page):
    return page.evaluate("""() => {
      const cs = (el) => {
        const id = el.id;
        const label = (id && document.querySelector(`label[for="${id}"]`))
          ? document.querySelector(`label[for="${id}"]`).innerText.trim()
          : (el.getAttribute('aria-label') || '');
        const desc = (el.getAttribute('aria-describedby') || '').split(/\\s+/).filter(Boolean)
          .map(i => document.getElementById(i)?.innerText?.trim()).filter(Boolean);
        return {
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || el.type || null,
          name: el.getAttribute('name'),
          id: el.id || null,
          placeholder: el.getAttribute('placeholder'),
          required: el.required,
          maxLength: el.maxLength > 0 ? el.maxLength : null,
          accept: el.getAttribute('accept'),
          label, describedBy: desc,
          value: el.value || '',
        };
      };
      const inputs = [...document.querySelectorAll('input, textarea, select')]
        .filter(el => el.getAttribute('aria-hidden') !== 'true' && el.name !== 'fax')
        .map(cs);
      const buttons = [...document.querySelectorAll('button')].map(b => ({
        type: b.type, text: b.innerText.trim(), className: b.className,
        disabled: b.disabled, aria: b.getAttribute('aria-label'),
      })).filter(b => b.text || b.aria);
      const groups = [...document.querySelectorAll('[role="group"], .tsp-group, .tsp-choices, fieldset')].map(g => ({
        label: g.getAttribute('aria-label') || g.querySelector('legend, h2, h3, label, p')?.innerText?.trim() || '',
        options: [...g.querySelectorAll('button, [role="radio"], [role="checkbox"], .sr-toggle, label')].map(o => o.innerText.trim()).filter(Boolean),
      }));
      const heading = document.querySelector('[data-step-heading], h1, h2')?.innerText?.trim();
      const progress = document.querySelector('[aria-label*="progress" i], .tsp-progress')?.innerText?.trim()
        || document.querySelector('[aria-label="Pitch progress"]')?.getAttribute('aria-label');
      const hash = location.hash;
      return {heading, hash, progress, url: location.href, inputs, buttons, groups};
    }""")

def shot(page, name, full=True):
    path = SHOT / f"{name}.png"
    page.screenshot(path=str(path), full_page=full)
    print("shot", path, page.evaluate("() => ({w:innerWidth,h:innerHeight,sh:document.documentElement.scrollHeight})"))
    return str(path)

def dismiss_cookies(page):
    for label in ["Accept", "Accept all", "I agree", "Got it", "OK", "Close"]:
        loc = page.get_by_role("button", name=re.compile(rf"^{label}$", re.I))
        if loc.count() and loc.first.is_visible():
            try:
                loc.first.click(timeout=1500)
                page.wait_for_timeout(300)
            except Exception:
                pass

findings = {"steps": [], "built_pages": [], "notes": []}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--disable-dev-shm-usage"])
    context = browser.new_context(
        viewport={"width": 1440, "height": 1100},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        locale="en-US",
    )
    # Block accidental submits
    def block_submit(route):
        url = route.request.url
        if "/api/talent-systems/submit" in url:
            findings["notes"].append(f"BLOCKED submit to {url}")
            route.abort()
        else:
            route.continue_()
    context.route("**/*", block_submit)
    page = context.new_page()
    page.set_default_timeout(25000)

    # Intro + hash deep links
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1500)
    dismiss_cookies(page)
    shot(page, "00_intro")
    intro = {"step": "intro-load", "text": visible_text(page), "fields": fields(page)}
    findings["steps"].append(intro)
    Path(OUT / "intro_text.txt").write_text(intro["text"])

    # Click Get started to ensure hydration, then walk via hash (no submit)
    try:
        page.locator("button.tsp-cta, button:has-text('Get started')").first.click(timeout=5000)
        page.wait_for_timeout(800)
        shot(page, "01_after_get_started")
    except Exception as e:
        findings["notes"].append(f"Get started click failed: {e}")

    for n in range(1, 10):
        page.goto(f"{BASE}#step-{n}", wait_until="networkidle")
        page.wait_for_timeout(900)
        rec = {"step": n, "hash": f"#step-{n}", "text": visible_text(page), "fields": fields(page)}
        findings["steps"].append(rec)
        Path(OUT / f"step_{n}_text.txt").write_text(rec["text"])
        Path(OUT / f"step_{n}_fields.json").write_text(json.dumps(rec["fields"], indent=2, ensure_ascii=False))
        shot(page, f"step_{n:02d}")
        print(f"STEP {n} heading={rec['fields'].get('heading')} hash={page.evaluate('()=>location.hash')}")

    # Also open the user-linked URL exactly
    page.goto("https://speedrun-talent-network.com/product-engineer/#step-3", wait_until="networkidle")
    page.wait_for_timeout(1000)
    shot(page, "user_link_step_3")
    findings["user_hash_step3"] = {
        "url": page.url,
        "heading": fields(page).get("heading"),
        "text": visible_text(page),
    }

    # Built + related pages
    pages = [
        ("home", "https://speedrun-talent-network.com/"),
        ("jobs", "https://speedrun-talent-network.com/jobs"),
        ("join", "https://speedrun-talent-network.com/join"),
        ("salary", "https://speedrun-talent-network.com/founding-engineer-salary"),
        ("layoffs", "https://speedrun-talent-network.com/layoffs"),
        ("developers", "https://speedrun-talent-network.com/developers"),
        ("network", "https://speedrun-talent-network.com/network"),
        ("collections", "https://speedrun-talent-network.com/collections"),
        ("jhs", "https://www.jobhuntingsux.com/"),
        ("speedrun", "https://speedrun.a16z.com/"),
        ("portfolio", "https://speedrun.a16z.com/companies"),
    ]
    for name, url in pages:
        try:
            resp = page.goto(url, wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(1800)
            dismiss_cookies(page)
            # try networkidle briefly
            try:
                page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass
            shot(page, f"site_{name}")
            text = visible_text(page)
            Path(OUT / f"site_{name}_text.txt").write_text(text)
            findings["built_pages"].append({
                "name": name,
                "url": url,
                "final_url": page.url,
                "status": resp.status if resp else None,
                "title": page.title(),
                "text": text[:8000],
                "h1": page.locator("h1").first.inner_text() if page.locator("h1").count() else None,
            })
            print("PAGE", name, resp.status if resp else None, page.title())
        except Exception as e:
            findings["built_pages"].append({"name": name, "url": url, "error": str(e)})
            print("PAGE FAIL", name, e)

    browser.close()

# slim json (full texts already in txt)
slim = {
    "notes": findings["notes"],
    "user_hash_step3": {
        "url": findings.get("user_hash_step3", {}).get("url"),
        "heading": findings.get("user_hash_step3", {}).get("heading"),
        "text": findings.get("user_hash_step3", {}).get("text"),
    },
    "steps": [
        {
            "step": s.get("step"),
            "hash": s.get("hash") or s.get("fields", {}).get("hash"),
            "heading": s.get("fields", {}).get("heading"),
            "fields": s.get("fields"),
            "text": s.get("text"),
        }
        for s in findings["steps"]
    ],
    "built_pages": [
        {k: v for k, v in p.items() if k != "text"} | {"text_excerpt": p.get("text", p.get("error", ""))[:2000]}
        for p in findings["built_pages"]
    ],
}
Path(OUT / "playwright_findings.json").write_text(json.dumps(slim, indent=2, ensure_ascii=False))
print("DONE", "notes=", findings["notes"])
