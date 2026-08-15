"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthStore from "../Zustand/AuthStore";
import { paths } from "../lib/paths";

function PaperGate() {
  return (
    <div className="flex h-dvh items-center justify-center bg-paper">
      <p className="font-display text-xl italic text-ink-soft">Opening the desk…</p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, hasHydrated, setHasHydrated } = AuthStore();

  useEffect(() => {
    const persist = AuthStore.persist;
    if (persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return persist.onFinishHydration(() => setHasHydrated(true));
  }, [setHasHydrated]);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace(paths.login);
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return <PaperGate />;
  if (!token) return <PaperGate />;
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, hasHydrated, setHasHydrated } = AuthStore();

  useEffect(() => {
    const persist = AuthStore.persist;
    if (persist.hasHydrated()) {
      setHasHydrated(true);
    }
    return persist.onFinishHydration(() => setHasHydrated(true));
  }, [setHasHydrated]);

  useEffect(() => {
    if (hasHydrated && token) {
      router.replace(paths.rooms);
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return <PaperGate />;
  if (token) return <PaperGate />;
  return <>{children}</>;
}
