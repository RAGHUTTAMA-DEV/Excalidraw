import Link from "next/link";
import { ReactNode } from "react";
import { paths } from "../../lib/paths";
import { BoardPreview } from "../landing/BoardPreview";

type AuthShellProps = {
  kicker: string;
  quote: string;
  children: ReactNode;
};

export function AuthShell({ kicker, quote, children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden bg-ink text-paper lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="paper-grain pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light" />
        <Link href={paths.home} className="relative z-10 flex items-baseline gap-2">
          <span className="font-display text-3xl italic">Trace</span>
          <span className="text-[11px] uppercase tracking-[0.22em] text-paper/60">
            studio
          </span>
        </Link>
        <div className="relative z-10 max-w-md scale-95">
          <BoardPreview className="sheet-tilt origin-center" />
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="text-[11px] uppercase tracking-[0.28em] text-copper">{kicker}</p>
          <p className="mt-3 font-display text-3xl italic leading-tight">{quote}</p>
        </div>
      </aside>
      <section className="relative flex flex-col bg-paper">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Link href={paths.home} className="flex items-baseline gap-2">
            <span className="font-display text-2xl italic text-ink">Trace</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-ink-soft">
              studio
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
    </div>
  );
}
