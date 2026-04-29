export function SiteFooter() {
  return (
    <footer className="hairline-t mt-24 py-10">
      <div className="container-prose flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-[color:var(--color-ink-3)]">
        <p>
          Reference material adapted from the{" "}
          <span className="text-[color:var(--color-ink-2)]">ai-pm-interview-coach</span>{" "}
          skill — Aakash Gupta&rsquo;s rubric, calibrated against 200+ candidates.
        </p>
        <p className="eyebrow">DASME · SIGNAL · STAR+M</p>
      </div>
    </footer>
  );
}
