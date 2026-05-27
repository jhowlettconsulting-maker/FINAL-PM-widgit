import Link from "next/link";

export default function SandboxHome() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--off-white)] p-8">
      <div className="max-w-xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-[var(--deep-purple)]">
          SSI Landing Page Sandbox
        </h1>
        <p className="text-[var(--dark-gray)]">
          This is your local dev sandbox. Open the page you&apos;re working on
          to start editing.
        </p>
        <Link
          href="/lp/new-page"
          className="inline-block px-6 py-3 bg-[var(--deep-purple)] text-white rounded-[var(--radius-md)] hover:bg-[var(--purple-dark)] transition-colors"
        >
          Open /lp/new-page
        </Link>
        <p className="text-sm text-[var(--medium-gray)]">
          See <code className="bg-[var(--light-gray)] px-1.5 py-0.5 rounded">README.md</code> for instructions and live-site reference links.
        </p>
      </div>
    </main>
  );
}
