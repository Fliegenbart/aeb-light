import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
      <section className="max-w-lg border border-ink/12 bg-white p-6 shadow-editorial">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">AEB Readiness Snapshot</p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate">
          This prototype only has one main page for the mock readiness check.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center justify-center bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-moss"
        >
          Back to snapshot
        </Link>
      </section>
    </main>
  );
}
