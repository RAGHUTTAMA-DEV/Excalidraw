import { RequireAuth } from "../components/AuthGuards";

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
