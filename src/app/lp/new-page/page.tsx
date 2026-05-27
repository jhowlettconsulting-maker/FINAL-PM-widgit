"use client";

import { useEffect, useCallback } from "react";
import { HubSpotForm } from "@/components/HubSpotForm";

/**
 * Scroll-reveal: uses CSS animation-timeline: view() when supported (Chrome/Edge),
 * falls back to IntersectionObserver for Safari/Firefox.
 * The CSS defines both the @supports path AND the .is-visible fallback path.
 */
function useScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll<HTMLElement>(
      ".fs02-entrance, .fs02-sticky-motion, .fs02-kpi-grid, .fs02-kpi-card, .fs02-quote-image, .fs02-quote aside, .fs02-quote-line, .fs02-critical-host, .fs02-prevention-host, .fs02-subscribe-copy, .fs02-subscribe-form-card, .fs02-founder-image, .fs02-issue-row"
    );

    if (reduced || typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("no-scroll-timeline");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            const target = entry.target as HTMLElement;
            if (target.classList.contains("fs02-kpi-grid")) {
              target.querySelectorAll<HTMLElement>(".fs02-kpi-card")
                .forEach((card) => card.classList.add("is-visible"));
            }
            if (target.classList.contains("fs02-kpi-card")) {
              target.closest(".fs02-kpi-grid")
                ?.querySelectorAll<HTMLElement>(".fs02-kpi-card")
                .forEach((card) => card.classList.add("is-visible"));
            }
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "80px 0px -8% 0px", threshold: 0.05 }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useIframePinnedMenu(iframeId: string) {
  useEffect(() => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;
    const reset = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        doc?.querySelectorAll<HTMLElement>(".menu").forEach((menu) => {
          menu.style.removeProperty("--menu-stick-y");
        });
      } catch {
        // Same-origin during local preview; if it ever isn't, leave the embedded menu alone.
      }
    };

    iframe.addEventListener("load", reset);
    const t = setTimeout(reset, 400);
    return () => {
      iframe.removeEventListener("load", reset);
      clearTimeout(t);
    };
  }, [iframeId]);
}

/** Auto-resize the field-study iframe to fit its full content (no internal scroll). */
function useIframeAutoHeight(iframeId: string) {
  const sync = useCallback(() => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      // Use the active chapter height if available, otherwise full scrollHeight
      const activeChapter = doc.querySelector(".chapter.is-active") as HTMLElement | null;
      const h = activeChapter ? activeChapter.offsetHeight : doc.documentElement.scrollHeight;
      if (h > 0) {
        iframe.style.height = h + "px";
        const criticalHost = iframe.closest(".fs02-critical-host") as HTMLElement | null;
        if (criticalHost) criticalHost.style.minHeight = h + 9 + "px";
        const preventionHost = iframe.closest(".fs02-prevention-host") as HTMLElement | null;
        if (preventionHost) preventionHost.style.minHeight = h + "px";
      }
    } catch { /* cross-origin — leave as-is */ }
  }, [iframeId]);

  useEffect(() => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;

    let observer: MutationObserver | null = null;

    const setup = () => {
      sync();
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        // Watch for class changes (is-active toggling) and child list changes
        observer = new MutationObserver(() => {
          // Small delay to let the chapter transition settle
          requestAnimationFrame(sync);
        });
        observer.observe(doc.body, {
          attributes: true,
          attributeFilter: ["class"],
          subtree: true,
          childList: true,
        });
      } catch { /* cross-origin */ }
    };

    // sync once the iframe loads
    iframe.addEventListener("load", setup);
    // also try immediately (if already loaded)
    setup();
    // re-sync on window resize
    window.addEventListener("resize", sync);

    // poll briefly in case content renders after load event
    const t1 = setTimeout(sync, 500);
    const t2 = setTimeout(sync, 1500);
    const t3 = setTimeout(sync, 3000);

    return () => {
      iframe.removeEventListener("load", setup);
      window.removeEventListener("resize", sync);
      if (observer) observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [iframeId, sync]);
}

