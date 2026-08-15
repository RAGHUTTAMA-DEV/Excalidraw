"use client";

import Link from "next/link";
import AuthStore from "../../Zustand/AuthStore";
import { paths } from "../../lib/paths";
import { Button } from "../ui/Button";

export function HeroCtas() {
  const { token, hasHydrated } = AuthStore();
  const signedIn = hasHydrated && Boolean(token);

  if (!hasHydrated) {
    return <div className="mt-8 h-12 w-64 rounded-md bg-line/60" />;
  }

  if (signedIn) {
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={paths.rooms}>
          <Button className="px-6 py-3 text-base">Go to rooms</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Link href={paths.signup}>
        <Button className="px-6 py-3 text-base">Start drawing</Button>
      </Link>
      <Link href={paths.login}>
        <Button variant="ghost" className="px-6 py-3 text-base">
          Sign in
        </Button>
      </Link>
    </div>
  );
}
