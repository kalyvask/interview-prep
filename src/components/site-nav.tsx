import Link from "next/link";

const links = [
  { href: "/interview", label: "Mock interview" },
  { href: "/questions", label: "Questions" },
  { href: "/frameworks", label: "Frameworks" },
  { href: "/companies", label: "Companies" },
  { href: "/calibrations", label: "Calibrations" },
];

export function SiteNav() {
  return (
    <header className="hairline-b sticky top-0 z-30 bg-[color:var(--color-paper)]/85 backdrop-blur-md">
      <div className="container-prose flex items-center justify-between py-4">
        <Link href="/" className="flex items-baseline gap-3 group">
          <span
            aria-hidden
            className="inline-block size-2 rounded-full bg-[color:var(--color-accent)] -mb-px"
          />
          <span className="font-display text-lg tracking-tight text-[color:var(--color-ink)]">
            Interview Prep
          </span>
          <span className="eyebrow hidden sm:inline">AI PM · v1</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-full text-sm text-[color:var(--color-ink-2)] hover:text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
