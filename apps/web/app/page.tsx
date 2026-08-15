import { AppHeader } from "./components/AppHeader";
import { BoardPreview } from "./components/landing/BoardPreview";
import { HeroCtas } from "./components/landing/HeroCtas";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="paper-grain pointer-events-none absolute inset-0" />
      <AppHeader />
      <main className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-0">
        <div className="max-w-xl">
          <p className="rise text-[11px] uppercase tracking-[0.28em] text-copper">
            Shared drafting table
          </p>
          <h1 className="rise rise-d1 mt-4 font-display text-[clamp(3.4rem,9vw,7rem)] leading-[0.86] italic">
            Draw on the
            <br />
            same sheet.
          </h1>
          <p className="rise rise-d2 mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Trace is a live studio for diagrams that refuse to stay in one head.
            Sketch boxes, argue in the margin, watch the ink show up on their
            paper too.
          </p>
          <div className="rise rise-d3">
            <HeroCtas />
          </div>
          <dl className="rise rise-d4 mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Rooms
              </dt>
              <dd className="mt-1 font-display text-xl italic">Named boards</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Hands
              </dt>
              <dd className="mt-1 font-display text-xl italic">Many at once</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.18em] text-ink-soft">
                Chat
              </dt>
              <dd className="mt-1 font-display text-xl italic">In the gutter</dd>
            </div>
          </dl>
        </div>
        <div className="sheet-tilt origin-bottom-left">
          <BoardPreview />
        </div>
      </main>
    </div>
  );
}