function useElementParallax(elementId: string, speed = 1.5) {
  useEffect(() => {
    const el = document.getElementById(elementId) as HTMLElement | null;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const progress = (vh - rect.top) / (vh + rect.height);
      const centered = Math.max(-0.6, Math.min(0.6, progress - 0.5));
      el.style.setProperty("--parallax-y", `${Math.round(centered * -90 * speed)}px`);
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [elementId, speed]);
}

/*
  Field Series 02 — key measured references from Wix:
  Sections: Hero/overview desktop 1650x2302, tablet 768x2415, mobile 390x2415;
  Result desktop 1650x1085, tablet 768x609, mobile 390x1189;
  Pull quote desktop 1650x989, tablet 768x754, mobile 390x856;
  Diagnostic desktop 1650x1517, tablet 768x728, mobile 390x370;
  Founder desktop 1650x478, tablet 768x294, mobile 390x277;
  Subscribe desktop 1650x800, tablet 768x1115, mobile 390x1375;
  Closing desktop 1650x1142, tablet 768x568, mobile 390x456;
  Footer desktop 1650x629, tablet 768x489, mobile 390x1541.
  Hero h1: desktop 152.369/152.369/-3.047px, tablet 72.562/72.562/0.726px,
  mobile 49.84/49.84/0.498px. Result h2: desktop 93.88/89.19/-4.69px,
  tablet 28.47/27.05, mobile 28/36.4. Closing h2: desktop 158.069/158.069/-3.161px,
  tablet 100.2/90.18, mobile 49.47/49.47.
*/

const links = {
  rsf: "https://stevensonsystems.com/lp/rsf-verification-v2",
  analyzer: "https://stevensonsystems.com/lp/portfolio-analysis-b",
  fieldStudyDownload: "#",
  subscribe: "#lp-form",
  ourView: "https://stevensonsystems.com/our-view",
  leadership: "https://stevensonsystems.com/leadership",
  contact: "https://stevensonsystems.com/contact",
  demo: "https://stevensonsystems.com/truspace/demo",
};

const heroImage =
  "https://static.wixstatic.com/media/3ad865_434e8c04b76546e0a7886e861c20b5d2~mv2.jpg/v1/fill/w_3300,h_2340,al_c,q_90,usm_0.66_1.00_0.01,enc_auto/cubic-building-in-a-cloudy-sky-2026-03-10-02-04-53-utc.jpg";
const quoteImage =
  "https://static.wixstatic.com/media/3ad865_579c752c5e314f98b1e608fef77a7aee~mv2.jpg/v1/fill/w_1643,h_750,fp_0.38_0.08,q_85,enc_auto/3ad865_579c752c5e314f98b1e608fef77a7aee~mv2.jpg";
const founderImage =
  "https://static.wixstatic.com/media/3ad865_f203448eea0445968af149603ec24321~mv2.png/v1/crop/x_0,y_184,w_420,h_349/fill/w_588,h_489,al_c,lg_1,q_85,enc_auto/SS%20Graphic.png";
const videoPoster =
  "https://static.wixstatic.com/media/3ad865_e598fb288e0e43a8952a68347aff0b20f000.jpg/v1/fill/w_330,h_159,al_c,q_80,usm_0.33_1.00_0.00,enc_auto/3ad865_e598fb288e0e43a8952a68347aff0b20f000.jpg";
const videoSrc =
  "https://video.wixstatic.com/video/3ad865_e598fb288e0e43a8952a68347aff0b20/360p/mp4/file.mp4";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="fs02-pill">
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

function Hero() {
  return (
    <section id="section215" className="fs02-hero" aria-labelledby="fs02-title">
      <div id="box2809" className="fs02-hero-card">
        <div className="fs02-hero-bg" aria-hidden="true" />
        <div className="fs02-hero-topbar">
          <a className="fs02-hero-logo" href="https://stevensonsystems.com" aria-label="Stevenson Systems">
            <img src="/images/ssi-logo.png" alt="Stevenson Systems rentable area verification and RSF portfolio analysis logo" />
          </a>
          <nav className="fs02-hero-nav" aria-label="Primary">
            <a href={links.rsf}>RSF Modeling Tool</a>
            <a href={links.analyzer}>Portfolio Analyzer</a>
            <a href="#box2808">Field Study 02</a>
            <a href="#lp-form">Subscribe</a>
          </nav>
          <a className="fs02-hero-cta" href={links.rsf}>Verify Your Portfolio</a>
        </div>

        <div className="fs02-hero-grid">
          <div className="fs02-hero-copy sticky-001">
            <Pill>Stevenson Systems · Field Series · 02</Pill>
            <div className="fs02-hero-headline-row">
              <h1 id="fs02-title">
                <span>4 Days</span>
                <br />
                <span>Until Lockout</span>
              </h1>
              <a className="fs02-hero-study-link" href={links.fieldStudyDownload} aria-disabled="true">
                View Field Study 02
              </a>
              <a className="fs02-hero-arrow" href="#overview" aria-label="Scroll to overview">
                <svg viewBox="0 0 94 138" aria-hidden="true">
                  <path d="M47 4v124M5 88l42 42 42-42" />
                </svg>
              </a>
            </div>
          </div>
          <div className="fs02-hero-meta">
            <p>Seattle CBD</p>
            <p>Class A Single Asset · 135,890 RSF</p>
            <p>3.66% Variance · $4.2M Valuation Impact</p>
          </div>
          <p className="fs02-hero-lede fs02-entrance">
            A class-A office, five-year hold, four days left to scrutinize the MO number.
            <br />
            The RSF variance was below the threshold the whole time. <strong>$4.2M
            valuation increase captured before it closed.</strong>
          </p>
        </div>
      </div>
      <div id="box2808" className="fs02-critical-host">
        <div id="box2835" className="fs02-critical-container">
          <iframe
            id="html17"
            className="fs02-critical-html"
            src="/field-study-02-final.html"
            title="Interactive Field Study 02"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function ResultKpis() {
  const cards = [
    { label: "Asset Valuation Impact", sub: "at 6% blended cap rate", value: "$4.2M" },
    { label: "Variance Found", sub: "Before review threshold on every transaction event", value: "3.66%" },
    { label: "Capturable RSF", sub: "Unrecognized in rent roll", value: "4,973" },
    { label: "New Capturable Revenue", sub: "Annually", value: "$245K" },
    { label: "5-year cumulative", sub: "Annually", value: "$245K" },
  ];

  return (
    <section id="section222" className="fs02-result" aria-labelledby="fs02-result-title">
      <div id="box2866" className="fs02-result-card">
        <div className="fs02-shell">
          <div className="fs02-sticky-motion"><Pill>The Result</Pill></div>
          <h2 id="fs02-result-title" className="fs02-sticky-motion"><span>$4.2M.</span> Captured before the window closed.</h2>
          <p className="fs02-result-lede fs02-sticky-motion">
            One asset. Four days of analysis and fieldwork. 4,973 captured square feet
            that had been sitting under the review threshold the entire five-year hold.
          </p>
          <div className="fs02-kpi-grid">
            {cards.map(({ label, sub, value }) => (
              <article key={label} className="fs02-kpi-card">
                <p>{label}</p>
                <span>{sub}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PullQuote() {
  return (
    <>
      <section id="section227" className="fs02-section-buffer" aria-hidden="true" />
      <section id="section220" className="fs02-quote">
        <img id="imageX756" className="fs02-quote-image" src={quoteImage} alt="Commercial office tower used in Stevenson Systems Field Study 02 RSF verification analysis" />
        <div className="fs02-shell fs02-quote-grid">
          <blockquote className="fs02-entrance" id="signal">
            <div className="fs02-sticky-motion"><Pill>First Signal · Day 4</Pill></div>
            <p className="fs02-sticky-motion fs02-quote-lines">
              <span className="fs02-quote-line">&quot;We have four days left in the inspection window.</span>
              <span className="fs02-quote-line fs02-quote-accent">Who&apos;s verifying the RSF number before close?&quot;</span>
            </p>
            <footer className="fs02-sticky-motion">
              — Buyer&apos;s diligence team
              <br />
              Field Series 02
            </footer>
          </blockquote>
          <aside>
            <Pill>The Result</Pill>
            <h2>Don&apos;t miss the next one.</h2>
            <p>
              We publish twice a month. Subscribers get every Field Study as it ships,
              plus access to past issues. Real portfolios, anonymized. Real numbers, verified.
            </p>
            <HubSpotForm variant="inlineDark" />
          </aside>
        </div>
      </section>
    </>
  );
}

function PreventionWidget() {
  return (
    <section id="diagnostic" className="fs02-prevention-host" aria-label="Prevention self-diagnostic">
      <iframe
        id="html16"
        className="fs02-prevention-html"
        src="/prevention-widget.html?v=4"
        title="Prevention Self-Diagnostic"
        loading="lazy"
      />
    </section>
  );
}

function FounderQuote() {
  return (
    <section className="fs02-founder">
      <img id="imageX757" className="fs02-founder-image" src={founderImage} alt="Stevenson Systems geometric line mark for commercial real estate measurement and RSF verification" />
      <div className="fs02-shell">
        <p className="fs02-sticky-motion">Peter Stevenson, Founder · Stevenson Systems</p>
        <blockquote className="fs02-sticky-motion">
          Drift isn&apos;t a measurement error.
          <br />
          It&apos;s a revenue decision made <strong>every time a lease<br />is signed against an unverified baseline.</strong>
        </blockquote>
      </div>
    </section>
  );
}

function Subscribe() {
  const issues = [
    "Issue 01 － 7 Buildings, 1 Story · Miami $23.3M",
    "Issue 02 － 4 Days Until Lockout · Seattle $4.2M",
    "Issue 03 － Upcoming",
  ];
  const fields = [
    ["First name", "text", "firstname", false],
    ["Last name", "text", "lastname", false],
    ["Email*", "email", "email", true],
    ["Company", "text", "company", false],
    ["Portfolio Size", "text", "portfolio_size", false],
  ] as const;

  return (
    <section id="lp-form" className="fs02-subscribe" aria-labelledby="fs02-subscribe-title">
      <div className="fs02-subscribe-grid">
        <div className="fs02-subscribe-copy">
          <p className="fs02-sticky-motion">Subscribe · Delivered as we publish</p>
          <h2 id="fs02-subscribe-title" className="fs02-sticky-motion">
            The Field Series,
            <br />
            in your inbox.
          </h2>
          <p className="fs02-sticky-motion">
            Every issue. Real portfolios, anonymized. Real numbers, verified.
            <strong> No sales call required.</strong>
          </p>
          <ul>
            {issues.map((issue) => (
              <li key={issue}>
                <hr className="fs02-issue-line" aria-hidden="true" />
                <div className="fs02-issue-row">
                  <svg className="fs02-issue-arrow" viewBox="63.5 19 73 161.9" aria-hidden="true">
                    <path d="M110.8 136.7l2.3 2.2-13.1 14.2-13.3-14.2 2.3-2.2 8.6 9.4V93.6c0-1.2.9-2.2 2.2-2.2 1.2 0 2.2.9 2.2 2.2V146l8.8-9.3zm25.7-81.2v89c0 20.1-16.4 36.4-36.5 36.4s-36.5-16.3-36.5-36.4v-89C63.4 35.3 79.9 19 100 19s36.5 16.3 36.5 36.5zm-4.5 0c0-17.7-14.4-32-32.1-32-17.8 0-32.1 14.4-32.1 32v89c0 17.7 14.4 32 32.1 32 17.8 0 32.1-14.4 32.1-32v-89zm-32 19.7c1.2 0 2.2-.9 2.2-2.2V49.7c0-1.2-.9-2.2-2.2-2.2s-2.2.9-2.2 2.2V73c0 1.3.9 2.2 2.2 2.2z" fill="currentColor" />
                  </svg>
                  <span>{issue}</span>
                </div>
              </li>
            ))}
            <hr className="fs02-issue-line" aria-hidden="true" />
          </ul>
        </div>
        <aside className="fs02-subscribe-form-card">
          <div className="fs02-subscribe-form-inner">
            <span className="fs02-subscribe-eyebrow">Subscribe</span>
            <h3>Get the Field Series － and your matched verification checklist.</h3>
            <form className="fs02-subscribe-form" aria-label="Subscribe to the Field Series">
              {fields.map(([label, type, name, required]) => (
                <label key={name} className={name === "email" ? "fs02-form-wide" : undefined}>
                  <span>{label}</span>
                  <input type={type} name={name} required={required} />
                </label>
              ))}
              <button type="submit">Subscribe to the Field Series</button>
            </form>
            <span className="fs02-unsubscribe">Unsubscribe anytime</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="fs02-closing">
      <div className="fs02-shell">
        <div className="fs02-sticky-motion"><Pill>First Signal · Day 4</Pill></div>
        <h2 className="fs02-sticky-motion">4 days is the window.</h2>
        <h3 className="fs02-sticky-motion">After that, recovery runs in lease cycles.</h3>
        <p className="fs02-sticky-motion">One asset. Four days. $4.2M. Yours is next.</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="fs02-footer">
      <div className="fs02-shell fs02-footer-brand fs02-entrance">
        <a href="https://www.stevensonsystems.com" aria-label="Stevenson Systems">
          <img src="/images/ss-logo-1025-footer.png" alt="Stevenson Systems commercial real estate measurement and revenue capture logo" />
        </a>
        <strong>Measure. Manage. Monetize.</strong>
      </div>
      <div className="fs02-shell fs02-footer-columns">
        <div className="fs02-footer-column fs02-entrance">
          <h2>Contact</h2>
          <a href="https://www.stevensonsystems.com">www.stevensonsystems.com</a>
          <a href="tel:9492974200">Tel: (949) 297-4200</a>
          <span>Laguna Niguel, CA</span>
          <span>27822 El Lazo Road Laguna Niguel, CA 92677</span>
        </div>
        <div className="fs02-footer-column fs02-entrance">
          <h2>Field Series</h2>
          <span>Issue 01 — 7 Buildings, 1 Story</span>
          <span>Issue 02 — 4 Days Until Lockout</span>
          <span>Issue 03 — Forthcoming</span>
          <a href="#lp-form">Subscribe →</a>
        </div>
        <div className="fs02-footer-column fs02-entrance">
          <h2>Services</h2>
          <a href={links.rsf}>Verified Rentable Area Measurement</a>
          <a href={links.rsf}>RSF Verification</a>
          <a href={links.analyzer}>Revenue Capture Diagnostic &amp; Analysis</a>
          <a href={links.demo}>TruSpace Portfolio Optimization</a>
        </div>
        <div className="fs02-footer-column fs02-entrance">
          <h2>Company</h2>
          <a href={links.ourView}>Our View</a>
          <a href={links.leadership}>Leadership</a>
          <a href={links.contact}>Contact</a>
          <a href={links.demo}>TruSpace Demo</a>
        </div>
      </div>
      <div className="fs02-shell fs02-footer-bottom fs02-entrance">
        <span>
          © 2026 Stevenson Systems Inc. · Laguna Niguel, CA
          <br />
          All buildings, tenants, and identifiers anonymized. Portfolio metrics reflect actual analysis output.
        </span>
      </div>
    </footer>
  );
}

export default function FieldSeries02() {
  useScrollReveal();
  useIframeAutoHeight("html17");
  useIframeAutoHeight("html16");
  useIframePinnedMenu("html17");
  useElementParallax("imageX757", 1.5);
  return (
    <main>
      <style>{`
        body:has(.fs02) > header,
        body:has(.fs02) > footer { display: none; }
        body:has(.fs02) > main { padding-top: 0 !important; }

        .fs02 {
          --char: #323233;
          --char-soft: #3b3a3a;
          --cyan: #5bb5d3;
          --cyan-2: #57b7cf;
          --canvas: #fcfcfc;
          --canvas-2: #f4f2ee;
          --muted: #89898a;
          --line: #d8d2c6;
          --max: 1412px;
          background: #f7f7f7;
          color: var(--char);
          overflow-x: clip;
          font-family: "Maison Neue", "Helvetica Neue", Arial, sans-serif;
        }

        .fs02 * { box-sizing: border-box; }
        .fs02 a { color: inherit; text-decoration: none; }
        .fs02-shell { width: min(var(--max), calc(100% - 96px)); margin: 0 auto; }
        .fs02 h1, .fs02 h2, .fs02 h3 { font-family: "New Rail Alphabet", "Helvetica Neue", Arial, sans-serif; margin: 0; letter-spacing: 0; }
        .fs02-pill { display: inline-flex; align-items: center; gap: 9px; width: max-content; height: 40px; border: 1px solid rgba(59,58,58,.15); border-radius: 40px; background: rgba(255,255,255,.87); padding: 0 16px; color: rgb(59, 58, 58); font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: .04em; line-height: 19.5px; text-transform: uppercase; }
        .fs02-pill span { width: 12px; height: 12px; border-radius: 50%; background: #0E85A7; }
        .fs02-hero { position: relative; overflow: visible; min-height: calc(100vh - 50px); padding: 0; background: #f4f4f4; }
        .fs02-hero-card { position: sticky; top: 0; width: 100%; height: calc(100vh - 50px); min-height: 650px; max-height: none; margin: 0 auto; overflow: visible; background: transparent; }
        .fs02-hero-card::before { content: ""; position: absolute; inset: 0; z-index: 1; background: rgba(252,252,252,.46); pointer-events: none; }
        .fs02-hero-card::after { content: ""; position: absolute; inset: 0; z-index: 1; background: rgba(255,255,255,.19); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); pointer-events: none; }
        .fs02-hero-bg { position: absolute; inset: 0; z-index: 0; background: url("${heroImage}") 50% 50% / cover no-repeat; opacity: .28; mix-blend-mode: normal; transform: scale(1.025); animation: fs02-hero-bg-drift both linear; animation-timeline: view(); animation-range: entry 0% exit 100%; will-change: transform; }
        .fs02-hero-topbar { position: absolute; z-index: 5; left: 7%; right: 4.4%; top: 5.2%; display: grid; grid-template-columns: 200px 1fr 208px; align-items: start; gap: 34px; animation: fs02-hero-fade-down .9s cubic-bezier(.18,.84,.2,1) .05s both; }
        .fs02-hero-logo { display: inline-flex; align-items: center; width: 165px; }
        .fs02-hero-logo img { width: 165px; height: auto; display: block; }
        .fs02-hero-nav { display: flex; align-items: center; justify-content: center; gap: 28px; color: rgb(0, 0, 0); font-size: 15px; line-height: 22px; font-weight: 400; white-space: nowrap; padding-top: 19px; }
        .fs02-hero-nav a { display: block; padding: 2px 8px; }
        .fs02-hero-cta { position: relative; z-index: 6; display: inline-flex; align-items: center; justify-content: center; width: 208px; height: 38px; justify-self: end; margin-top: 8px; border-radius: 999px; background: rgb(50, 50, 51); color: #fff !important; font-size: 15px; font-weight: 700; white-space: nowrap; padding: 0 12px; }
        .fs02-hero-grid { position: absolute; z-index: 2; inset: 0; display: block; }
        .fs02-hero-copy { position: absolute; left: 7%; top: 20%; z-index: 2; }
        .fs02-hero h1 { margin-top: clamp(82px, 7.2vw, 132px); margin-left: 6px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: clamp(78px, 7.59vw, 121px); line-height: 1; letter-spacing: -0.02em; font-weight: 700; }
        .fs02-hero h1 span { display: inline-block; transform-origin: 0 50%; animation: fs02-hero-title-in 1.2s cubic-bezier(.65,0,.35,1) both; will-change: transform, opacity, filter; }
        .fs02-hero h1 span:first-child { color: var(--char); animation-delay: .18s; }
        .fs02-hero h1 span:last-child { color: var(--cyan); animation-delay: .38s; }
        .fs02-hero-meta { position: absolute; right: 5%; top: 20%; display: block; width: 440px; text-align: right; color: rgb(50, 50, 51); font-size: 16px; line-height: 1.4; font-weight: 400; animation: fs02-hero-fade-left 1s cubic-bezier(.18,.84,.2,1) .58s both; }
        .fs02-hero-meta p { margin: 0; }
        .fs02-hero-meta p:first-child { margin-bottom: 8px; font-size: 18px; line-height: 1.4; font-weight: 700; color: rgb(50, 50, 51); }
        .fs02-hero-meta p:nth-child(n+2) { line-height: 1.4; }
        .fs02-hero-headline-row { display: flex; align-items: flex-end; gap: 39px; flex-wrap: wrap; }
        .fs02-hero-lede { position: absolute; left: 7.6%; top: calc(20% + 40px + clamp(82px, 7.2vw, 132px) + (clamp(78px, 7.59vw, 121px) * 2) + 35px); bottom: auto; max-width: 805px; margin: 0; color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 21px; line-height: 1.4; font-weight: 400; animation: fs02-hero-copy-in 1.05s cubic-bezier(.18,.84,.2,1) .72s both; }
        .fs02-hero-lede strong { display: block; margin-top: 20px; color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 24px; line-height: 33.6px; font-weight: 700; }
        .fs02-hero-study-link { display: inline-flex; align-items: center; justify-content: center; width: 219px; height: 35px; margin-bottom: 0; align-self: flex-end; border-radius: 968px; background: rgb(50, 50, 50); color: #fff !important; font-size: clamp(14px, 1.12vw, 18px); line-height: 25px; font-weight: 400; white-space: nowrap; transform-origin: 50% 50%; animation: fs02-hero-pill-in 1.2s cubic-bezier(.65,0,.35,1) .72s both; }
        .fs02-hero-arrow { width: clamp(90px, 7.5vw, 119px); height: clamp(90px, 7.5vw, 119px); margin: 0 0 calc(35px - clamp(90px, 7.5vw, 119px)); align-self: flex-end; color: #323233; flex-shrink: 0; transform-origin: 50% 50%; animation: fs02-hero-arrow-in 1.2s cubic-bezier(.65,0,.35,1) .82s both; }
        .fs02-hero-arrow svg { display: block; width: 100%; height: 100%; overflow: visible; }
        .fs02-hero-arrow path { fill: none; stroke: currentColor; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
        .fs02-critical-host { position: relative; z-index: 4; width: 100%; margin: clamp(48px, 6vw, 96px) auto 0; padding: clamp(16px, 2.8vw, 42px) 0; background: transparent; overflow: visible; transform-origin: bottom center; }
        .fs02-critical-host::before { content: ""; position: absolute; left: 0; right: 0; top: 0; bottom: 0; z-index: 0; background: #f4f4f4; transform-origin: bottom center; }
        .fs02-critical-host::after { content: ""; position: absolute; left: 0; right: 0; top: -400px; height: 480px; z-index: 0; pointer-events: none; background: linear-gradient(to bottom, rgba(244,244,244,0) 0%, rgba(244,244,244,.15) 25%, rgba(244,244,244,.5) 50%, rgba(244,244,244,.85) 72%, #f4f4f4 100%); transform-origin: bottom center; }
        .fs02-critical-container { position: relative; z-index: 1; width: min(calc(100% - 176px), 1600px); margin: 0 auto; display: grid; }
        .fs02-critical-html { width: 100%; display: block; border: 0; background: #f4f4f4; min-height: 800px; transform: none !important; overflow: hidden; }
        @supports (animation-timeline: view()) {
          .fs02-critical-host::before {
            animation: fs02-critical-expand 1s both;
            animation-timeline: view();
            animation-range: entry 0% cover 28%;
          }
          .fs02-critical-host::after { animation: fs02-critical-gradient-in 1s both; animation-timeline: view(); animation-range: entry 0% cover 28%; }
          .fs02-critical-container { animation: fs02-critical-content-in .95s cubic-bezier(.18,.84,.2,1) both; animation-timeline: view(); animation-range: entry 52% cover 88%; }
        }
        @keyframes fs02-critical-expand {
          from { transform: scaleY(.5); opacity: 1; }
          to   { transform: scaleY(1); opacity: 1; }
        }
        @keyframes fs02-critical-gradient-in {
          from { opacity: 0; transform: translateY(46px) scaleY(.4); }
          42%  { opacity: .78; }
          to   { opacity: 1; transform: translateY(0) scaleY(1); }
        }
        @keyframes fs02-critical-content-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fs02-hero-rise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fs02-hero-title-in {
          from { opacity: 0; transform: scale(1.2); filter: blur(5px); }
          34% { opacity: 1; }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes fs02-hero-copy-in {
          from { opacity: 0; transform: translateY(34px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fs02-hero-fade-left {
          from { opacity: 0; transform: translateX(34px); filter: blur(4px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes fs02-hero-fade-down {
          from { opacity: 0; transform: translateY(-18px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fs02-hero-pill-in {
          from { opacity: 0; transform: translateY(-20%) scale(.8); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fs02-hero-arrow-in {
          from { opacity: 0; transform: translateY(-20%) scale(.8); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fs02-hero-bg-drift {
          from { transform: scale(1.035) translateY(-18px); }
          to { transform: scale(1.015) translateY(22px); }
        }
        /* ── Scroll-driven animations (Chrome / Edge) ── */
        .fs02-entrance { animation: fs02-entrance-up .95s cubic-bezier(.18,.84,.2,1) both; animation-timeline: view(); animation-range: entry 0% cover 28%; will-change: transform, opacity; }
        .fs02-sticky-motion { animation: fs02-sticky-settle both; animation-timeline: view(); animation-range: entry 0% cover 34%; will-change: transform, opacity; }
        .fs02-prevention-host,
        .fs02-subscribe-copy,
        .fs02-subscribe-form-card { animation: fs02-premium-reveal both; animation-timeline: view(); animation-range: entry 0% cover 30%; will-change: transform, opacity; }
        .fs02-subscribe-form-card { animation-range: entry 6% cover 34%; }
        @keyframes fs02-entrance-up {
          from { opacity: 0; transform: translateY(54px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fs02-sticky-settle {
          from { opacity: .35; transform: translateY(42px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fs02-image-slide-self {
          from { transform: translateY(90px); }
          to { transform: translateY(0); }
        }
        @keyframes fs02-premium-reveal {
          from { opacity: 0; transform: translateY(44px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fs02-card-breathe-in {
          from { opacity: 0; transform: translateY(36px) scale(.975); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        /* ── Fallback for Safari / Firefox (IntersectionObserver) ── */
        .no-scroll-timeline .fs02-entrance { animation: none; opacity: 0; transform: translateY(54px); transition: opacity .95s cubic-bezier(.18,.84,.2,1), transform .95s cubic-bezier(.18,.84,.2,1); }
        .no-scroll-timeline .fs02-entrance.is-visible { opacity: 1; transform: translateY(0); }
        .no-scroll-timeline .fs02-sticky-motion { animation: none; opacity: .35; transform: translateY(42px); transition: opacity .9s cubic-bezier(.18,.84,.2,1), transform .9s cubic-bezier(.18,.84,.2,1); }
        .no-scroll-timeline .fs02-sticky-motion.is-visible { opacity: 1; transform: translateY(0); }
        .no-scroll-timeline .fs02-quote-image { animation: none; transform: translateY(140px); transition: transform 1.2s cubic-bezier(.65,0,.35,1); }
        .no-scroll-timeline .fs02-quote-image.is-visible { transform: translateY(0); }
        .no-scroll-timeline .fs02-quote aside,
        .no-scroll-timeline .fs02-quote-line,
        .no-scroll-timeline .fs02-prevention-host,
        .no-scroll-timeline .fs02-subscribe-copy,
        .no-scroll-timeline .fs02-subscribe-form-card { animation: none; opacity: 0; transform: translateY(36px); transition: opacity .95s cubic-bezier(.18,.84,.2,1), transform .95s cubic-bezier(.18,.84,.2,1); }
        .no-scroll-timeline .fs02-quote aside.is-visible,
        .no-scroll-timeline .fs02-quote-line.is-visible,
        .no-scroll-timeline .fs02-prevention-host.is-visible,
        .no-scroll-timeline .fs02-subscribe-copy.is-visible,
        .no-scroll-timeline .fs02-subscribe-form-card.is-visible { opacity: 1; transform: translateY(0); }
        .no-scroll-timeline .fs02-critical-host::before { animation: none; transform: scaleY(.035); opacity: .5; transition: opacity 4.2s cubic-bezier(.65,0,.35,1), transform 4.2s cubic-bezier(.65,0,.35,1); }
        .no-scroll-timeline .fs02-critical-host.is-visible::before { opacity: 1; transform: scaleY(1); }
        .no-scroll-timeline .fs02-critical-host::after { animation: none; opacity: 0; transform: translateY(46px) scaleY(.4); transition: opacity 4.2s cubic-bezier(.65,0,.35,1), transform 4.2s cubic-bezier(.65,0,.35,1); }
        .no-scroll-timeline .fs02-critical-host.is-visible::after { opacity: 1; transform: translateY(0) scaleY(1); }
        .no-scroll-timeline .fs02-critical-container { animation: none; opacity: 0; transition: opacity .95s cubic-bezier(.18,.84,.2,1) 1.2s; }
        .no-scroll-timeline .fs02-critical-host.is-visible .fs02-critical-container { opacity: 1; }
        .fs02-small-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 42px; }
        .fs02-small-kpis div { border-top: 1px solid var(--line); padding-top: 18px; }
        .fs02-small-kpis strong { display: block; color: #959595; font-size: 30px; letter-spacing: .04em; }
        .fs02-small-kpis span { display: block; margin-top: 8px; color: #959595; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }

        .fs02-result { position: relative; z-index: 8; min-height: 986px; background: #fff; color: white; padding: 0; overflow: hidden; }
        .fs02-result-card { position: relative; z-index: 1; isolation: isolate; overflow: hidden; background: #323234; border-radius: 14.86px; width: calc(100% - 32px); margin: 0 auto; padding: 73px 0 46px; min-height: 986px; }
        .fs02-result-card::before { content: ""; position: absolute; inset: 0; z-index: -1; background: #323234; border-radius: inherit; }
        .fs02-result .fs02-shell { position: relative; z-index: 1; width: min(calc(100% - 124px), 1462px); }
        .fs02-result .fs02-pill { height: 40px; margin-left: 29px; padding: 0 22px 0 36px; background: rgba(65, 65, 67, 0.87); color: white; border-color: rgba(255,255,255,.16); font-size: 13px; line-height: 20px; letter-spacing: .02em; }
        .fs02-result .fs02-pill span { width: 12px; height: 12px; margin-left: -20px; background: #0E85A7; }
        .fs02-result h2 { max-width: 806px; margin-top: 70px; margin-left: 29px; color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 72px; line-height: .95; letter-spacing: -0.05em; font-weight: 700; }
        .fs02-result h2 span { color: rgb(87, 183, 207); }
        .fs02-result-lede { max-width: 761px; margin: 42px 0 0 29px; color: rgb(206, 206, 209); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 22px; line-height: 1.3; letter-spacing: 0; }
        .fs02-kpi-grid { display: grid; grid-template-columns: minmax(0, 575fr) minmax(0, 382fr) minmax(0, 382fr); grid-template-rows: 217px 196px; column-gap: 17px; row-gap: 20px; width: min(100% - 29px, 1373px); margin-top: 59px; margin-left: 29px; align-items: start; }
        .fs02-kpi-card { --kpi-from-x: 0px; --kpi-from-y: 80px; --kpi-scale: .8; min-height: 217px; height: 217px; background: #3c3c3e; border: 0; border-radius: 16px; padding: 18px 32px; display: flex; flex-direction: column; justify-content: flex-start; opacity: 0; transform: translate(var(--kpi-from-x), var(--kpi-from-y)) scale(var(--kpi-scale)); transition: opacity 1.2s cubic-bezier(.65,0,.35,1), transform 1.2s cubic-bezier(.65,0,.35,1); will-change: transform, opacity; }
        .fs02-kpi-card.is-visible,
        .fs02-kpi-grid.is-visible .fs02-kpi-card,
        .fs02-kpi-grid:has(.fs02-kpi-card.is-visible) .fs02-kpi-card { opacity: 1; transform: translate(0, 0) scale(1); }
        .fs02-kpi-card:first-child { background: #57b7ce; color: var(--char); padding: 19px 37px; }
        .fs02-kpi-card:nth-child(4),
        .fs02-kpi-card:nth-child(5) { grid-column: 1 / -1; grid-row: 2; width: calc((100% - 17px) / 2); height: 196px; min-height: 196px; margin-top: 0; }
        .fs02-kpi-card:nth-child(4) { justify-self: start; }
        .fs02-kpi-card:nth-child(5) { justify-self: end; }
        .fs02-kpi-card p { margin: 0; color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 24px; line-height: 1.4; font-weight: 400; }
        .fs02-kpi-card:first-child p { color: #3b3a3a; }
        .fs02-kpi-card span { display: block; margin-top: 7px; margin-bottom: 0; color: #c6c6c6; opacity: 1; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 17px; line-height: 1.4; }
        .fs02-kpi-card:first-child span { color: #636363; font-size: 17px; line-height: 1.4; font-weight: 400; }
        .fs02-kpi-card strong { display: block; margin-top: 16px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #fff; font-size: 70px; line-height: 1.1; font-weight: 700; letter-spacing: -0.02em; }
        .fs02-kpi-card:first-child strong { margin-top: 16px; color: #323335; font-size: 93px; line-height: 1.1; letter-spacing: -0.01em; }
        .fs02-kpi-card:nth-child(2) strong { color: #57b7d0; font-size: 73px; line-height: 1.1; letter-spacing: -0.02em; }
        .fs02-kpi-card:nth-child(n+4) strong { font-size: 70px; line-height: 1.1; letter-spacing: -0.02em; }
        .fs02-kpi-card:nth-child(1) { --kpi-from-x: -400px; --kpi-from-y: 0px; transition-delay: 0s; }
        .fs02-kpi-card:nth-child(2) { --kpi-from-x: 254px; --kpi-from-y: -159px; transition-delay: .06s; }
        .fs02-kpi-card:nth-child(3) { --kpi-from-x: 400px; --kpi-from-y: 0px; transition-delay: .12s; }
        .fs02-kpi-card:nth-child(4) { --kpi-from-x: 0px; --kpi-from-y: 400px; transition-delay: .18s; }
        .fs02-kpi-card:nth-child(5) { --kpi-from-x: 0px; --kpi-from-y: 400px; transition-delay: .18s; }

        @media (min-width: 1500px) {
          .fs02-kpi-grid { grid-template-columns: 575px 382px 382px; width: 1373px; }
          .fs02-kpi-card:nth-child(4),
          .fs02-kpi-card:nth-child(5) { width: 678px; }
        }

        .fs02-section-buffer { height: 43px; background: #fff; }
        .fs02-quote { position: relative; height: 841px; background: #fff; padding: 0; overflow: hidden; }
        .fs02-quote-image { position: absolute; left: 0; right: 0; top: 115px; display: block; width: 100%; height: 722px; object-fit: fill; object-position: 50% 50%; animation: fs02-image-slide-self 1.2s cubic-bezier(.65,0,.35,1) both; animation-timeline: view(); animation-range: entry 0% cover 50%; will-change: transform; }
        .fs02-quote-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 732px 578px; justify-content: space-between; gap: 26px; height: 100%; align-items: start; width: min(calc(100% - 194px), 1391px); padding-top: 95px; transform: translateX(-34px); }
        .fs02-quote blockquote { margin: 0; max-width: 935px; background: transparent; padding: 0; border: 0; }
        .fs02-quote aside { width: 578px; height: 475px; margin: 74px 0 0; border: 0; border-radius: 15px; background: rgba(50,50,50,.75); color: #fff; padding: 40px 45px 50px 52px; backdrop-filter: blur(11px); -webkit-backdrop-filter: blur(11px); animation: fs02-card-breathe-in both; animation-timeline: view(); animation-range: entry 8% cover 40%; will-change: transform, opacity, filter; }
        .fs02-quote blockquote p { width: 700px; max-width: 100%; margin: 34px 0 45px; color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 46px; line-height: 1.2; letter-spacing: 0; font-weight: 700; }
        .fs02-quote-line { display: block; animation: fs02-sticky-settle both; animation-timeline: view(); animation-range: entry 0% cover 28%; will-change: transform, opacity; }
        .fs02-quote-line:nth-child(2) { animation-range: entry 5% cover 34%; }
        .fs02-quote-accent { color: #6dbdd2; line-height: 1.2; }
        .fs02-quote footer { color: rgb(59, 58, 58); font-size: 16px; line-height: 22.4px; }
        .fs02-quote aside .fs02-pill { width: max-content; min-width: max-content; height: 40px; justify-content: flex-start; gap: 9px; padding: 0 18px; background: rgba(65, 65, 67, .87); color: #fcfcfc; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; }
        .fs02-quote aside .fs02-pill span { background: #10A0D6; }
        .fs02-quote aside h2 { width: 462px; max-width: 100%; margin-top: 18px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 36px; line-height: 50.4px; color: #fff; font-weight: 400; }
        .fs02-quote aside p { max-width: 437px; margin: 25.5px 0 0; color: #ccc; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 25.2px; }
        .fs02-inline-form { display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; row-gap: 24px; width: 481px; max-width: 100%; margin-top: 43.5px; }
        .fs02-inline-form label { display: grid; gap: 8px; margin: 0; color: #fff; font-size: 13px; line-height: 1; }
        .fs02-inline-form input { width: 100%; height: 40px; border: 0; border-radius: 10px; background: rgba(255,255,255,.1); color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 8px 2px 8px 0; outline: none; }
        .fs02-inline-form button { grid-column: 1 / -1; height: 41px; border: 0; border-radius: 999px; background: #57b7cf; color: #323233; font-size: 16px; line-height: 20.8px; font-weight: 700; cursor: pointer; }
        .fs02-prevention-host { background: #f4f4f4; padding: 0; min-height: 1200px; }
        .fs02-prevention-html { display: block; width: 100%; height: 1200px; border: 0; background: #f4f4f4; }

        .fs02-founder { position: relative; height: 659px; background: #f4f4f4; padding: 169px 0 0; text-align: center; overflow: hidden; }
        .fs02-founder-image { position: absolute; right: 0; bottom: 0; width: 536px; height: 446px; object-fit: contain; object-position: right bottom; pointer-events: none; transform: translateY(var(--parallax-y, 0px)); will-change: transform; }
        .fs02-founder p { margin: 0; color: rgb(68, 171, 195); font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 16px; font-weight: 600; letter-spacing: .02em; text-transform: uppercase; line-height: 1.4; }
        .fs02-founder blockquote { max-width: 1060px; margin: 25px auto 0; color: var(--char-soft); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 46px; line-height: 1.4; letter-spacing: 0; font-weight: 400; }
        .fs02-founder blockquote strong { font-weight: 700; }

        .fs02-subscribe { height: 800px; background: rgb(50, 50, 50); color: var(--char); padding: 0; overflow: hidden; }
        .fs02-subscribe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; width: min(calc(100% - 126px), 1458px); margin: 0 auto; padding: 63px 0; }
        .fs02-subscribe-copy { background: #f4f4f4; border-radius: 14.5px 0 0 14.5px; padding: 72px 60px 64px 80px; height: 673px; }
        .fs02-subscribe-copy > p:first-child { margin: 0; color: #89898a; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 22.4px; font-weight: 700; letter-spacing: 0; text-transform: none; }
        .fs02-subscribe h2 { width: 518px; max-width: 100%; margin: 20px 0 0; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 63px; line-height: .9; font-weight: 700; letter-spacing: 0; }
        .fs02-subscribe-copy > p:not(:first-child) { max-width: 427px; margin: 24px 0 0; color: #7A7A7A; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.4; letter-spacing: 0; }
        .fs02-subscribe-copy > p:not(:first-child) strong { font-weight: 700; }
        .fs02-subscribe ul { margin: 36px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 25.2px; }
        .fs02-subscribe li { display: block; }
        .fs02-issue-line { border: 0; border-top: 1px solid rgba(157, 157, 157, 0.4); margin: 0; width: 100%; }
        .fs02-issue-row { display: grid; grid-template-columns: 53px 1fr; gap: 22px; align-items: center; min-height: 62px; animation: fs02-premium-reveal both; animation-timeline: view(); animation-range: entry 0% cover 22%; will-change: transform, opacity; }
        .fs02-issue-arrow { display: block; width: 53px; height: 62px; flex-shrink: 0; color: #0FA0D6; transform: rotate(-90deg); }
        .fs02-subscribe-eyebrow { display: block; margin-bottom: 20px; color: #0fa0d6; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13.572px; line-height: 20.358px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        .fs02-subscribe-form-card { background: #f4f4f4; border-radius: 0 14.5px 14.5px 0; padding: 24px 26px 24px 20px; height: 673px; display: flex; flex-direction: column; justify-content: center; }
        .fs02-subscribe-form-inner { background: #fff; border-radius: 15px; padding: 40px 50px 36px; }
        .fs02-subscribe-form-card h3 { width: 562px; max-width: 100%; margin: 0 0 25px; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 28px; line-height: 1.2; font-weight: 700; letter-spacing: 0; }
        .fs02-subscribe-form { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 24px; row-gap: 24px; width: 100%; }
        .fs02-subscribe-form label { display: grid; gap: 8px; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 20px; }
        .fs02-subscribe-form .fs02-form-wide { grid-column: 1 / -1; }
        .fs02-subscribe-form input { height: 40px; width: 100%; border: 0; border-radius: 8px; background: rgba(243,243,243,.71); color: #3b3a3a; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 8px 12px; outline: none; }
        .fs02-subscribe-form button { grid-column: 1 / -1; width: 100%; height: 41px; margin-top: 0; border: 0; border-radius: 100px; background: rgb(87, 183, 207); color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 20.8px; font-weight: 700; letter-spacing: .01em; cursor: pointer; }
        .fs02-subscribe .fs02-unsubscribe { display: block; margin: 20px 0 0 4px; color: #959595; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13px; line-height: 19.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }

        .fs02-closing { height: 957px; background: #f4f4f4; padding: 110px 0 130px; }
        .fs02-closing .fs02-pill { animation-range: entry 0% cover 18%; }
        .fs02-closing h2.fs02-sticky-motion { animation-range: entry 5% cover 26%; }
        .fs02-closing h3.fs02-sticky-motion { animation-range: entry 12% cover 34%; }
        .fs02-closing p.fs02-sticky-motion { animation-range: entry 20% cover 42%; }
        .fs02-closing h2 { margin-top: 43px; max-width: 1100px; color: var(--char-soft); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: clamp(49px, 9.97vw, 158.07px); line-height: .9; font-weight: 700; letter-spacing: -0.02em; }
        .fs02-closing h3 { margin-top: 36px; max-width: 1100px; color: rgb(137, 137, 138); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: clamp(38px, 6.31vw, 100.95px); line-height: 1; font-weight: 700; letter-spacing: -0.05em; }
        .fs02-closing p { margin: 93px 0 0; color: #0fa0d6; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 22px; line-height: .95; letter-spacing: .02em; font-weight: 700; text-transform: uppercase; }

        .fs02-footer { background: #f4f4f4; color: var(--char-soft); padding: 72px 0 30px; --footer-width: min(100% - 128px, 1720px); }
        .fs02-footer-brand,
        .fs02-footer-columns,
        .fs02-footer-bottom { width: var(--footer-width); }
        .fs02-footer-brand { display: grid; grid-template-columns: 320px 1fr; align-items: center; gap: 48px; margin: 0 auto 64px; }
        .fs02-footer-brand a { display: inline-flex; width: 225px; margin: 0; transform: translateX(-30px); }
        .fs02-footer-brand img { display: block; width: 225px; height: auto; }
        .fs02-footer-brand strong { justify-self: end; text-align: right; color: #31435c; font-family: "New Rail Alphabet", "Helvetica Neue", Arial, sans-serif; font-size: clamp(26px, 3.1vw, 48px); line-height: 1; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
        .fs02-footer-columns { display: grid; grid-template-columns: 280px 270px 360px 280px; justify-content: space-between; gap: 32px; margin-left: auto; margin-right: auto; }
        .fs02-footer-column:nth-child(2) { transition-delay: .08s; }
        .fs02-footer-column:nth-child(3) { transition-delay: .16s; }
        .fs02-footer-column:nth-child(4) { transition-delay: .24s; }
        .fs02-footer h2 { margin-bottom: 22px; font-size: 18px; }
        .fs02-footer a, .fs02-footer span { display: block; margin-top: 9px; color: var(--char-soft); font-size: 15px; line-height: 1.7; }
        .fs02-footer-bottom { display: flex; justify-content: flex-end; gap: 48px; border-top: 1px solid var(--line); margin-top: 60px; padding-top: 36px; }
        .fs02-footer-bottom span { max-width: 680px; text-align: right; font-size: 14px; }

        @media (max-width: 1400px) {
          .fs02-quote-grid { width: min(calc(100% - 96px), 1391px); grid-template-columns: minmax(0, 1fr) 578px; transform: none; }
          .fs02-quote blockquote p { width: 100%; }
        }

        @media (max-width: 1000px) {
          .fs02-shell { width: min(100% - 80px, 768px); }
          .fs02-hero { min-height: 0; padding: 24px 0 70px; }
          .fs02-hero-card { height: auto; min-height: auto; }
          .fs02-hero-topbar { position: relative; left: auto; right: auto; top: auto; display: grid; grid-template-columns: 1fr auto; padding: 32px 40px 0; }
          .fs02-hero-nav { grid-column: 1 / -1; justify-content: flex-start; padding-top: 12px; }
          .fs02-hero-cta { margin-top: 4px; }
          .fs02-hero-grid { position: relative; inset: auto; display: grid; grid-template-columns: 1fr; gap: 28px; padding: 70px 40px 88px; }
          .fs02-hero-copy { position: relative; left: auto; top: auto; }
          .fs02-hero-headline-row { gap: 18px; }
          .fs02-hero h1 { margin-top: 48px; margin-left: 0; font-size: 72.562px; line-height: 72.562px; letter-spacing: 0; }
          .fs02-hero-meta { position: relative; right: auto; top: auto; justify-self: start; text-align: left; max-width: 640px; width: auto; }
          .fs02-hero-lede { position: relative; left: auto; bottom: auto; max-width: 680px; margin-left: 0; font-size: 22px; line-height: 1.4; }
          .fs02-hero-arrow { width: 80px; height: 80px; opacity: .7; }
          .fs02-critical-host { width: 100%; padding: 12px 0; }
          .fs02-critical-container { width: min(100% - 48px, 920px); }
          .fs02-result { min-height: auto; }
          .fs02-result-card { min-height: auto; padding: 70px 0; width: calc(100% - 24px); }
          .fs02-result .fs02-shell { width: min(100% - 80px, 768px); }
          .fs02-result h2 { font-size: 28.47px; line-height: 27.05px; letter-spacing: 0; }
          .fs02-result-lede { font-size: 18px; line-height: 1.35; }
          .fs02-kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); width: 100%; margin-left: 0; margin-top: 44px; }
          .fs02-kpi-card,
          .fs02-kpi-card:first-child,
          .fs02-kpi-card:nth-child(4),
          .fs02-kpi-card:nth-child(5) { flex-basis: auto; width: auto; }
          .fs02-kpi-card:first-child { grid-column: span 2; }
          .fs02-section-buffer { height: 43px; }
          .fs02-quote { height: 760px; }
          .fs02-quote-grid { grid-template-columns: 1fr; gap: 28px; padding-top: 64px; transform: none; }
          .fs02-quote aside { margin-top: 36px; max-width: 575px; }
          .fs02-prevention-host { min-height: 1560px; }
          .fs02-prevention-html { height: 1560px; }
          .fs02-subscribe { height: auto; min-height: auto; padding: 48px 0; }
          .fs02-subscribe-grid { grid-template-columns: 1fr; gap: 0; width: min(100% - 80px, 768px); padding: 0; }
          .fs02-subscribe-copy { border-radius: 14.5px 14.5px 0 0; padding: 48px 40px 40px; height: auto; }
          .fs02-subscribe-form-card { width: 100%; height: auto; border-radius: 0 0 14.5px 14.5px; padding: 20px; }
          .fs02-subscribe-form-inner { padding: 32px 28px 28px; }
          .fs02-closing { padding: 100px 0 90px; }
          .fs02-closing h2 { font-size: 100.2px; line-height: 90.18px; }
          .fs02-closing h3 { font-size: 60px; line-height: 1; }
          .fs02-founder { padding: 80px 0; }
          .fs02-founder blockquote { font-size: clamp(28px, 3.9vw, 46px); }
          .fs02-footer { --footer-width: min(100% - 80px, 768px); }
          .fs02-footer-brand { grid-template-columns: 240px 1fr; align-items: center; gap: 32px; }
          .fs02-footer-brand a { transform: translateX(-24px); }
          .fs02-footer-brand strong { font-size: clamp(26px, 4vw, 36px); }
          .fs02-footer-columns { grid-template-columns: 1fr 1fr; gap: 42px 64px; }
          .fs02-footer a, .fs02-footer span { font-size: 13.5px; }
        }

        @media (max-width: 750px) {
          .fs02-shell { width: min(100% - 48px, 390px); }
          .fs02-pill { padding: 7px 13px; font-size: 10px; }
          .fs02-hero { padding: 0 0 54px; }
          .fs02-hero-card { width: 100%; }
          .fs02-hero-topbar { padding: 26px 24px 0; grid-template-columns: 1fr; gap: 18px; }
          .fs02-hero-logo, .fs02-hero-logo img { width: 160px; }
          .fs02-hero-nav { display: none; }
          .fs02-hero-cta { width: max-content; min-width: 188px; margin-top: 0; }
          .fs02-hero-grid { padding: 58px 24px 72px; gap: 24px; }
          .fs02-hero h1 { margin-top: 34px; font-size: 49.84px; line-height: 49.84px; letter-spacing: 0; }
          .fs02-hero-meta { font-size: 14px; line-height: 1.4; }
          .fs02-hero-meta p:first-child { font-size: 16px; }
          .fs02-hero-lede { font-size: 18px; line-height: 1.45; }
          .fs02-hero-headline-row { flex-direction: column; align-items: flex-start; gap: 16px; }
          .fs02-hero-study-link { font-size: 16px; }
          .fs02-hero-arrow { display: none; }
          .fs02-critical-host { width: 100%; margin-top: 36px; padding: 0; }
          .fs02-critical-container { width: 100%; }
          .fs02-small-kpis { grid-template-columns: 1fr; }
          .fs02-kpi-grid { grid-template-columns: 1fr; }
          .fs02-kpi-card:first-child { grid-column: auto; }
          .fs02-result .fs02-shell { width: min(100% - 48px, 390px); }
          .fs02-result h2 { font-size: 28px; line-height: 36.4px; }
          .fs02-result-lede { margin-top: 28px; }
          .fs02-kpi-card { min-height: 150px; }
          .fs02-kpi-card strong { font-size: 44px; }
          .fs02-quote { height: 780px; padding-bottom: 0; }
          .fs02-section-buffer { height: 43px; }
          .fs02-quote blockquote, .fs02-quote aside { padding: 30px 24px; }
          .fs02-quote blockquote { padding: 0; }
          .fs02-quote blockquote p { font-size: 32px; }
          .fs02-prevention-host { min-height: 1720px; }
          .fs02-prevention-html { height: 1720px; }
          .fs02-founder { padding: 70px 0; }
          .fs02-founder blockquote { font-size: 28px; line-height: 1.35; }
          .fs02-subscribe { padding: 32px 0; }
          .fs02-subscribe h2 { font-size: 31.03px; line-height: 34.13px; }
          .fs02-subscribe-grid { width: min(100% - 32px, 390px); }
          .fs02-subscribe-copy { padding: 36px 24px 28px; }
          .fs02-subscribe-form-card { padding: 16px; }
          .fs02-subscribe-form-inner { padding: 24px 20px 20px; }
          .fs02-subscribe-form { grid-template-columns: 1fr; width: 100%; }
          .fs02-subscribe-form button { width: 100%; }
          .fs02-closing { padding: 72px 0; }
          .fs02-closing h2 { font-size: 49.47px; line-height: 49.47px; }
          .fs02-closing h3 { font-size: 38px; }
          .fs02-footer { --footer-width: min(100% - 48px, 390px); }
          .fs02-footer-brand { display: grid; grid-template-columns: 1fr; justify-items: start; gap: 28px; margin-bottom: 48px; }
          .fs02-footer-brand a,
          .fs02-footer-brand img { width: 168px; }
          .fs02-footer-brand a { transform: translateX(-18px); }
          .fs02-footer-brand strong { justify-self: start; text-align: left; white-space: normal; }
          .fs02-footer-columns { grid-template-columns: 1fr; }
          .fs02-footer-bottom { display: grid; }
          .fs02-footer-bottom span { text-align: left; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fs02-hero-bg,
          .fs02-hero-topbar,
          .fs02-hero h1 span,
          .fs02-hero-meta,
          .fs02-hero-lede,
          .fs02-hero h1,
          .fs02-hero-study-link,
          .fs02-hero-arrow { animation: none; transform: none; }
          .fs02-entrance,
          .fs02-sticky-motion,
          .fs02-kpi-card,
        .fs02-quote-image,
        .fs02-quote-line,
        .fs02-quote aside,
          .fs02-prevention-host,
          .fs02-subscribe-copy,
          .fs02-subscribe-form-card,
          .fs02-issue-row { animation: none; opacity: 1; transform: none; filter: none; clip-path: none; }
          .fs02-critical-host::before,
          .fs02-critical-host::after,
          .fs02-critical-container { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
      <div className="fs02">
        <Hero />
        <ResultKpis />
        <PullQuote />
        <PreventionWidget />
        <ClosingCta />
        <Subscribe />
        <FounderQuote />
        <Footer />
      </div>
    </main>
  );
}
