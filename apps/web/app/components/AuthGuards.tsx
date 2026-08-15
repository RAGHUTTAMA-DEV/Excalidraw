"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthStore from "../Zustand/AuthStore";
import { paths } from "../lib/paths";

function hasSession(token: string | null) {
  return Boolean(token);
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, hasHydrated } = AuthStore();

  useEffect(() => {
    if (hasHydrated && !hasSession(token)) {
      router.replace(paths.login);
    }
  }, [hasHydrated, token, router]);

  if (!hasHydrated) {
    return (
      <div className="flex h-dvh items-center justify-center bg-paper">
        <p className="font-display text-xl italic text-ink-soft">Opening the desk…</p>
      </div>
    );
  }

  if (!hasSession(token)) return null;
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, hasHydrated } = AuthStore();

  useEffect(() => {
    if (hasHydrated && hasSession(token)) {
      router.replace(paths.rooms);
    }
  }, [hasHydrated, token, router]);

  if (hasHydrated && hasSession(token)) return null;
  return <>{children}</>;
}
