import { cn } from "../../lib/cn";

export function BoardPreview({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-md", className)}>
      <div
        aria-hidden
        className="absolute -left-6 top-10 h-10 w-24 rotate-[-18deg] bg-[#d9c48a]/80 shadow-sm"
      />
      <div
        aria-hidden
        className="absolute -right-4 top-24 h-9 w-20 rotate-[22deg] bg-[#d9c48a]/75"
      />
      <div className="desk-grid relative aspect-[4/5] overflow-hidden rounded-[2px] border border-ink/15 bg-paper shadow-[12px_28px_50px_-18px_rgba(28,25,23,0.55)]">
        <svg viewBox="0 0 320 400" className="h-full w-full" role="img" aria-label="Sketch of a product flow on paper">
          <rect x="38" y="48" width="108" height="64" fill="none" stroke="#1c1917" strokeWidth="1.6" />
          <text x="52" y="86" fill="#1c1917" fontSize="13" fontFamily="Georgia, serif">
            intake
          </text>
          <path d="M146 80 H196" stroke="#c45c26" strokeWidth="1.5" fill="none" />
          <path d="M188 74 L198 80 L188 86" fill="none" stroke="#c45c26" strokeWidth="1.5" />
          <polygon
            points="230,48 286,80 230,112 174,80"
            fill="none"
            stroke="#1c1917"
            strokeWidth="1.6"
          />
          <text x="198" y="84" fill="#1c1917" fontSize="12" fontFamily="Georgia, serif">
            decide
          </text>
          <path
            d="M92 128 C 70 170, 250 150, 228 210"
            fill="none"
            stroke="#c45c26"
            strokeWidth="1.4"
            strokeDasharray="4 6"
          />
          <rect x="56" y="214" width="210" height="92" fill="none" stroke="#1c1917" strokeWidth="1.6" rx="2" />
          <text x="72" y="254" fill="#57534e" fontSize="12" fontFamily="Georgia, serif">
            ship it before the ink dries
          </text>
          <path
            d="M70 292 C 110 276, 160 310, 240 286"
            fill="none"
            stroke="#1c1917"
            strokeWidth="1.3"
          />
          <circle cx="74" cy="338" r="18" fill="none" stroke="#c45c26" strokeWidth="1.5" />
          <text x="102" y="344" fill="#57534e" fontSize="11" fontFamily="ui-sans-serif, sans-serif">
            live · two pencils
          </text>
        </svg>
        <p className="absolute bottom-4 left-4 font-display text-sm italic text-ink-soft">
          Fig. 12 — war room, Tuesday
        </p>
      </div>
    </div>
  );
}
