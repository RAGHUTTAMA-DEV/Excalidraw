"use client";

import { useEffect } from "react";
import AuthStore from "../Zustand/AuthStore";

function markHydrated() {
  AuthStore.getState().setHasHydrated(true);
}

export function AuthHydration() {
  useEffect(() => {
    const persist = AuthStore.persist;
    if (persist.hasHydrated()) {
      markHydrated();
    }
    const unsub = persist.onFinishHydration(markHydrated);
    void persist.rehydrate();
    const timer = window.setTimeout(markHydrated, 50);
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
