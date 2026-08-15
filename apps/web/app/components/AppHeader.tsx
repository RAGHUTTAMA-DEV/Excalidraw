"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthStore from "../Zustand/AuthStore";
import { paths } from "../lib/paths";
import { Button } from "./ui/Button";

type AppHeaderProps = {
  dense?: boolean;
};

export function AppHeader({ dense = false }: AppHeaderProps) {
  const router = useRouter();
  const { user, token, logout, hasHydrated } = AuthStore();
  const signedIn = hasHydrated && Boolean(token);

  return (
    <header
      className={`flex items-center justify-between border-b border-line bg-paper/90 backdrop-blur ${
        dense ? "px-4 py-3" : "px-4 py-3 sm:px-6 sm:py-4"
      }`}
    >
      <Link href="/" className="flex items-baseline gap-2">
        <span className="font-display text-2xl italic text-ink">Trace</span>
            <span className="hidden text-xs uppercase tracking-[0.18em] text-ink-soft sm:inline">
          studio
        </span>
      </Link>
      <nav className="flex items-center gap-2">
        {signedIn ? (
          <>
            <Link
              href={paths.rooms}
              className="px-3 py-2 text-sm text-ink-soft hover:text-ink"
            >
              Boards
            </Link>
            <span className="hidden text-sm text-ink-soft sm:inline">
              {user?.name}
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                logout();
                router.push(paths.login);
              }}
            >
              Log out
            </Button>
          </>
        ) : (
          <>
            <Link href={paths.login}>
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href={paths.signup}>
              <Button>Get a desk</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
