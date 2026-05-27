"use client";

import { useEffect, useCallback, useState, useRef } from "react";
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
      ".fs02-entrance, .fs02-sticky-motion, .fs02-kpi-grid, .fs02-kpi-card, .fs02-quote-image, .fs02-quote aside, .fs02-quote-line, .fs02-prevention-host, .fs02-subscribe-copy, .fs02-subscribe-form-card, .fs02-founder-image, .fs02-issue-row"
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

    // Separate observer for scroll-fade sections — toggles on/off both directions
    const scrollFadeSections = document.querySelectorAll<HTMLElement>(".fs02-closing, .fs02-result, .fs02-quote, .fs02-founder, .fs02-footer");
    if (scrollFadeSections.length) {
      const scrollIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
            } else {
              entry.target.classList.remove("is-visible");
            }
          });
        },
        { threshold: 0.05 }
      );
      scrollFadeSections.forEach((el) => scrollIo.observe(el));
      return () => { io.disconnect(); scrollIo.disconnect(); };
    }

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
    // Field study widget handles its own internal scroll — skip auto-height
    if (iframeId === "html17") return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const h = doc.documentElement.scrollHeight;
      if (h > 0) {
        iframe.style.height = h + "px";
        const preventionHost = iframe.closest(".fs02-prevention-host") as HTMLElement | null;
        if (preventionHost) preventionHost.style.minHeight = h + "px";
      }
    } catch { /* cross-origin — leave as-is */ }
  }, [iframeId]);

  useEffect(() => {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (!iframe) return;

    // sync once the iframe loads
    iframe.addEventListener("load", sync);
    // also try immediately (if already loaded)
    sync();
    // re-sync on window resize
    window.addEventListener("resize", sync);

    // poll briefly in case content renders after load event
    const t1 = setTimeout(sync, 500);
    const t2 = setTimeout(sync, 1500);
    const t3 = setTimeout(sync, 3000);

    return () => {
      iframe.removeEventListener("load", sync);
      window.removeEventListener("resize", sync);
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

function useCharReveal() {
  return useCallback((node: HTMLElement | null) => {
    if (!node) return;
    // Walk text nodes and wrap each character in a span
    const walk = (el: Node) => {
      const nodes = Array.from(el.childNodes);
      nodes.forEach(child => {
        if (child.nodeType === 3) { // text node
          const text = child.textContent || "";
          const frag = document.createDocumentFragment();
          for (let i = 0; i < text.length; i++) {
            const span = document.createElement("span");
            span.className = "fs02-char";
            span.textContent = text[i];
            frag.appendChild(span);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          const el = child as HTMLElement;
          if (el.tagName === "BR") return;
          walk(child);
        }
      });
    };
    walk(node);

    // Observe scroll position and update character opacities
    const chars = node.querySelectorAll<HTMLElement>(".fs02-char");
    const total = chars.length;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // Progress: 0 when bottom of element enters viewport, 1 when element top passes 20% from top
      const travel = vh + rect.height;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (travel * 0.6)));
      chars.forEach((c, i) => {
        const charProgress = progress * total;
        const charOpacity = Math.max(0.15, Math.min(1, (charProgress - i) * 0.35 + 0.15));
        c.style.opacity = String(charOpacity);
      });
    };
    const onScroll = () => requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
  }, []);
}

function usePerspectiveTilt() {
  return useCallback((node: HTMLElement | null) => {
    if (!node) return;
    node.style.transformStyle = "preserve-3d";
    node.style.transition = "transform 0.3s ease-out";
    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.01)`;
    };
    const onLeave = () => {
      node.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
    };
    node.addEventListener("mousemove", onMove);
    node.addEventListener("mouseleave", onLeave);
  }, []);
}

function useTickerCountdown(from: number, to: number, delay = 500) {
  const [value, setValue] = useState<number | null>(null);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const duration = 6000;
    const t0 = performance.now() + delay;
    const step = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < 0) { requestAnimationFrame(step); return; }
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out — fast start, gentle deceleration
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const current = Math.round(from - (from - to) * eased);
      setValue(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [from, to, delay]);
  return value;
}

function useCountUpMoney(target: number, duration = 2200, delay = 800) {
  const [value, setValue] = useState<string>("$0");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now() + delay;
    const step = (now: number) => {
      const elapsed = now - t0;
      if (elapsed < 0) { requestAnimationFrame(step); return; }
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      if (current < 1) setValue(`$${Math.round(current * 1000)}K`);
      else setValue(`$${current.toFixed(1)}M`);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, delay]);
  return value;
}

function useAnalyzerModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onMessage = (e: MessageEvent) => { if (e.data === "close-modal") setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMessage);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("message", onMessage); };
  }, []);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  const modal = open ? (
    <div className="fs02-modal-overlay" onClick={() => setOpen(false)}>
      <div className="fs02-modal-container fs02-modal-wide" onClick={e => e.stopPropagation()}>
        <button className="fs02-modal-close" onClick={() => setOpen(false)} aria-label="Close analyzer">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <iframe
          src="/portfolio-analyzer.html?v=7"
          title="Portfolio Analyzer"
          className="fs02-modal-iframe"
        />
      </div>
    </div>
  ) : null;
  return { open: () => setOpen(true), modal };
}

function useVerifyModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onMessage = (e: MessageEvent) => { if (e.data === "close-modal") setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("message", onMessage);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("message", onMessage); };
  }, []);
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  const modal = open ? (
    <div className="fs02-modal-overlay fs02-modal-overlay-dark" onClick={() => setOpen(false)}>
      <div className="fs02-modal-container fs02-modal-wide fs02-modal-dark" onClick={e => e.stopPropagation()}>
        <button className="fs02-modal-close fs02-modal-close-dark" onClick={() => setOpen(false)} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <iframe
          src="/portfolio-analyzer.html?v=7&mode=verify"
          title="Verify Your Portfolio"
          className="fs02-modal-iframe"
        />
      </div>
    </div>
  ) : null;
  return { open: () => setOpen(true), modal };
}

function useCalculatorModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data === "open-subscribe") {
        setOpen(false);
        setTimeout(() => {
          document.getElementById("lp-form")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    };
    window.addEventListener("message", onMessage);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("message", onMessage); window.removeEventListener("keydown", onKey); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  const modal = open ? (
    <div className="fs02-modal-overlay" onClick={() => setOpen(false)}>
      <div className="fs02-modal-container" onClick={e => e.stopPropagation()}>
        <button className="fs02-modal-close" onClick={() => setOpen(false)} aria-label="Close calculator">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <iframe
          src="/rsf-calculator.html?v=4"
          title="TruSpace Revenue Capacity Calculator"
          className="fs02-modal-iframe"
        />
      </div>
    </div>
  ) : null;
  return { open: () => setOpen(true), modal };
}

function StickySubscribeCta() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const hero = document.querySelector(".fs02-hero-card");
    const subscribe = document.getElementById("lp-form");
    if (!hero || !subscribe) return;
    const check = () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      const subscribeTop = subscribe.getBoundingClientRect().top;
      // Show after hero card scrolls out, hide when subscribe section is in view
      setVisible(heroBottom < 0 && subscribeTop > window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);
  return (
    <div className={`fs02-sticky-cta${visible ? " is-visible" : ""}`}>
      <a href="#lp-form">Subscribe to the Field Series</a>
    </div>
  );
}

function Hero({ onOpenCalc, onOpenAnalyzer, onOpenVerify }: { onOpenCalc: () => void; onOpenAnalyzer: () => void; onOpenVerify: () => void }) {
  const dayCount = useTickerCountdown(120, 4, 500);
  const landed = dayCount !== null && dayCount <= 4;
  return (
    <section id="section215" className="fs02-hero" aria-labelledby="fs02-title">
      <div id="box2809" className="fs02-hero-card">
        <div className="fs02-hero-bg" aria-hidden="true" />
        <div className="fs02-hero-topbar">
          <a className="fs02-hero-logo" href="https://stevensonsystems.com" aria-label="Stevenson Systems">
            <img src="/images/ssi-logo.png" alt="Stevenson Systems rentable area verification and RSF portfolio analysis logo" />
          </a>
          <nav className="fs02-hero-nav" aria-label="Primary">
            <button type="button" onClick={onOpenCalc}>RSF Modeling Tool</button>
            <button type="button" onClick={onOpenAnalyzer}>Portfolio Analyzer</button>
            <a href={links.fieldStudyDownload} aria-disabled="true">Field Study 02</a>
            <a href="#lp-form">Subscribe</a>
          </nav>
          <button type="button" className="fs02-hero-cta" onClick={onOpenVerify}>Verify Your Portfolio</button>
        </div>

        <div className="fs02-hero-grid">
          <div className="fs02-hero-copy sticky-001">
            <Pill>Stevenson Systems · Field Series · 02</Pill>
            <div className="fs02-hero-headline-row">
              <h1 id="fs02-title">
                <span className={landed ? "fs02-landed" : ""}>{dayCount !== null ? dayCount : "4"} Days</span>
                <br />
                <span>Until Lockout</span>
              </h1>
              <a className="fs02-hero-study-link" href="#box2808">
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
            {" "}valuation increase captured before it closed.</strong>
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
            scrolling="no"
          />
        </div>
      </div>
    </section>
  );
}

function parseKpiValue(val: string): { prefix: string; number: number; suffix: string; decimals: number } {
  const match = val.match(/^([^0-9]*)([0-9,.]+)(.*)$/);
  if (!match) return { prefix: "", number: 0, suffix: "", decimals: 0 };
  const raw = match[2];
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return { prefix: match[1], number: parseFloat(raw.replace(/,/g, "")), suffix: match[3], decimals };
}

function formatKpiValue(prefix: string, num: number, suffix: string, decimals: number): string {
  let formatted: string;
  if (decimals > 0) {
    formatted = num.toFixed(decimals);
  } else {
    formatted = Math.round(num).toLocaleString("en-US");
  }
  return prefix + formatted + suffix;
}

function KpiGrid({ cards }: { cards: { label: string; sub: string; value: string }[] }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const update = () => {
      const rect = grid.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when grid enters bottom of viewport, 1 when fully in view
      const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.55)));
      setProgress(p);
    };
    const onScroll = () => requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fs02-kpi-grid" ref={gridRef}>
      {cards.map(({ label, sub, value }) => {
        const { prefix, number, suffix, decimals } = parseKpiValue(value);
        const scrubbed = formatKpiValue(prefix, number * progress, suffix, decimals);
        return (
          <article key={label} className="fs02-kpi-card">
            <p>{label}</p>
            <span>{sub}</span>
            <strong style={{ fontVariantNumeric: "tabular-nums" }}>{progress > 0 ? scrubbed : value}</strong>
          </article>
        );
      })}
    </div>
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
          <h2 id="fs02-result-title" className="fs02-scroll-fade fs02-scroll-fade-2"><span>$4.2M.</span> Captured before the window closed.</h2>
          <p className="fs02-result-lede fs02-scroll-fade fs02-scroll-fade-3">
            One asset. Four days of analysis and fieldwork. 4,973 captured square feet
            that had been sitting under the review threshold the entire five-year hold.
          </p>
          <KpiGrid cards={cards} />
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
        <img id="imageX756" className="fs02-quote-image" src={quoteImage} alt="Commercial office tower used in Stevenson Systems Field Study 02 RSF verification analysis" loading="lazy" />
        <div className="fs02-shell fs02-quote-grid">
          <blockquote className="fs02-entrance" id="signal">
            <div className="fs02-scroll-fade fs02-scroll-fade-1"><Pill>First Signal · Day 4</Pill></div>
            <p className="fs02-scroll-fade fs02-scroll-fade-2 fs02-quote-lines">
              <span className="fs02-quote-line">&quot;We have four days left in the inspection window.</span>
              <span className="fs02-quote-line fs02-quote-accent">Who&apos;s verifying the RSF number before close?&quot;</span>
            </p>
            <footer className="fs02-scroll-fade fs02-scroll-fade-3">
              — Buyer&apos;s diligence team, Seattle CBD acquisition
              <br />
              Field Series 02
            </footer>
          </blockquote>
          <aside>
            <Pill>Stay Current</Pill>
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
  const conditions = [
    { id:"baseline",    title:"Verified rentable baseline older than 24 months",          desc:"The number was correct at acquisition. Every additional month compounds the gap.",                          pill:"Remeasure",   summary:"Baseline has aged out" },
    { id:"single",      title:"Single unverified RSF figure carrying every lease",        desc:"If one number propagates across the rent roll, OM, and underwriting, the variance flows through.",         pill:"Remeasure",   summary:"One number, no verification" },
    { id:"conflicting", title:"Conflicting figures across plan sets, rent rolls, and OMs", desc:"Inconsistency isn't a documentation problem. It's evidence the baseline isn't being maintained.",          pill:"Reconcile",   summary:"Documents don't agree" },
    { id:"expansion",   title:"Tenant expansion executed without re-verification",        desc:"Each expansion creates new variance against the baseline. Across a hold, those variances compound.",       pill:"Verify",      summary:"Expansion skipped baseline check" },
    { id:"demising",    title:"Demising-line modification pulled from architect plans",   desc:"Architect plans aren't the verified measurement file. The lease and the building reflect different things.", pill:"Recalculate", summary:"Plans aren't the measurement" },
    { id:"vacancy",     title:"Suite turnover without re-measurement at vacancy",         desc:"Vacancy is the single moment the number can be tested without disrupting an active lease.",                pill:"Verify",      summary:"Vacancy missed its window" },
    { id:"contract",    title:"Asset under contract, inspection window open",             desc:"Pre-close, the variance is a price negotiation. Three or four days of fieldwork resolves it.",              pill:"Verify Now",  summary:"Window is closing now" },
    { id:"disposition", title:"Disposition planned within 24 months",                     desc:"The number on the rent roll today is effectively the number that closes the deal.",                         pill:"Remeasure",   summary:"Closing on today's number" },
  ];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setChecked(prev => {
    const next = { ...prev };
    if (next[id]) delete next[id]; else next[id] = true;
    return next;
  });
  const flagged = conditions.filter(c => checked[c.id]);

  return (
    <section id="diagnostic" className="fs02-prevention-host" aria-label="Prevention self-diagnostic">
      <div className="ssi-prev">
        <div className="ssi-prev-pill">Prevention · Self-Diagnostic</div>
        <h2 className="ssi-prev-h2">Where verification still has leverage.</h2>
        <p className="ssi-prev-lede">The variance was the same one every operating event missed. The window to find it first is the window before someone else does. Tap any condition that applies — the matched action set compiles below.</p>
        <div className="ssi-prev-grid">
          {conditions.map(c => (
            <div key={c.id} className={`ssi-prev-item${checked[c.id] ? " checked" : ""}`} tabIndex={0} role="button" aria-pressed={!!checked[c.id]} onClick={() => toggle(c.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(c.id); } }}>
              <div className="ssi-prev-box" />
              <div className="ssi-prev-content">
                <div className="ssi-prev-title">{c.title}</div>
                <div className="ssi-prev-desc">{c.desc}</div>
                <span className="ssi-prev-pill-inline" data-action={c.pill}>{c.pill}</span>
              </div>
            </div>
          ))}
        </div>
        <div className={`ssi-prev-output${flagged.length === 0 ? " empty" : ""}`} aria-live="polite">
          <div className="ssi-prev-output-eyebrow">{flagged.length === 0 ? "Matched Actions" : `Matched Actions · ${flagged.length} flagged`}</div>
          <h3 className="ssi-prev-output-title">{flagged.length === 0 ? "Tap any condition above to begin." : `${flagged.length} condition${flagged.length > 1 ? "s" : ""} flagged. Here\u2019s your matched action set.`}</h3>
          {flagged.length === 0 && <p className="ssi-prev-output-text">Each condition you flag adds a row to your matched action set below.</p>}
          <ul className="ssi-prev-output-list" aria-label="Selected conditions">
            {flagged.map(f => (
              <li key={f.id} className="ssi-prev-output-row">
                <p className="ssi-prev-output-row-text">{f.summary}</p>
                <span className="ssi-prev-pill-inline" data-action={f.pill}>{f.pill}</span>
              </li>
            ))}
          </ul>
          {flagged.length >= 2 && (
            <a href="#lp-form" className="ssi-prev-cta">
              You flagged {flagged.length} conditions — get your verification scope →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function FounderQuote() {
  return (
    <section className="fs02-founder">
      <img id="imageX757" className="fs02-founder-image" src={founderImage} alt="Stevenson Systems geometric line mark for commercial real estate measurement and RSF verification" loading="lazy" />
      <div className="fs02-shell">
        <p className="fs02-entrance">Peter Stevenson, Founder · Stevenson Systems</p>
        <blockquote className="fs02-char-reveal" ref={useCharReveal()}>
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
            <span style={{whiteSpace: "nowrap"}}>The Field Series,</span>
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
                  <span><strong className="fs02-issue-num">{issue.split("－")[0].trim()}</strong> － {issue.split("－").slice(1).join("－").trim()}</span>
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
  const charReveal = useCharReveal();
  return (
    <section className="fs02-closing">
      <div id="closing-content" className="fs02-shell">
        <div className="fs02-sticky-motion"><Pill>First Signal · Day 4</Pill></div>
        <div className="fs02-char-reveal fs02-closing-block" ref={charReveal}>
          <span className="fs02-closing-h2">4 days is<br />the window.</span>
          <span className="fs02-closing-h3">After that, recovery<br />runs in lease cycles.</span>
          <span className="fs02-closing-p">One asset. Four days. $4.2M. Yours is next.</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="footer" className="fs02-footer">
      <div className="fs02-shell fs02-footer-brand fs02-entrance">
        <a href="https://www.stevensonsystems.com" aria-label="Stevenson Systems" target="_blank" rel="noopener noreferrer" className="fs02-scroll-fade fs02-scroll-fade-1">
          <img src="/images/ssi-logo.png" alt="Stevenson Systems commercial real estate measurement and revenue capture logo" loading="lazy" />
        </a>
        <strong className="fs02-scroll-fade fs02-scroll-fade-2">Measure. Manage. Monetize.</strong>
      </div>
      <div className="fs02-shell fs02-footer-columns">
        <div className="fs02-footer-column fs02-entrance">
          <h2>Contact</h2>
          <a href="https://www.stevensonsystems.com" target="_blank" rel="noopener noreferrer">www.stevensonsystems.com</a>
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
          <a href={links.rsf} target="_blank" rel="noopener noreferrer">Verified Rentable Area Measurement</a>
          <a href={links.rsf} target="_blank" rel="noopener noreferrer">RSF Verification</a>
          <a href={links.analyzer} target="_blank" rel="noopener noreferrer">Revenue Capture Diagnostic &amp; Analysis</a>
          <a href={links.demo} target="_blank" rel="noopener noreferrer">TruSpace Portfolio Optimization</a>
        </div>
        <div className="fs02-footer-column fs02-entrance">
          <h2>Company</h2>
          <a href={links.ourView} target="_blank" rel="noopener noreferrer">Our View</a>
          <a href={links.leadership} target="_blank" rel="noopener noreferrer">Leadership</a>
          <a href={links.contact} target="_blank" rel="noopener noreferrer">Contact</a>
          <a href={links.demo} target="_blank" rel="noopener noreferrer">TruSpace Demo</a>
        </div>
      </div>
      <div className="fs02-shell fs02-footer-bottom">
        <span>© 2026 Stevenson Systems, Inc. All rights reserved.</span>
        <a href="https://stevensonsystems.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
      </div>
    </footer>
  );
}

function useWidgetReveal() {
  useEffect(() => {
    const container = document.getElementById("box2835");
    const host = document.getElementById("box2808");
    const heroCard = document.querySelector(".fs02-hero-card") as HTMLElement | null;
    if (!container || !host || !heroCard) return;

    // Trigger when scroll passes the hero card's natural bottom (its offsetTop + height)
    const triggerY = heroCard.offsetTop + heroCard.offsetHeight - window.innerHeight * 0.3;
    let fired = false;
    const check = () => {
      if (fired) return;
      if (window.scrollY >= triggerY) {
        fired = true;
        host.classList.add("is-visible");
        container.classList.add("is-visible");
        window.removeEventListener("scroll", onScroll);
      }
    };
    const onScroll = () => requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export default function FieldSeries02() {
  useScrollReveal();
  useIframeAutoHeight("html17");
  // Prevention widget is now inline React, no iframe needed
  useIframePinnedMenu("html17");
  useElementParallax("imageX756", 1.0);
  useElementParallax("imageX757", 1.5);
  useElementParallax("closing-content", 0.6);
  useWidgetReveal();
  const calc = useCalculatorModal();
  const analyzer = useAnalyzerModal();
  const verify = useVerifyModal();
  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelector(".fs02-hero-study-link")?.classList.add("fs02-pill-ready");
    }, 720);
    return () => clearTimeout(t);
  }, []);
  return (
    <main>
      {/* ── JSON-LD Structured Data for SEO & AI Search ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://stevensonsystems.com/#organization",
                name: "Stevenson Systems",
                url: "https://stevensonsystems.com",
                logo: "https://stevensonsystems.com/images/ssi-logo.png",
                description:
                  "Stevenson Systems provides verified rentable area measurement, RSF verification, and revenue capture analysis for commercial real estate portfolios.",
                founder: {
                  "@type": "Person",
                  name: "Peter Stevenson",
                },
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "27822 El Lazo Road",
                  addressLocality: "Laguna Niguel",
                  addressRegion: "CA",
                  postalCode: "92677",
                  addressCountry: "US",
                },
                telephone: "+1-949-297-4200",
                sameAs: ["https://www.stevensonsystems.com"],
              },
              {
                "@type": "ProfessionalService",
                "@id": "https://stevensonsystems.com/#service",
                name: "RSF Verification & Revenue Capture",
                provider: {
                  "@id": "https://stevensonsystems.com/#organization",
                },
                description:
                  "Verified rentable square footage measurement and revenue capture diagnostics for commercial real estate owners, operators, and investors.",
                serviceType: [
                  "Rentable Area Measurement",
                  "RSF Verification",
                  "Revenue Capture Diagnostic",
                  "Portfolio Optimization",
                  "BOMA Measurement",
                ],
                areaServed: {
                  "@type": "Country",
                  name: "United States",
                },
              },
              {
                "@type": "Article",
                "@id": "https://stevensonsystems.com/lp/fs02/#article",
                headline:
                  "Field Study 02: RSF Verification Exposed $4.2M in Hidden Revenue — Seattle Class A Office",
                description:
                  "A single-asset RSF verification on a 135,890 SF Seattle CBD class-A office uncovered a 3.66% rentable area variance worth $4.2M before the disposition window closed.",
                author: {
                  "@type": "Person",
                  name: "Peter Stevenson",
                },
                publisher: {
                  "@id": "https://stevensonsystems.com/#organization",
                },
                datePublished: "2025-01-01",
                dateModified: "2026-05-13",
                mainEntityOfPage:
                  "https://stevensonsystems.com/lp/fs02",
                image:
                  "https://static.wixstatic.com/media/3ad865_579c752c5e314f98b1e608fef77a7aee~mv2.jpg/v1/fill/w_1200,h_630,fp_0.38_0.08,q_85,enc_auto/3ad865_579c752c5e314f98b1e608fef77a7aee~mv2.jpg",
                about: [
                  {
                    "@type": "Thing",
                    name: "Rentable Square Footage Verification",
                  },
                  {
                    "@type": "Thing",
                    name: "Commercial Real Estate Revenue Capture",
                  },
                  {
                    "@type": "Thing",
                    name: "BOMA Building Measurement",
                  },
                ],
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Stevenson Systems",
                    item: "https://stevensonsystems.com",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Field Series",
                    item: "https://stevensonsystems.com/lp",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Field Study 02: Seattle Class A RSF Verification",
                    item: "https://stevensonsystems.com/lp/fs02",
                  },
                ],
              },
            ],
          }),
        }}
      />
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
        .fs02 { overflow: visible !important; }
        .fs02 a { color: inherit; text-decoration: none; }
        .fs02-shell { width: min(var(--max), calc(100% - 96px)); margin: 0 auto; }
        .fs02 h1, .fs02 h2, .fs02 h3 { font-family: "New Rail Alphabet", "Helvetica Neue", Arial, sans-serif; margin: 0; letter-spacing: 0; }
        .fs02-pill { display: inline-flex; align-items: center; gap: 9px; width: max-content; height: 40px; border: 1px solid rgba(59,58,58,.15); border-radius: 40px; background: rgba(255,255,255,.87); padding: 0 16px; color: rgb(59, 58, 58); font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13px; font-weight: 600; letter-spacing: .04em; line-height: 19.5px; text-transform: uppercase; }
        .fs02-pill span { width: 12px; height: 12px; border-radius: 50%; background: #0E85A7; }
        .fs02-hero { position: relative; overflow: visible; min-height: calc(100vh - 35px + 220vh); padding: 0; background: #f4f4f4; }
        .fs02-hero::after { display: none; }
        .fs02-hero-card { position: sticky; top: 0; width: 100%; height: calc(100vh - 35px); min-height: 650px; max-height: none; margin: 0 auto; overflow: visible; background: transparent; }
        .fs02-hero-card::before { content: ""; position: absolute; inset: 0; z-index: 1; background: rgba(252,252,252,.46); pointer-events: none; }
        .fs02-hero-card::after { content: ""; position: absolute; inset: 0; z-index: 1; background: rgba(255,255,255,.19); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); pointer-events: none; }
        .fs02-hero-bg { position: absolute; inset: 0; z-index: 0; background: url("${heroImage}") 50% 30% / cover no-repeat; opacity: 1; mix-blend-mode: normal; pointer-events: none; -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,.75) 30%, rgba(0,0,0,.4) 55%, rgba(0,0,0,.28) 100%); mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,.75) 30%, rgba(0,0,0,.4) 55%, rgba(0,0,0,.28) 100%); }
        .fs02-hero-topbar { position: absolute; z-index: 5; left: 7%; right: 4.4%; top: 5.2%; display: grid; grid-template-columns: 200px 1fr 208px; align-items: center; gap: 34px; animation: fs02-hero-fade-down .9s cubic-bezier(.18,.84,.2,1) .05s both; }
        .fs02-hero-logo { display: inline-flex; align-items: center; width: 165px; }
        .fs02-hero-logo img { width: 165px; height: auto; display: block; }
        .fs02-hero-nav { display: flex; align-items: center; justify-content: center; gap: 28px; color: rgb(0, 0, 0); font-size: 16px; line-height: 22px; font-weight: 400; white-space: nowrap; padding-top: 0; }
        .fs02-hero-nav a { display: block; padding: 2px 8px; transition: color .25s ease; }
        .fs02-hero-nav a:hover { color: var(--cyan); }
        .fs02-hero-cta { position: relative; z-index: 6; display: inline-flex; align-items: center; justify-content: center; width: 208px; height: 38px; justify-self: end; margin-top: 0; border-radius: 999px; background: rgb(50, 50, 51); color: #fff !important; font-size: 15px; font-weight: 700; white-space: nowrap; padding: 0 12px; transition: transform .25s ease, background .25s ease; }
        .fs02-hero-cta:hover { background: var(--cyan); transform: scale(1.04); }
        .fs02-hero-grid { position: absolute; z-index: 2; inset: 0; display: block; }
        .fs02-hero-copy { position: absolute; left: 7%; top: 20%; z-index: 2; }
        .fs02-hero h1 { margin-top: clamp(82px, 7.2vw, 132px); margin-left: 6px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 126px; line-height: 1.1; letter-spacing: -0.02em; font-weight: 700; font-variant-numeric: tabular-nums; }
        .fs02-hero h1 span { display: inline-block; transform-origin: 0 50%; animation: fs02-hero-title-in 1.6s cubic-bezier(.33,0,.2,1) both; will-change: transform, opacity, filter; }
        .fs02-hero h1 > span:first-child { color: var(--char); animation-delay: .18s; }
        .fs02-hero h1 > span:first-child * { color: inherit; }

        .fs02-hero h1 > span:first-child { transition: color 1.4s cubic-bezier(.22,1,.36,1); }
        .fs02-hero h1 > span:first-child.fs02-landed { color: var(--cyan) !important; }
        .fs02-hero h1 > span:first-child.fs02-landed * { color: var(--cyan) !important; }
        .fs02-hero h1 > span:last-child { color: var(--cyan); animation-delay: .5s; }
        .fs02-hero-meta { position: absolute; right: 5%; top: 20%; display: block; width: 440px; text-align: right; color: rgb(50, 50, 51); font-size: 16px; line-height: 1.4; font-weight: 400; animation: fs02-hero-fade-left 1s cubic-bezier(.18,.84,.2,1) .58s both; }
        .fs02-hero-meta p { margin: 0; }
        .fs02-hero-meta p:first-child { margin-bottom: 8px; font-size: 18px; line-height: 1.4; font-weight: 700; color: rgb(50, 50, 51); }
        .fs02-hero-meta p:nth-child(n+2) { line-height: 1.4; }
        .fs02-hero-headline-row { display: flex; align-items: flex-end; gap: 39px; flex-wrap: wrap; }
        .fs02-hero-lede { position: absolute; left: 7.6%; top: calc(20% + 40px + clamp(82px, 7.2vw, 132px) + (124px * 2) + 70px); bottom: auto; max-width: 1100px; margin: 0; color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 30px; line-height: 1.4; font-weight: 400; animation: fs02-hero-copy-in 1.6s cubic-bezier(.33,0,.2,1) .9s both; }
        .fs02-hero-lede strong { display: block; margin-top: 20px; color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 32px; line-height: 1.4; font-weight: 700; }
        .fs02-hero-study-link { display: inline-flex; align-items: center; justify-content: center; height: 35px; padding: 0 28px; margin-bottom: 18px; align-self: flex-end; border-radius: 968px; background: rgb(50, 50, 50); color: #fff !important; font-size: clamp(16px, 1.12vw, 20px); line-height: 25px; font-weight: 400; white-space: nowrap; cursor: pointer; opacity: 0; transform: translateY(-20%) scale(.8); filter: blur(4px); }
        .fs02-hero-study-link.fs02-pill-ready { opacity: 1; transform: scale(1); filter: blur(0); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1), filter .6s cubic-bezier(.22,1,.36,1); }
        .fs02-hero-study-link.fs02-pill-ready:hover { transform: scale(1.04); }
        .fs02-hero-arrow { width: clamp(90px, 7.5vw, 119px); height: clamp(90px, 7.5vw, 119px); align-self: flex-end; margin-bottom: calc(18px + 35px - clamp(90px, 7.5vw, 119px)); color: #323233; flex-shrink: 0; transform-origin: 50% 50%; animation: fs02-hero-arrow-in 1.2s cubic-bezier(.65,0,.35,1) .82s both; }
        .fs02-hero-arrow svg { display: block; width: 100%; height: 100%; overflow: visible; }
        .fs02-hero-arrow path { fill: none; stroke: currentColor; stroke-width: 6; stroke-linecap: round; stroke-linejoin: round; }
        .fs02-critical-host { position: sticky; top: 4%; z-index: 5; width: 100%; padding: 0 0 clamp(16px, 2.8vw, 42px); background: #f4f4f4; }
        .fs02-critical-host::before { content: ""; position: absolute; bottom: 100%; left: 0; right: 0; height: 280px; z-index: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(244,244,244,0) 0%, rgba(244,244,244,.08) 20%, rgba(244,244,244,.25) 40%, rgba(244,244,244,.55) 60%, rgba(244,244,244,.82) 80%, #f4f4f4 100%); transform-origin: bottom; animation: fs02-gradient-reveal 1s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes fs02-gradient-reveal { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
        .fs02-critical-container { position: relative; z-index: 1; width: min(calc(100% - 80px), 1700px); margin: 4vh auto 0; display: grid; opacity: 0; transform: translateY(60px) scale(0.88); transform-origin: center center; filter: blur(6px); clip-path: circle(0% at 50% 50%); transition: clip-path 1.4s cubic-bezier(.16,1,.3,1), opacity 0.6s cubic-bezier(.16,1,.3,1), filter 1s cubic-bezier(.16,1,.3,1), transform 1.6s linear(0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%, 0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50%, 1.015 54.8%, 1.017 60.8%, 1.001 79.6%, 1); }
        .fs02-critical-container.is-visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); clip-path: circle(150% at 50% 50%); }
        .fs02-critical-html { width: 100%; display: block; border: 0; background: #f4f4f4; transform: none !important; overflow: hidden !important; height: calc(100vh - 20px); }
        @keyframes fs02-critical-content-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fs02-hero-rise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fs02-hero-title-in {
          from { opacity: 0; transform: translateY(20px); filter: blur(14px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes fs02-hero-copy-in {
          from { opacity: 0; transform: translateY(20px); filter: blur(12px); }
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
        .fs02-subscribe-form-card { animation: fs02-premium-reveal both; animation-timeline: view(); animation-range: entry 6% cover 34%; will-change: transform, opacity; }
        @keyframes fs02-entrance-up {
          from { opacity: 0; transform: translateY(36px) scale(.985); filter: blur(3px); }
          40% { opacity: .7; filter: blur(0); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fs02-sticky-settle {
          from { opacity: 0; transform: translateY(28px); letter-spacing: .08em; }
          50% { opacity: .85; letter-spacing: .01em; }
          to { opacity: 1; transform: translateY(0); letter-spacing: inherit; }
        }
        @keyframes fs02-image-slide-self {
          from { transform: translateY(90px); }
          to { transform: translateY(0); }
        }
        @keyframes fs02-premium-reveal {
          from { opacity: 0; transform: translateY(30px) scale(.97); filter: blur(4px); }
          60% { filter: blur(0); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes fs02-card-breathe-in {
          from { opacity: 0; transform: translateY(36px) scale(.975); filter: blur(2px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        /* ── Fallback for Safari / Firefox (IntersectionObserver) ── */
        .no-scroll-timeline .fs02-entrance { animation: none; opacity: 0; transform: translateY(36px) scale(.985); filter: blur(3px); transition: opacity .95s cubic-bezier(.18,.84,.2,1), transform .95s cubic-bezier(.18,.84,.2,1), filter .6s cubic-bezier(.18,.84,.2,1); }
        .no-scroll-timeline .fs02-entrance.is-visible { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        .no-scroll-timeline .fs02-sticky-motion { animation: none; opacity: 0; transform: translateY(28px); letter-spacing: .08em; transition: opacity .9s cubic-bezier(.18,.84,.2,1), transform .9s cubic-bezier(.18,.84,.2,1), letter-spacing 1.2s cubic-bezier(.16,1,.3,1); }
        .no-scroll-timeline .fs02-sticky-motion.is-visible { opacity: 1; transform: translateY(0); letter-spacing: inherit; }
        .no-scroll-timeline .fs02-quote-image { animation: none; }
        .no-scroll-timeline .fs02-quote aside,
        .no-scroll-timeline .fs02-quote-line,
        .no-scroll-timeline .fs02-prevention-host,
        .no-scroll-timeline .fs02-subscribe-copy,
        .no-scroll-timeline .fs02-subscribe-form-card { animation: none; opacity: 0; transform: translateY(60px); transition: opacity .95s cubic-bezier(.18,.84,.2,1), transform .95s cubic-bezier(.18,.84,.2,1); }
        .no-scroll-timeline .fs02-subscribe-form-card { transform: translateY(90px); transition-delay: .15s; }
        .no-scroll-timeline .fs02-quote aside.is-visible,
        .no-scroll-timeline .fs02-quote-line.is-visible,
        .no-scroll-timeline .fs02-prevention-host.is-visible,
        .no-scroll-timeline .fs02-subscribe-copy.is-visible,
        .no-scroll-timeline .fs02-subscribe-form-card.is-visible { opacity: 1; transform: translateY(0); transition-delay: 0s; }
        .no-scroll-timeline .fs02-subscribe-form-card.is-visible { transition-delay: .15s; }
        .no-scroll-timeline .fs02-critical-host::before { animation: none; transform: scaleY(.035); opacity: .5; transition: opacity 4.2s cubic-bezier(.65,0,.35,1), transform 4.2s cubic-bezier(.65,0,.35,1); }
        .no-scroll-timeline .fs02-critical-host.is-visible::before { opacity: 1; transform: scaleY(1); }
        .no-scroll-timeline .fs02-critical-host::after { animation: none; opacity: 0; transform: translateY(46px) scaleY(.4); transition: opacity 4.2s cubic-bezier(.65,0,.35,1), transform 4.2s cubic-bezier(.65,0,.35,1); }
        .no-scroll-timeline .fs02-critical-host.is-visible::after { opacity: 1; transform: translateY(0) scaleY(1); }
        .no-scroll-timeline .fs02-critical-container { animation: none; opacity: 0; transform: translateY(60px) scale(0.88); transform-origin: center center; filter: blur(6px); clip-path: circle(0% at 50% 50%); transition: clip-path 1.4s cubic-bezier(.16,1,.3,1), opacity 0.6s cubic-bezier(.16,1,.3,1), filter 1s cubic-bezier(.16,1,.3,1), transform 1.6s linear(0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 18.9%, 0.721 25.3%, 0.849 31.5%, 0.937 38.1%, 0.968 41.8%, 0.991 45.7%, 1.006 50%, 1.015 54.8%, 1.017 60.8%, 1.001 79.6%, 1); }
        .no-scroll-timeline .fs02-critical-host.is-visible .fs02-critical-container { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); clip-path: circle(150% at 50% 50%); }
        .fs02-small-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 42px; }
        .fs02-small-kpis div { border-top: 1px solid var(--line); padding-top: 18px; }
        .fs02-small-kpis strong { display: block; color: #959595; font-size: 30px; letter-spacing: .04em; }
        .fs02-small-kpis span { display: block; margin-top: 8px; color: #959595; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }

        .fs02-result { position: relative; z-index: 8; min-height: 986px; background: #fff; color: white; padding: 0; overflow: hidden; }
        .fs02-result-card { position: relative; z-index: 1; isolation: isolate; overflow: hidden; background: #323234; border-radius: 14.86px; width: calc(100% - 32px); margin: 0 auto; padding: 73px 0 80px; min-height: 986px; transform: translateY(48px); opacity: 0; transition: transform 0.9s cubic-bezier(.22,1,.36,1), opacity 0.7s cubic-bezier(.22,1,.36,1); }
        .fs02-result.is-visible .fs02-result-card { transform: translateY(0); opacity: 1; }
        .fs02-result-card::before { content: ""; position: absolute; inset: 0; z-index: -1; background: #323234; border-radius: inherit; }
        .fs02-result .fs02-shell { position: relative; z-index: 1; width: min(calc(100% - 124px), 1462px); }
        .fs02-result .fs02-pill { height: 40px; margin-left: 29px; padding: 0 22px 0 36px; background: rgba(65, 65, 67, 0.87); color: white; border-color: rgba(255,255,255,.16); font-size: 13px; line-height: 20px; letter-spacing: .02em; }
        .fs02-result .fs02-pill span { width: 12px; height: 12px; margin-left: -20px; background: #0E85A7; }
        .fs02-result h2 { max-width: 806px; margin-top: 70px; margin-left: 29px; color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 72px; line-height: .95; letter-spacing: -0.05em; font-weight: 700; }
        .fs02-result h2 span { color: rgb(87, 183, 207); }
        .fs02-result-lede { max-width: 761px; margin: 42px 0 0 29px; color: rgb(206, 206, 209); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 22px; line-height: 1.3; letter-spacing: 0; }
        .fs02-kpi-grid { display: grid; grid-template-columns: minmax(0, 575fr) minmax(0, 382fr) minmax(0, 382fr); grid-template-rows: 217px 196px; column-gap: 17px; row-gap: 20px; width: min(100% - 29px, 1373px); margin-top: 59px; margin-left: 29px; align-items: start; }
        .fs02-kpi-card { --kpi-from-x: 0px; --kpi-from-y: 80px; --kpi-scale: .8; min-height: 217px; height: 217px; background: #3c3c3e; border: 0; border-radius: 16px; padding: 18px 32px; display: flex; flex-direction: column; justify-content: space-between; opacity: 0; transform: translate(var(--kpi-from-x), var(--kpi-from-y)) scale(var(--kpi-scale)); transition: opacity 1.2s cubic-bezier(.65,0,.35,1), transform 1.2s cubic-bezier(.65,0,.35,1); will-change: transform, opacity; }
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
        .fs02-quote { position: relative; min-height: 841px; background: #fff; padding: 0; overflow: hidden; }
        .fs02-quote-image { position: absolute; left: 0; right: 0; top: 115px; display: block; width: 100%; height: 722px; object-fit: cover; object-position: 50% 50%; transform: translateY(var(--parallax-y, 0px)); will-change: transform; transition: transform 0.05s linear; }
        @keyframes fs02-image-parallax { from { transform: translateY(120px) scale(1.05); } to { transform: translateY(-80px) scale(1); } }
        .fs02-quote-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 732px 578px; justify-content: space-between; gap: 26px; height: 100%; align-items: start; width: min(calc(100% - 194px), 1391px); padding-top: 95px; transform: translateX(-34px); }
        .fs02-quote blockquote { margin: 0; max-width: 935px; background: transparent; padding: 0; border: 0; }
        .fs02-quote aside { width: 100%; max-width: 578px; min-height: 475px; margin: 74px 0 0; border: 0; border-radius: 15px; background: rgba(50,50,50,.75); color: #fff; padding: 40px 45px 50px 52px; backdrop-filter: blur(11px); -webkit-backdrop-filter: blur(11px); animation: fs02-card-breathe-in both; animation-timeline: view(); animation-range: entry 8% cover 40%; will-change: transform, opacity, filter; }
        .fs02-quote blockquote p { width: 700px; max-width: 100%; margin: 34px 0 45px; color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 46px; line-height: 1.2; letter-spacing: 0; font-weight: 700; }
        .fs02-quote-line { display: inline; animation: fs02-sticky-settle both; animation-timeline: view(); animation-range: entry 0% cover 28%; will-change: transform, opacity; }
        .fs02-quote-line:nth-child(2) { animation-range: entry 5% cover 34%; }
        .fs02-quote-accent { color: #6dbdd2; line-height: 1.2; }
        .fs02-quote footer { color: rgb(59, 58, 58); font-size: 16px; line-height: 22.4px; }
        .fs02-quote aside .fs02-pill { width: max-content; min-width: max-content; height: 40px; justify-content: flex-start; gap: 9px; padding: 0 18px; background: rgba(65, 65, 67, .87); color: #fcfcfc; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13px; font-weight: 700; white-space: nowrap; }
        .fs02-quote aside .fs02-pill span { background: #10A0D6; }
        .fs02-quote aside h2 { width: 462px; max-width: 100%; margin-top: 18px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 38px; line-height: 50.4px; color: #fff; font-weight: 400; }
        .fs02-quote aside p { max-width: 500px; margin: 25.5px 0 0; color: #ccc; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 19px; line-height: 25.2px; }
        .fs02-inline-form { display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; row-gap: 24px; width: 481px; max-width: 100%; margin-top: 43.5px; }
        .fs02-inline-form label { display: grid; gap: 8px; margin: 0; color: #fff; font-size: 13px; line-height: 1; }
        .fs02-inline-form input { width: 100%; height: 44px; border: 0; border-radius: 10px; background: rgba(255,255,255,.1); color: #fff; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 8px 2px 8px 0; outline: none; }
        .fs02-inline-form button { grid-column: 1 / -1; height: 44px; border: 0; border-radius: 999px; background: #57b7cf; color: #323233; font-size: 16px; line-height: 20.8px; font-weight: 700; cursor: pointer; }
        .fs02-prevention-host { background: #f4f4f4; padding: 40px 0 0; min-height: auto; }

        /* Prevention widget inline styles */
        .ssi-prev { --char: #323233; --char-2: #333334; --cyan: #56B7D1; --canvas-2: #F4F4F4; --white: #FFFFFF; --muted: #8A8A8B; --line: #E0DDD7; --line-2: rgba(59,58,58,0.15); --pill-remeasure: #4A8A98; --pill-verify: #5BAFC4; --pill-verifynow: #5BAFC4; --pill-reconcile: #6B5862; --pill-recalc: #8AAE8E; --pill-address: #4A4A52; --pill-revisit: #8E8472; background: var(--canvas-2); padding: 96px 56px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: var(--char); overflow-x: hidden; }
        .ssi-prev * { box-sizing: border-box; }
        .ssi-prev img, .ssi-prev svg { max-width: 100%; height: auto; }
        .ssi-prev-pill { display: inline-flex; align-items: center; gap: 9px; background: var(--white); padding: 8px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #636363; letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid var(--line-2); margin-bottom: 32px; }
        .ssi-prev-pill::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); }
        .ssi-prev-h2 { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 700; font-size: 80px; line-height: 1.0; color: var(--char); margin: 0 0 35px; letter-spacing: -0.032em; max-width: 1320px; }
        .ssi-prev-lede { font-family: 'Helvetica Neue', sans-serif; font-size: 18px; line-height: 1.55; color: var(--char); margin: 0 0 56px; max-width: 760px; font-weight: 400; }
        .ssi-prev-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 40px; align-items: stretch; }
        .ssi-prev-item { position: relative; display: flex; gap: 28px; align-items: flex-start; padding: 24px 26px; background: var(--white); border-radius: 12px; cursor: pointer; transition: all 0.2s; user-select: none; border: 1px solid transparent; }
        .ssi-prev-item:hover { box-shadow: 0 6px 20px rgba(50,50,51,0.07); transform: translateY(-1px); }
        .ssi-prev-item.checked { border-color: var(--char-2); box-shadow: 0 6px 24px rgba(50,50,51,0.08); }
        .ssi-prev-item.checked::before { content: ''; position: absolute; top: 14px; bottom: 14px; left: -1px; width: 3px; border-radius: 2px; background: var(--cyan); }
        .ssi-prev-box { width: 22px; height: 22px; border: 1.5px solid var(--line); border-radius: 6px; flex-shrink: 0; margin-top: 1px; transition: all 0.2s; position: relative; background: var(--white); }
        .ssi-prev-item.checked .ssi-prev-box { background: var(--char-2); border-color: var(--char-2); }
        .ssi-prev-item.checked .ssi-prev-box::after { content: ""; position: absolute; top: 50%; left: 50%; width: 5px; height: 10px; margin-top: -1px; border: solid #FFF; border-width: 0 2px 2px 0; transform: translate(-50%, -50%) rotate(45deg); }
        .ssi-prev-content { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
        .ssi-prev-content .ssi-prev-desc { flex: 1; }
        .ssi-prev-title { font-family: 'Helvetica Neue', sans-serif; font-weight: 600; font-size: 19px; color: var(--char); line-height: 1.32; margin-bottom: 8px; letter-spacing: -0.01em; }
        .ssi-prev-desc { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; color: var(--muted); line-height: 1.5; margin-bottom: 20px; padding-right: clamp(30px, 8vw, 115px); }
        .ssi-prev-pill-inline { display: inline-block; padding: 6px 14px; border-radius: 999px; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 600; background: var(--canvas-2); color: var(--char); letter-spacing: 0.08em; text-transform: uppercase; }
        .ssi-prev-pill-inline[data-action="Remeasure"] { background: var(--pill-remeasure); color: var(--white); }
        .ssi-prev-pill-inline[data-action="Verify"] { background: var(--pill-verify); color: var(--white); }
        .ssi-prev-pill-inline[data-action="Verify Now"] { background: var(--pill-verifynow); color: var(--white); }
        .ssi-prev-pill-inline[data-action="Reconcile"] { background: var(--pill-reconcile); color: var(--white); }
        .ssi-prev-pill-inline[data-action="Recalculate"] { background: var(--pill-recalc); color: var(--white); }
        .ssi-prev-pill-inline[data-action="Address"] { background: var(--pill-address); color: var(--white); }
        .ssi-prev-pill-inline[data-action="Revisit"] { background: var(--pill-revisit); color: var(--white); }
        .ssi-prev-output { padding: 36px 40px; background: var(--white); border-radius: 12px; transition: all 0.3s; box-shadow: 0 6px 20px rgba(50,50,51,0.05); border: 1px solid var(--line); }
        .ssi-prev-output.empty { background: transparent; border: 1.5px dashed var(--line); box-shadow: none; }
        .ssi-prev-output-eyebrow { font-size: 13px; color: var(--cyan); margin-bottom: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
        .ssi-prev-output.empty .ssi-prev-output-eyebrow { color: var(--muted); }
        .ssi-prev-output-title { font-family: 'Helvetica Neue', sans-serif; font-weight: 700; font-size: 24px; color: var(--char); margin: 0 0 22px; line-height: 1.22; letter-spacing: -0.018em; }
        .ssi-prev-output.empty .ssi-prev-output-title { color: var(--muted); }
        .ssi-prev-output-text { font-size: 14px; color: var(--muted); line-height: 1.6; margin: 0 0 22px; max-width: 640px; }
        .ssi-prev-output-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .ssi-prev-output.empty .ssi-prev-output-list { display: none; }
        .ssi-prev-output-row { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; border-bottom: 1px solid var(--line); }
        .ssi-prev-output-row:last-child { border-bottom: none; }
        .ssi-prev-output-row-text { font-family: 'Helvetica Neue', sans-serif; font-size: 16px; font-weight: 500; color: var(--char); line-height: 1.4; margin: 0; flex: 1; min-width: 0; }
        .ssi-prev-output-row .ssi-prev-pill-inline { flex-shrink: 0; }
        .ssi-prev-item:focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
        a.ssi-prev-cta { display: inline-block; margin-top: 24px; margin-left: auto; padding: 16px 28px; background: var(--char); color: #ffffff; font-family: 'Inter', system-ui, sans-serif; font-size: 15px; font-weight: 600; text-align: center; text-decoration: none; border-radius: 8px; transition: background 0.2s, transform 0.2s; width: auto; }
        .ssi-prev-output { display: flex; flex-direction: column; align-items: flex-end; }
        .ssi-prev-output > *:not(.ssi-prev-cta) { align-self: stretch; }
        a.ssi-prev-cta:hover { background: #1a1a1b; color: #ffffff; transform: translateY(-1px); }

        .fs02-modal-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(30,30,30,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fs02-modal-fadein 0.25s ease; isolation: isolate; }
        @keyframes fs02-modal-fadein { from { opacity: 0; } to { opacity: 1; } }
        .fs02-modal-container { position: relative; width: 100%; max-width: 660px; max-height: calc(100vh - 48px); background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 80px rgba(0,0,0,0.25); animation: fs02-modal-slidein 0.3s cubic-bezier(.22,1,.36,1); isolation: isolate; transform: translateZ(0); -webkit-transform: translateZ(0); }
        @keyframes fs02-modal-slidein { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .fs02-modal-dark { background: #2A1F2E; }
        .fs02-modal-overlay-dark { background: rgba(0,0,0,0.75); }
        .fs02-modal-close-dark { color: #f4f4f4; background: rgba(255,255,255,0.18); }
        .fs02-modal-close-dark:hover { background: rgba(255,255,255,0.28); }
        .fs02-modal-gutter-dark { background: #2A1F2E; }
        .fs02-modal-gutter { position: absolute; top: 0; bottom: 0; width: 22px; background: #fff; z-index: 2; pointer-events: none; }
        .fs02-modal-gutter-l { left: 0; }
        .fs02-modal-gutter-r { right: 0; }
        .fs02-modal-close { position: absolute; top: 16px; right: 16px; z-index: 10; width: 44px; height: 44px; border: none; border-radius: 50%; background: rgba(0,0,0,0.08); color: #333; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .fs02-modal-close:hover { background: rgba(0,0,0,0.14); }
        .fs02-modal-close.fs02-modal-close-dark { color: #f4f4f4; background: rgba(255,255,255,0.18); box-shadow: none; }
        .fs02-modal-close.fs02-modal-close-dark:hover { background: rgba(255,255,255,0.28); }
        .fs02-modal-iframe { width: 100%; height: calc(100vh - 96px); max-height: 900px; border: none; display: block; }
        .fs02-modal-wide { max-width: 940px; }
        .fs02-modal-wide .fs02-modal-iframe { max-height: 1000px; }
        @media (max-width: 640px) {
          .fs02-modal-overlay { padding: 0; }
          .fs02-modal-container { max-width: 100%; max-height: 100vh; max-height: 100dvh; border-radius: 0; box-shadow: none; }
          .fs02-modal-wide { max-width: 100%; }
          .fs02-modal-iframe { height: 100vh; height: 100dvh; max-height: none; }
          .fs02-modal-wide .fs02-modal-iframe { max-height: none; }
          .fs02-modal-close { top: 12px; right: 12px; background: rgba(0,0,0,0.10); box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
          .fs02-modal-close.fs02-modal-close-dark { top: 12px; right: 12px; color: #f4f4f4; background: rgba(255,255,255,0.18); box-shadow: none; }
          .fs02-modal-gutter { display: none; }
        }
        @media (max-width: 640px) and (max-height: 700px) {
          .fs02-modal-iframe { height: 100vh; height: 100dvh; }
        }
        .fs02-hero-nav button { background: none; border: none; color: inherit; font: inherit; cursor: pointer; padding: 2px 8px; white-space: nowrap; }
        .fs02-hero-nav button:hover { opacity: 0.7; }
        button.fs02-hero-cta { font: inherit; cursor: pointer; }

        .fs02-sticky-cta { position: fixed; bottom: 28px; right: 28px; z-index: 999; opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity 0.35s cubic-bezier(.22,1,.36,1), transform 0.35s cubic-bezier(.22,1,.36,1); }
        .fs02-sticky-cta.is-visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .fs02-sticky-cta a { display: inline-flex; align-items: center; padding: 14px 24px; background: var(--char); color: #fff; font-family: 'Inter', system-ui, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 999px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); transition: background 0.2s, box-shadow 0.2s, transform 0.15s; letter-spacing: 0.01em; }
        .fs02-sticky-cta a:hover { background: #1a1a1b; box-shadow: 0 6px 28px rgba(0,0,0,0.25); transform: translateY(-1px); }

        .fs02-founder { position: relative; min-height: 659px; background: #f4f4f4; padding: 169px 0 80px; text-align: center; overflow: hidden; }
        .fs02-founder-image { position: absolute; right: 0; bottom: 0; width: 536px; height: 446px; object-fit: contain; object-position: right bottom; pointer-events: none; transform: translateY(var(--parallax-y, 0px)); will-change: transform; }
        .fs02-founder p { margin: 0; color: rgb(68, 171, 195); font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 16px; font-weight: 600; letter-spacing: .02em; text-transform: uppercase; line-height: 1.4; }
        .fs02-founder p.fs02-entrance, .fs02-founder blockquote.fs02-entrance { animation-name: fs02-founder-float; animation-duration: 2s; animation-timing-function: cubic-bezier(.22,1,.36,1); }
        .fs02-founder blockquote.fs02-entrance { animation-delay: .2s; }
        @keyframes fs02-founder-float { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fs02-founder blockquote { max-width: 1060px; margin: 25px auto 0; color: var(--char-soft); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 46px; line-height: 1.4; letter-spacing: 0; font-weight: 400; }
        .fs02-founder blockquote strong { font-weight: 700; }

        .fs02-subscribe { min-height: 800px; background: rgb(50, 50, 50); color: var(--char); padding: 15px 0 80px; overflow: hidden; }
        .fs02-subscribe-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0; width: min(calc(100% - 64px), 1520px); margin: 63px auto 0; padding: 0; background: #f4f4f4; border-radius: 14.5px; box-shadow: 0 8px 40px rgba(0,0,0,.12); }
        .fs02-subscribe-copy { background: transparent; border-radius: 0; padding: 72px 60px 64px 80px; min-height: 673px; }
        .fs02-subscribe-copy > p:first-child { margin: 0; color: #89898a; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 22.4px; font-weight: 700; letter-spacing: 0; text-transform: none; }
        .fs02-subscribe h2 { width: 518px; max-width: 100%; margin: 20px 0 0; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 62px; line-height: .9; font-weight: 700; letter-spacing: 0; }
        .fs02-subscribe-copy > p:not(:first-child) { max-width: 427px; margin: 24px 0 0; color: #7A7A7A; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.4; letter-spacing: 0; }
        .fs02-subscribe-copy > p:not(:first-child) strong { font-weight: 700; }
        .fs02-subscribe ul { margin: 36px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 18px; line-height: 25.2px; }
        .fs02-subscribe li { display: block; }
        .fs02-issue-num { font-weight: 600; }
        .fs02-issue-line { border: 0; border-top: 1px solid rgba(157, 157, 157, 0.4); margin: 0; width: 100%; }
        .fs02-issue-row { display: grid; grid-template-columns: 53px 1fr; gap: 22px; align-items: center; min-height: 62px; animation: fs02-premium-reveal both; animation-timeline: view(); animation-range: entry 0% cover 22%; will-change: transform, opacity; }
        .fs02-issue-arrow { display: block; width: 53px; height: 62px; flex-shrink: 0; color: #0FA0D6; transform: rotate(-90deg) translateY(20px); opacity: 0; transition: transform .8s cubic-bezier(.22,1,.36,1), opacity .8s cubic-bezier(.22,1,.36,1); }
        .fs02-issue-row.is-visible .fs02-issue-arrow { transform: rotate(-90deg) translateY(0); opacity: 1; }
        .fs02-issue-row:nth-child(2) .fs02-issue-arrow { transition-delay: .1s; }
        .fs02-issue-row:nth-child(4) .fs02-issue-arrow { transition-delay: .2s; }
        .fs02-issue-row:nth-child(6) .fs02-issue-arrow { transition-delay: .3s; }
        .fs02-subscribe-eyebrow { display: block; margin-bottom: 20px; color: #0fa0d6; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13.572px; line-height: 20.358px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; }
        .fs02-subscribe-form-card { background: transparent; border-radius: 0; padding: 24px 48px 24px 0; min-height: 673px; display: flex; flex-direction: column; justify-content: center; }
        .fs02-subscribe-form-inner { background: #fff; border-radius: 15px; padding: 40px 50px 36px; box-shadow: 0 4px 24px rgba(0,0,0,.08); transform: scale(1.06); opacity: 0; transition: transform 0.8s cubic-bezier(.22,1,.36,1), opacity 0.6s cubic-bezier(.22,1,.36,1); }
        .fs02-subscribe-form-card.is-visible .fs02-subscribe-form-inner { transform: scale(1); opacity: 1; }
        .fs02-subscribe-form-card h3 { max-width: 562px; margin: 0 0 25px; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 29px; line-height: 1.2; font-weight: 700; letter-spacing: 0; }
        .fs02-subscribe-form { display: grid; grid-template-columns: repeat(2, 1fr); column-gap: 24px; row-gap: 24px; width: 100%; }
        .fs02-subscribe-form label { display: grid; gap: 8px; color: rgb(59, 58, 58); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 20px; }
        .fs02-subscribe-form .fs02-form-wide { grid-column: 1 / -1; }
        .fs02-subscribe-form input { height: 44px; width: 100%; border: 0; border-radius: 8px; background: rgba(243,243,243,.71); color: #3b3a3a; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 8px 12px; outline: none; }
        .fs02-subscribe-form button { grid-column: 1 / -1; width: 100%; height: 44px; margin-top: 0; border: 0; border-radius: 100px; background: rgb(87, 183, 207); color: rgb(50, 50, 50); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 20.8px; font-weight: 700; letter-spacing: .01em; cursor: pointer; }
        .fs02-subscribe .fs02-unsubscribe { display: block; margin: 20px 0 0 4px; color: #959595; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 13px; line-height: 19.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }

        /* Character reveal */
        .fs02-char-reveal { max-width: 1060px; margin: 25px auto 0; color: var(--char-soft); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 46px; line-height: 1.4; letter-spacing: 0; font-weight: 400; }
        .fs02-char-reveal strong { font-weight: 700; }
        .fs02-founder .fs02-char-reveal { font-size: 48px; }
        .fs02-char { opacity: 0.15; transition: opacity 0.45s cubic-bezier(.22,1,.36,1); }
        .fs02-closing-block { max-width: 1100px; margin: 32px 0 0 0; font-size: unset; }
        .fs02-closing-h2 { display: block; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: clamp(49px, 9.97vw, 158.07px); line-height: .9; font-weight: 700; letter-spacing: -0.02em; color: var(--char-soft); }
        .fs02-closing-h3 { display: block; margin-top: 24px; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: clamp(38px, 6.31vw, 100.95px); line-height: 1; font-weight: 700; letter-spacing: -0.05em; color: rgb(137, 137, 138); padding-bottom: 40px; }
        .fs02-closing-p { display: block; margin-top: 90px; padding-bottom: 120px; padding-left: 30px; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 26px; line-height: .95; letter-spacing: .02em; font-weight: 700; text-transform: uppercase; color: #0fa0d6; }

        .fs02-section-divider { width: 100%; max-width: none; margin: 0; padding: 32px 0; border: none; background: #f4f4f4; background-clip: padding-box; border-top: 0; position: relative; }
        .fs02-section-divider::after { content: ""; display: block; width: min(calc(100% - 128px), 1400px); margin: 0 auto; border-top: 1px solid rgba(59,58,58,.12); }
        .fs02-closing { min-height: 682px; background: #f4f4f4; padding: 0 0 10px; display: flex; align-items: center; overflow: hidden; transition: background 1.4s cubic-bezier(.22,1,.36,1); }
        .fs02-closing:hover { background: rgb(50, 50, 50); }
        .fs02-closing .fs02-pill { transition: background 1.4s cubic-bezier(.22,1,.36,1), color 1.4s cubic-bezier(.22,1,.36,1), border-color 1.4s cubic-bezier(.22,1,.36,1); }
        .fs02-closing:hover .fs02-pill { background: rgba(65,65,67,.87); color: #fcfcfc; border-color: rgba(255,255,255,.16); }
        .fs02-closing:hover .fs02-pill span { background: #0E85A7; }
        .fs02-closing-h2 .fs02-char,
        .fs02-closing-h3 .fs02-char,
        .fs02-closing-p .fs02-char { transition: opacity 0.45s cubic-bezier(.22,1,.36,1), color 1.4s cubic-bezier(.22,1,.36,1); }
        .fs02-closing:hover .fs02-closing-h2 .fs02-char { color: #fff; }
        .fs02-closing:hover .fs02-closing-h3 .fs02-char { color: rgba(200,200,202,.7); }
        .fs02-closing:hover .fs02-closing-p .fs02-char { color: #0fa0d6; }
        .fs02-closing .fs02-shell { transform: translateY(var(--parallax-y, 0px)); will-change: transform; text-align: left; padding-left: 35px; padding-top: 90px; }
        .fs02-closing .fs02-pill { animation-range: entry 0% cover 18%; }
        .fs02-closing p { margin: 56px 0 0; color: #0fa0d6; font-family: Inter, "Helvetica Neue", Arial, sans-serif; font-size: 22px; line-height: .95; letter-spacing: .02em; font-weight: 700; text-transform: uppercase; }

        /* Scroll-driven fade + blur reveal */
        .fs02-scroll-fade { animation: fs02-scroll-blur-in both linear; animation-timeline: view(); will-change: opacity, filter, transform; }
        .fs02-scroll-fade-1 { animation-range: entry 0% cover 22%; }
        .fs02-scroll-fade-2 { animation-range: entry 5% cover 28%; }
        .fs02-scroll-fade-3 { animation-range: entry 12% cover 36%; }
        .fs02-scroll-fade-4 { animation-range: entry 20% cover 44%; }
        @keyframes fs02-scroll-blur-in {
          from { opacity: 0; filter: blur(12px); transform: translateY(20px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
        /* Fallback for Safari/Firefox */
        .no-scroll-timeline .fs02-scroll-fade { animation: none; opacity: 0; filter: blur(12px); transform: translateY(20px); transition: opacity 1.8s cubic-bezier(.33,0,.2,1), filter 1.8s cubic-bezier(.33,0,.2,1), transform 1.8s cubic-bezier(.33,0,.2,1); }
        .no-scroll-timeline .fs02-scroll-fade-2 { transition-delay: .15s; }
        .no-scroll-timeline .fs02-scroll-fade-3 { transition-delay: .3s; }
        .no-scroll-timeline .fs02-scroll-fade-4 { transition-delay: .45s; }
        .no-scroll-timeline .fs02-closing.is-visible .fs02-scroll-fade,
        .no-scroll-timeline .fs02-result.is-visible .fs02-scroll-fade,
        .no-scroll-timeline .fs02-quote.is-visible .fs02-scroll-fade,
        .no-scroll-timeline .fs02-founder.is-visible .fs02-scroll-fade,
        .no-scroll-timeline .fs02-footer.is-visible .fs02-scroll-fade { opacity: 1; filter: blur(0); transform: translateY(0); }

        .fs02-footer { position: relative; z-index: 2; background: #f4f4f4; color: var(--char-soft); padding: 72px 0 36px; margin-top: -60px; }
        .fs02-footer .fs02-shell { width: min(calc(100% - 128px), 1400px); margin: 0 auto; }
        .fs02-footer .fs02-footer-brand { display: flex; align-items: center; justify-content: space-between; padding-bottom: 40px; gap: 32px; }
        .fs02-footer-brand a { display: inline-flex; width: 180px; flex-shrink: 0; }
        .fs02-footer-brand img { display: block; width: 180px; height: auto; margin-left: -38px; }
        .fs02-footer-brand strong { color: #31435c; font-family: "New Rail Alphabet", "Helvetica Neue", Arial, sans-serif; font-size: clamp(26px, 3.1vw, 44px); line-height: 1; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
        .fs02-footer-columns { display: grid; grid-template-columns: repeat(4, auto); justify-content: space-between; gap: 32px; }
        .fs02-footer-column:nth-child(2) { transition-delay: .08s; }
        .fs02-footer-column:nth-child(3) { transition-delay: .16s; }
        .fs02-footer-column:nth-child(4) { transition-delay: .24s; }
        .fs02-footer h2 { margin-bottom: 18px; font-size: 16px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; }
        .fs02-footer a, .fs02-footer span { display: block; margin-top: 8px; color: var(--char-soft); font-size: 14px; line-height: 1.7; }
        .fs02-footer .fs02-footer-columns { padding-bottom: 40px; }
        .fs02-footer .fs02-footer-bottom { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #d4d4d4; padding-top: 25px; }
        .fs02-footer-bottom span { font-size: 13px; line-height: 1.6; color: var(--muted); }
        .fs02-footer-bottom a { font-size: 13px; line-height: 1.6; color: var(--muted); text-decoration: none; }
        .fs02-footer-bottom a:hover { text-decoration: underline; }
        .fs02-footer-column a { transition: color 0.2s; }
        .fs02-footer-column a:hover { color: var(--cyan); }

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
          .fs02-kpi-card:nth-child(5) { flex-basis: auto; width: auto; grid-column: auto; grid-row: auto; height: auto; min-height: auto; }
          .fs02-kpi-card:first-child { grid-column: span 2; }
          .fs02-kpi-card:first-child strong { font-size: 70px; }
          .fs02-kpi-card:nth-child(2) strong { font-size: 56px; }
          .fs02-section-buffer { height: 43px; }
          .fs02-quote { min-height: 760px; height: auto; }
          .fs02-quote-grid { grid-template-columns: 1fr; gap: 28px; padding-top: 64px; transform: none; }
          .fs02-quote aside { margin-top: 36px; max-width: 575px; height: auto; min-height: auto; }
          .fs02-prevention-host { min-height: auto; }
          .ssi-prev { padding: 56px 28px; }
          .ssi-prev-h2 { font-size: 44px; letter-spacing: -0.028em; }
          .ssi-prev-lede { font-size: 16px; margin-bottom: 36px; }
          .ssi-prev-grid { grid-template-columns: 1fr; gap: 10px; margin-bottom: 32px; }
          .ssi-prev-desc { padding-right: 60px; }
          .fs02-subscribe { height: auto; min-height: auto; padding: 48px 0; }
          .fs02-subscribe-grid { grid-template-columns: 1fr; gap: 0; width: min(100% - 80px, 768px); padding: 0; }
          .fs02-subscribe-copy { border-radius: 0; padding: 48px 40px 40px; height: auto; }
          .fs02-subscribe-form-card { width: 100%; height: auto; border-radius: 0; padding: 20px; }
          .fs02-subscribe-form-inner { padding: 32px 28px 28px; }
          .fs02-closing { padding: 100px 0 90px; }
          .fs02-closing-h2 { font-size: 100.2px; line-height: 90.18px; }
          .fs02-closing-h3 { font-size: 60px; line-height: 1; }
          .fs02-founder { padding: 80px 0; }
          .fs02-founder-image { width: 380px; height: auto; }
          .fs02-founder blockquote { font-size: clamp(28px, 3.9vw, 46px); }
          .fs02-footer .fs02-shell { width: min(calc(100% - 80px), 768px); }
          .fs02-footer-brand { flex-direction: column; align-items: flex-start; gap: 20px; }
          .fs02-footer-brand a { width: 160px; }
          .fs02-footer-brand img { width: 160px; }
          .fs02-footer-brand strong { font-size: 28px; }
          .fs02-footer-columns { grid-template-columns: repeat(2, auto); justify-content: space-evenly; gap: 36px; }
          .fs02-footer h2 { font-size: 14px; }
          .fs02-footer a, .fs02-footer span { font-size: 13px; }
        }

        @media (max-width: 750px) {
          .fs02-shell { width: calc(100% - 48px); }
          .fs02-pill { padding: 7px 13px; font-size: 12px; }
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
          .fs02-kpi-card:first-child,
          .fs02-kpi-card:nth-child(4),
          .fs02-kpi-card:nth-child(5) { grid-column: auto; grid-row: auto; height: auto; min-height: 150px; }
          .fs02-kpi-card:first-child strong,
          .fs02-kpi-card:nth-child(2) strong { font-size: 44px; }
          .fs02-result .fs02-shell { width: calc(100% - 48px); }
          .fs02-result h2 { font-size: 28px; line-height: 36.4px; }
          .fs02-result-lede { margin-top: 28px; }
          .fs02-kpi-card { min-height: 150px; }
          .fs02-kpi-card strong { font-size: 44px; }
          .fs02-quote { min-height: 780px; height: auto; padding-bottom: 0; }
          .fs02-section-buffer { height: 43px; }
          .fs02-quote blockquote, .fs02-quote aside { padding: 30px 24px; }
          .fs02-quote blockquote { padding: 0; }
          .fs02-quote blockquote p { font-size: 32px; }
          .fs02-quote aside { height: auto; min-height: auto; }
          .fs02-quote aside h2 { font-size: 28px; line-height: 1.3; }
          .fs02-quote aside p { font-size: 16px; }
          .fs02-inline-form { grid-template-columns: 1fr; width: 100%; }
          .fs02-quote-image { height: 500px; }
          .fs02-prevention-host { min-height: auto; }
          .ssi-prev { padding: 44px 18px; }
          .ssi-prev-h2 { font-size: 34px; line-height: 1.05; margin-bottom: 14px; }
          .ssi-prev-lede { font-size: 15px; line-height: 1.5; margin-bottom: 28px; }
          .ssi-prev-grid { gap: 8px; margin-bottom: 24px; }
          .ssi-prev-item { padding: 18px 18px; gap: 18px; border-radius: 10px; }
          .ssi-prev-desc { padding-right: 0; }
          .ssi-prev-output { padding: 22px 20px; border-radius: 10px; }
          .ssi-prev-output-title { font-size: 20px; }
          .ssi-prev-output-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .fs02-founder { padding: 70px 0; }
          .fs02-founder-image { width: min(280px, 70vw); height: auto; }
          .fs02-founder blockquote { font-size: 28px; line-height: 1.35; }
          .fs02-subscribe { padding: 32px 0; }
          .fs02-subscribe h2 { font-size: 31.03px; line-height: 34.13px; }
          .fs02-subscribe-grid { width: calc(100% - 32px); }
          .fs02-subscribe-copy { padding: 36px 24px 28px; }
          .fs02-subscribe-form-card { padding: 16px; }
          .fs02-subscribe-form-inner { padding: 24px 20px 20px; }
          .fs02-subscribe-form { grid-template-columns: 1fr; width: 100%; }
          .fs02-subscribe-form button { width: 100%; }
          .fs02-closing { padding: 72px 0; }
          .fs02-closing-h2 { font-size: 49.47px; line-height: 49.47px; }
          .fs02-closing-h3 { font-size: 38px; }
          .fs02-closing-p { margin-top: 40px; padding-bottom: 60px; padding-left: 0; }
          .fs02-footer .fs02-shell { width: calc(100% - 48px); }
          .fs02-footer-brand { flex-direction: column; align-items: flex-start; gap: 18px; margin-bottom: 36px; }
          .fs02-footer-brand a { width: 140px; }
          .fs02-footer-brand img { width: 140px; }
          .fs02-footer-brand strong { white-space: normal; font-size: 22px; }
          .fs02-footer-columns { grid-template-columns: repeat(2, auto); justify-content: space-evenly; gap: 28px; }
          .fs02-footer h2 { font-size: 13px; margin-bottom: 14px; }
          .fs02-footer a, .fs02-footer span { font-size: 12.5px; }
          .fs02-footer-column a { min-height: 44px; display: flex; align-items: center; }
          .fs02-footer-bottom { flex-direction: column; gap: 8px; align-items: flex-start; }
          .fs02-footer-bottom span { text-align: left; }
          .fs02-sticky-cta { bottom: 16px; right: 16px; left: 16px; }
          .fs02-sticky-cta a { width: 100%; justify-content: center; padding: 16px 20px; font-size: 15px; }
          a.ssi-prev-cta { font-size: 14px; padding: 14px 20px; align-self: stretch; text-align: center; }
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
          .fs02-issue-row,
          .fs02-scroll-fade { animation: none; opacity: 1; transform: none; filter: none; clip-path: none; }
          .fs02-critical-host::before,
          .fs02-critical-host::after,
          .fs02-critical-container { animation: none; opacity: 1; transform: none; clip-path: none; }
        }
      `}</style>
      <div className="fs02">
        <Hero onOpenCalc={calc.open} onOpenAnalyzer={analyzer.open} onOpenVerify={verify.open} />
        <StickySubscribeCta />
        <ResultKpis />
        <PullQuote />
        <PreventionWidget />
        <ClosingCta />
        <Subscribe />
        <FounderQuote />
        <Footer />
        {calc.modal}
        {analyzer.modal}
        {verify.modal}
      </div>
    </main>
  );
}
