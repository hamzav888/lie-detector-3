import { SITE } from "@/lib/site";

/**
 * Placeholder wordmark — swap the SVG mark and/or `SITE.name` for your brand.
 * The mark is a tiny CSS/SVG "truth meter" badge so there are zero image deps.
 */
export default function Wordmark({
  className = "",
  onDark = false,
}: {
  className?: string;
  onDark?: boolean;
}) {
  const textColor = onDark ? "text-white" : "text-ink";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl border-[3px] border-ink bg-magenta shadow-pop-sm sm:h-10 sm:w-10">
        <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true">
          {/* mini gauge */}
          <path
            d="M4 18 A8 8 0 0 1 20 18"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          {/* needle */}
          <line
            x1="12"
            y1="18"
            x2="16.5"
            y2="10.5"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="18" r="2.2" fill="#fff" />
        </svg>
      </span>
      <span
        className={`font-display text-2xl font-extrabold leading-none tracking-tight sm:text-[26px] ${textColor}`}
      >
        {SITE.name}
      </span>
    </span>
  );
}
