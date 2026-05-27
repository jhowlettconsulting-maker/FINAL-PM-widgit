"use client";

import Link from "next/link";
import Image from "next/image";

/**
 * Minimal layout for /lp/* landing pages.
 * Mirrors the production SSI landing-page shell: sticky white header
 * with logo + CTA, content below, dark footer.
 *
 * Edit HEADER_CTA_TEXT to change the CTA button label.
 * The CTA links to #lp-form — make sure your page has an element with that id.
 */

const HEADER_CTA_TEXT = "Get Started";

export default function LandingPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Sticky header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[var(--light-gray)]">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Stevenson Systems home">
            <Image
              src="/images/ssi-logo.png"
              alt="Stevenson Systems"
              width={148}
              height={40}
              priority
            />
          </Link>
          <a
            href="#lp-form"
            className="font-medium text-white bg-[var(--deep-purple)] rounded-[var(--radius-md)] hover:bg-[var(--purple-dark)] transition-colors duration-200 text-sm px-5 py-2.5"
          >
            {HEADER_CTA_TEXT}
          </a>
        </div>
      </header>

      <main className="pt-16">{children}</main>

      {/* ── Footer ── */}
      <footer className="bg-[#2A1F2E] py-8 px-6">
        <div className="max-w-[var(--max-w)] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/images/ssi-logo-footer.png"
            alt="Stevenson Systems"
            width={124}
            height={34}
            className="opacity-60"
          />
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Stevenson Systems, Inc. All rights reserved.
          </p>
          <a
            href="https://stevensonsystems.com/privacy-policy"
            className="text-white/40 text-sm hover:text-white/60 transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </>
  );
}
