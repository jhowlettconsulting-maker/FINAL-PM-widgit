import type { Metadata } from "next";

const SITE_URL = "https://stevensonsystems.com";
const PAGE_PATH = "/lp/fs02";
const OG_IMAGE = "https://static.wixstatic.com/media/3ad865_579c752c5e314f98b1e608fef77a7aee~mv2.jpg/v1/fill/w_1200,h_630,fp_0.38_0.08,q_85,enc_auto/3ad865_579c752c5e314f98b1e608fef77a7aee~mv2.jpg";

export const metadata: Metadata = {
  title:
    "Field Study 02: RSF Verification Exposed $4.2M in Hidden Revenue — Seattle Class A Office | Stevenson Systems",
  description:
    "A single-asset RSF verification on a 135,890 SF Seattle CBD class-A office uncovered a 3.66% rentable area variance worth $4.2M. See the full field study — real numbers, anonymized portfolio, verified measurement.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title:
      "Field Study 02: RSF Verification Exposed $4.2M in Hidden Revenue",
    description:
      "A 135,890 SF Seattle class-A office. A 3.66% rentable area variance. $4.2M in revenue at risk — captured before the window closed. See the full verified field study.",
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Stevenson Systems",
    type: "article",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Seattle CBD class-A office tower — Stevenson Systems Field Study 02 RSF verification",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Field Study 02: $4.2M Hidden Revenue Found in Seattle Class A Office",
    description:
      "3.66% RSF variance. 135,890 SF. $4.2M captured. Real numbers from a real verification — see the full field study.",
    images: [OG_IMAGE],
  },
  keywords: [
    "RSF verification",
    "rentable square footage",
    "commercial real estate measurement",
    "revenue capture",
    "BOMA measurement",
    "office space verification",
    "Seattle commercial real estate",
    "rentable area audit",
    "lease audit",
    "CRE portfolio analysis",
    "Stevenson Systems",
    "TruSpace",
    "field study",
    "building measurement",
    "RSF variance",
  ],
  authors: [{ name: "Peter Stevenson", url: SITE_URL }],
  publisher: "Stevenson Systems",
};

export default function FS02Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
